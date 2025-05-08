/* eslint-disable @typescript-eslint/no-explicit-any */
import { NestApplicationOptions, RequestMethod } from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { ServeOptions, Server, Serve as BunServe } from 'bun';
// Use native Request/Response available globally in Bun, or import cross-runtime ones if preferred
// import { Request, Response, Headers } from '@whatwg-node/fetch';
import { HttpStatus } from '@nestjs/common';
import * as qs from 'qs'; // For parsing x-www-form-urlencoded

// --- A Custom Response Wrapper ---
// This class mimics parts of Node's ServerResponse and captures state
// to build a final Bun/Web API Response object.
class BunResponseWrapper {
  public statusCode: number = HttpStatus.OK;
  public headers: Headers = new Headers();
  public body: any = null;
  private _isDone: boolean = false;
  private _resolve!: (value: Response) => void; // Definite assignment assertion
  private _promise: Promise<Response>;
  private _headersSent: boolean = false;

  // Required by NestJS internals (e.g., for express compatibility checks)
  public locals: Record<string, any> = {};

  constructor() {
    this._promise = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  setHeader(key: string, value: string | string[]): this {
    if (this._headersSent) {
      console.warn(`Headers already sent, cannot set ${key}`);
      return this;
    }
    // Normalize header key
    const lowerKey = key.toLowerCase();
    // Special handling for Set-Cookie which allows multiple headers
    if (lowerKey === 'set-cookie' && Array.isArray(value)) {
      this.headers.delete(key); // Clear existing first
      value.forEach((v) => this.headers.append(key, v));
    } else if (Array.isArray(value)) {
      // For other headers, join array values (standard behavior?) or take the last?
      // Let's join with comma, though behavior might vary depending on header.
      this.headers.set(key, value.join(', '));
    } else {
      this.headers.set(key, value);
    }
    return this;
  }

  getHeader(key: string): string | string[] | number | undefined {
    const value = this.headers.get(key);
    // Handle Set-Cookie specially if needed to return array
    if (key.toLowerCase() === 'set-cookie') {
      // Bun's Headers.get() might only return the first? Need to test Headers.getAll() equivalent if exists or manage internally.
      // For now, returning the potentially comma-separated string from .get()
      return value ?? undefined;
    }
    return value ?? undefined;
  }

  removeHeader(key: string): this {
    if (this._headersSent) {
      console.warn(`Headers already sent, cannot remove ${key}`);
      return this;
    }
    this.headers.delete(key);
    return this;
  }

  // Mimic common methods used by NestJS or middleware
  send(body?: any): this {
    this.body = body;
    this.end();
    return this;
  }

  json(body?: any): this {
    if (!this.headers.has('Content-Type')) {
      this.setHeader('Content-Type', 'application/json');
    }
    // Stringify happens during final Response creation if body is object
    this.body = body;
    this.end();
    return this;
  }

  // Simplified write/end - doesn't handle streams properly yet
  write(chunk: any): boolean {
    if (this._isDone) return false;
    // Naive implementation: assumes body is string or becomes string
    if (this.body === null || this.body === undefined) {
      this.body = chunk;
    } else {
      // This is inefficient and potentially incorrect for non-string/buffer chunks
      this.body = String(this.body) + String(chunk);
    }
    this._headersSent = true; // Writing implies headers are sent
    return true;
  }

  end(chunk?: any): this {
    if (this._isDone) return this;
    if (chunk) {
      this.write(chunk);
    }
    this._isDone = true;
    this._headersSent = true;

    // --- Construct the final Response ---
    let responseBody = this.body;
    const contentType = this.headers.get('Content-Type');

    // Auto-stringify JSON if body is object and content-type is json
    if (
      typeof responseBody === 'object' &&
      responseBody !== null &&
      !(responseBody instanceof Uint8Array) &&
      !(responseBody instanceof ReadableStream) &&
      !(responseBody instanceof Blob) && // Add other raw types if needed
      contentType?.includes('application/json')
    ) {
      try {
        responseBody = JSON.stringify(responseBody);
      } catch (error) {
        console.error('Failed to stringify JSON body:', error);
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        responseBody = 'Internal Server Error';
        this.setHeader('Content-Type', 'text/plain');
      }
    }

    // Ensure Content-Type if body exists and type not set
    if (
      responseBody !== null &&
      responseBody !== undefined &&
      !this.headers.has('Content-Type')
    ) {
      if (typeof responseBody === 'string') {
        this.setHeader('Content-Type', 'text/html'); // Default assumption
      }
      // Add more default types if needed (e.g., for Buffer -> application/octet-stream)
    }

    // Handle null/undefined body for certain status codes
    if (responseBody === null || responseBody === undefined) {
      if (
        this.statusCode === HttpStatus.NO_CONTENT ||
        this.statusCode === HttpStatus.NOT_MODIFIED
      ) {
        responseBody = null; // Explicitly null for Response constructor
      } else {
        responseBody = ''; // Empty string for others
      }
    }

    const response = new Response(responseBody, {
      status: this.statusCode,
      headers: this.headers,
    });

    this._resolve(response);
    return this;
  }

  // Property needed by NestJS/Express compatibility checks
  get writableEnded(): boolean {
    return this._isDone;
  }

  getResponsePromise(): Promise<Response> {
    return this._promise;
  }
}

// --- The Bun Adapter ---
export class BunAdapter extends AbstractHttpAdapter {
  private server: Server | null = null;

  constructor() {
    super(null); // Pass null initially, set instance later
  }

  // --- Server Lifecycle ---

  listen(port: string | number, callback?: () => void): any;
  listen(port: string | number, hostname: string, callback?: () => void): any;
  listen(
    port: any,
    hostnameOrCallback?: string | (() => void),
    callback?: () => void,
  ) {
    const hostname =
      typeof hostnameOrCallback === 'string' ? hostnameOrCallback : '0.0.0.0';
    const done =
      typeof hostnameOrCallback === 'function' ? hostnameOrCallback : callback;
    const portNumber = Number(port);

    const fetchHandler = async (request: Request): Promise<Response> => {
      const responseWrapper = new BunResponseWrapper();
      try {
        // `this.handler` is the NestJS request handler function
        // It expects (req, res) signature
        await this.handler(request, responseWrapper);
        // Wait for the responseWrapper to be finalized (e.g., via .end())
        return await responseWrapper.getResponsePromise();
      } catch (error) {
        console.error('Error during NestJS request handling:', error);
        // Ensure a response is always sent
        if (!responseWrapper.writableEnded) {
          responseWrapper
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Internal Server Error');
          return await responseWrapper.getResponsePromise();
        }
        // If response already started, maybe log and let existing flow finish? Risky.
        // Best effort fallback:
        return new Response('Internal Server Error', {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    };

    const options: BunServe = {
      port: portNumber,
      hostname: hostname,
      fetch: fetchHandler,
      error: (error: Error): Response | Promise<Response> => {
        console.error('Bun.serve internal error:', error);
        // Customize this Bun-level error response (e.g., hide details in prod)
        return new Response(
          `Server Error: ${error.message || 'Unknown error'}`,
          {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
          },
        );
      },
      // Consider adding other Bun.serve options like `development`, `websocket`, etc. if needed
    };

    try {
      this.server = Bun.serve(options);
      // Set the instance for the base class AFTER creation
      this.httpServer = this.server;
      console.log(
        `[BunAdapter] NestJS Application listening on http://${this.server.hostname}:${this.server.port}`,
      );
      if (done) {
        done();
      }
      return this.server; // Return the server instance
    } catch (error) {
      console.error('[BunAdapter] Failed to start Bun server:', error);
      if (error instanceof Error && error.message.includes('EADDRINUSE')) {
        // Specific error handling for address in use
        process.exit(1); // Exit or throw? Exiting is common for port conflicts.
      }
      throw error; // Re-throw for NestJS bootstrap to potentially catch
    }
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.server) {
        return resolve();
      }
      try {
        const stopped = this.server.stop(true); // Graceful shutdown
        if (stopped || stopped === undefined) {
          // Handle older Bun versions where stop() might return void
          console.log('[BunAdapter] Bun server stopped.');
          this.server = null;
          this.httpServer = null;
          resolve();
        } else {
          // Bun >= 1.0.1 might return false if not stopped immediately
          console.warn(
            '[BunAdapter] Bun server stop(true) returned false. Shutdown might be pending or failed.',
          );
          // Consider a timeout or resolve anyway? Resolving for now.
          this.server = null;
          this.httpServer = null;
          resolve();
        }
      } catch (error) {
        console.error('[BunAdapter] Error stopping Bun server:', error);
        reject(error);
      }
    });
  }

  // --- Request Handling ---

  getRequestHostname(request: Request): string | undefined {
    try {
      return new URL(request.url).hostname;
    } catch {
      return undefined;
    }
  }

  getRequestMethod(request: Request): string {
    return request.method;
  }

  getRequestUrl(request: Request): string {
    try {
      // Return path + query string, not the full URL
      const url = new URL(request.url);
      return url.pathname + url.search;
    } catch {
      // Fallback for potentially invalid URLs? Unlikely with Bun.serve
      return request.url;
    }
  }

  // --- Response Handling ---

  reply(response: BunResponseWrapper, body: any, statusCode?: number): void {
    if (statusCode) {
      response.status(statusCode);
    }
    response.send(body); // send() will call end() implicitly
  }

  status(response: BunResponseWrapper, statusCode: number): void {
    response.status(statusCode);
  }

  setHeader(
    response: BunResponseWrapper,
    name: string,
    value: string | string[],
  ): void {
    response.setHeader(name, value);
  }

  render(response: BunResponseWrapper, view: string, options: any): void {
    // View rendering requires integrating a view engine (like Handlebars, EJS)
    // This basic adapter doesn't support it out-of-the-box.
    console.error('[BunAdapter] View rendering (render) is not implemented.');
    response
      .status(HttpStatus.NOT_IMPLEMENTED)
      .send('View rendering not implemented');
  }

  redirect(
    response: BunResponseWrapper,
    statusCode: number,
    url: string,
  ): void {
    response.status(statusCode);
    response.setHeader('Location', url);
    response.send(); // Empty body for redirect
  }

  // --- Error Handling ---

  setErrorHandler(handler: Function, prefix?: string): void {
    // TODO: Integrate with Bun.serve's error handler or internal request error handling
    console.warn(
      '[BunAdapter] setErrorHandler not fully implemented. Using default Bun.serve error handling.',
    );
    // Could potentially store this handler and call it within the fetch catch block
  }

  setNotFoundHandler(handler: Function, prefix?: string): void {
    // TODO: Integrate with routing or default handler logic
    console.warn(
      '[BunAdapter] setNotFoundHandler not fully implemented. NestJS routing should handle 404s.',
    );
    // Could store this and call if NestJS handler doesn't produce a response (tricky)
  }

  // --- Instance & Type ---

  getInstance<T = any>(): T {
    // Return the underlying Bun Server instance
    return this.server as T;
  }

  getHttpServer<T = any>(): T {
    // Return the underlying Bun Server instance
    return this.server as T;
  }

  getType(): string {
    // Identifier for this adapter
    return 'bun';
  }

  // --- Body Parsing ---
  // Note: NestJS pipes (like ValidationPipe) often trigger body parsing implicitly.
  // This method provides the raw body parsing logic for the adapter.
  async getBody(request: Request): Promise<any> {
    if (
      !request.body ||
      request.method === 'GET' ||
      request.method === 'HEAD' ||
      request.headers.get('content-length') === '0'
    ) {
      return undefined; // No body expected or present
    }

    const contentType = request.headers.get('content-type')?.toLowerCase();

    try {
      if (contentType?.includes('application/json')) {
        return await request.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        // Use qs for robustness (handles nested objects, arrays)
        return qs.parse(text);
        // Alternative: Simple parsing using URLSearchParams (doesn't handle nesting)
        // return Object.fromEntries(new URLSearchParams(text));
      } else if (contentType?.includes('text/plain')) {
        return await request.text();
      } else if (contentType?.includes('multipart/form-data')) {
        // Bun has built-in FormData parsing!
        return await request.formData();
      } else {
        // Default: return as Buffer/ArrayBuffer for unknown or binary types
        // Bun's arrayBuffer() returns ArrayBuffer
        return await request.arrayBuffer();
      }
    } catch (error) {
      console.error(
        `[BunAdapter] Error parsing request body (Content-Type: ${contentType}):`,
        error,
      );
      // Throw an error that NestJS can potentially catch and convert to a BadRequestException
      // Using a plain error here, Nest might map it to 500 by default.
      throw new Error(
        `Invalid request body: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Alternatively:
      // import { BadRequestException } from '@nestjs/common';
      // throw new BadRequestException('Invalid request body');
    }
  }

  // --- Middleware ---
  // Basic `use` implementation - This is COMPLEX to do correctly for (req, res, next) style middleware.
  // This simple version won't work for most Express middleware.
  // NestJS middleware might work if adapted or if they don't rely heavily on specific Express/Fastify req/res properties.
  use(...args: any[]): any {
    console.warn(
      "[BunAdapter] Basic 'use' method called. Full middleware compatibility is limited.",
    );
    // This needs a proper middleware execution chain implementation before the main Nest handler.
    // For now, this is largely a no-op or placeholder.
    // A real implementation would need to queue middleware functions and adapt their signatures.
  }

  // --- Other Optional Methods (Implement or Stub) ---
  // These are less commonly critical but might be needed for specific features

  init(): Promise<void> {
    // Called during NestFactory.create(), can perform async setup if needed
    return Promise.resolve();
  }

  registerParserMiddleware(): void {
    // Body parsing is handled within getBody based on Content-Type now.
    // No separate middleware registration needed like body-parser.
    console.log(
      '[BunAdapter] registerParserMiddleware called (no-op - parsing integrated in getBody).',
    );
  }

  enableCors(options: any): any {
    // CORS needs to be handled by adding headers in the response wrapper or via a custom hook/middleware.
    console.warn(
      '[BunAdapter] enableCors() called - CORS headers need manual setup or a dedicated hook.',
    );
    // A simple implementation could store CORS options and apply headers in BunResponseWrapper.end()
  }

  createMiddlewareFactory(requestMethod: RequestMethod): any {
    // Used internally by NestJS for applying middleware to specific routes/methods.
    // Needs careful implementation if supporting complex middleware scenarios.
    console.warn(
      '[BunAdapter] createMiddlewareFactory() called - returning basic no-op function.',
    );
    // Returning a function that accepts path and callback, but does nothing
    return (path: string, callback: Function) => {
      // A real implementation would need to store these mappings and apply them during request handling
    };
  }

  // Add stubs for any other abstract methods from AbstractHttpAdapter if not implemented
  applyVersionFilter(...args: any[]): any {
    throw new Error('Method not implemented.');
  }
  useStaticAssets(...args: any[]): any {
    throw new Error('Method not implemented.');
  }
  setViewEngine(...args: any[]): any {
    throw new Error('Method not implemented.');
  }
  getRequest<T = any>(request: Request): T {
    return request as T;
  } // Return the raw Bun request
  getResponse<T = any>(response: BunResponseWrapper): T {
    return response as T;
  } // Return our wrapper
}

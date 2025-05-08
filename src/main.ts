import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { errorFormatter } from './shared/error-formattor';
import { BunAdapter } from './bun.adapter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new BunAdapter(), {
    cors: true,
  });

  app.enableCors({
    origin: 'http://localhost:3000',
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: false,
      disableErrorMessages: false,
      exceptionFactory(errors): void {
        const messages = errorFormatter(errors);
        throw new BadRequestException(messages);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS API Boilerplate')
    .setDescription('The NestJS API Boilerplate description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get('port') || 3000;
  await app.listen(PORT);
}
bootstrap();

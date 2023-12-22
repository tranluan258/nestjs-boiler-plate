import { ACTION } from '@/permission/enum/action.enum';
import { JwtPayload } from './../interface/jwt-payload.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requirePermission = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>('permissions', [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    let hasPermission = false;
    user.roles.forEach((role) => {
      role.policies.forEach((policy) => {
        policy.permissions.forEach((permission) => {
          if (
            (permission.action === requirePermission.action &&
              permission.resource === requirePermission.resource) ||
            (permission.action === ACTION.MANAGE &&
              permission.resource === requirePermission.resource)
          ) {
            hasPermission = true;
          }
        });
      });
    });

    if (!hasPermission)
      throw new ForbiddenException(
        'Account not allowed access to this resource',
      );

    return true;
  }
}

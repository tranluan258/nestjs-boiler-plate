import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permissions: {
  resource: string;
  action: string;
}) => SetMetadata('permissions', permissions);

import { applyDecorators, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../decorators/decorators';
import { PermissionGuard } from '../guards/permission.guard';
import { AuthGuard } from '../guards/auth.guard';

export function RequestPermission(permission: string, table: string) {
  const formatedPermission = permission + '_' + table;
  return applyDecorators(
    RequirePermission(formatedPermission),
    UseGuards(AuthGuard, PermissionGuard),
  );
}

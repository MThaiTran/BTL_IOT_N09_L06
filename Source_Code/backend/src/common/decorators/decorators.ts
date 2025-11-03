import { SetMetadata } from '@nestjs/common';

// Single permission decorator
export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermission } from 'src/modules/role-permission/entities/role-permission.entity';
import { RolePermissionService } from 'src/modules/role-permission/role-permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('PermissionGuard is active');

    const requestedPermission = this.reflector.getAllAndOverride<string>(
      'permission',
      [context.getHandler(), context.getClass()],
    ); // mapped first index

    console.log('Requested Permission:', requestedPermission);
    const user = context.switchToHttp().getRequest().user;
    if (!user) {
      console.log('No user found in request - AuthRoleGuard');
      return false;
    }

    const permission = (
      (await this.rolePermissionService.getRolePermissionsByRoleId(
        user.roleId,
        requestedPermission,
      )) as RolePermission
    ).permission;

    if (!permission || !permission.name) {
      return false;
    }

    return permission.name === requestedPermission;
  }
}

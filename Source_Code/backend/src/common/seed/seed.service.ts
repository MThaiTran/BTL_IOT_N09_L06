// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { RolesService } from 'src/modules/roles/roles.service';
// import { RolePermissionService } from 'src/modules/role-permission/role-permission.service';
// import { ERole, EPermission, UserRole } from '../enum/enum';
// import { PermissionsService } from 'src/modules/permissions/permissions.service';

// @Injectable()
// export class SeedService implements OnModuleInit {
//     constructor(
//         private readonly rolesService: RolesService,
//         private readonly permissionsService: PermissionsService,
//         private readonly rolePermissionService: RolePermissionService,
//     ) { }

//     async onModuleInit() {
//         await this.seedRolesAndPermissions();
//     }

//     private async seedRolesAndPermissions() {
//         console.log('Seeding roles and permissions...');

//         // Create/Find Permissions
//         const allPermissions = Object.values(EPermission);
//         const createdPermissions = {};
//         for (const permName of allPermissions) {
//             let permission = await this.permissionsService.findOneByName(permName);
//             if (!permission) {
//                 permission = await this.permissionsService.create({ name: permName, description: permName });
//             }
//             createdPermissions[permName] = permission;
//         }

//         // Create/Find Roles and assign permissions
//         const rolesToSeed = [
//             { id: UserRole.ADMIN, name: ERole.ADMIN, description: 'Quản trị viên - Quyền truy cập đầy đủ', permissions: Object.values(EPermission) },
//             { id: UserRole.TECHNICIAN, name: ERole.TECHNICIAN, description: 'Kỹ thuật viên - Quản lý thiết bị và hệ thống', permissions: [EPermission.READ_DEVICE, EPermission.UPDATE_DEVICE, EPermission.CONTROL_DEVICE, EPermission.VIEW_ALL_DEVICES, EPermission.VIEW_SYSTEM_LOGS, EPermission.READ_USER, EPermission.UPDATE_USER] },
//             { id: UserRole.HOUSE_OWNER, name: ERole.HOUSE_OWNER, description: 'Chủ nhà - Quản lý thiết bị của mình', permissions: [EPermission.READ_DEVICE, EPermission.UPDATE_DEVICE, EPermission.CONTROL_DEVICE, EPermission.VIEW_OWN_DEVICES, EPermission.READ_USER, EPermission.UPDATE_USER, EPermission.VIEW_SYSTEM_LOGS] },
//             { id: UserRole.GUEST, name: ERole.GUEST, description: 'Thành viên gia đình - Điều khiển thiết bị được cấp quyền', permissions: [EPermission.READ_DEVICE, EPermission.CONTROL_DEVICE, EPermission.VIEW_OWN_DEVICES, EPermission.VIEW_SYSTEM_LOGS] },
//         ];

//         for (const roleData of rolesToSeed) {
//             let role = await this.rolesService.findOneById(roleData.id);
//             if (!role) {
//                 role = await this.rolesService.create({ id: roleData.id, name: roleData.name, description: roleData.description });
//             }

//             // Assign permissions to roles
//             for (const permName of roleData.permissions) {
//                 const permission = createdPermissions[permName];
//                 if (permission) {
//                     const rolePermission = await this.rolePermissionService.getRolePermissionByIdPair(
//                         role.id,
//                         permission.id,
//                     );
//                     if (!rolePermission) {
//                         await this.rolePermissionService.create({ roleId: role.id, permissionId: permission.id });
//                     }
//                 }
//             }
//         }
//         console.log('Roles and permissions seeded successfully.');
//     }
// }

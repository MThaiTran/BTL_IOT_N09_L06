import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permissions.entity';
import { RolesModule } from '../roles/roles.module';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    RolePermissionModule,
    RolesModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

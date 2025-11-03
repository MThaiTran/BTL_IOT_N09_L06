import { Module } from '@nestjs/common';
import { DeviceTypesService } from './device-types.service';
import { DeviceTypesController } from './device-types.controller';
import { DeviceType } from './entities/device-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionService } from '../role-permission/role-permission.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceType]), RolePermissionModule],
  controllers: [DeviceTypesController],
  providers: [DeviceTypesService],
})
export class DeviceTypesModule {}

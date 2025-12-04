import { Module } from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { UserDevicesController } from './user-devices.controller';
import { UserDevice } from './entities/user-device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionService } from '../role-permission/role-permission.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserDevice]), RolePermissionModule],
  controllers: [UserDevicesController],
  providers: [UserDevicesService],
})
export class UserDevicesModule {}

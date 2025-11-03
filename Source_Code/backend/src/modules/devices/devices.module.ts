import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './entities/device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionService } from '../role-permission/role-permission.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), RolePermissionModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}

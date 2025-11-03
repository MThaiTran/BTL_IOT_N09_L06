import { Module } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { SystemLogsController } from './system-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLog } from './entities/system-log.entity';
import { RolePermissionService } from '../role-permission/role-permission.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog]), RolePermissionModule],
  controllers: [SystemLogsController],
  providers: [SystemLogsService],
})
export class SystemLogsModule {}

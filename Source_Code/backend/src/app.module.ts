import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmRootModule } from './common/configs/typeorm-module.config';
import { JwtRootModule } from './common/configs/jwt-module.config';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SystemLogsModule } from './modules/system-logs/system-logs.module';
import { DevicesModule } from './modules/devices/devices.module';
import { DeviceTypesModule } from './modules/device-types/device-types.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';

@Module({
  imports: [
    JwtRootModule,
    UsersModule,
    TypeOrmRootModule,
    AuthModule,
    SystemLogsModule,
    DevicesModule,
    DeviceTypesModule,
    PermissionsModule,
    RolesModule,
    RolePermissionModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

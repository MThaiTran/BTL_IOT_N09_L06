import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtRootModule } from 'src/common/configs/jwt-module.config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [UsersModule, JwtRootModule, PassportModule, RolePermissionModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { databaseConfig, NODE_ENV } from './constants.config';
import { Permission } from 'src/modules/permissions/entities/permissions.entity';
import { RolePermission } from 'src/modules/role-permission/entities/role-permission.entity';
import { Device } from 'src/modules/devices/entities/device.entity';
import { DeviceType } from 'src/modules/device-types/entities/device-type.entity';
import { SystemLog } from 'src/modules/system-logs/entities/system-log.entity';

export const TypeOrmRootModule = TypeOrmModule.forRoot({
  type: databaseConfig.TYPE as any,
  host: databaseConfig.HOST,
  port: databaseConfig.PORT,
  username: databaseConfig.USERNAME,
  password: databaseConfig.PASSWORD,
  database: databaseConfig.DATABASE,
  entities: [
    User,
    Role,
    Permission,
    RolePermission,
    Device,
    DeviceType,
    SystemLog,
  ],
  synchronize: false,
  logging: NODE_ENV === 'development',
});

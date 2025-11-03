import { BaseEntity } from 'src/base/base.entity';
import { EDeviceLog } from 'src/common/enum/enum';
import { Device } from 'src/modules/devices/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('SystemLog')
export class SystemLog extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  log: EDeviceLog;

  @Column({ type: 'text' })
  logDescription: string;

  @Column({ type: 'jsonb' })
  logData: any; // any type

  @Column({ type: 'number' })
  userId: number;

  @Column({ type: 'number' })
  deviceId: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Device)
  device: Device;
}

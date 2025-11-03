import { BaseEntity } from 'src/base/base.entity';
import { DeviceType } from 'src/modules/device-types/entities/device-type.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('Device')
export class Device extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  fireBasePath: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'float' })
  thresholdLow: number;

  @Column({ type: 'float' })
  thresholdHigh: number;

  @Column({ type: 'timestamp', nullable: true })
  lastestDeviceUpdate: Date | null;

  @Column({ type: 'number' })
  userId: number;

  @Column({ type: 'number' })
  deviceTypeId: number;

  @ManyToOne(() => DeviceType)
  deviceType: DeviceType;

  @ManyToOne(() => User)
  user: User;
}

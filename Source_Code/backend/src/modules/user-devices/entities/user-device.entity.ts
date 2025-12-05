import { Status } from 'src/common/enum/enum';
import { Device } from 'src/modules/devices/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('UserDevice')
export class UserDevice {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  deviceId: number;

  @Column({ type: 'varchar', length: 255 })
  status: Status = Status.ACTIVE;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  latestUpdate: Date;

  @Column({ type: 'integer', nullable: true })
  latestUpdateBy: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Device)
  device: Device;
}

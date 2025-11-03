import { BaseEntity } from 'src/base/base.entity';
import { EDeviceUnit } from 'src/common/enum/enum';
import { Column, Entity } from 'typeorm';

@Entity('DeviceType')
export class DeviceType extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  unit: EDeviceUnit;

  @Column({ type: 'float' })
  minValue: number;

  @Column({ type: 'float' })
  maxValue: number;

  @Column({ type: 'float' })
  defaultThresholdLow: number;

  @Column({ type: 'float' })
  defaultThresholdHigh: number;

  @Column({ type: 'boolean' })
  isActuator: boolean;
}

import { BaseEntity } from 'src/base/base.entity';
import { EDeviceLog } from 'src/common/enum/enum';
import { Column } from 'typeorm';

export class SystemLog extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  log: EDeviceLog;

  @Column({ type: 'text' })
  logDescription: string;

  @Column({ type: 'jsonb' })
  logData: any; // any type
}

import { Status } from 'src/common/enum/enum';
import {
  Column,
  CreateDateColumn,
  ObjectLiteral,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity implements ObjectLiteral {
  // Can be missunderstood as typeorm BaseEntity
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  status: Status = Status.ACTIVE;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  latestUpdate: Date;

  @Column({ type: 'integer', nullable: true })
  latestUpdateBy: number;
}

import { Status } from 'src/common/enum/enum';
import { Permission } from 'src/modules/permissions/entities/permissions.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  ObjectLiteral,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('RolePermission')
export class RolePermission implements ObjectLiteral {
  @PrimaryColumn({ type: 'integer' })
  permissionId: number;

  @PrimaryColumn({ type: 'integer' })
  roleId: number;

  @Column({ type: 'varchar', length: 255 })
  status: Status = Status.ACTIVE;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  latestUpdate: Date;

  @Column({ type: 'integer', nullable: true })
  latestUpdateBy: number;

  @ManyToOne(() => Permission)
  permission: Permission;

  @ManyToOne(() => Role)
  role: Role;
}

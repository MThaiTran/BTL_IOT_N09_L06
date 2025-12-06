import { BaseEntity } from 'src/base/base.entity';
import { UserRole } from 'src/common/enum/enum';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('User')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rawPassword: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashPassword: string;

  @Column({ type: 'int', nullable: true, default: UserRole.GUEST })
  roleId: UserRole | number = UserRole.GUEST;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  role: Role;
}

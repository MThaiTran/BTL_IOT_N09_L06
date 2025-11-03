import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/base/base.entity';
import { UserRole, ERole } from 'src/common/enum/enum';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity('Role')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: ERole | string;

  @Column({ type: 'text' })
  description: string;

  @ApiHideProperty()
  @OneToMany(() => User, (user) => user.role, { nullable: true })
  users: User[];
}

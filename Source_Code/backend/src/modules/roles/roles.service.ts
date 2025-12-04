import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BaseService } from 'src/base/extendable.services';
import { BaseRepository } from 'src/base/base.repository';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepository: BaseRepository<Role>,
  ) {
    super(new BaseRepository<Role>(roleRepository));
  }

  async findOneById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id } });
  }
}

import { Injectable } from '@nestjs/common';
import { Permission } from './entities/permissions.entity';
import { BaseService } from 'src/base/extendable.services';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base/base.repository';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {
    super(new BaseRepository(permissionRepository));
  }

  async findOneByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }
}

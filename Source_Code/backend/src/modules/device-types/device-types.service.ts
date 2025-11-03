import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/extendable.services';
import { DeviceType } from './entities/device-type.entity';
import { BaseRepository } from 'src/base/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DeviceTypesService extends BaseService<DeviceType> {
  constructor(
    @InjectRepository(DeviceType)
    private readonly deviceTypeRepository: Repository<DeviceType>,
  ) {
    super(new BaseRepository<DeviceType>(deviceTypeRepository));
  }
}

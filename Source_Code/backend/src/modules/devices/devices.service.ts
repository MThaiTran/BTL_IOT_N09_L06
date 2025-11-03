import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base/extendable.services';
import { Device } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/base/base.repository';

@Injectable()
export class DevicesService extends BaseService<Device> {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {
    super(new BaseRepository(deviceRepository));
  }
}

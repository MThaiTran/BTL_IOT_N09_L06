import { Injectable } from '@nestjs/common';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { UpdateSystemLogDto } from './dto/update-system-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemLog } from './entities/system-log.entity';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/base/base.repository';
import { BaseService } from 'src/base/extendable.services';

@Injectable()
export class SystemLogsService extends BaseService<SystemLog> {
  constructor(
    @InjectRepository(SystemLog)
    private systemLogRepository: Repository<SystemLog>,
  ) {
    super(new BaseRepository<SystemLog>(systemLogRepository));
  }
}

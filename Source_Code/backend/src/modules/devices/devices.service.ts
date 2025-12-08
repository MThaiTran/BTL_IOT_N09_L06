import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from 'src/base/extendable.services';
import { Device } from './entities/device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseRepository } from 'src/base/base.repository';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { MqttService } from 'src/mqtt/mqtt.service';
import { MQTT_CONFIG } from 'src/common/configs/mqtt.config';

@Injectable()
export class DevicesService extends BaseService<Device> {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly mqttService: MqttService,
  ) {
    super(new BaseRepository(deviceRepository));
  }

  override async update(
    id: number,
    updateEntityDto: DeepPartial<Device>,
  ): Promise<Device | null> {
    try {
      await this.deviceRepository.update(
        id,
        updateEntityDto as QueryDeepPartialEntity<Device>,
      );
      this.mqttService.publish(
        MQTT_CONFIG.PUB_TOPICS.DEVICES,
        id,
        updateEntityDto,
      );
      return this.findOne(id);
    } catch (error) {
      console.error('BaseService.update error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to update entity',
      );
    }
  }
}

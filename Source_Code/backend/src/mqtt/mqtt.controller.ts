import { Body, Controller, Get, Post } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { CreateMqttDto } from './dto/create-mqtt.dto';
import { UpdateMqttDto } from './dto/update-mqtt.dto';
import { MqttOtaTopicDto } from './dto/topics-mqtt.dto';

@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('ota')
  testOta(@Body('version') version: number, @Body('otaData') otaData: string) {
    return this.mqttService.publishOta(version, otaData);
  }
}

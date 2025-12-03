// import { Controller } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { MqttService } from './mqtt.service';
// import { CreateMqttDto } from './dto/create-mqtt.dto';
// import { UpdateMqttDto } from './dto/update-mqtt.dto';

// @Controller()
// export class MqttController {
//   constructor(private readonly mqttService: MqttService) {}

//   @MessagePattern('createMqtt')
//   create(@Payload() createMqttDto: CreateMqttDto) {
//     return this.mqttService.create(createMqttDto);
//   }

//   @MessagePattern('findAllMqtt')
//   findAll() {
//     return this.mqttService.findAll();
//   }

//   @MessagePattern('findOneMqtt')
//   findOne(@Payload() id: number) {
//     return this.mqttService.findOne(id);
//   }

//   @MessagePattern('updateMqtt')
//   update(@Payload() updateMqttDto: UpdateMqttDto) {
//     return this.mqttService.update(updateMqttDto.id, updateMqttDto);
//   }

//   @MessagePattern('removeMqtt')
//   remove(@Payload() id: number) {
//     return this.mqttService.remove(id);
//   }
// }

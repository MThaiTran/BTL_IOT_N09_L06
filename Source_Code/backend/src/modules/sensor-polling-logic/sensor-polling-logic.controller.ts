// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { SensorPollingLogicService } from './sensor-polling-logic.service';
// import { CreateSensorPollingLogicDto } from './dto/create-sensor-polling-logic.dto';
// import { UpdateSensorPollingLogicDto } from './dto/update-sensor-polling-logic.dto';

// @Controller('sensor-polling-logic')
// export class SensorPollingLogicController {
//   constructor(private readonly sensorPollingLogicService: SensorPollingLogicService) {}

//   @Post()
//   create(@Body() createSensorPollingLogicDto: CreateSensorPollingLogicDto) {
//     return this.sensorPollingLogicService.create(createSensorPollingLogicDto);
//   }

//   @Get()
//   findAll() {
//     return this.sensorPollingLogicService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.sensorPollingLogicService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateSensorPollingLogicDto: UpdateSensorPollingLogicDto) {
//     return this.sensorPollingLogicService.update(+id, updateSensorPollingLogicDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.sensorPollingLogicService.remove(+id);
//   }
// }

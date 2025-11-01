import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeviceTypesService } from './device-types.service';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';

@Controller('device-types')
export class DeviceTypesController {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}

  @Post()
  create(@Body() createDeviceTypeDto: CreateDeviceTypeDto) {
    return this.deviceTypesService.create(createDeviceTypeDto);
  }

  @Get()
  findAll() {
    return this.deviceTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceTypeDto: UpdateDeviceTypeDto) {
    return this.deviceTypesService.update(+id, updateDeviceTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceTypesService.remove(+id);
  }
}

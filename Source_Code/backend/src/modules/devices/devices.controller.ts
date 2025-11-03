import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { Device } from './entities/device.entity';
import { RequestPermission } from 'src/common/helper/common.helper';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';

const tableName = 'Device';
@ApiBearerAuth()
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiCreateOne(Device, CreateDeviceDto)
  @RequestPermission(EPermission.ADD_ONE, tableName)
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @ApiFindAll(Device)
  @RequestPermission(EPermission.GET_ALL, tableName)
  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @ApiFindOne(Device)
  @RequestPermission(EPermission.GET_ONE, tableName)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @ApiUpdateOne(Device, UpdateDeviceDto)
  @RequestPermission(EPermission.EDIT_ONE, tableName)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @ApiDeleteOne(Device)
  @RequestPermission(EPermission.DELETE_ONE, tableName)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}

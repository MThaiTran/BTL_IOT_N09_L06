import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DeviceTypesService } from './device-types.service';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { DeviceType } from './entities/device-type.entity';
import { RequestPermission } from 'src/common/helper/common.helper';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';

const tableName = 'DeviceType';
@ApiBearerAuth()
@Controller('device-types')
export class DeviceTypesController {
  constructor(private readonly deviceTypesService: DeviceTypesService) {}

  @ApiCreateOne(DeviceType, CreateDeviceTypeDto)
  @RequestPermission(EPermission.ADD_ONE, tableName)
  @Post()
  create(@Body() createDeviceTypeDto: CreateDeviceTypeDto) {
    return this.deviceTypesService.create(createDeviceTypeDto);
  }

  @ApiFindAll(DeviceType)
  @RequestPermission(EPermission.GET_ALL, tableName)
  @Get()
  findAll() {
    return this.deviceTypesService.findAll();
  }

  @ApiFindOne(DeviceType)
  @RequestPermission(EPermission.GET_ONE, tableName)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceTypesService.findOne(+id);
  }

  @ApiUpdateOne(DeviceType, UpdateDeviceTypeDto)
  @RequestPermission(EPermission.EDIT_ONE, tableName)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceTypeDto: UpdateDeviceTypeDto,
  ) {
    return this.deviceTypesService.update(+id, updateDeviceTypeDto);
  }

  @ApiDeleteOne(DeviceType)
  @RequestPermission(EPermission.DELETE_ONE, tableName)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceTypesService.remove(+id);
  }
}

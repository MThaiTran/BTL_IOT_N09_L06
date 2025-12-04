import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserDevicesService } from './user-devices.service';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { UpdateUserDeviceDto } from './dto/update-user-device.dto';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { UserDevice } from './entities/user-device.entity';
import { RequestPermission } from 'src/common/helper/common.helper';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';

const tableName = 'UserDevice';
@ApiBearerAuth()
@Controller('user-devices')
export class UserDevicesController {
  constructor(private readonly userDevicesService: UserDevicesService) {}
  @Post()
  @ApiCreateOne(UserDevice, CreateUserDeviceDto)
  async create(@Body() entity: CreateUserDeviceDto) {
    return this.userDevicesService.create(entity);
  }

  @Patch(':userId/:deviceId')
  @ApiUpdateOne(UserDevice, UpdateUserDeviceDto)
  async update(
    @Param('userId') userId: number,
    @Param('deviceId') deviceId: number,
    @Body() entity: UpdateUserDeviceDto,
  ) {
    return this.userDevicesService.updateByIdPair(userId, deviceId, entity);
  }

  @Get(':userId')
  @ApiFindAll(UserDevice)
  async findPermissionsByRoleId(
    @Param('userId') userId: number,
    @Query('context') permissionContext: string,
  ): Promise<UserDevice[] | UserDevice | null | String> {
    return this.userDevicesService.getUserDevicesByUserId(
      userId,
      permissionContext,
    );
  }

  @Get(':userId/:deviceId')
  @ApiFindOne(UserDevice)
  async findPermissionByIdPair(
    @Param('userId') userId: number,
    @Param('deviceId') deviceId: number,
  ): Promise<UserDevice[] | UserDevice | null | String> {
    return this.userDevicesService.getUserDeviceByIdPair(userId, deviceId);
  }

  @Delete(':id')
  @ApiDeleteOne(UserDevice)
  async remove(
    @Param('userId') userId: number,
    @Param('deviceId') deviceId: number,
  ) {
    return this.userDevicesService.removeByIdPair(userId, deviceId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionsDto } from './dto/create-permissions.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { Permission } from './entities/permissions.entity';
import { BaseController } from 'src/base/extendable.controller';
import { IListOptions } from 'src/common/interfaces/paginate.interfaces';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RequestPermission } from 'src/common/helper/common.helper';

const tableName = 'Permission';
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Post()
  @ApiCreateOne(Permission, CreatePermissionsDto)
  @RequestPermission(EPermission.ADD_ONE, tableName)
  async create(@Body() entity: CreatePermissionsDto): Promise<Permission> {
    return this.permissionService.create(entity);
  }

  @Patch(':id')
  @ApiUpdateOne(Permission, UpdatePermissionsDto)
  @RequestPermission(EPermission.EDIT_ONE, tableName)
  async update(
    @Param('id') id: number,
    @Body() entity: UpdatePermissionsDto,
  ): Promise<Permission | null> {
    return this.permissionService.update(id, entity);
  }

  @Get()
  @ApiFindAll(Permission)
  @RequestPermission(EPermission.GET_ALL, tableName)
  async findAll(@Query() query: IListOptions<Permission>) {
    return this.permissionService.findAll(query);
  }

  @Get(':id')
  @ApiFindOne(Permission)
  @RequestPermission(EPermission.GET_ONE, tableName)
  async findOne(@Param('id') id: number): Promise<Permission | null> {
    return this.permissionService.findOne(id);
  }

  @Delete(':id')
  @ApiDeleteOne(Permission)
  @RequestPermission(EPermission.DELETE_ONE, tableName)
  async remove(@Param('id') id: number) {
    return this.permissionService.remove(id);
  }
}

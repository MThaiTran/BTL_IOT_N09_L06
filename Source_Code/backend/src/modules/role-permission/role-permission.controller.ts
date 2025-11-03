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
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { BaseController } from 'src/base/extendable.controller';
import { RolePermission } from './entities/role-permission.entity';
import { IListOptions } from 'src/common/interfaces/paginate.interfaces';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @ApiCreateOne(RolePermission, CreateRolePermissionDto)
  async create(
    @Body() entity: CreateRolePermissionDto,
  ): Promise<RolePermission> {
    return this.rolePermissionService.create(entity);
  }

  @Patch(':roleId/:permissionId')
  @ApiUpdateOne(RolePermission, UpdateRolePermissionDto)
  async update(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
    @Body() entity: UpdateRolePermissionDto,
  ): Promise<RolePermission | null> {
    return this.rolePermissionService.updateByIdPair(
      roleId,
      permissionId,
      entity,
    );
  }

  @Get(':roleId')
  @ApiFindAll(RolePermission)
  async findPermissionsByRoleId(
    @Param('roleId') roleId: number,
    @Query('context') permissionContext: string,
  ): Promise<RolePermission[] | RolePermission | null | String> {
    return this.rolePermissionService.getRolePermissionsByRoleId(
      roleId,
      permissionContext,
    );
  }

  @Get(':roleId/:permissionId')
  @ApiFindOne(RolePermission)
  async findPermissionByIdPair(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ): Promise<RolePermission[] | RolePermission | null | String> {
    return this.rolePermissionService.getRolePermissionByIdPair(
      roleId,
      permissionId,
    );
  }

  @Delete(':id')
  @ApiDeleteOne(RolePermission)
  async remove(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ) {
    return this.rolePermissionService.removeByIdPair(roleId, permissionId);
  }
}

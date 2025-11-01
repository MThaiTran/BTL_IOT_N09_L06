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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { IListOptions } from 'src/common/interfaces/paginate.interfaces';
import { EPermission, ERole } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { RequestPermission } from 'src/common/helper/common.helper';

const tableName = 'Role';
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiCreateOne(Role, CreateRoleDto)
  // @RequestPermission(EPermission.ADD_ONE, tableName)
  async create(@Body() entity: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(entity);
  }

  @Patch(':id')
  @ApiUpdateOne(Role, UpdateRoleDto)
  // @RequestPermission(EPermission.EDIT_ONE, tableName)
  async update(
    @Param('id') id: number,
    @Body() entity: UpdateRoleDto,
  ): Promise<Role | null> {
    return this.rolesService.update(id, entity);
  }

  @Get()
  @ApiFindAll(Role)
  // @RequestPermission(EPermission.GET_ALL, tableName)
  async findAll(@Query() query: IListOptions<Role>) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiFindOne(Role)
  // @RequestPermission(EPermission.GET_ONE, tableName)
  async findOne(@Param('id') id: number): Promise<Role | null> {
    return this.rolesService.findOne(id);
  }

  @Delete(':id')
  @ApiDeleteOne(Role)
  // @RequestPermission(EPermission.DELETE_ONE, tableName)
  async remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { IListOptions } from 'src/common/interfaces/paginate.interfaces';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { RequestPermission } from 'src/common/helper/common.helper';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';

const tableName = 'User';
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, PermissionGuard) // Apply AuthGuard and PermissionGuard at controller level
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateOne(User, CreateUserDto)
  @RequestPermission(EPermission.CREATE_USER, tableName) // Specific permission for creating users
  async create(@Body() entity: CreateUserDto): Promise<User> {
    return this.usersService.create(entity);
  }

  @Patch(':id')
  @ApiUpdateOne(User, UpdateUserDto)
  @RequestPermission(EPermission.UPDATE_USER, tableName) // Specific permission for updating users
  async update(
    @Param('id') id: number,
    @Body() entity: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, entity);
  }

  @Get()
  @ApiFindAll(User)
  @RequestPermission(EPermission.VIEW_ALL_USERS, tableName) // Specific permission for viewing all users
  async findAll(@Query() query: IListOptions<User>) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiFindOne(User)
  @RequestPermission(EPermission.READ_USER, tableName) // Specific permission for reading a single user
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @ApiDeleteOne(User)
  @RequestPermission(EPermission.DELETE_USER, tableName) // Specific permission for deleting users
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

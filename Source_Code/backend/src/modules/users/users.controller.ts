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

const tableName = 'User';
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateOne(User, CreateUserDto)
  async create(@Body() entity: CreateUserDto): Promise<User> {
    return this.usersService.create(entity);
  }

  @Patch(':id')
  @ApiUpdateOne(User, UpdateUserDto)
  @RequestPermission(EPermission.EDIT_ONE, tableName)
  async update(
    @Param('id') id: number,
    @Body() entity: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersService.update(id, entity);
  }

  @Get()
  @ApiFindAll(User)
  @RequestPermission(EPermission.GET_ALL, tableName)
  async findAll(@Query() query: IListOptions<User>) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiFindOne(User)
  @RequestPermission(EPermission.GET_ONE, tableName)
  async findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @ApiDeleteOne(User)
  @RequestPermission(EPermission.DELETE_ONE, tableName)
  async remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}

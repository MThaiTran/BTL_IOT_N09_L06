import { DeepPartial } from 'typeorm';
import { IBaseController, IBaseService } from './base.interfaces';
import {
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  IListOptions,
  IPaginateOptions,
} from 'src/common/interfaces/paginate.interfaces';
import { ApiQuery } from '@nestjs/swagger';

export class BaseController<T> implements IBaseController<T> {
  constructor(private readonly service: IBaseService<T>) {}

  @Post()
  async create(@Body() entity: DeepPartial<T>): Promise<T> {
    return this.service.create(entity);
  }

  @Get()
  async findAll(@Query() listOptions?: IListOptions<T>) {
    return this.service.findAll(listOptions);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<T | null> {
    const entity = await this.service.findOne(id);
    console.log('entity', entity);
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() entity: DeepPartial<T>,
  ): Promise<T | null> {
    return this.service.update(id, entity);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}

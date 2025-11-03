import {
  DeepPartial,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  ObjectLiteral,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IBaseService } from './base.interfaces';
import {
  IFilterOptions,
  IListOptions,
  IPaginateOptions,
  ISearchOptions,
} from 'src/common/interfaces/paginate.interfaces';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseRepository } from './base.repository';

export class BaseService<T extends ObjectLiteral> implements IBaseService<T> {
  constructor(private readonly repository: BaseRepository<T>) {}

  async create(createEntityDto: DeepPartial<T>): Promise<T> {
    try {
      const newEntity = this.repository.create(createEntityDto);
      return await this.repository.save(newEntity);
    } catch (error) {
      console.error('BaseService.create error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to create entity',
      );
    }
  }

  async findAll(listOptions?: IListOptions<T>) {
    try {
      if (!listOptions) return this.repository.find();

      const {
        limit,
        page,
        cursor,
        sortOrder,
        sortBy,
        searchBy,
        search,
        ...filters
      } = listOptions;
      const filterOptions: IFilterOptions<T> = { ...filters };
      const paginateOptions: IPaginateOptions<T> = {
        limit,
        page,
        cursor,
        sortOrder,
        sortBy,
      };
      const searchOptions: ISearchOptions<T> = { searchBy, search };
      const findOptions: FindManyOptions<T> = {} as FindManyOptions<T>;

      console.log('filterOptions', filterOptions);
      console.log('paginateOptions', paginateOptions);
      console.log('searchOptions', searchOptions);
      findOptions.order = {
        [(sortBy ?? 'id') as string]: sortOrder ?? 'ASC',
      } as FindOptionsOrder<T>;

      if (searchBy && search)
        findOptions.where = {
          ...findOptions.where,
          [searchBy ?? ('name' as string)]: ILike(`%${String(search)}%`),
        } as FindOptionsWhere<T>;

      if (filterOptions)
        findOptions.where = {
          ...findOptions.where,
          ...filters,
        } as FindOptionsWhere<T>;

      // Pagination options
      if (limit || page || cursor) {
        return await this.repository.findPaginated(
          paginateOptions,
          findOptions,
        );
      }

      // Default
      return this.repository.find(findOptions);
    } catch (error) {
      console.error('BaseService.findAll error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to fetch entities',
      );
    }
  }

  async findOne(id: number): Promise<T | null> {
    try {
      return this.repository.findOne({
        where: { id: id } as unknown as FindOptionsWhere<T>, // Unknown Type
      });
    } catch (error) {
      console.error('BaseService.findOne error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to fetch entity',
      );
    }
  }

  async update(id: number, updateEntityDto: DeepPartial<T>): Promise<T | null> {
    try {
      await this.repository.update(
        id,
        updateEntityDto as QueryDeepPartialEntity<T>,
      );
      return this.findOne(id);
    } catch (error) {
      console.error('BaseService.update error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to update entity',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      console.error('BaseService.remove error', error);
      throw new InternalServerErrorException(
        error?.message ?? 'Failed to remove entity',
      );
    }
  }
}

import {
  IFilterOptions,
  IListOptions,
  IPaginateOptions,
  IPagination,
  ISearchOptions,
} from 'src/common/interfaces/paginate.interfaces';

export interface IBaseRepository<T> {}

export interface IBaseService<T> {
  create(entity: T | any): Promise<T>;

  findAll(listOptions?: IListOptions<T>): Promise<T[] | IPagination<T> | any>;

  findOne(id: number): Promise<T | null>;

  update(id: number, entity: T | any): Promise<T | null>;

  remove(id: number): Promise<void>;
}

export interface IBaseController<T> {
  create(entity: T | any): Promise<T>;

  findAll(listOptions?: IListOptions<T>): Promise<T[] | IPagination<T> | any>;

  findOne(id: number): Promise<T | null>;

  update(id: number, entity: T | any): Promise<T | null>;

  remove(id: number): Promise<void>;
}

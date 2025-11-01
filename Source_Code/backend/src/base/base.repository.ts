import { IPaginateOptions } from 'src/common/interfaces/paginate.interfaces';
import {
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  MoreThan,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  // Cant extends Repository
  constructor(private repository: Repository<T>) {
    super(repository.target, repository.manager);
  }

  async findPaginated(
    paginateOptions: IPaginateOptions<T>,
    options?: FindManyOptions<T>,
  ) {
    const { limit, page, cursor, sortOrder, sortBy } = paginateOptions;
    const pageInt = parseInt(page ?? '1') > 0 ? parseInt(page ?? '1') : 1;
    const limitInt = parseInt(limit ?? '5') > 0 ? parseInt(limit ?? '5') : 5;
    const findOptions = options ?? ({} as FindManyOptions<T>);
    findOptions.skip = (pageInt - 1) * limitInt;
    findOptions.take = limitInt;
    findOptions.order = {
      [(sortBy ?? 'id') as string]: sortOrder ?? 'ASC',
    } as FindOptionsOrder<T>;
    const [data, total] = await this.findAndCount(findOptions);
    const returnObject = {
      page: pageInt,
      pageLimit: limitInt,
      totalPage: Math.ceil(total / limitInt),
      totalItem: total,
      data: data,
    };
    return returnObject;
  }

  async cursorPagination(
    paginateOptions: IPaginateOptions<T>,
    options?: FindManyOptions<T>,
  ) {
    //Cursor pagination
    const pageInt =
      parseInt(paginateOptions.page ?? '1') > 0
        ? parseInt(paginateOptions.page ?? '1')
        : 1;
    const limitInt =
      parseInt(paginateOptions.limit ?? '5') > 0
        ? parseInt(paginateOptions.limit ?? '5')
        : 5;
    const cursor = paginateOptions.cursor ?? null;
    // Cursor by ID
    const cursorId = cursor === null ? 0 : +cursor;

    const findOptions = options ?? ({} as FindManyOptions<T>);
    findOptions.order = {
      [(paginateOptions.sortBy ?? 'id') as string]:
        paginateOptions.sortOrder ?? 'ASC',
    } as FindOptionsOrder<T>;
    findOptions.take = limitInt;
    findOptions.where = {
      ...findOptions.where,
      id: MoreThan(cursorId),
    } as FindOptionsWhere<T>;

    const [data, total] = await this.findAndCount(findOptions);

    const nextCursor = data.length === limitInt ? data[data.length - 1].id : 0;
    return {
      page: pageInt,
      pageLimit: limitInt,
      totalPage: Math.ceil(total / limitInt),
      totalItem: total,
      data: data,
      next: nextCursor,
      hashNext: nextCursor !== 0,
      previous: cursorId > 0 ? cursorId - 1 : null,
      hashPrevious: cursorId > 0,
    };
  }
}

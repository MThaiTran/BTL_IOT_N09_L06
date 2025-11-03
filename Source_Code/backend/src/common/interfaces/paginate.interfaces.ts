export interface IPaginateOptions<T> {
  limit?: string;
  page?: string;
  cursor?: string | null;
  sortOrder?: 'ASC' | 'DESC';
  sortBy?: keyof T;
}

export interface IFilterOptions<T> {
  [key: string]: any;
}

export interface ISearchOptions<T> {
  searchBy?: keyof T;
  search?: string;
}

export interface IListOptions<T>
  extends IPaginateOptions<T>,
    IFilterOptions<T>,
    ISearchOptions<T> {}

export interface IPagination<T> {
  page: number;
  pageLimit: number;
  totalPage: number;
  totalItem: number;
  data: T[];
  // cursor paging
  next?: string;
  hashNext?: boolean;
  previous?: string;
  hashPrevious?: boolean;
}

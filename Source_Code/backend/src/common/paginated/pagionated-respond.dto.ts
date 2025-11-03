import { ApiProperty } from '@nestjs/swagger';
import { IPagination } from 'src/common/interfaces/paginate.interfaces';

export class PaginatedResponseDto<T> implements IPagination<T> {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageLimit: number;

  @ApiProperty()
  totalPage: number;

  @ApiProperty()
  totalItem: number;

  @ApiProperty({ isArray: true })
  data: T[];

  // cursor paging
  @ApiProperty()
  next?: string;

  @ApiProperty()
  hashNext?: boolean;

  @ApiProperty()
  previous?: string;

  @ApiProperty()
  hashPrevious?: boolean;
}

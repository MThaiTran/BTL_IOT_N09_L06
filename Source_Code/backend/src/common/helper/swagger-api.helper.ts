import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/paginated/pagionated-respond.dto';

export function ApiFindAll(ItemDto: any) {
  const itemKeys: MethodDecorator[] = [];
  // Get property names from the DTO class prototype
  const propertyNames = Object.getOwnPropertyNames(new ItemDto());
  const tmp = Object.create(ItemDto);
  for (const key of propertyNames) {
    itemKeys.push(ApiQuery({ name: key, required: false, type: String }));
  }
  return applyDecorators(
    ...itemKeys,
    ApiQuery({ name: 'page', required: false, type: String }),
    ApiQuery({ name: 'limit', required: false, type: String }),
    ApiQuery({ name: 'cursor', required: false, type: String }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] }),
    ApiQuery({ name: 'sortBy', required: false, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiOperation({ summary: 'Get all items with optional pagination' }),
    ApiOkResponse({ description: 'List of all results', type: [ItemDto] }),
    ApiBadRequestResponse({ description: 'Invalid query parameters' }),
  );
}

export function ApiFindAllPaginate(ItemDto: any) {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: String }),
    ApiQuery({ name: 'limit', required: false, type: String }),
    ApiQuery({ name: 'cursor', required: false, type: String }),

    ApiOperation({ summary: 'Get all items with pagination' }),
    ApiOkResponse({
      description: 'List of paginated results',
      type: PaginatedResponseDto<typeof ItemDto>,
    }),
    ApiBadRequestResponse({ description: 'Invalid query parameters' }),
  );
}

export function ApiFindOne(ItemDto: any) {
  return applyDecorators(
    ApiOperation({ summary: 'Get a single item by ID' }),
    ApiOkResponse({ description: 'The found item', type: ItemDto }),
    ApiNotFoundResponse({ description: 'Item not found' }),
    ApiBadRequestResponse({ description: 'Invalid ID format' }),
  );
}

export function ApiCreateOne(ItemDto: any, CreateItemDto: any) {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new item' }),
    ApiBody({ type: CreateItemDto, description: 'Item creation payload' }),
    ApiCreatedResponse({
      description: 'Item successfully created',
      type: ItemDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
  );
}

export function ApiUpdateOne(ItemDto: any, UpdateItemDto: any) {
  return applyDecorators(
    ApiOperation({ summary: 'Update an existing item' }),
    ApiBody({ type: UpdateItemDto, description: 'Item update payload' }),
    ApiOkResponse({ description: 'Item successfully updated', type: ItemDto }),
    ApiNotFoundResponse({ description: 'Item not found' }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
  );
}

export function ApiDeleteOne(ItemDto: any) {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an item by ID' }),
    ApiOkResponse({ description: 'Item successfully deleted', type: ItemDto }),
    ApiNotFoundResponse({ description: 'Item not found' }),
    ApiBadRequestResponse({ description: 'Invalid ID format' }),
  );
}

export function ApiGuard() {
  return applyDecorators(
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 200, description: 'Success' }),
  );
}

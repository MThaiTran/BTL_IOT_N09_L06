import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { UpdateSystemLogDto } from './dto/update-system-log.dto';
import {
  ApiCreateOne,
  ApiDeleteOne,
  ApiFindAll,
  ApiFindOne,
  ApiUpdateOne,
} from 'src/common/helper/swagger-api.helper';
import { SystemLog } from './entities/system-log.entity';
import { RequestPermission } from 'src/common/helper/common.helper';
import { EPermission } from 'src/common/enum/enum';
import { ApiBearerAuth } from '@nestjs/swagger';

const tableName = 'SystemLog';
@ApiBearerAuth()
@Controller('system-logs')
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @ApiCreateOne(SystemLog, CreateSystemLogDto)
  @RequestPermission(EPermission.ADD_ONE, tableName)
  @Post()
  create(@Body() createSystemLogDto: CreateSystemLogDto) {
    return this.systemLogsService.create(createSystemLogDto);
  }

  @ApiFindAll(SystemLog)
  @RequestPermission(EPermission.GET_ALL, tableName)
  @Get()
  findAll() {
    return this.systemLogsService.findAll();
  }

  @ApiFindOne(SystemLog)
  @RequestPermission(EPermission.GET_ONE, tableName)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemLogsService.findOne(+id);
  }

  @ApiUpdateOne(SystemLog, UpdateSystemLogDto)
  @RequestPermission(EPermission.EDIT_ONE, tableName)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSystemLogDto: UpdateSystemLogDto,
  ) {
    return this.systemLogsService.update(+id, updateSystemLogDto);
  }

  @ApiDeleteOne(SystemLog)
  @RequestPermission(EPermission.DELETE_ONE, tableName)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemLogsService.remove(+id);
  }
}

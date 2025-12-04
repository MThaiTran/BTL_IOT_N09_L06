import { PartialType } from '@nestjs/mapped-types';
import { CreateFileHandlerDto } from './create-file-handler.dto';

export class UpdateFileHandlerDto extends PartialType(CreateFileHandlerDto) {}

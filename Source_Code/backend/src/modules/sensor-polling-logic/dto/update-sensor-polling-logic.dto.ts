import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorPollingLogicDto } from './create-sensor-polling-logic.dto';

export class UpdateSensorPollingLogicDto extends PartialType(CreateSensorPollingLogicDto) {}

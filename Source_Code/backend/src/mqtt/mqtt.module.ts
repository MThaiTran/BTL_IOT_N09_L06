import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SystemLogsModule } from 'src/modules/system-logs/system-logs.module';
import { MqttController } from './mqtt.controller';

@Module({
  controllers: [MqttController],
  imports: [SystemLogsModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}

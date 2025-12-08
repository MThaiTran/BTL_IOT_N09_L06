import { MQTT_CONFIG } from 'src/common/configs/mqtt.config';
import { CreateMqttDto } from './dto/create-mqtt.dto';
import { UpdateMqttDto } from './dto/update-mqtt.dto';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { SystemLogsService } from 'src/modules/system-logs/system-logs.service';
import { EDeviceLog } from 'src/common/enum/enum';
import { DeepPartial } from 'typeorm';
import { Device } from 'src/modules/devices/entities/device.entity';
import { MqttDeviceTopicDto } from './dto/topics-mqtt.dto';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly systemLogsService: SystemLogsService;

  constructor(systemLogsService: SystemLogsService) {
    this.systemLogsService = systemLogsService;
  }

  onModuleInit() {
    this.client = mqtt.connect(MQTT_CONFIG.CONNECT_URL_TLS, {
      clean: true,
      connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT,
      username: MQTT_CONFIG.USERNAME,
      password: MQTT_CONFIG.PASSWORD,
      reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
    });

    this.client.on('connect', () => {
      console.log('✅ Connected to HiveMQ Broker!');
      this.subscribeToTopics();
    });

    // Cần bổ sung xử lý các trạng thái ngắt kết nối:
    this.client.on('disconnect', (packet) => {
      console.warn('⚠️ MQTT Disconnected:', packet);
    });

    this.client.on('close', () => {
      console.warn('❌ MQTT Connection closed.');
    });

    // Thêm xử lý lỗi, vì lỗi cũng có thể dẫn đến mất kết nối
    this.client.on('error', (error) => {
      console.error('🔥 MQTT Error:', error);
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Attempting to reconnect...');
    });

    this.client.on('message', this.handleIncomingMessage.bind(this));
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
      console.log('🔌 Disconnected from MQTT Broker.');
    }
  }

  // Phương thức đăng ký nhận tin
  private subscribeToTopics() {
    // Đăng ký nhận tin từ các topic bạn quan tâm
    const topics = Object.values(MQTT_CONFIG.SUB_TOPICS);

    this.client.subscribe(topics, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Subscription failed:', err);
      } else {
        console.log(
          `📡 Subscribed successfully to topics: ${topics.join(', ')}`,
        );
      }
    });
  }

  // Phương thức xử lý tin nhắn đến
  private handleIncomingMessage(topic: string, payload: Buffer) {
    // const message = JSON.parse(payload.toString()); /////////
    const mockPayload = { test: 'data' };
    let payloadObject = null;
    let message = '';
    try {
      payloadObject = JSON.parse(payload.toString());
    } catch (error) {
      console.error('Invalid JSON message:', error);
    }

    if (!payloadObject) {
      message = payload.toString();
    } else {
      message = JSON.stringify(payloadObject);
    }
    console.log(`[MQTT Message] Topic: ${topic} | Payload: ${message}`);

    // Logic xử lý nghiệp vụ tại đây:
    // 1. Phân tích cú pháp message (thường là JSON)
    // 2. Gọi các Service khác (ví dụ: DeviceService) để cập nhật trạng thái
    // 3. Lưu dữ liệu lịch sử vào Database
    if (topic.startsWith(MQTT_CONFIG.SUB_TOPICS.LOGS)) {
      // Xử lý log message
      const tempLogDto = {
        log: EDeviceLog.INFO,
        logDescription: 'TEST LOG FROM MQTT',
        logData: JSON.stringify({ test: 'data' }),
        userId: 1,
        deviceId: null, // message là 1 mảng >> nên lấy hay ko ?
      };
      this.systemLogsService.create(tempLogDto);
    } else if (topic.startsWith(MQTT_CONFIG.SUB_TOPICS.WARNINGS)) {
      // Xử lý warning message
      const tempWarningDto = {
        log: EDeviceLog.WARNING,
        logDescription: 'TEST LOG FROM MQTT',
        logData: JSON.stringify({ test: 'data' }),
        userId: 1,
        deviceId: null, // Có thể lấy từ message nếu có
      };
      this.systemLogsService.create(tempWarningDto);
    }
  }

  // Có thể thêm phương thức public để các Service khác publish tin nhắn nếu cần
  public publish(
    topic: string = MQTT_CONFIG.PUB_TOPICS.DEVICES,
    deviceId: number,
    updateDto: DeepPartial<Device>,
  ) {
    // Data preprocessing
    const data: MqttDeviceTopicDto = {
      id: deviceId,
      state: updateDto.state,
      autoMode: updateDto.autoMode,
      status: updateDto.status,
      tempHigher: updateDto.thresholdHigh,
      tempLower: updateDto.thresholdLow,
    } as MqttDeviceTopicDto;

    console.log('Publishing MQTT message...', topic, data);
    if (this.client && this.client.connected) {
      this.client.publish(topic, JSON.stringify(data), { qos: 2 }); // Qos  2 đảm bảo tin nhắn được nhận ít nhất một lần
      console.log(
        `[MQTT Publish] Topic: ${topic} | Message: ${JSON.stringify(data)}`,
      );
    }
  }
}

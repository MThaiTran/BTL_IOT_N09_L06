import { CreateMqttDto } from './dto/create-mqtt.dto';
import { UpdateMqttDto } from './dto/update-mqtt.dto';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private isConnected = false;

  // Thay thế bằng thông tin kết nối HiveMQ Cloud của bạn
  private readonly HOST = process.env.MQTT_BROKER_URL; // Ví dụ
  private readonly PORT = 8883; // Cổng SSL/TLS mặc định
  private readonly USERNAME = process.env.MQTT_USERNAME;
  private readonly PASSWORD = process.env.MQTT_PASSWORD;

  onModuleInit() {
    const connectUrl = `mqtts://${this.HOST}:${this.PORT}`; // Sử dụng mqtts cho kết nối TLS/SSL

    this.client = mqtt.connect(connectUrl, {
      clean: true,
      connectTimeout: 4000,
      username: this.USERNAME,
      password: this.PASSWORD,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      console.log('✅ Connected to HiveMQ Broker!');
      this.isConnected = true;
      this.subscribeToTopics();
    });

    // Cần bổ sung xử lý các trạng thái ngắt kết nối:
    this.client.on('disconnect', (packet) => {
      console.warn('⚠️ MQTT Disconnected:', packet);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.warn('❌ MQTT Connection closed.');
      this.isConnected = false;
    });

    // Thêm xử lý lỗi, vì lỗi cũng có thể dẫn đến mất kết nối
    this.client.on('error', (error) => {
      console.error('🔥 MQTT Error:', error);
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('🔄 Attempting to reconnect...');
      this.isConnected = false; // Đặt thành false trong khi đang kết nối lại
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
    const topics = ['smart/home/+/status', 'smart/home/alert', 'hello'];

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
    const message = payload.toString();
    console.log(`[MQTT Message] Topic: ${topic} | Payload: ${message}`);

    // Logic xử lý nghiệp vụ tại đây:
    // 1. Phân tích cú pháp message (thường là JSON)
    // 2. Gọi các Service khác (ví dụ: DeviceService) để cập nhật trạng thái
    // 3. Lưu dữ liệu lịch sử vào Database
  }

  // Có thể thêm phương thức public để các Service khác publish tin nhắn nếu cần
  public publish(topic: string, message: string) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message, { qos: 1 });
      console.log(`[MQTT Publish] Topic: ${topic} | Message: ${message}`);
    }
  }
}

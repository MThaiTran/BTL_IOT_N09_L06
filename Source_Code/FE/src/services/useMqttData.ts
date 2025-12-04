// src/hooks/useMqttData.ts
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqttConfig';

// Định nghĩa kiểu dữ liệu trả về từ cảm biến
interface SensorData {
  temp: number;
  hum: number;
  lux: number;
  motion: boolean;

}
interface MqttData {
  data: SensorData;
  status: string;
}

export const useMqttData = () => {
  const [data, setData] = useState<SensorData>({ temp: 0, hum: 0, lux: 0, motion: false });
  const [status, setStatus] = useState<string>('Connecting...');

  useEffect(() => {
    // Tạo chuỗi kết nối
    const connectUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;
    
    const client = mqtt.connect(connectUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: 'web_client_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 4000,
    });

    client.on('connect', () => {
      setStatus('Connected');
      console.log('MQTT Connected via WebSockets');
      client.subscribe(MQTT_CONFIG.topics.sensors);
    });

    client.on('message', (topic, message) => {
      if (topic === MQTT_CONFIG.topics.sensors) {
        try {
          const parsedData = JSON.parse(message.toString());
          setData(parsedData);
        } catch (error) {
          console.error('JSON Parse error', error);
        }
      }
    });

    client.on('error', (err) => {
      console.error('Connection error: ', err);
      setStatus('Error');
      client.end();
    });

    return () => {
      if (client.connected) client.end();
    };
  }, []);

  return { data, status };
};
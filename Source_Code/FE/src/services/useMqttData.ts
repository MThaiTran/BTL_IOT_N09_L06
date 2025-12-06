// src/services/useMqttData.ts
import { useEffect, useState, useRef } from 'react'; // Thêm useRef
import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config/mqttConfig';

interface SensorData {
  temp: number;
  hum: number;
  lux: number;
  motion: boolean;
}

interface RelayData {
  relay1: number;
  relay2: number;
}

export const useMqttData = () => {
  const [data, setData] = useState<SensorData>({ temp: 0, hum: 0, lux: 0, motion: false });
  const [relayData, setRelayData] = useState<RelayData>({ relay1: 0, relay2: 0 });
  const [status, setStatus] = useState<string>('Connecting...');
  
  // Dùng useRef để giữ kết nối client mà không gây render lại
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const connectUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;
    
    const client = mqtt.connect(connectUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: 'web_client_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 4000,
    });

    clientRef.current = client; // Lưu client vào ref

    client.on('connect', () => {
      setStatus('Connected');
      // Subscribe topic nhận dữ liệu
      client.subscribe([MQTT_CONFIG.topics.sensors, MQTT_CONFIG.topics.relays]);
    });

    client.on('message', (topic, message) => {
      try {
        const parsedData = JSON.parse(message.toString());
        if (topic === MQTT_CONFIG.topics.sensors) {
          setData(parsedData);
        } else if (topic === MQTT_CONFIG.topics.relays) {
          setRelayData(parsedData);
        }
      } catch (error) {
        console.error('JSON Parse error', error);
      }
    });

    return () => {
      if (client.connected) client.end();
    };
  }, []);

  // Hàm gửi lệnh điều khiển (Publish)
  const sendCommand = (topic: string, message: string) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish(topic, message);
      console.log(`Sent: ${message} to ${topic}`);
    } else {
      console.error('MQTT Client not connected');
    }
  };

  // Trả về thêm hàm sendCommand
  return { data, relayData, status, sendCommand };
};
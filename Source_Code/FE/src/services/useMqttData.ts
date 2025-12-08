// src/services/useMqttData.ts
import { useEffect, useState, useRef } from "react"; // Thêm useRef
import mqtt from "mqtt";
import { MQTT_CONFIG } from "../config/mqttConfig";
import {
  AvaialbilityTopicDto,
  StatusTopicDto,
} from "../interfaces/dtos.interface";
import { set } from "date-fns";
import { te } from "date-fns/locale";

function handleMessage(topic: string, message: string) {
  console.log(`Received message on topic ${topic}: ${message}`);
}

export const useMqttData = () => {
  const [statusData, setStatusData] = useState<StatusTopicDto>();
  const [status, setStatus] = useState<string>("Connecting...");
  const [availabilityData, setAvailabilityData] = useState<boolean>();

  // Dùng useRef để giữ kết nối client mà không gây render lại
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const connectUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;

    const client = mqtt.connect(connectUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: "web_client_" + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 4000,
    });

    clientRef.current = client; // Lưu client vào ref

    client.on("connect", () => {
      setStatus("Connected");
      client.subscribe(Array.from(Object.values(MQTT_CONFIG.topics)));
    });

    client.on("message", (topic, message) => {
      console.log(
        `Received: ${
          // (JSON.parse(message.toString()) as AvaialbilityTopicDto).availability
          message.toString()
        } from ${topic}`
      );

      if (topic === MQTT_CONFIG.topics.availability) {
        setAvailabilityData(
          (JSON.parse(message.toString()) as AvaialbilityTopicDto).availability
        );
        const tempAvailability = (
          JSON.parse(message.toString()) as AvaialbilityTopicDto
        ).availability;
        if (!tempAvailability) {
          const tempOfflineDatas: StatusTopicDto = {
            sensors: {
              temp: 0,
              hum: 0,
              motion: false,
            },
            devices: [],
          };
          console.log("Availability false, set all devices to offline");
          setStatusData(tempOfflineDatas);
        }
      } else {
        try {
          const parsedData = JSON.parse(message.toString());
          if (topic === MQTT_CONFIG.topics.status) {
            setStatusData(parsedData);
          }
          // } else if (topic === MQTT_CONFIG.topics.relays) {
          //   setRelayData(parsedData);
        } catch (error) {
          console.error("JSON Parse error", error);
        }
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
      console.error("MQTT Client not connected");
    }
  };

  // Trả về thêm hàm sendCommand
  return { statusData, status, sendCommand };
};

export const MQTT_CONFIG = {
  host: import.meta.env.VITE_MQTT_HOST,
  port: Number(import.meta.env.VITE_MQTT_WSS_PORT),
  protocol: import.meta.env.VITE_MQTT_PROTOCOL,
  username: import.meta.env.VITE_MQTT_USERNAME,
  password: import.meta.env.VITE_MQTT_PASSWORD,
  path: import.meta.env.VITE_MQTT_PATH,
  topics: {
    tests: import.meta.env.VITE_MQTT_TESTS_TOPIC,
    status: import.meta.env.VITE_MQTT_STATUS_TOPIC,
    logs: import.meta.env.VITE_MQTT_LOGS_TOPIC,
    warnings: import.meta.env.VITE_MQTT_WARNINGS_TOPIC,
    availability: import.meta.env.VITE_MQTT_AVAILABILITY_TOPIC,
  },
};

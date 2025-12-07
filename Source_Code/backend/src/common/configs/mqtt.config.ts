export const MQTT_CONFIG = {
  HOST: process.env.MQTT_BROKER_URL,
  PORT: 8883,
  USERNAME: process.env.MQTT_USERNAME,
  PASSWORD: process.env.MQTT_PASSWORD,
  CONNECT_URL_TLS: `mqtts://${process.env.MQTT_BROKER_URL}:8883`,
  CONNECT_URL_NON_TLS: `mqtt://${process.env.MQTT_BROKER_URL}:1883`,
  CONNECT_TIMEOUT: 4000,
  RECONNECT_PERIOD: 1000,
  SUB_TOPICS: {
    LOGS: process.env.MQTT_LOGS_TOPIC || 'logs',
    WARNINGS: process.env.MQTT_WARNINGS_TOPIC || 'warnings',
  },
  PUB_TOPICS: {
    DEVICES: process.env.MQTT_DEVICES_TOPIC || 'devices',
  },
};

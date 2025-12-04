// src/config/mqttConfig.ts
// npm i mqtt
export const MQTT_CONFIG = {
  host: '29e338b948b3405391a0847c592b0174.s1.eu.hivemq.cloud',
  port: 8884, // Port WSS
  protocol: 'wss' as const, // 'wss' cho bảo mật, 'ws' cho thường
  username: 'WebViewer',
  password: 'WebViewer123',
  path: '/mqtt',
  topics: {
    sensors: 'myproject/sensors',
   // controls: 'smarthome/controls/+',
    relays: 'myproject/relays'

  }
};
//     #define MQTT_TOPIC_SENSORS "myproject/sensors"
// #define MQTT_TOPIC_RELAYS "myproject/relays"
// dữ liệu tới
//      {"temp":26.8,"hum":58.5,"motion":false}
//      topic myproject/relays dưới dạng JSON ntn: {"relay1":1, "relay2":0}
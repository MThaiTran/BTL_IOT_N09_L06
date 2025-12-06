// src/config/mqttConfig.ts
// npm i mqtt
export const MQTT_CONFIG = {
  // real host: '29e338b948b3405391a0847c592b0174.s1.eu.hivemq.cloud',
  host: '37908302bb4f49caace8c0d5a5c6b140.s1.eu.hivemq.cloud',
  port: 8884, // Port WSS
  protocol: 'wss' as const, // 'wss' cho bảo mật, 'ws' cho thường
  // real username: 'WebViewer',
  // password: 'WebViewer123',
  username: 'smart-home-iot',
  password: 'password123A',
  path: '/mqtt',
  topics: {
    sensors: 'myproject/sensors1',
   // controls: 'smarthome/controls/+',
    relays: 'myproject/relays1'
    
  }
};
//     #define MQTT_TOPIC_SENSORS "myproject/sensors"
// #define MQTT_TOPIC_RELAYS "myproject/relays"
// dữ liệu tới
//      {"temp":26.8,"hum":58.5,"motion":false}
//      topic myproject/relays dưới dạng JSON ntn: {"relay1":1, "relay2":0}
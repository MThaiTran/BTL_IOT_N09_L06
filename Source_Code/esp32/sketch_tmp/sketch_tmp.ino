#include <WiFi.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include "login_infos.h"
#include "control_infos.h"



#define MQTT_TOPIC_STATUS "esp32/pubStatus"           // Done
#define MQTT_TOPIC_LOGS "esp32/pubLogs"               // Chek req
#define MQTT_TOPIC_WARNS "esp32/pubWarnings"          //
#define MQTT_TOPIC_DEVICES "esp32/subDevices"         // Check req
#define MQTT_TOPIC_AVAILABILITY "esp32/availability"  // Check req

// Running the code on your own require these parameters:
// #define WIFI_SSID "WIFI_NAME" <- Replaced by WifiManager soon
// #define WIFI_PASSWORD "WIFI_PASS" <- Replaced by WifiManager soon
// #define MQTT_SERVER "MQTT_URL"
// #define MQTT_PORT PORT_NUM
// #define MQTT_USER "HIVEMQ_USERNAME"
// #define MQTT_PASS "HIVEMQ_PASSWORD"

#define DHT_PIN 25
#define PIR_PIN 26
#define DHT_TYPE DHT11

const int NUM_DEVICES = 6;

Device myDevices[NUM_DEVICES] = {
  // ID, Pin, State, AutoMode, T_High, H_High, Mot_On, T_Low,  H_Low,  Mot_Off
  { 8, 23, 0, 0, NAN, NAN, 0, NAN, NAN, 0 },
  { 9, 22, 0, 0, NAN, NAN, 0, NAN, NAN, 0 },
  { 10, 19, 0, 0, NAN, NAN, 0, NAN, NAN, 0 },
  { 11, 18, 0, 0, NAN, NAN, 0, NAN, NAN, 0 },
  { 12, 17, 0, 0, NAN, NAN, 0, NAN, NAN, 0 },
  { 13, 16, 0, 0, NAN, NAN, 0, NAN, NAN, 0 }
};

WiFiManager wm;
WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

const long interval = 2000;
const long logInterval = 20000;
const char* MQTT_WILL = "\"availability\": false";
const char* MQTT_WILL_CONNECTED = "\"availability\": true";

unsigned long lastLogTime = 0;
unsigned long lastMsgTime = 0;

// HiveMQ Cloud Let's Encrypt CA certificate
static const char* root_ca PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";


// currently unused - test first_run.ino needed to test UX
// void setup_wifi() {
//   delay(100);
//   Serial.println();
//   Serial.print("Connecting to ");
//   Serial.println(WIFI_SSID);

//   WiFi.mode(WIFI_STA);
//   WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//   while (WiFi.status() != WL_CONNECTED) {
//     delay(1000);
//     Serial.println("Wifi connect failed. Reconnecting...");
//   }

//   Serial.println("\nWiFi connected");
//   Serial.println(WiFi.localIP());
// }



void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS, MQTT_TOPIC_AVAILABILITY, 1, true, MQTT_WILL)) {
      Serial.println("connected");
      client.publish(MQTT_TOPIC_AVAILABILITY, MQTT_WILL_CONNECTED, true);
      client.subscribe(MQTT_TOPIC_DEVICES);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5s");
      delay(5000);
    }
  }
}



void setup() {
  Serial.begin(115200);
  delay(1000);



  // pinMode(RESET_PIN, INPUT_PULLUP);

  // if (digitalRead(RESET_PIN) == LOW) {
  //   Serial.println("Reset Button Held...");
  //   Serial.println("Erasing WiFi Settings in 3 seconds...");
  //   delay(3000);

  //   if (digitalRead(RESET_PIN) == LOW) {
  //     WiFiManager wm;
  //     wm.resetSettings();
  //     Serial.println("Settings Erased! Restarting...");
  //     ESP.restart();
  //   }
  // }



  // Init Sensors
  dht.begin();
  pinMode(PIR_PIN, INPUT);

  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(myDevices[i].pin, OUTPUT);
    digitalWrite(myDevices[i].pin, LOW);
  }

  Serial.println("System initializing...");

  // Init Network
  // setup_wifi();
  start_wifi_manager();
  espClient.setCACert(root_ca);
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  client.setBufferSize(2048);
}



void publishWarning(int devId, const char* threshName, float threshVal, float currentVal) {
  StaticJsonDocument<256> doc;

  doc["id"] = devId;
  doc["threshold"] = threshName;
  doc["thresholdValue"] = threshVal;
  doc["value"] = currentVal;

  String output;
  serializeJson(doc, output);

  Serial.print(">> Sending WARNING: ");
  Serial.println(output);

  client.publish(MQTT_TOPIC_WARNS, output.c_str());
}



void publishLog() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  bool m = (digitalRead(PIR_PIN) == HIGH);

  if (isnan(t) || isnan(h)) return;

  DynamicJsonDocument log(1024);

  // Object Sensors
  JsonObject sensors = log.createNestedObject("sensors");
  sensors["temp"] = t;
  sensors["hum"] = h;
  sensors["motion"] = m;

  // Array Devices
  JsonArray devices = log.createNestedArray("devices");
  for (int i = 0; i < NUM_DEVICES; i++) {
    JsonObject devObj = devices.createNestedObject();
    devObj["id"] = myDevices[i].id;
    devObj["state"] = myDevices[i].state;
    devObj["autoMode"] = myDevices[i].autoMode;
  }

  String output;
  serializeJson(log, output);

  Serial.println(">> Sending LOG data...");
  client.publish(MQTT_TOPIC_LOGS, output.c_str());
}



void publishStatus() {
  // --- READ SENSORS ---
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  int motion = digitalRead(PIR_PIN);

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // --- PREPARE JSON ---
  DynamicJsonDocument doc(2048);

  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temp"] = t;
  sensors["hum"] = h;
  sensors["motion"] = (motion == HIGH);

  JsonArray devicesArray = doc.createNestedArray("devices");
  for (int i = 0; i < NUM_DEVICES; i++) {
    JsonObject devObj = devicesArray.createNestedObject();
    myDevices[i].state = digitalRead(myDevices[i].pin);
    devObj["id"] = myDevices[i].id;
    devObj["state"] = myDevices[i].state;
    devObj["autoMode"] = myDevices[i].autoMode;
  }


  String output;
  serializeJson(doc, output);

  // --- PUBLISH TO HIVEMQ ---
  Serial.print("Publishing message: ");
  Serial.println(output);
  client.publish(MQTT_TOPIC_STATUS, output.c_str());
}



void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost! Reconnecting...");
    // setup_wifi();
    // return;

    delay(10000);
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Still disconnected. Rebooting to restart WiFi Manager.");
      ESP.restart();
    }
  }

  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  unsigned long now = millis();

  if (now - lastLogTime > logInterval) {
    lastLogTime = now;
    publishLog();
  }

  if (now - lastMsgTime > interval) {
    lastMsgTime = now;
    checkAutoRules();
    publishStatus();
  }
}
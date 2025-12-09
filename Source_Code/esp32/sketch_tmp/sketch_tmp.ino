#include <WiFi.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPUpdate.h>
#include "DHT.h"
#include "login_infos.h"
#include "control_infos.h"



const int CODE_VERSION = 2;



#define MQTT_TOPIC_STATUS "esp32/status"              // Done
#define MQTT_TOPIC_LOGS "esp32/logs"                  // Chek req
#define MQTT_TOPIC_WARNS "esp32/warnings"             //
#define MQTT_TOPIC_DEVICES "esp32/devices"            // Check req
#define MQTT_TOPIC_AVAILABILITY "esp32/availability"  // Check req
#define MQTT_TOPIC_OTA "esp32/ota"

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
#define RESET_PIN 0

const int NUM_DEVICES = 6;

Device myDevices[NUM_DEVICES] = {
  // ID, Pin, State, AutoMode, T_High, H_High, Mot_On, T_Low,  H_Low,  Mot_Off
  { 8, 16, true, false, NAN, NAN, false, NAN, NAN, false },
  { 9, 17, true, false, NAN, NAN, false, NAN, NAN, false },
  { 10, 18, true, false, NAN, NAN, false, NAN, NAN, false },
  { 11, 19, true, false, NAN, NAN, false, NAN, NAN, false },
  { 12, 21, true, false, NAN, NAN, false, NAN, NAN, false },
  { 13, 23, false, false, NAN, NAN, false, NAN, NAN, false }
};

SensorData currentSensors = { NAN, NAN, false, false };

WiFiManager wm;
WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

const long interval = 2000;
const long logInterval = 20000;
const long wifiCheckInterval = 20000;
const char* MQTT_WILL = "{\"availability\": false}";
const char* MQTT_WILL_CONNECTED = "{\"availability\": true}";

unsigned long lastLogTime = 0;
unsigned long lastStatusTime = 0;
unsigned long lastWifiCheck = 0;

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



void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS, MQTT_TOPIC_AVAILABILITY, 1, true, MQTT_WILL)) {
      Serial.println("connected");
      client.publish(MQTT_TOPIC_AVAILABILITY, MQTT_WILL_CONNECTED, true);
      client.subscribe(MQTT_TOPIC_DEVICES);
      client.subscribe(MQTT_TOPIC_OTA);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5s");
      delay(5000);
    }
  }
}



void start_wifi_manager() {
  WiFiManager wm;
  wm.setConfigPortalTimeout(180);

  Serial.println("Starting WiFi Manager...");
  bool res = wm.autoConnect("ESP32_Config_AP");

  if (!res) {
    Serial.println("Failed to connect to WiFi (timeout).");
    ESP.restart();
  } else {
    Serial.println("WiFi Connected successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }
}



void setup() {
  Serial.begin(115200);
  delay(1000);

  // wm.resetSettings();

  pinMode(RESET_PIN, INPUT_PULLUP);

  if (digitalRead(RESET_PIN) == LOW) {
    Serial.println("Reset Button Held...");
    Serial.println("Erasing WiFi Settings in 3 seconds...");
    delay(5000);

    if (digitalRead(RESET_PIN) == LOW) {
      WiFiManager wm;
      wm.resetSettings();
      Serial.println("Settings Erased! Restarting...");
      ESP.restart();
    }
  }

  dht.begin();
  pinMode(PIR_PIN, INPUT);

  for (int i = 0; i < NUM_DEVICES; i++) {
    pinMode(myDevices[i].pin, OUTPUT);
    digitalWrite(myDevices[i].pin, LOW);
  }

  Serial.println("System initializing...");

  start_wifi_manager();
  espClient.setCACert(root_ca);
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);

  client.setBufferSize(2048);

  Serial.print("-----CODE VERSION: ");
  Serial.print(CODE_VERSION);
  Serial.print("-----");
  Serial.println();

  Serial.println("Applying initial device states...");

  for (int i = 0; i < NUM_DEVICES; i++) {
    // 1. Configure the GPIO as Output
    pinMode(myDevices[i].pin, OUTPUT);

    // 2. Write the default state immediately
    // If your array says 'true', this turns the pin HIGH
    // If your array says 'false', this turns the pin LOW
    digitalWrite(myDevices[i].pin, myDevices[i].state ? HIGH : LOW);

    Serial.printf("Device %d (Pin %d) initialized to %s\n",
                  myDevices[i].id,
                  myDevices[i].pin,
                  myDevices[i].state ? "ON" : "OFF");
  }

  Serial.println("System Initializing Complete.");
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



void publishSystemData(const char* topic) {
  if (!currentSensors.valid) {
    Serial.println("Cannot publish data: Sensor read invalid.");
    return;
  }

  DynamicJsonDocument doc(2048);

  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temp"] = currentSensors.temp;
  sensors["hum"] = currentSensors.hum;
  sensors["motion"] = currentSensors.motion;

  JsonArray devices = doc.createNestedArray("devices");
  for (int i = 0; i < NUM_DEVICES; i++) {
    JsonObject d = devices.createNestedObject();
    d["id"] = myDevices[i].id;
    d["state"] = myDevices[i].state;
    d["autoMode"] = myDevices[i].autoMode;
    d["status"] = "active";
  }

  JsonObject pir = devices.createNestedObject();
  pir["id"] = 15;
  pir["status"] = "active";

  JsonObject dht = devices.createNestedObject();
  dht["id"] = 14;
  dht["status"] = "active";

  String output;
  serializeJson(doc, output);

  Serial.print(">> Publishing to [");
  Serial.print(topic);
  Serial.print("]...");
  Serial.println();
  // Serial.println(output.substring(0, 50) + "...");

  client.publish(topic, output.c_str());
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

  if (now - lastStatusTime > interval) {
    lastStatusTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    bool mVal = digitalRead(PIR_PIN);

    if (isnan(t) || isnan(h)) {
      Serial.println("Sensor Read Failed!");
      currentSensors.valid = false;
    } else {
      currentSensors.temp = t;
      currentSensors.hum = h;
      currentSensors.motion = (mVal == HIGH);
      currentSensors.valid = true;
    }

    checkAutoRules();
    publishSystemData(MQTT_TOPIC_STATUS);

    if (now - lastLogTime > logInterval) {
      lastLogTime = now;
      publishSystemData(MQTT_TOPIC_LOGS);
    }
  }
}
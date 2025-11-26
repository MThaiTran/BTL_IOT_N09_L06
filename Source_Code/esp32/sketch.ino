// =================================================================
// LIBRARIES
// =================================================================
#include <WiFi.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "DHT.h" 

// =================================================================
// MQTT & WIFI CONFIGURATION
// =================================================================
// --- Wi-Fi Credentials ---
const char* ssid = "Wokwi-GUEST";
const char* password = ""; 

// --- MQTT Broker Credentials (from your HiveMQ page) ---
const char* mqtt_server = "______";
const int mqtt_port = 8883;
const char* mqtt_user = "______";
const char* mqtt_pass = "______"; 

// =================================================================
// PINS, CONSTANTS, etc. 
// =================================================================
#define DHT_PIN 14       
#define LDR_PIN 34       
#define RELAY_FAN_PIN 13
#define RELAY_LIGHT_PIN 26
#define LED_FAN_PIN 19
#define LED_LIGHT_PIN 18
#define DHT_TYPE DHT22
#define LDR_ANALOG_MIN 280   
#define LDR_ANALOG_MAX 4095  
#define LUX_MAPPED_MAX 5000  
#define LUX_MAPPED_MIN 0     

// =================================================================
// OBJECTS & GLOBALS
// =================================================================
WiFiClientSecure espClient; 
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastMsg = 0; 

// =================================================================
// MQTT CALLBACK FUNCTION - Handles incoming messages
// =================================================================
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);

  // Convert payload to a string
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';
  String messageStr = String(message);
  
  // Compare the topic and act accordingly
  if (strcmp(topic, "smarthome/controls/fan") == 0) {
    int state = messageStr.toInt();
    digitalWrite(RELAY_FAN_PIN, state);
    digitalWrite(LED_FAN_PIN, state);
    Serial.print("  > Fan command received: "); Serial.println(state);
  } 
  else if (strcmp(topic, "smarthome/controls/light") == 0) {
    int state = messageStr.toInt();
    digitalWrite(RELAY_LIGHT_PIN, state);
    digitalWrite(LED_LIGHT_PIN, state);
    Serial.print("  > Light command received: "); Serial.println(state);
  }
}

// =================================================================
// RECONNECT FUNCTION - Tries to connect to MQTT if disconnected
// =================================================================
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected!");
      // Re-subscribe to all control topics
      client.subscribe("smarthome/controls/fan");
      client.subscribe("smarthome/controls/light");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// =================================================================
// SETUP FUNCTION
// =================================================================
void setup() {
  Serial.begin(115200);
  Serial.println("MQTT Smart Home Control - Initializing...");

  // Setup actuators
  pinMode(RELAY_FAN_PIN, OUTPUT);
  pinMode(RELAY_LIGHT_PIN, OUTPUT);
  pinMode(LED_FAN_PIN, OUTPUT);
  pinMode(LED_LIGHT_PIN, OUTPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");

  espClient.setInsecure(); 
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// =================================================================
// MAIN LOOP
// =================================================================
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop(); 

  // Publish sensor data every 10 seconds (non-blocking)
  unsigned long now = millis();
  if (now - lastMsg > 10000) {
    lastMsg = now;
    
    // Create a JSON document
    StaticJsonDocument<256> doc;
    doc["temp"] = dht.readTemperature();
    doc["hum"] = dht.readHumidity();
    doc["lux"] = map(analogRead(LDR_PIN), LDR_ANALOG_MIN, LDR_ANALOG_MAX, LUX_MAPPED_MAX, LUX_MAPPED_MIN);

    // Serialize JSON to a buffer
    char buffer[256];
    serializeJson(doc, buffer);

    // Publish the message
    client.publish("smarthome/sensors", buffer);
    Serial.print("Published sensor data: ");
    Serial.println(buffer);
  }
}
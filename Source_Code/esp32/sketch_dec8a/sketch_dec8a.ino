// ==========================================
// VERSION 1 (The Factory Firmware)
// LED PIN: 19
// ==========================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <WiFiClientSecure.h>

const char* ssid = "Home Labs";
const char* password = "lamgicomang";

// PASTE THE LINK TO THE V2 .BIN FILE HERE
const char* firmwareURL = "https://raw.githubusercontent.com/CrisBui/OTA-check/raw/refs/heads/main/ota.bin"; 

const int LedPin = 19; // <--- STARTS ON 19
const String Version = "1.0";

void setup() {
  Serial.begin(115200);
  pinMode(LedPin, OUTPUT);

  // 1. Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("V1: Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    // Flash LED 19 while connecting
    digitalWrite(LedPin, !digitalRead(LedPin));
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nConnected! This is FIRMWARE V1.");

  // 2. Wait 5 seconds so you can see V1 is actually running
  Serial.println("Waiting 5 seconds before downloading V2...");
  for(int i=0; i<10; i++){
    digitalWrite(LedPin, HIGH);
    delay(250);
    digitalWrite(LedPin, LOW);
    delay(250);
  }

  // 3. Start Update Routine
  Serial.println("Starting OTA Update...");
  WiFiClientSecure client;
  client.setInsecure(); // Necessary for GitHub/Tmpfiles
  
  // Define callbacks so we can see progress in Serial Monitor
  httpUpdate.onProgress([](int cur, int total) {
      Serial.printf("Downloading: %d%%\n", (cur * 100) / total);
  });

  // This function will NOT return if the update is successful 
  // (The ESP will restart automatically)
  t_httpUpdate_return ret = httpUpdate.update(client, firmwareURL);

  // If we reach here, the update failed
  Serial.println("Update Failed!");
  Serial.println(httpUpdate.getLastErrorString());
}

void loop() {
  // If update failed, we stay in V1 behavior
  digitalWrite(LedPin, HIGH);
  delay(1000);
  digitalWrite(LedPin, LOW);
  delay(1000);
  Serial.println("Still stuck in Firmware V1 (Pin 19)... check URL!");
}
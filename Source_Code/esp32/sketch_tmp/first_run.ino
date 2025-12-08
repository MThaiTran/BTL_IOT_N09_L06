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
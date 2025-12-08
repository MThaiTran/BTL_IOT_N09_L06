void performOTA(String url) {
  // 1. Safety Check: Ensure WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("OTA Error: No WiFi connection");
    return;
  }

  Serial.println("--------------------------------");
  Serial.println("OTA UPDATE INITIATED");
  Serial.print("Downloading from: ");
  Serial.println(url);

  client.disconnect();

  WiFiClientSecure updateClient;
  updateClient.setInsecure();  // Ignore SSL certs (Needed for tmpfiles/github/etc)

  // CRITICAL: Enable redirects (tmpfiles.org redirects /dl/ links)
  httpUpdate.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);

  // 4. Start Update (This blocks until finished)
  // The ESP32 will restart automatically if successful.
  t_httpUpdate_return ret = httpUpdate.update(updateClient, url);

  // 5. If we are here, the update FAILED
  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n",
                    httpUpdate.getLastError(),
                    httpUpdate.getLastErrorString().c_str());
      break;

    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("HTTP_UPDATE_NO_UPDATES");
      break;

    case HTTP_UPDATE_OK:
      Serial.println("HTTP_UPDATE_OK");
      break;
  }

  Serial.println("OTA Failed. Reconnecting MQTT...");
  reconnect();
}
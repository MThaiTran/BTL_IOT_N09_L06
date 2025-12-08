void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");



  // 0. Convert payload to a readable String
  String messageTemp;
  for (int i = 0; i < length; i++)
    messageTemp += (char)payload[i];

  Serial.print("Commands received from topic [");
  Serial.print(topic);
  Serial.println("]: " + messageTemp);



  // 1. Check if the message comes from the OTA Topic
  if (String(topic) == MQTT_TOPIC_OTA) {

    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, messageTemp);

    if (error) {
      Serial.println("OTA JSON Error");
      return;
    }

    // 2. Extract Data
    if (doc.containsKey("version") && doc.containsKey("url")) {
      int newVersion = doc["version"];
      const char* downloadUrl = doc["url"];

      Serial.print("Current Version: ");
      Serial.println(CODE_VERSION);
      Serial.print("New Version:     ");
      Serial.println(newVersion);

      // 3. Compare Version
      if (newVersion > CODE_VERSION) {
        Serial.println("New version found! Starting update...");
        performOTA(String(downloadUrl));
      } else {
        Serial.println("Update ignored: Version is not newer.");
      }
    }
    return;  // Exit callback, do not process as a relay command
  }


  // 2. Parse JSON using ArduinoJson
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, messageTemp);
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }



  // 3. Match device with ID
  const int incomingId = doc["id"];
  Device* targetDevice = nullptr;

  for (int i = 0; i < NUM_DEVICES; i++)
    if (myDevices[i].id == incomingId) {
      targetDevice = &myDevices[i];
      break;
    }

  if (targetDevice == nullptr) {
    Serial.println("No device found with the received ID.");
    return;
  }

  bool stateChanged = false;  // Check if any changes are made



  // 4. Logic: AUTO or MANUAL

  // CASE 1: MANUAL
  bool isManualRequest = (doc.containsKey("autoMode") && doc["autoMode"] == false);
  if (isManualRequest) {
    targetDevice->autoMode = false;

    if (doc.containsKey("state")) {
      bool reqState = doc["state"];

      if (targetDevice->state != reqState) {
        targetDevice->state = reqState;
        digitalWrite(targetDevice->pin, reqState ? HIGH : LOW);
        stateChanged = true;
      }
    }

    targetDevice->tempHigher = NAN;
    targetDevice->humHigher = NAN;
    targetDevice->motionOn = false;

    targetDevice->tempLower = NAN;
    targetDevice->humLower = NAN;
    targetDevice->motionOff = false;
  }

  // CASE 2: AUTO
  else {
    targetDevice->autoMode = true;

    targetDevice->tempHigher = doc.containsKey("tempHigher") ? doc["tempHigher"].as<float>() : NAN;
    targetDevice->humHigher = doc.containsKey("humHigher") ? doc["humHigher"].as<float>() : NAN;
    targetDevice->motionOn = doc.containsKey("motionOn") ? doc["motionOn"].as<bool>() : false;

    targetDevice->tempLower = doc.containsKey("tempLower") ? doc["tempLower"].as<float>() : NAN;
    targetDevice->humLower = doc.containsKey("humLower") ? doc["humLower"].as<float>() : NAN;
    targetDevice->motionOff = doc.containsKey("motionOff") ? doc["motionOff"].as<bool>() : false;

    Serial.println("autoMode updated");


    // PRINT STATUS
    Serial.println("--------------------------------");
    Serial.printf("Device %d Auto-Rules Configured:\n", targetDevice->id);

    bool hasTrigger = false;

    if (!isnan(targetDevice->tempHigher)) {
      Serial.print(" - Turn ON if Temp >= ");
      Serial.println(targetDevice->tempHigher);
      hasTrigger = true;
    }
    if (!isnan(targetDevice->tempLower)) {
      Serial.print(" - Turn ON if Temp <= ");
      Serial.println(targetDevice->tempLower);
      hasTrigger = true;
    }
    if (!isnan(targetDevice->humHigher)) {
      Serial.print(" - Turn ON if Hum  >= ");
      Serial.println(targetDevice->humHigher);
      hasTrigger = true;
    }
    if (!isnan(targetDevice->humLower)) {
      Serial.print(" - Turn ON if Hum  <= ");
      Serial.println(targetDevice->humLower);
      hasTrigger = true;
    }
    if (targetDevice->motionOn) {
      Serial.println(" - Turn ON if Motion DETECTED");
      hasTrigger = true;
    }
    if (targetDevice->motionOff) {
      Serial.println(" - Turn ON if Motion STOPPED");
      hasTrigger = true;
    }

    if (!hasTrigger) {
      Serial.println(" - (No active triggers set)");
    }
    Serial.println("--------------------------------");
  }

  if (stateChanged) {
    Serial.println("Manual change detected...");
    publishSystemData(MQTT_TOPIC_LOGS);
  }
}




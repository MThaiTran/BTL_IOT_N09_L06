void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");



  // 1. Convert payload to a readable String
  String messageTemp;
  for (int i = 0; i < length; i++)
    messageTemp += (char)payload[i];

  Serial.print("Commands received from topic [");
  Serial.print(topic);
  Serial.println("]: " + messageTemp);



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
  bool isManualRequest = (doc.containsKey("autoMode") && doc["autoMode"] == false) || doc.containsKey("state");
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
  }

  if (stateChanged) {
    Serial.println("Manual change detected...");
    publishLog();
  }
}
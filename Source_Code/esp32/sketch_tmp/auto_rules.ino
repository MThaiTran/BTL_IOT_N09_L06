void checkAutoRules() {
  // float currentHum = dht.readHumidity();
  // float currentTemp = dht.readTemperature();
  // int currentMotion = digitalRead(PIR_PIN);

  if (!currentSensors.valid) return;

  bool anyDeviceChanged = false;

  for (int i = 0; i < NUM_DEVICES; i++) {
    if (!myDevices[i].autoMode) continue;

    bool currentState = myDevices[i].state;
    bool newState = currentState;

    const char* triggerReason = "";
    float triggerLimit = 0;
    float triggerActualValue = 0;


    if (currentState == false) {
      if (!isnan(myDevices[i].tempHigher) && currentSensors.temp >= myDevices[i].tempHigher) {
        newState = true;
        triggerReason = "tempHigher";
        triggerLimit = myDevices[i].tempHigher;
        triggerActualValue = currentSensors.temp;
      } else if (!isnan(myDevices[i].humHigher) && currentSensors.hum >= myDevices[i].humHigher) {
        newState = true;
        triggerReason = "humHigher";
        triggerLimit = myDevices[i].humHigher;
        triggerActualValue = currentSensors.hum;
      } else if (myDevices[i].motionOn && currentSensors.motion) {
        newState = true;
        triggerReason = "motionOn";
        triggerLimit = myDevices[i].motionOn;
        triggerActualValue = currentSensors.motion;
      } else if (!isnan(myDevices[i].tempLower) && currentSensors.temp <= myDevices[i].tempLower) {
        newState = true;
        triggerReason = "tempLower";
        triggerLimit = myDevices[i].tempLower;
        triggerActualValue = currentSensors.temp;
      } else if (!isnan(myDevices[i].humLower) && currentSensors.hum <= myDevices[i].humLower) {
        newState = true;
        triggerReason = "humLower";
        triggerLimit = myDevices[i].humLower;
        triggerActualValue = currentSensors.hum;
      } else if (myDevices[i].motionOff && !currentSensors.motion) {
        newState = true;
        triggerReason = "motionOff";
        triggerLimit = myDevices[i].motionOff;
        triggerActualValue = currentSensors.motion;
      }
    } else {
      if (!isnan(myDevices[i].tempHigher) && currentSensors.temp < myDevices[i].tempHigher) {
        newState = false;
        triggerReason = "tempHigher";
        triggerLimit = myDevices[i].tempHigher;
        triggerActualValue = currentSensors.temp;
      } else if (!isnan(myDevices[i].humHigher) && currentSensors.hum < myDevices[i].humHigher) {
        newState = false;
        triggerReason = "humHigher";
        triggerLimit = myDevices[i].humHigher;
        triggerActualValue = currentSensors.hum;
      } else if (myDevices[i].motionOn && !currentSensors.motion) {
        newState = false;
        triggerReason = "motionOn";
        triggerLimit = myDevices[i].motionOn;
        triggerActualValue = currentSensors.motion;
      } else if (!isnan(myDevices[i].tempLower) && currentSensors.temp > myDevices[i].tempLower) {
        newState = false;
        triggerReason = "tempLower";
        triggerLimit = myDevices[i].tempLower;
        triggerActualValue = currentSensors.temp;
      } else if (!isnan(myDevices[i].humLower) && currentSensors.hum > myDevices[i].humLower) {
        newState = false;
        triggerReason = "humLower";
        triggerLimit = myDevices[i].humLower;
        triggerActualValue = currentSensors.hum;
      } else if (!myDevices[i].motionOff && currentSensors.motion) {
        newState = false;
        triggerReason = "motionOff";
        triggerLimit = myDevices[i].motionOff;
        triggerActualValue = currentSensors.motion;
      }
    }

    // Notify backend when changes detected
    if (newState != currentState) {
      myDevices[i].state = newState;
      digitalWrite(myDevices[i].pin, newState ? HIGH : LOW);
      anyDeviceChanged = true;

      if (strlen(triggerReason) > 0) {
        publishWarning(myDevices[i].id, triggerReason, triggerLimit, triggerActualValue);
      }
    }
  }


  if (anyDeviceChanged) {
    Serial.println("Auto Change Detected! Sending Log...");
    publishLog();
  }
}
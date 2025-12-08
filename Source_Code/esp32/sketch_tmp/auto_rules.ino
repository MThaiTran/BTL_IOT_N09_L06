void checkAutoRules() {
  float currentHum = dht.readHumidity();
  float currentTemp = dht.readTemperature();
  int currentMotion = digitalRead(PIR_PIN);

  bool anyDeviceChanged = false;

  for (int i = 0; i < NUM_DEVICES; i++) {
    if (!myDevices[i].autoMode) continue;

    bool currentState = myDevices[i].state;
    bool newState = currentState;

    const char* triggerReason = "";
    float triggerLimit = 0;
    float triggerActualValue = 0;


    if (currentState == false) {
      if (!isnan(myDevices[i].tempHigher) && currentTemp >= myDevices[i].tempHigher) {
        newState = true;
        triggerReason = "tempHigher";
        triggerLimit = myDevices[i].tempHigher;
        triggerActualValue = currentTemp;
      } else if (!isnan(myDevices[i].humHigher) && currentHum >= myDevices[i].humHigher) {
        newState = true;
        triggerReason = "humHigher";
        triggerLimit = myDevices[i].humHigher;
        triggerActualValue = currentHum;
      } else if (myDevices[i].motionOn && currentMotion) {
        newState = true;
        triggerReason = "motionOn";
        triggerLimit = true;
        triggerActualValue = true;
      } else if (!isnan(myDevices[i].tempLower) && currentTemp <= myDevices[i].tempLower) {
        newState = false;
        triggerReason = "tempLower";
        triggerLimit = myDevices[i].tempLower;
        triggerActualValue = currentTemp;
      } else if (!isnan(myDevices[i].humLower) && currentHum <= myDevices[i].humLower) {
        newState = false;
        triggerReason = "humLower";
        triggerLimit = myDevices[i].humLower;
        triggerActualValue = currentHum;
      } else if (myDevices[i].motionOff && !currentMotion) {
        newState = false;
        triggerReason = "motionOff";
        triggerLimit = false;
        triggerActualValue = false;
      }
    } else {
      if (!isnan(myDevices[i].tempHigher) && currentTemp < myDevices[i].tempHigher) {
        newState = true;
        triggerReason = "tempHigher";
        triggerLimit = myDevices[i].tempHigher;
        triggerActualValue = currentTemp;
      } else if (!isnan(myDevices[i].humHigher) && currentHum < myDevices[i].humHigher) {
        newState = true;
        triggerReason = "humHigher";
        triggerLimit = myDevices[i].humHigher;
        triggerActualValue = currentHum;
      } else if (myDevices[i].motionOn && !currentMotion) {
        newState = true;
        triggerReason = "motionOn";
        triggerLimit = true;
        triggerActualValue = true;
      } else if (!isnan(myDevices[i].tempLower) && currentTemp > myDevices[i].tempLower) {
        newState = false;
        triggerReason = "tempLower";
        triggerLimit = myDevices[i].tempLower;
        triggerActualValue = currentTemp;
      } else if (!isnan(myDevices[i].humLower) && currentHum > myDevices[i].humLower) {
        newState = false;
        triggerReason = "humLower";
        triggerLimit = myDevices[i].humLower;
        triggerActualValue = currentHum;
      } else if (!myDevices[i].motionOff && currentMotion) {
        newState = false;
        triggerReason = "motionOff";
        triggerLimit = false;
        triggerActualValue = false;
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
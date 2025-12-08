void checkAutoRules() {
  if (!currentSensors.valid) return;

  bool anyDeviceChanged = false;

  for (int i = 0; i < NUM_DEVICES; i++) {
    if (!myDevices[i].autoMode) continue;

    bool shouldBeActive = false;
    
    // Variables to capture the reason (for the first matching trigger)
    const char* triggerReason = ""; 
    float triggerLimit = 0;
    float triggerActual = 0;

    // --- CHECK ALL "ON" TRIGGERS (OR Logic) ---
    
    // Trigger 1: Temp Higher
    if (!isnan(myDevices[i].tempHigher) && currentSensors.temp >= myDevices[i].tempHigher) {
      shouldBeActive = true;
      triggerReason = "tempHigher";
      triggerLimit = myDevices[i].tempHigher;
      triggerActual = currentSensors.temp;
    }
    // Trigger 2: Temp Lower
    else if (!isnan(myDevices[i].tempLower) && currentSensors.temp <= myDevices[i].tempLower) {
      shouldBeActive = true;
      triggerReason = "tempLower";
      triggerLimit = myDevices[i].tempLower;
      triggerActual = currentSensors.temp;
    }
    // Trigger 3: Hum Higher
    else if (!isnan(myDevices[i].humHigher) && currentSensors.hum >= myDevices[i].humHigher) {
      shouldBeActive = true;
      triggerReason = "humHigher";
      triggerLimit = myDevices[i].humHigher;
      triggerActual = currentSensors.hum;
    }
    // Trigger 4: Hum Lower
    else if (!isnan(myDevices[i].humLower) && currentSensors.hum <= myDevices[i].humLower) {
      shouldBeActive = true;
      triggerReason = "humLower";
      triggerLimit = myDevices[i].humLower;
      triggerActual = currentSensors.hum;
    }
    // Trigger 5: Motion Detected
    else if (myDevices[i].motionOn && currentSensors.motion) {
      shouldBeActive = true;
      triggerReason = "motionOn";
      triggerLimit = 1.0;
      triggerActual = 1.0;
    }
    // Trigger 6: No Motion (Motion Off)
    else if (myDevices[i].motionOff && !currentSensors.motion) {
      shouldBeActive = true;
      triggerReason = "motionOff";
      triggerLimit = 1.0; 
      triggerActual = 0.0;
    }

    // --- 3. COMPARE & ACT ---
    
    if (shouldBeActive != myDevices[i].state) {
      myDevices[i].state = shouldBeActive;
      digitalWrite(myDevices[i].pin, shouldBeActive ? HIGH : LOW);
      anyDeviceChanged = true;

      if (shouldBeActive) {
        publishWarning(myDevices[i].id, triggerReason, triggerLimit, triggerActual);
      } else {
        Serial.printf("Device %d returned to normal state (OFF).\n", myDevices[i].id);
      }
    }
  }

  if (anyDeviceChanged) {
    publishSystemData(MQTT_TOPIC_LOGS);
  }
}



// void checkAutoRules() {
//   if (!currentSensors.valid) return;

//   bool anyDeviceChanged = false;

//   for (int i = 0; i < NUM_DEVICES; i++) {
//     if (!myDevices[i].autoMode) continue;

//     bool currentState = myDevices[i].state;
//     bool newState = currentState;

//     const char* triggerReason = "";
//     float triggerLimit = 0;
//     float triggerActualValue = 0;


//     if (currentState == false) {
//       if (!isnan(myDevices[i].tempHigher) && currentSensors.temp >= myDevices[i].tempHigher) {
//         newState = true;
//         triggerReason = "tempHigher";
//         triggerLimit = myDevices[i].tempHigher;
//         triggerActualValue = currentSensors.temp;
//       } else if (!isnan(myDevices[i].humHigher) && currentSensors.hum >= myDevices[i].humHigher) {
//         newState = true;
//         triggerReason = "humHigher";
//         triggerLimit = myDevices[i].humHigher;
//         triggerActualValue = currentSensors.hum;
//       } else if (myDevices[i].motionOn && currentSensors.motion) {
//         newState = true;
//         triggerReason = "motionOn";
//         triggerLimit = myDevices[i].motionOn;
//         triggerActualValue = currentSensors.motion;
//       } else if (!isnan(myDevices[i].tempLower) && currentSensors.temp <= myDevices[i].tempLower) {
//         newState = true;
//         triggerReason = "tempLower";
//         triggerLimit = myDevices[i].tempLower;
//         triggerActualValue = currentSensors.temp;
//       } else if (!isnan(myDevices[i].humLower) && currentSensors.hum <= myDevices[i].humLower) {
//         newState = true;
//         triggerReason = "humLower";
//         triggerLimit = myDevices[i].humLower;
//         triggerActualValue = currentSensors.hum;
//       } else if (myDevices[i].motionOff && !currentSensors.motion) {
//         newState = true;
//         triggerReason = "motionOff";
//         triggerLimit = myDevices[i].motionOff;
//         triggerActualValue = currentSensors.motion;
//       }
//     } else {
//       if (!isnan(myDevices[i].tempHigher) && currentSensors.temp < myDevices[i].tempHigher) {
//         newState = false;
//         // triggerReason = "tempHigher";
//         triggerLimit = myDevices[i].tempHigher;
//         triggerActualValue = currentSensors.temp;
//       } else if (!isnan(myDevices[i].humHigher) && currentSensors.hum < myDevices[i].humHigher) {
//         newState = false;
//         // triggerReason = "humHigher";
//         triggerLimit = myDevices[i].humHigher;
//         triggerActualValue = currentSensors.hum;
//       } else if (myDevices[i].motionOn && !currentSensors.motion) {
//         newState = false;
//         // triggerReason = "motionOn";
//         triggerLimit = myDevices[i].motionOn;
//         triggerActualValue = currentSensors.motion;
//       } else if (!isnan(myDevices[i].tempLower) && currentSensors.temp > myDevices[i].tempLower) {
//         newState = false;
//         // triggerReason = "tempLower";
//         triggerLimit = myDevices[i].tempLower;
//         triggerActualValue = currentSensors.temp;
//       } else if (!isnan(myDevices[i].humLower) && currentSensors.hum > myDevices[i].humLower) {
//         newState = false;
//         triggerReason = "humLower";
//         triggerLimit = myDevices[i].humLower;
//         triggerActualValue = currentSensors.hum;
//       } else if (myDevices[i].motionOff && currentSensors.motion) {
//         newState = false;
//         // triggerReason = "motionOff";
//         triggerLimit = myDevices[i].motionOff;
//         triggerActualValue = currentSensors.motion;
//       }
//     }

//     // Notify backend when changes detected
//     if (newState != currentState) {
//       myDevices[i].state = newState;
//       digitalWrite(myDevices[i].pin, newState ? HIGH : LOW);
//       anyDeviceChanged = true;

//       if (strlen(triggerReason) > 0) {
//         publishWarning(myDevices[i].id, triggerReason, triggerLimit, triggerActualValue);
//       }
//     }
//   }


//   if (anyDeviceChanged) {
//     Serial.println("Auto Change Detected! Sending Log...");
//     publishSystemData(MQTT_TOPIC_LOGS);
//   }
// }
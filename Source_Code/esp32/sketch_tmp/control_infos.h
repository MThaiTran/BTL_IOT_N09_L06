#include <math.h>

struct Device {
  int id;
  int pin;
  bool state;
  bool autoMode;

  // --- AUTO MODE TRIGGERS ---
  float tempHigher;
  float humHigher;
  bool  motionOn;

  float tempLower;
  float humLower;
  bool  motionOff;
};

struct SensorData {
  float temp;
  float hum;
  bool motion;
  bool valid; // true if data was read successfully
};

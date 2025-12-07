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
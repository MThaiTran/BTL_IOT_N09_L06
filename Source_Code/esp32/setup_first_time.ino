#include <WiFi.h>
#include <WiFiManager.h> // https://github.com/tzapu/WiFiManager

// Create an instance of the WiFiManager class
WiFiManager wm;

// Define a pin for a physical reset button (Optional)
// If you hold this button on startup, it wipes saved settings.
// Useful if you move the ESP32 to a new house.
#define RESET_PIN 0  // Pin 0 is usually the "BOOT" button on ESP32 boards

void setup() {
    // 1. Initialize Serial for Debugging
    Serial.begin(115200);
    delay(1000); // Wait for serial to stabilize
    Serial.println("\n Starting ESP32 Wifi Manager Demo...");

    // 2. Optional: Reset Settings Logic (Using BOOT button)
    pinMode(RESET_PIN, INPUT_PULLUP);
    if (digitalRead(RESET_PIN) == LOW) {
        Serial.println("Reset button held. Clearing WiFi credentials...");
        wm.resetSettings();
        delay(3000); // Give time to read message
        ESP.restart();
    }

    // 3. Configure WiFiManager
    
    // Automatically connect to saved WiFi. 
    // If that fails, it starts an AP with the name "ESP32_Setup_AP".
    // It creates a Captive Portal (redirects user to config page).
    
    // Set debug output to true so you can see progress in Serial Monitor
    wm.setDebugOutput(true);

    // Remove this line after testing! It wipes settings every restart.
    wm.resetSettings(); 

    // Customizing the UI (Optional)
    // You can inject custom HTML/CSS into the head if you want a specific look
    // wm.setCustomHeadElement("<style>body{background-color: #f0f0f0;}</style>");

    bool res;
    
    // --- THE MAIN LOGIC ---
    // This creates the AP named "ESP32_Config_AP".
    // You can add a password as a second argument: wm.autoConnect("ESP32_Config_AP", "password123");
    Serial.println("Attempting to connect or starting Config AP...");
    
    res = wm.autoConnect("ESP32_Config_AP"); 

    if(!res) {
        Serial.println("Failed to connect or hit timeout");
        // ESP.restart(); // Optional: restart if you want to loop the attempt
    } 
    else {
        // 4. Success Handling
        // If we get here, you have connected to the WiFi successfully.
        // The ESP32 automatically shuts down the AP mode to save power.
        Serial.println("Connected to WiFi successfully!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    }
}

void loop() {
    // Put your main code here.
    // This runs only AFTER the WiFi is connected.
    
    // Example: Check if wifi is still connected
    if (WiFi.status() == WL_CONNECTED) {
        // Do normal internet tasks
    } else {
        Serial.println("WiFi lost...");
        // You could restart the portal here if you wanted, 
        // but usually we just let the ESP try to reconnect automatically.
    }
    
    delay(5000);
}
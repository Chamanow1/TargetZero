// TargetZero — โหมด MQTT + จอ LCD I2C  (Arduino UNO R4 WiFi เท่านั้น)
// ไลบรารี: "MQTT" (256dpi/arduino-mqtt) และ "LiquidCrystal I2C"
// สาย: HC-SR04 VCC->5V, GND->GND, TRIG->D4, ECHO->D2 | ปุ่มล็อก D7 <-> GND
//      LCD I2C  VCC->5V, GND->GND, SDA->SDA, SCL->SCL (แอดเดรส 0x27)

#include <WiFiS3.h>
#include <MQTTClient.h>
#include <LiquidCrystal_I2C.h>

const char WIFI_SSID[] = "";        // ใส่ WIFI และต้องเป็น WiFi 2.4 GHz
const char WIFI_PASS[] = "";

const char BROKER[] = "mqtt-dashboard.com";   // broker
const int  PORT     = 1883;
const char T_DIST[] = "TargetZero/Topic/distance";  // ต้องตรงกับช่อง topic ในเว็บ
const char T_LOCK[] = "TargetZero/Topic/lock";

const int TRIG_PIN = 4, ECHO_PIN = 2, BTN_PIN = 7;

LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiClient network;
MQTTClient client;

bool lastBtn = HIGH;
unsigned long lastBtnMs = 0, lastPubMs = 0, msgUntil = 0;
float lastDist = -1; //ค่าล่าสุดที่ส่งไป topic distance

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);  
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); 
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long dur = pulseIn(ECHO_PIN, HIGH, 30000UL);  // timeout 30 ms กันโปรแกรมค้าง
  if (dur == 0) return -1;
  return dur * 0.0343f / 2.0f; //distance
}

void lcdLine(int row, const char* text) {
  lcd.setCursor(0, row);
  lcd.print("                ");
  lcd.setCursor(0, row);
  lcd.print(text);
}

void showDistance(float lastdist) {
  lcd.setCursor(0, 1);
  if (lastdist < 0) {
    lcd.print("Out of range    ");
  } else {
    lcd.print("Distance: ");
    lcd.print(lastdist, 1);
    lcd.print(" cm   ");
  }
}

void connectAll() {
  lcdLine(0, "Connecting...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    delay(4000);
  }
  Serial.println("WiFi OK");

  String id = "zero-" + String(random(0xffff), HEX);
  while (!client.connect(id.c_str())) {
    Serial.println("MQTT connecting...");
    delay(2000);
  }
  Serial.println("MQTT OK");
  lcdLine(0, "Press Button!");
}
void ButtonPress(){
  bool b = digitalRead(BTN_PIN);                // ปุ่มล็อก
  if (b == LOW && lastBtn == HIGH && millis() - lastBtnMs > 250) {
    if (lastDist > 0){
      client.publish(T_LOCK, String(lastDist, 1)); //ใช้ค่าเดียวกันกับที่ส่งใน topic distance ส่งเข้า topic lock
      float showlcd = lastDist;
      showDistance(showlcd);
      lcdLine(0, "Button Pressed");
      msgUntil = millis() + 600;
    }
    lastBtnMs = millis();
  }
  lastBtn = b;

  if (msgUntil && millis() > msgUntil) {        // คืนข้อความบรรทัดบน
    lcdLine(0, "Press Button!");
    msgUntil = 0;
  }
}
void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  randomSeed(analogRead(A0));

  lcd.init();
  lcd.backlight();

  client.begin(BROKER, PORT, network);
  connectAll();
}

void loop() {
  client.loop();
  if (WiFi.status() != WL_CONNECTED || !client.connected()) connectAll();

  ButtonPress();

  if (millis() - lastPubMs >= 100) {            // วัดและส่งระยะทุก 100 ms
    lastPubMs = millis();
    float d = readDistanceCm();
    if (d > 0){
      lastDist = d;
      client.publish(T_DIST, String(d, 1));
      }
  }

  
}

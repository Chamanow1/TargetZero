# Physical Computing Project 2026 - IT KMITL

## TargetZero
- Project นี้เป็นส่วนหนึ่งในรายวิชา Physical Computing รหัสวิชา 06016409 ภาคเรียนที่ 1 ปีการศึกษา 2569 ของคณะเทคโนโลยีสารสนเทศ
  สาขาเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง

## บทคัดย่อ
- TargetZero คือเกมกะระยะที่ผสานฮาร์ดแวร์กับเว็บแอปพลิเคชันเข้าด้วยกัน ระบบสุ่มระยะเป้าหมาย ผู้เล่นใช้เซ็นเซอร์อัลตราโซนิก HC-SR04 ที่ต่อกับ Arduino UNO R4 WiFi วัดระยะด้วยการเคลื่อนวัตถุเข้า-ออก แล้วกดปุ่มล็อกค่า ระบบจะหักระยะที่ล็อกออกจากเป้าหมายแบบสะสมเป้าหมายคือทำให้ระยะคงเหลือเป็น 0 (อยู่ในช่วงความคลาดเคลื่อนที่ตั้งไว้) โดยห้ามติดลบ ข้อมูลระยะทางถูกส่งผ่าน MQTT แบบเรียลไทม์ไปยังหน้าเว็บ ซึ่งแสดงผลค่าสด คงเหลือ สถิติ และเอฟเฟกต์ชนะ/แพ้

## อุปกรณ์และ Library ที่ใช้
- **อุปกรณ์**
  - Arduino R4 WIFI
    - <img src="Assets/Equipments/Arduino R4.jpg" alt="ArduinoR4" width="200"/>
  - BreadBoard
    - <img src="Assets/Equipments/breadboard.jpg" alt="breadboard" width="200"/>
  - LCD
    - <img src="Assets/Equipments/lcd.jpg" alt="LCD" width="200"/>
  - Ultrasonic sensor
    - <img src="Assets/Equipments/Ultrasonisensor.jpg" alt="Ultrasonicsensor" width="200"/>
- **Library**
  - WiFiS3.h
  - MQTTClient.h
  - LiquidCrystal_I2C.h
  
## Website
[TargetZero](https://chamanow1.github.io/TargetZero/)

## Poster
<img src="Assets/TargetZeroPoster.jpg" alt="Poster" width="500"/>

## Video

[![ดูวิดีโอบน YouTube](https://img.youtube.com/vi/FP0ot5-cXIQ/hqdefault.jpg)](https://youtu.be/FP0ot5-cXIQ)

## สมาชิก
| ID | ชื่อ-นามสกุล | งานที่รับผิดชอบ | รูป |
| -- | ---------- | -------------| --| 
| 68070037 | ณฐมน อำไพสุทธิพงษ์ | Github, Website, Video, Arduino | <img src="Assets/Members/68070037.JPG" alt="037" width="200"/> |
| 68070046 | ณิชาภัทร เลิศภูตราช | Github, Poster, Video, Arduino | <img src="Assets/Members/68070046.jpg" alt="046" width="200"/> |
| 68070090 | บรรณสรณ์ ถินถาวร | Github, Website, Video, Arduino | <img src="Assets/Members/68070090.jpg" alt="090" width="200"/> |

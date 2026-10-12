/**
 * LYFESTYLE - Cloud Realtime Database Configuration
 * กำหนดค่า Firebase Realtime Database เพื่อให้เว็บไซต์ซิงค์ข้อมูลสดแบบ Realtime บน GitHub Pages
 * 
 * วิธีการใช้งาน:
 * 1. ไปที่ https://console.firebase.google.com แล้วสร้างโปรเจกต์ฟรี
 * 2. ไปที่เมนู "Realtime Database" > กด "Create Database" > เลือก "Start in test mode"
 * 3. คัดลอก URL ที่ได้ (เช่น https://xxxx-default-rtdb.asia-southeast1.firebasedatabase.app) มาวางที่ databaseURL ด้านล่างนี้
 */

window.LYFE_FIREBASE_CONFIG = {
  // วาง URL ของ Firebase Realtime Database ของคุณที่นี่
  databaseURL: "https://lyfe-d7804-default-rtdb.firebaseio.com/"
};

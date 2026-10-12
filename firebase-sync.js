/**
 * LYFESTYLE - Cloud Realtime Synchronization Engine
 * รองรับการซิงค์ข้อมูลสมาชิกแบบ Realtime ทั่วโลกบน GitHub Pages
 * โดยใช้ Firebase Realtime Database (Client-Side NoSQL)
 */

(function () {
  const STORAGE_KEY_CONFIG = "lyfe_firebase_config";
  const STORAGE_KEY_MEMBERS = "lyfe_members";

  let db = null;
  let isInitialized = false;
  let listeners = [];

  // ดึงคอนฟิกจาก window.LYFE_FIREBASE_CONFIG ก่อน หากไม่มีให้ดูจาก LocalStorage
  function getEffectiveConfig() {
    if (window.LYFE_FIREBASE_CONFIG && window.LYFE_FIREBASE_CONFIG.databaseURL && window.LYFE_FIREBASE_CONFIG.databaseURL.trim() !== "") {
      return window.LYFE_FIREBASE_CONFIG;
    }
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (e) {}
    return null;
  }

  function initFirebase() {
    if (isInitialized && db) return true;
    const config = getEffectiveConfig();
    if (!config || !config.databaseURL || config.databaseURL.trim() === "") {
      return false;
    }

    try {
      if (typeof firebase === "undefined") {
        console.warn("Firebase SDK ยังไม่ได้ถูกโหลด");
        return false;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      db = firebase.database();
      isInitialized = true;

      // เริ่มต้นรับฟังการเปลี่ยนแปลงแบบ Realtime ทันที
      const membersRef = db.ref("members");
      membersRef.on("value", (snapshot) => {
        const val = snapshot.val();
        if (val && Array.isArray(val)) {
          // อัปเดตลง LocalStorage เพื่อเป็นแคชออฟไลน์
          try {
            localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(val));
          } catch (e) {}

          // แจ้งเตือนไปยังทุกหน้าเพจที่เปิดฟังอยู่
          listeners.forEach((callback) => {
            try {
              callback(val);
            } catch (err) {
              console.error("Error in realtime listener:", err);
            }
          });
        }
      });

      return true;
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase:", err);
      return false;
    }
  }

  window.LyfeSync = {
    isReady: function () {
      return isInitialized && db !== null;
    },

    hasConfig: function () {
      const config = getEffectiveConfig();
      return !!(config && config.databaseURL && config.databaseURL.trim() !== "");
    },

    getConfig: function () {
      return getEffectiveConfig();
    },

    saveConfig: function (config) {
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
        location.reload();
        return true;
      } catch (e) {
        return false;
      }
    },

    onMembersChange: function (callback) {
      if (typeof callback === "function") {
        listeners.push(callback);
      }
    },

    saveMembers: async function (membersList) {
      // 1. บันทึกลง LocalStorage เสมอ
      try {
        localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(membersList));
      } catch (e) {}

      // 2. ถ้าเชื่อมต่อ Firebase อยู่ ให้ส่งขึ้น Cloud ทันที
      if (isInitialized && db) {
        try {
          await db.ref("members").set(membersList);
          return { success: true, cloud: true };
        } catch (err) {
          console.error("Failed to push to Firebase:", err);
          return { success: true, cloud: false, error: err.message };
        }
      }

      return { success: true, cloud: false };
    },

    fetchLatestMembers: async function () {
      if (isInitialized && db) {
        try {
          const snapshot = await db.ref("members").once("value");
          const val = snapshot.val();
          if (val && Array.isArray(val)) {
            localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(val));
            return val;
          }
        } catch (e) {
          console.warn("Could not fetch latest from Firebase:", e);
        }
      }
      return null;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFirebase);
  } else {
    initFirebase();
  }
})();

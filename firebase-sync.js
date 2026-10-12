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

      // รับฟังการเปลี่ยนแปลงแบนเนอร์ / พื้นหลัง Realtime
      const bannerRef = db.ref("settings/banner");
      bannerRef.on("value", (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
          const cleanVal = (val || "").trim();
          if (cleanVal) {
            localStorage.setItem("lyfe_site_bg", cleanVal);
          } else {
            localStorage.removeItem("lyfe_site_bg");
          }
          const bgEls = document.querySelectorAll(".bg-animation");
          bgEls.forEach(el => {
            el.style.background = cleanVal ? `url('${cleanVal}') center/cover no-repeat` : `url('background.gif') center/cover no-repeat`;
          });
          if (typeof window.onLyfeBannerChange === "function") {
            window.onLyfeBannerChange(cleanVal);
          }
        }
      });

      // รับฟังการเปลี่ยนแปลงรหัสลับแก๊ง Realtime (ค่าเริ่มต้น 3004)
      const gangCodeRef = db.ref("settings/gang_code");
      gangCodeRef.on("value", (snapshot) => {
        const val = snapshot.val();
        if (val !== null) {
          const cleanCode = String(val).trim() || "3004";
          localStorage.setItem("lyfe_gang_code", cleanCode);
        }
      });

      // รับฟังการเปิด-ปิดระบบผูก IG ของสมาชิก Realtime
      const allowIgRef = db.ref("settings/allow_ig_claim");
      allowIgRef.on("value", (snapshot) => {
        const val = snapshot.val();
        const isAllowed = val === null ? true : (val === true || val === "true");
        localStorage.setItem("lyfe_allow_ig_claim", isAllowed ? "true" : "false");
        if (typeof window.onLyfeAllowIgChange === "function") {
          window.onLyfeAllowIgChange(isAllowed);
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

    saveBanner: async function (bannerUrl) {
      const clean = (bannerUrl || "").trim();
      try {
        if (clean) {
          localStorage.setItem("lyfe_site_bg", clean);
        } else {
          localStorage.removeItem("lyfe_site_bg");
        }
      } catch (e) {}

      // อัปเดตพื้นหลังบนหน้านี้ทันที
      const bgEls = document.querySelectorAll(".bg-animation");
      bgEls.forEach(el => {
        el.style.background = clean ? `url('${clean}') center/cover no-repeat` : `url('background.gif') center/cover no-repeat`;
      });

      // ถ้าเชื่อมต่อ Firebase Cloud Realtime อยู่
      if (isInitialized && db) {
        try {
          await db.ref("settings/banner").set(clean);
          return { success: true, cloud: true };
        } catch (err) {
          console.error("Failed to push banner to Firebase:", err);
          return { success: true, cloud: false, error: err.message };
        }
      }

      // REST Fallback เผื่อ SDK กำลังต่อ
      const config = getEffectiveConfig();
      if (config && config.databaseURL) {
        try {
          const endpoint = config.databaseURL.replace(/\/$/, "");
          await fetch(`${endpoint}/settings/banner.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clean)
          });
          return { success: true, cloud: true };
        } catch (err) {}
      }

      return { success: true, cloud: false };
    },

    fetchLatestBanner: async function () {
      if (isInitialized && db) {
        try {
          const snapshot = await db.ref("settings/banner").once("value");
          const val = snapshot.val();
          if (val !== null) {
            return val;
          }
        } catch (e) {}
      }
      return localStorage.getItem("lyfe_site_bg") || "";
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
    },

    getGangCode: function () {
      return localStorage.getItem("lyfe_gang_code") || "3004";
    },

    saveGangCode: async function (code) {
      const clean = (code || "").trim() || "3004";
      try {
        localStorage.setItem("lyfe_gang_code", clean);
      } catch (e) {}

      if (isInitialized && db) {
        try {
          await db.ref("settings/gang_code").set(clean);
          return { success: true, cloud: true };
        } catch (err) {
          console.error("Failed to push gang code to Firebase:", err);
          return { success: true, cloud: false, error: err.message };
        }
      }

      // REST Fallback
      const config = getEffectiveConfig();
      if (config && config.databaseURL) {
        try {
          const endpoint = config.databaseURL.replace(/\/$/, "");
          await fetch(`${endpoint}/settings/gang_code.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clean)
          });
          return { success: true, cloud: true };
        } catch (err) {}
      }

      return { success: true, cloud: false };
    },

    fetchLatestGangCode: async function () {
      if (isInitialized && db) {
        try {
          const snapshot = await db.ref("settings/gang_code").once("value");
          const val = snapshot.val();
          if (val !== null && String(val).trim() !== "") {
            const clean = String(val).trim();
            localStorage.setItem("lyfe_gang_code", clean);
            return clean;
          }
        } catch (e) {}
      }

      // REST Fallback
      const config = getEffectiveConfig();
      if (config && config.databaseURL) {
        try {
          const endpoint = config.databaseURL.replace(/\/$/, "");
          const res = await fetch(`${endpoint}/settings/gang_code.json?t=${Date.now()}`, { cache: "no-store" });
          if (res.ok) {
            const val = await res.json();
            if (val !== null && String(val).trim() !== "") {
              const clean = String(val).trim();
              localStorage.setItem("lyfe_gang_code", clean);
              return clean;
            }
          }
        } catch (err) {}
      }

      return localStorage.getItem("lyfe_gang_code") || "3004";
    },

    isIgClaimAllowed: function () {
      const saved = localStorage.getItem("lyfe_allow_ig_claim");
      return saved === null ? true : saved === "true";
    },

    setIgClaimAllowed: async function (allowed) {
      const boolVal = !!allowed;
      try {
        localStorage.setItem("lyfe_allow_ig_claim", boolVal ? "true" : "false");
      } catch (e) {}

      if (isInitialized && db) {
        try {
          await db.ref("settings/allow_ig_claim").set(boolVal);
          return { success: true, cloud: true };
        } catch (err) {
          console.error("Failed to push allow_ig_claim to Firebase:", err);
        }
      }

      // REST Fallback
      const config = getEffectiveConfig();
      if (config && config.databaseURL) {
        try {
          const endpoint = config.databaseURL.replace(/\/$/, "");
          await fetch(`${endpoint}/settings/allow_ig_claim.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(boolVal)
          });
          return { success: true, cloud: true };
        } catch (err) {}
      }

      return { success: true, cloud: false };
    },

    fetchLatestIgClaimAllowed: async function () {
      if (isInitialized && db) {
        try {
          const snapshot = await db.ref("settings/allow_ig_claim").once("value");
          const val = snapshot.val();
          if (val !== null) {
            const isAllowed = val === true || val === "true";
            localStorage.setItem("lyfe_allow_ig_claim", isAllowed ? "true" : "false");
            return isAllowed;
          }
        } catch (e) {}
      }

      // REST Fallback
      const config = getEffectiveConfig();
      if (config && config.databaseURL) {
        try {
          const endpoint = config.databaseURL.replace(/\/$/, "");
          const res = await fetch(`${endpoint}/settings/allow_ig_claim.json?t=${Date.now()}`, { cache: "no-store" });
          if (res.ok) {
            const val = await res.json();
            if (val !== null) {
              const isAllowed = val === true || val === "true";
              localStorage.setItem("lyfe_allow_ig_claim", isAllowed ? "true" : "false");
              return isAllowed;
            }
          }
        } catch (err) {}
      }

      return this.isIgClaimAllowed();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFirebase);
  } else {
    initFirebase();
  }
})();

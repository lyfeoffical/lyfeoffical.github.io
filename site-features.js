/**
 * LYFESTYLE — Site Features & Security Engine
 * 1. Dynamic Background / Banner Loader
 * 2. Dynamic Audio / Music Loader
 * 3. Cookie Consent Banner System
 * 4. Anti-AI Scraper & Bot Shield
 */

(function() {
  // --- 1. Dynamic Background / Banner ---
  function applyCustomBackground() {
    const customBg = localStorage.getItem("lyfe_site_bg");
    if (customBg) {
      const bgElements = document.querySelectorAll(".bg-animation");
      bgElements.forEach(el => {
        el.style.background = `url('${customBg}') center/cover no-repeat`;
      });
    }
  }

  // --- 2. Dynamic Audio Loader ---
  function applyCustomMusic() {
    const customMusic = localStorage.getItem("lyfe_site_music");
    const audioEl = document.getElementById("bgMusic") || document.querySelector("audio");
    if (audioEl && customMusic) {
      // ตรวจสอบว่าเพลงปัจจุบันตรงกับที่ตั้งไว้หรือไม่
      if (audioEl.getAttribute("src") !== customMusic && !audioEl.currentSrc.includes(customMusic)) {
        audioEl.src = customMusic;
        // ถ้ากำลังเล่นอยู่ให้โหลดใหม่
        const isMuted = localStorage.getItem("musicMuted") === "true";
        if (!isMuted && localStorage.getItem("musicPlaying") === "true") {
          audioEl.play().catch(() => {});
        }
      }
    }
  }

  // --- 3. Cookie Consent Banner ---
  function initCookieConsent() {
    const consent = localStorage.getItem("lyfe_cookie_consent");
    if (consent === "accepted") return;

    // สร้างกล่องแจ้งเตือนคุกกี้สไตล์โมเดิร์นธีมมืด
    const cookieBox = document.createElement("div");
    cookieBox.id = "lyfeCookieBanner";
    cookieBox.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-icon-box">
          <i class="fa-solid fa-cookie-bite"></i>
        </div>
        <div class="cookie-text">
          <h4>การยินยอมใช้คุกกี้ (Cookie Notice)</h4>
          <p>เว็บไซต์นี้ใช้คุกกี้และพื้นที่จัดเก็บในเบราว์เซอร์เพื่อจดจำระดับเสียงเพลง การตั้งค่าหน้าจอ และปรับปรุงประสบการณ์การใช้งานของคุณ</p>
        </div>
        <div class="cookie-actions">
          <button id="btnAcceptCookie" class="cookie-btn cookie-accept">
            <i class="fa-solid fa-check"></i> ยอมรับทั้งหมด
          </button>
          <button id="btnCloseCookie" class="cookie-btn cookie-close">
            <i class="fa-solid fa-xmark"></i> ปิด
          </button>
        </div>
      </div>
    `;

    // เพิ่ม Style สำหรับ Cookie Banner
    const style = document.createElement("style");
    style.textContent = `
      #lyfeCookieBanner {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(30px);
        opacity: 0;
        z-index: 99999;
        width: 90%;
        max-width: 720px;
        background: rgba(10, 10, 10, 0.92);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 15px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 255, 255, 0.04);
        border-radius: 16px;
        padding: 18px 24px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Kanit', sans-serif;
      }
      #lyfeCookieBanner.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .cookie-banner-content {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }
      .cookie-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        color: #ffa502;
      }
      .cookie-text {
        flex: 1;
        min-width: 260px;
      }
      .cookie-text h4 {
        margin: 0 0 4px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #fff;
      }
      .cookie-text p {
        margin: 0;
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.45;
      }
      .cookie-actions {
        display: flex;
        gap: 10px;
      }
      .cookie-btn {
        padding: 9px 18px;
        border-radius: 8px;
        font-size: 0.86rem;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: 'Kanit', sans-serif;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .cookie-accept {
        background: #ffffff;
        color: #000;
      }
      .cookie-accept:hover {
        background: #e0e0e0;
        transform: translateY(-1px);
      }
      .cookie-close {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .cookie-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      @media (max-width: 600px) {
        #lyfeCookieBanner {
          width: calc(100% - 24px);
          bottom: 12px;
          padding: 14px 16px;
        }
        .cookie-banner-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .cookie-icon-box {
          display: none;
        }
        .cookie-text {
          min-width: 100%;
        }
        .cookie-actions {
          width: 100%;
          gap: 8px;
        }
        .cookie-actions button {
          flex: 1;
          justify-content: center;
          padding: 8px 12px;
          font-size: 0.82rem;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(cookieBox);

    setTimeout(() => {
      cookieBox.classList.add("show");
    }, 500);

    document.getElementById("btnAcceptCookie").onclick = () => {
      localStorage.setItem("lyfe_cookie_consent", "accepted");
      cookieBox.classList.remove("show");
      setTimeout(() => cookieBox.remove(), 400);
    };
    document.getElementById("btnCloseCookie").onclick = () => {
      cookieBox.classList.remove("show");
      setTimeout(() => cookieBox.remove(), 400);
    };
  }

  // --- 4. Anti-AI Scraper & Protection Shield ---
  function initAntiAiShield() {
    // 1. เพิ่ม Meta tags noai / noimageai ใน <head>
    const metaTags = [
      { name: "robots", content: "noai, noimageai" },
      { name: "googlebot", content: "noarchive" },
      { name: "meta-ai-disallow", content: "true" }
    ];
    metaTags.forEach(m => {
      if (!document.querySelector(`meta[name="${m.name}"]`)) {
        const tag = document.createElement("meta");
        tag.name = m.name;
        tag.content = m.content;
        document.head.appendChild(tag);
      }
    });

    // 2. ตรวจจับและบล็อก AI Scraping Bot
    const isBotUA = /GPTBot|ClaudeBot|PerplexityBot|Bytespider|CCBot|Diffbot|Scrapy|Amazonbot|Cohere-ai/i.test(navigator.userAgent);
    const isHeadlessBot = (/HeadlessChrome/i.test(navigator.userAgent) && !window.chrome) || document.documentElement.getAttribute("webdriver") === "true";
    
    // ไม่บล็อกหน้า admin หรือ login
    const isControlPage = window.location.pathname.includes("admin.html") || window.location.pathname.includes("login.html");

    if ((isBotUA || isHeadlessBot) && !isControlPage) {
      console.warn("Automated AI Scraping activity detected. Access restricted.");
      // บิดเบือนการอ่านข้อมูลของ AI Bot
      document.body.innerHTML = "<div style='display:flex;align-items:center;justify-content:center;height:100vh;background:#030303;color:#fff;font-family:sans-serif;'><h3>ANTI-AI SHIELD: UNAUTHORIZED AUTOMATION SCRAPING BLOCKED</h3></div>";
    }
  }

  // --- 5. System Protection & Anti-Inspect Shield (ทุกหน้าเว็บไซต์) ---
  function initSystemProtection() {
    // 1. ตรวจสอบและสร้างองค์ประกอบ #block-popup หากยังไม่มีในหน้าเว็บ
    if (!document.getElementById("block-popup")) {
      const popupEl = document.createElement("div");
      popupEl.id = "block-popup";
      popupEl.innerHTML = `<div class="box">SYSTEM PROTECTED</div>`;
      document.body.appendChild(popupEl);
    }

    // 2. ฉีดสไตล์ CSS ของ SYSTEM PROTECTED
    if (!document.getElementById("blockPopupStyles")) {
      const style = document.createElement("style");
      style.id = "blockPopupStyles";
      style.textContent = `
        #block-popup {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(3, 3, 3, 0.88);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          justify-content: center;
          align-items: center;
          z-index: 9999999;
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
          pointer-events: none;
        }
        #block-popup .box {
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          padding: 30px 65px;
          border-radius: 18px;
          font-family: 'Kanit', sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 6px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          animation: sysAlertBlink 1.5s infinite alternate ease-in-out;
        }
        @keyframes sysAlertBlink {
          0% { border-color: rgba(255, 255, 255, 0.1); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); }
          100% { border-color: rgba(255, 255, 255, 0.35); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(255, 255, 255, 0.2); }
        }
        @media (max-width: 480px) {
          #block-popup .box {
            padding: 20px 32px;
            font-size: 1.35rem;
            letter-spacing: 3px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let hideTimer = null;
    function triggerSystemProtected() {
      const popup = document.getElementById("block-popup");
      if (!popup) return;
      popup.style.display = "flex";
      setTimeout(() => { popup.style.opacity = "1"; }, 10);
      
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => { popup.style.display = "none"; }, 350);
      }, 1500);
    }

    // ป้องกันคลิกขวา (Right Click)
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      triggerSystemProtected();
      return false;
    }, true);

    // ป้องกันคีย์ลัดตรวจสอบโค้ด ดูซอร์สโค้ด และแคปหน้าจอ (DevTools & Inspection Shortcuts)
    document.addEventListener("keydown", (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // F12 (Developer Tools)
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        triggerSystemProtected();
        return false;
      }

      // Ctrl + Shift + I, J, C (Inspect Elements / Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        triggerSystemProtected();
        return false;
      }

      // Ctrl + U (View Source Code)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U" || e.keyCode === 85)) {
        e.preventDefault();
        triggerSystemProtected();
        return false;
      }

      // Ctrl + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S" || e.keyCode === 83)) {
        if (!isInput) {
          e.preventDefault();
          triggerSystemProtected();
          return false;
        }
      }

      // Ctrl + P (Print Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P" || e.keyCode === 80)) {
        e.preventDefault();
        triggerSystemProtected();
        return false;
      }
    }, true);
  }

  // ดำเนินการเมื่อ DOM โหลดเรียบร้อย
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyCustomBackground();
      applyCustomMusic();
      initCookieConsent();
      initAntiAiShield();
      initSystemProtection();
    });
  } else {
    applyCustomBackground();
    applyCustomMusic();
    initCookieConsent();
    initAntiAiShield();
    initSystemProtection();
  }
})();

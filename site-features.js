/**
 * LYFESTYLE — Site Features & Security Engine
 * 1. Dynamic Background / Banner Loader
 * 2. Dynamic Audio / Music Loader
 * 3. Cookie Consent Banner System
 * 4. Anti-AI Scraper & Bot Shield
 */

(function() {
  // --- 1. Dynamic Background / Banner (Local + Cloud Realtime Sync) ---
  function setBackgroundStyle(url) {
    const bgElements = document.querySelectorAll(".bg-animation");
    bgElements.forEach(el => {
      if (url && url.trim() !== "") {
        el.style.background = `url('${url.trim()}') center/cover no-repeat`;
      } else {
        el.style.background = `url('background.gif') center/cover no-repeat`;
      }
    });
  }

  function getEffectiveDbUrl() {
    if (window.LYFE_FIREBASE_CONFIG && window.LYFE_FIREBASE_CONFIG.databaseURL && window.LYFE_FIREBASE_CONFIG.databaseURL.trim() !== "") {
      return window.LYFE_FIREBASE_CONFIG.databaseURL;
    }
    try {
      const savedConfig = localStorage.getItem("lyfe_firebase_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed && parsed.databaseURL) return parsed.databaseURL;
      }
    } catch(e) {}
    return "https://lyfe-d7804-default-rtdb.firebaseio.com/";
  }

  async function syncBannerFromCloud() {
    const dbUrl = getEffectiveDbUrl();
    if (!dbUrl) return;
    try {
      const endpoint = dbUrl.replace(/\/$/, "");
      const res = await fetch(`${endpoint}/settings/banner.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const cloudBanner = await res.json();
        if (cloudBanner !== null) {
          const currentLocal = localStorage.getItem("lyfe_site_bg") || "";
          if (cloudBanner !== currentLocal) {
            if (cloudBanner && cloudBanner.trim() !== "") {
              localStorage.setItem("lyfe_site_bg", cloudBanner);
              setBackgroundStyle(cloudBanner);
            } else {
              localStorage.removeItem("lyfe_site_bg");
              setBackgroundStyle("");
            }
          }
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  function applyCustomBackground() {
    // 1. นำภาพจาก LocalStorage มาแสดงผลก่อนทันที (0 delay)
    const customBg = localStorage.getItem("lyfe_site_bg");
    if (customBg) {
      setBackgroundStyle(customBg);
    }
    // 2. ดึงค่าล่าสุดจาก Cloud Realtime Database
    syncBannerFromCloud();

    // 3. ฟังการเปลี่ยนแปลงข้ามแท็บ (storage event)
    window.addEventListener("storage", (e) => {
      if (e.key === "lyfe_site_bg") {
        setBackgroundStyle(e.newValue);
      }
    });
  }

  // เผยแพร่ API สากลสำหรับอัปเดตแบนเนอร์/พื้นหลัง
  window.LyfeSite = {
    setBackground: async function(url) {
      const clean = (url || "").trim();
      if (clean) {
        localStorage.setItem("lyfe_site_bg", clean);
      } else {
        localStorage.removeItem("lyfe_site_bg");
      }
      setBackgroundStyle(clean);

      // ส่งขึ้น Cloud Firebase Realtime Database
      const dbUrl = getEffectiveDbUrl();
      if (dbUrl) {
        try {
          const endpoint = dbUrl.replace(/\/$/, "");
          await fetch(`${endpoint}/settings/banner.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clean)
          });
        } catch(e) {}
      }

      if (window.firebase && firebase.apps && firebase.apps.length) {
        try {
          await firebase.database().ref("settings/banner").set(clean);
        } catch(e) {}
      }
      return true;
    },
    getBackground: function() {
      return localStorage.getItem("lyfe_site_bg") || "";
    }
  };

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
    const isControlPage = (window.location.pathname.includes("admin.html") || window.location.pathname.includes("admin.php")) || (window.location.pathname.includes("login.html") || window.location.pathname.includes("login.php"));

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

  // --- 6. Ambient Cyber Stardust Particles Canvas ---
  function initAmbientParticles() {
    if (document.getElementById("lyfeParticleCanvas")) return;
    const canvas = document.createElement("canvas");
    canvas.id = "lyfeParticleCanvas";
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;opacity:0.65;";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, moved: false };
    const numParticles = Math.min(42, Math.max(20, Math.floor((width * height) / 36000)));
    const particles = [];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.8 + 0.6;
        this.speedY = Math.random() * 0.4 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.baseOpacity = this.opacity;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // ตอบสนองการขยับเมาส์อย่างนุ่มนวล
        if (mouse.moved) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * 0.7;
            this.y -= Math.sin(angle) * 0.7;
          }
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.shadowBlur = this.size * 2.5;
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    let isVisible = true;
    document.addEventListener("visibilitychange", () => {
      isVisible = !document.hidden;
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.moved = true;
    });

    function loop() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  // --- 7. Interactive 3D Card Tilt & Holographic Glow ---
  function initCardTiltAndGlow() {
    const cardSelectors = [
      ".news-card",
      ".official-card",
      ".member-card",
      ".stat-card"
    ];

    if (!document.getElementById("cardEffectsStyle")) {
      const style = document.createElement("style");
      style.id = "cardEffectsStyle";
      style.textContent = `
        .news-card, .official-card, .member-card, .stat-card {
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease !important;
          will-change: transform;
        }
        .card-glow-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.35s ease;
          background: radial-gradient(circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.12), transparent 75%);
          z-index: 2;
        }
        .card-has-glow:hover .card-glow-overlay {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    function attachCardTilt(card) {
      if (card.dataset.tiltAttached) return;
      card.dataset.tiltAttached = "true";
      card.classList.add("card-has-glow");

      let glowOverlay = card.querySelector(".card-glow-overlay");
      if (!glowOverlay) {
        glowOverlay = document.createElement("div");
        glowOverlay.className = "card-glow-overlay";
        card.appendChild(glowOverlay);
      }

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((centerY - y) / centerY) * 4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    }

    function scanAndAttach() {
      cardSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(attachCardTilt);
      });
    }

    scanAndAttach();
    const observer = new MutationObserver(() => scanAndAttach());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // --- 8. Audio Waveform Equalizer Visualizer ---
  function initAudioVisualizer() {
    const volContainer = document.querySelector(".volume-container");
    if (!volContainer || document.getElementById("audioWaveVisualizer")) return;

    if (!document.getElementById("audioWaveStyle")) {
      const style = document.createElement("style");
      style.id = "audioWaveStyle";
      style.textContent = `
        .audio-wave-visualizer {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          height: 18px;
          margin-left: 8px;
          pointer-events: none;
        }
        .wave-bar {
          width: 3px;
          background: #ffffff;
          border-radius: 3px;
          height: 4px;
          opacity: 0.45;
          transition: height 0.2s ease, opacity 0.2s ease;
        }
        .audio-wave-visualizer.active .wave-bar {
          opacity: 0.95;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
          animation: waveBounce 1.1s infinite ease-in-out alternate;
        }
        .audio-wave-visualizer.active .bar-1 { animation-delay: 0.1s; height: 14px; }
        .audio-wave-visualizer.active .bar-2 { animation-delay: 0.35s; height: 18px; }
        .audio-wave-visualizer.active .bar-3 { animation-delay: 0.2s; height: 10px; }
        .audio-wave-visualizer.active .bar-4 { animation-delay: 0.5s; height: 16px; }
        @keyframes waveBounce {
          0% { height: 4px; }
          50% { height: 18px; }
          100% { height: 6px; }
        }
      `;
      document.head.appendChild(style);
    }

    const iconBox = volContainer.querySelector(".icon-box, .vol-icon-box");
    if (iconBox) {
      const waveEl = document.createElement("div");
      waveEl.id = "audioWaveVisualizer";
      waveEl.className = "audio-wave-visualizer";
      waveEl.innerHTML = `
        <span class="wave-bar bar-1"></span>
        <span class="wave-bar bar-2"></span>
        <span class="wave-bar bar-3"></span>
        <span class="wave-bar bar-4"></span>
      `;
      iconBox.parentNode.insertBefore(waveEl, iconBox.nextSibling);

      const audio = document.getElementById("bgMusic") || document.querySelector("audio");
      function updateWaveState() {
        if (!audio) return;
        const isMuted = localStorage.getItem("musicMuted") === "true" || audio.muted || audio.volume === 0;
        const isPlaying = !audio.paused && !isMuted;
        if (isPlaying) {
          waveEl.classList.add("active");
        } else {
          waveEl.classList.remove("active");
        }
      }

      if (audio) {
        audio.addEventListener("play", updateWaveState);
        audio.addEventListener("pause", updateWaveState);
        audio.addEventListener("volumechange", updateWaveState);
      }
      setInterval(updateWaveState, 800);
      updateWaveState();
    }
  }

  // Universal Theme Controller (Dark & Light Mode Engine)
  const THEME_STORAGE_KEY = "lyfe_theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    } catch(e) {
      return "dark";
    }
  }

  function updateColorSchemeEnforcer(theme) {
    try {
      let meta = document.querySelector('meta[name="color-scheme"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "color-scheme";
        document.head.appendChild(meta);
      }
      meta.content = theme === "light" ? "light" : "dark";

      const styleId = "lyfe-global-dark-scheme";
      let st = document.getElementById(styleId);
      if (!st) {
        st = document.createElement("style");
        st.id = styleId;
        document.head.appendChild(st);
      }

      if (theme === "light") {
        st.textContent = `
          :root, html, body.light-theme {
            color-scheme: light !important;
          }
          body.light-theme select, body.light-theme select option, body.light-theme select optgroup, body.light-theme input, body.light-theme textarea {
            color-scheme: light !important;
          }
          body.light-theme select option, body.light-theme select optgroup {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          body.light-theme select option:checked {
            background-color: #e2e8f0 !important;
            color: #0f172a !important;
          }
        `;
      } else {
        st.textContent = `
          :root, html, body:not(.light-theme) {
            color-scheme: dark !important;
          }
          body:not(.light-theme) select, body:not(.light-theme) select option, body:not(.light-theme) select optgroup, body:not(.light-theme) input, body:not(.light-theme) textarea {
            color-scheme: dark !important;
          }
          body:not(.light-theme) select option, body:not(.light-theme) select optgroup {
            background-color: #141418 !important;
            color: #f8fafc !important;
          }
          body:not(.light-theme) select option:checked {
            background-color: #1e3a8a !important;
            color: #ffffff !important;
          }
        `;
      }
    } catch(e) {}
  }

  function updateThemeUI(theme) {
    const isLight = theme === "light";

    // 1. Desktop & Generic Theme Switch Buttons
    const themeButtons = document.querySelectorAll("#themeSwitchBtn, #loginThemeBtn, [data-theme-toggle]");
    themeButtons.forEach(btn => {
      const icon = btn.querySelector(".theme-switch-icon, i");
      if (icon) {
        icon.className = isLight ? "fa-solid fa-sun theme-switch-icon" : "fa-solid fa-moon theme-switch-icon";
        icon.style.color = isLight ? "#ffa502" : "#f1c40f";
      }
      const text = btn.querySelector("#themeSwitchText, #loginThemeText");
      if (text) {
        text.innerText = isLight ? "LIGHT" : "DARK";
      }
    });

    // 2. Mobile Menu Theme Buttons
    const mobileThemeBtns = document.querySelectorAll("#mobileThemeSwitchBtn");
    mobileThemeBtns.forEach(btn => {
      const icon = btn.querySelector(".theme-switch-icon, i");
      if (icon) {
        icon.className = isLight ? "fa-solid fa-sun theme-switch-icon" : "fa-solid fa-moon theme-switch-icon";
        icon.style.color = isLight ? "#ffa502" : "#f1c40f";
      }
      const text = btn.querySelector("#mobileThemeSwitchText");
      if (text) {
        text.innerText = isLight ? "โหมดสว่าง (LIGHT)" : "โหมดมืด (DARK)";
      }
    });

    // 3. Admin Theme Button
    const adminThemeBtn = document.getElementById("btnAdminTheme");
    if (adminThemeBtn) {
      const icon = document.getElementById("adminThemeIcon") || adminThemeBtn.querySelector("i");
      const text = document.getElementById("adminThemeText") || adminThemeBtn.querySelector("span");
      if (icon) {
        icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
        icon.style.color = isLight ? "#ffa502" : "#f1c40f";
      }
      if (text) {
        text.innerText = isLight ? "โหมดสว่าง" : "โหมดมืด";
      }
    }
  }

  function applyLyfeTheme(theme, save = true) {
    const targetTheme = theme === "light" ? "light" : "dark";
    if (save) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
      } catch(e) {}
    }

    if (targetTheme === "light") {
      document.documentElement.classList.add("light-theme");
      document.body.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.body.classList.remove("light-theme");
    }

    updateColorSchemeEnforcer(targetTheme);
    updateThemeUI(targetTheme);
  }

  function toggleLyfeTheme() {
    const current = document.body.classList.contains("light-theme") ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyLyfeTheme(next, true);
  }

  // Make globally available
  window.LyfeTheme = {
    get: getStoredTheme,
    apply: applyLyfeTheme,
    toggle: toggleLyfeTheme
  };
  window.toggleLyfeTheme = toggleLyfeTheme;
  window.applyLyfeTheme = applyLyfeTheme;

  function bindThemeSwitchButtons() {
    const selector = "#themeSwitchBtn, #mobileThemeSwitchBtn, #loginThemeBtn, .theme-switch-btn, [data-theme-toggle]";
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(btn => {
      // ยกเว้นปุ่มใน admin.html ที่มี handler เฉพาะ
      if (btn.id === "btnAdminTheme" || btn.id === "adminThemeBtn") return;
      if (!btn.dataset.themeBound) {
        btn.dataset.themeBound = "true";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          toggleLyfeTheme();
        });
      }
    });
  }

  function initUniversalTheme() {
    // 1. ใช้ค่าจาก LocalStorage ทันที
    const savedTheme = getStoredTheme();
    applyLyfeTheme(savedTheme, false);

    // 2. ผูกปุ่มสลับธีมบนหน้า
    bindThemeSwitchButtons();

    // 3. ฟังการเปลี่ยนแปลงข้ามแท็บแบบ Realtime
    window.addEventListener("storage", (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        applyLyfeTheme(e.newValue || "dark", false);
      }
    });

    // 4. MutationObserver สังเกต elements ที่อาจถูกโหลดแบบไดนามิก
    const observer = new MutationObserver(() => {
      bindThemeSwitchButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Shared Light Mode Styles (Universal fallback injection)
  function injectSharedThemeStyles() {
    const id = "lyfe-universal-theme-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      /* Universal Theme Transition */
      body {
        transition: background-color 0.4s ease, color 0.4s ease, opacity 0.8s ease;
      }
      .bg-overlay, header, .navbar, .news-card, .official-card, .login-container {
        transition: background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
      }

      /* Universal Theme Switch Button Styles */
      .theme-switch-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 50px;
        padding: 7px 18px;
        color: #ffffff;
        font-size: 0.82rem;
        font-family: 'Kanit', sans-serif;
        font-weight: 500;
        letter-spacing: 1.5px;
        cursor: pointer;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        text-decoration: none;
        user-select: none;
        line-height: 1.2;
      }
      .theme-switch-btn:hover {
        transform: translateY(-2px) scale(1.03);
        background: rgba(255, 255, 255, 0.16);
        border-color: rgba(255, 255, 255, 0.35);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      }
      .theme-switch-btn:active {
        transform: translateY(0) scale(0.97);
      }
      .theme-switch-icon {
        font-size: 0.92rem;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        color: #f1c40f;
        display: inline-block;
      }
      .theme-switch-btn:hover .theme-switch-icon {
        transform: rotate(25deg) scale(1.1);
      }

      /* Light Mode Variations for Generic Elements */
      body.light-theme .theme-switch-btn {
        background: rgba(0, 0, 0, 0.06);
        border-color: rgba(0, 0, 0, 0.14);
        color: #0f172a;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      }
      body.light-theme .theme-switch-btn:hover {
        background: rgba(0, 0, 0, 0.12);
        border-color: rgba(0, 0, 0, 0.25);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
      body.light-theme .theme-switch-icon {
        color: #ffa502;
      }

      /* Cookie Banner in Light Mode */
      body.light-theme #lyfeCookieBanner .cookie-banner-content {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(0, 0, 0, 0.1);
        color: #0f172a;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
      }
      body.light-theme #lyfeCookieBanner .cookie-text h4 {
        color: #0f172a;
      }
      body.light-theme #lyfeCookieBanner .cookie-text p {
        color: rgba(15, 23, 42, 0.65);
      }
      body.light-theme #lyfeCookieBanner .cookie-accept {
        background: #0f172a;
        color: #ffffff;
      }
      body.light-theme #lyfeCookieBanner .cookie-close {
        background: rgba(0, 0, 0, 0.05);
        color: #0f172a;
        border-color: rgba(0, 0, 0, 0.12);
      }

      /* Volume Container in Light Mode */
      body.light-theme .volume-container {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(0, 0, 0, 0.08);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }
      body.light-theme .volume-container:hover {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(0, 0, 0, 0.15);
      }
      body.light-theme .vol-icon-box i {
        color: #0f172a;
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.1));
      }
      body.light-theme .volume-slider {
        background: rgba(0, 0, 0, 0.12);
      }
      body.light-theme .volume-slider::-webkit-slider-thumb {
        background: #0f172a;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
      }
      body.light-theme .audio-wave-visualizer .wave-bar {
        background: #0f172a;
      }
      body.light-theme .audio-wave-visualizer.active .wave-bar {
        box-shadow: 0 0 8px rgba(15, 23, 42, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════════════════
  // 5. CYBER VISITOR TELEMETRY & LIVE IP ENGINE
  // ══════════════════════════════════════════════════════
  function parseDeviceInfo() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || "";
    let deviceName = "Unknown Device";
    let deviceType = "Desktop";
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    // 1. Detect OS & Specific Device
    if (/iPad|Macintosh/i.test(ua) && 'ontouchend' in document) {
      deviceName = "Apple iPad (iPadOS)";
      deviceType = "Tablet";
      os = "iPadOS";
    } else if (/iPhone/i.test(ua)) {
      deviceType = "Mobile";
      os = "iOS";
      const w = window.screen.width;
      const h = window.screen.height;
      if ((w === 430 && h === 932) || (w === 393 && h === 852)) {
        deviceName = "Apple iPhone 15 / 14 Pro";
      } else if (w === 390 && h === 844) {
        deviceName = "Apple iPhone 14 / 13";
      } else if (w === 414 && h === 896) {
        deviceName = "Apple iPhone 11 / XR";
      } else {
        deviceName = "Apple iPhone (iOS)";
      }
    } else if (/Android/i.test(ua)) {
      deviceType = /Tablet/i.test(ua) ? "Tablet" : "Mobile";
      os = "Android";
      const match = ua.match(/;\s*([^;]+)\s*Build\//i);
      if (match && match[1]) {
        deviceName = match[1].trim();
      } else if (/Samsung/i.test(ua)) {
        deviceName = "Samsung Galaxy";
      } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
        deviceName = "Xiaomi / Redmi";
      } else if (/OPPO/i.test(ua)) {
        deviceName = "OPPO Device";
      } else if (/vivo/i.test(ua)) {
        deviceName = "vivo Device";
      } else {
        deviceName = "Android Smartphone";
      }
    } else if (/Windows NT 10.0/i.test(ua)) {
      deviceName = "Windows 11 / 10 PC";
      deviceType = "Desktop";
      os = "Windows";
    } else if (/Windows NT/i.test(ua)) {
      deviceName = "Windows PC";
      deviceType = "Desktop";
      os = "Windows";
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceName = "Apple Mac (macOS)";
      deviceType = "Desktop";
      os = "macOS";
    } else if (/Linux/i.test(ua)) {
      deviceName = "Linux Workstation";
      deviceType = "Desktop";
      os = "Linux";
    }

    // 2. Detect Browser
    if (/Edg\//i.test(ua)) {
      browser = "Microsoft Edge";
    } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
      browser = "Google Chrome";
    } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
      browser = "Apple Safari";
    } else if (/Firefox\//i.test(ua)) {
      browser = "Mozilla Firefox";
    } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
      browser = "Opera";
    }

    return {
      deviceName,
      deviceType,
      os,
      browser,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || "th-TH"
    };
  }

  function getPageLabel() {
    const p = window.location.pathname.toLowerCase();
    if (p.includes("members")) return "MEMBERS (รายชื่อสมาชิก)";
    if (p.includes("official")) return "OFFICIAL (ช่องทางติดต่อ)";
    if (p.includes("chat")) return "OPENCHAT (ห้องแชท & เกมงู 3004)";
    if (p.includes("login")) return "LOGIN (เข้าสู่ระบบแอดมิน)";
    if (p.includes("admin")) return "ADMIN (แผงควบคุมหลังบ้าน)";
    return "HOME (หน้าหลักเว็บแก๊ง)";
  }

  async function getClientPublicIp() {
    // 1. ลองดึงจาก ipify API
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 3500);
      const res = await fetch("https://api.ipify.org?format=json", { signal: c.signal });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ip) return data.ip;
      }
    } catch(e) {}

    // 2. Fallback ดึงจาก ipwho.is (พร้อมระบุประเทศ/พิกัด)
    try {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 3500);
      const res2 = await fetch("https://ipwho.is/", { signal: c2.signal });
      clearTimeout(t2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.ip) {
          return {
            ip: data2.ip,
            country: data2.country || "Thailand",
            city: data2.city || "Bangkok",
            flag: data2.country_code || "TH",
            isp: data2.connection && data2.connection.isp ? data2.connection.isp : "Internet Provider"
          };
        }
      }
    } catch(e) {}

    return "127.0.0.1";
  }

  async function trackVisitorTelemetry() {
    try {
      const dbUrl = getEffectiveDbUrl();
      const dev = parseDeviceInfo();
      const page = getPageLabel();

      // Session Tracking Key
      let sessionId = sessionStorage.getItem("lyfe_session_id");
      if (!sessionId) {
        sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
        sessionStorage.setItem("lyfe_session_id", sessionId);
      }

      // IP Address Resolution
      const ipResult = await getClientPublicIp();
      let ipAddress = typeof ipResult === "string" ? ipResult : ipResult.ip;
      let country = typeof ipResult === "object" ? ipResult.country : "Thailand";
      let city = typeof ipResult === "object" ? ipResult.city : "Bangkok";
      let isp = typeof ipResult === "object" ? ipResult.isp : "Telecom";

      const logEntry = {
        sessionId,
        ip: ipAddress,
        deviceName: dev.deviceName,
        deviceType: dev.deviceType,
        os: dev.os,
        browser: dev.browser,
        screen: dev.screen,
        language: dev.language,
        page: page,
        country: country,
        city: city,
        isp: isp,
        timestamp: Date.now(),
        lastActive: Date.now(),
        timeFormatted: new Date().toLocaleString("th-TH")
      };

      // 1. บันทึกประวัติ Localhost Fallback
      try {
        let localLogs = JSON.parse(localStorage.getItem("lyfe_visitor_telemetry_logs") || "[]");
        localLogs.unshift(logEntry);
        if (localLogs.length > 100) localLogs = localLogs.slice(0, 100);
        localStorage.setItem("lyfe_visitor_telemetry_logs", JSON.stringify(localLogs));
      } catch(e) {}

      // 2. บันทึกและซิงค์ขึ้น Cloud Firebase Realtime Database
      if (dbUrl) {
        const endpoint = dbUrl.replace(/\/$/, "");
        const safeSessionId = sessionId.replace(/[.#$[\]]/g, "_");

        // อัปเดต Active Session
        fetch(`${endpoint}/analytics/active/${safeSessionId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEntry)
        }).catch(() => {});

        // อัปเดต Visitor Log ล่าสุด
        fetch(`${endpoint}/analytics/visitors/${safeSessionId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEntry)
        }).catch(() => {});

        // Heartbeat ทุกๆ 25 วินาที เพื่อเช็ค Realtime Active Users
        const heartbeatTimer = setInterval(() => {
          fetch(`${endpoint}/analytics/active/${safeSessionId}/lastActive.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Date.now())
          }).catch(() => {});
        }, 25000);

        // เมื่อปิดหน้าเว็บ นำ Session ออกจาก Active
        window.addEventListener("beforeunload", () => {
          clearInterval(heartbeatTimer);
          if (navigator.sendBeacon) {
            navigator.sendBeacon(`${endpoint}/analytics/active/${safeSessionId}.json`, JSON.stringify(null));
          }
        });
      }
    } catch(e) {}
  }

  // ดำเนินการเมื่อ DOM โหลดเรียบร้อย
  function startAllFeatures() {
    injectSharedThemeStyles();
    initUniversalTheme();
    applyCustomBackground();
    applyCustomMusic();
    initCookieConsent();
    initAntiAiShield();
    initSystemProtection();
    initAmbientParticles();
    initCardTiltAndGlow();
    initAudioVisualizer();
    trackVisitorTelemetry();
  }

  // ดำเนินการตรวจสอบธีมและใส่สไตล์ทันทีก่อน DOM เพื่อความรวดเร็ว 0 latency ไร้ FOUC
  try {
    injectSharedThemeStyles();
    const preTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    if (preTheme === "light") {
      document.documentElement.classList.add("light-theme");
      if (document.body) document.body.classList.add("light-theme");
    }
  } catch(e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAllFeatures);
  } else {
    startAllFeatures();
  }
})();

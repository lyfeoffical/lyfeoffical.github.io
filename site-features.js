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
    const finalUrl = (url && url.trim() !== "") ? url.trim() : "background.gif";
    let bgStyleEl = document.getElementById("lyfe-instant-bg-fast");
    if (!bgStyleEl) {
      bgStyleEl = document.createElement("style");
      bgStyleEl.id = "lyfe-instant-bg-fast";
      if (document.head) {
        document.head.appendChild(bgStyleEl);
      } else if (document.documentElement) {
        document.documentElement.appendChild(bgStyleEl);
      }
    }
    if (bgStyleEl) {
      bgStyleEl.textContent = `.bg-animation { background: url('${finalUrl}') center/cover no-repeat !important; will-change: transform; transform: translateZ(0); }`;
    }
    const bgElements = document.querySelectorAll(".bg-animation");
    bgElements.forEach(el => {
      el.style.background = `url('${finalUrl}') center/cover no-repeat`;
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
    setTimeout(syncBannerFromCloud, 2500);

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

    // 2. ตรวจจับและบล็อก AI Scraping Bot (ข้ามเมื่อเปิดเครื่องตัวเองหรือพรีวิว)
    if (window.location.protocol === "file:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || !window.location.hostname) {
      return;
    }

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
        text.innerText = isLight ? "โหมดสว่าง" : "โหมดมืด";
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
      if (document.body) document.body.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
      if (document.body) document.body.classList.remove("light-theme");
    }

    updateColorSchemeEnforcer(targetTheme);
    updateThemeUI(targetTheme);
  }

  function toggleLyfeTheme() {
    const isCurrentlyLight = document.documentElement.classList.contains("light-theme") ||
                             (document.body && document.body.classList.contains("light-theme")) ||
                             getStoredTheme() === "light";
    const nextTheme = isCurrentlyLight ? "dark" : "light";
    applyLyfeTheme(nextTheme, true);
  }

  // Make globally available
  window.LyfeTheme = {
    get: getStoredTheme,
    apply: applyLyfeTheme,
    toggle: toggleLyfeTheme
  };
  window.toggleLyfeTheme = toggleLyfeTheme;
  window.applyLyfeTheme = applyLyfeTheme;

  // Global Capture Delegator for Theme Switching across all pages
  let themeDelegatorActive = false;
  function bindGlobalThemeDelegator() {
    if (themeDelegatorActive) return;
    themeDelegatorActive = true;
    document.addEventListener("click", (e) => {
      const themeBtn = e.target.closest("#themeSwitchBtn, #mobileThemeSwitchBtn, #loginThemeBtn, #btnAdminTheme, .theme-switch-btn, [data-theme-toggle]");
      if (themeBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleLyfeTheme();
      }
    }, true);
  }

  function initUniversalTheme() {
    // 1. Apply stored theme immediately
    const savedTheme = getStoredTheme();
    applyLyfeTheme(savedTheme, false);

    // 2. Bind global capture delegator
    bindGlobalThemeDelegator();

    // 3. Realtime cross-tab sync
    window.addEventListener("storage", (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        applyLyfeTheme(e.newValue || "dark", false);
      }
    });
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
        font-family: 'Prompt', 'Kanit', 'Noto Sans Thai', sans-serif !important;
        font-weight: 500;
        letter-spacing: 0.8px;
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
    if (p.includes("chat")) return "BOARDGANG";
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
    return;
  }

  // ดำเนินการเมื่อ DOM โหลดเรียบร้อย
  
  // ══════════════════════════════════════════════════════
  // 6. UNIVERSAL MOBILE SLIDE BAR ENGINE (FOR ALL PHONES & SCREENS)
  // ══════════════════════════════════════════════════════
  function injectSidebarStyles() {
    const id = "lyfe-sidebar-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      /* Lock scroll while mobile sidebar is open */
      body.lyfe-sidebar-open,
      html.lyfe-sidebar-open {
        overflow: hidden !important;
        touch-action: none !important;
        -webkit-overflow-scrolling: auto !important;
      }

      /* Backdrop Overlay */
      .lyfe-sidebar-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        background: rgba(0, 0, 0, 0.7) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        z-index: 99998 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s !important;
        will-change: opacity, visibility;
      }

      .lyfe-sidebar-overlay.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      /* Sidebar Drawer */
      .lyfe-sidebar {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: min(86vw, 350px) !important;
        height: 100vh !important;
        height: 100dvh !important;
        background: rgba(10, 10, 14, 0.95) !important;
        backdrop-filter: blur(28px) !important;
        -webkit-backdrop-filter: blur(28px) !important;
        border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: -15px 0 45px rgba(0, 0, 0, 0.75) !important;
        z-index: 99999 !important;
        display: flex !important;
        flex-direction: column !important;
        transform: translateX(105%) !important;
        transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1) !important;
        will-change: transform;
        font-family: 'Prompt', 'Kanit', sans-serif !important;
        color: #ffffff !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      .lyfe-sidebar.active {
        transform: translateX(0) !important;
      }

      /* Safe Area Insets for modern devices (iPhone notch, dynamic island, navigation bar) */
      .lyfe-sidebar-inner {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
        width: 100% !important;
        padding-top: max(16px, env(safe-area-inset-top)) !important;
        padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
        padding-right: max(6px, env(safe-area-inset-right)) !important;
        padding-left: max(4px, env(safe-area-inset-left)) !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }

      /* Sidebar Header */
      .lyfe-sidebar-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 16px 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        flex-shrink: 0 !important;
      }

      .lyfe-sidebar-brand {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        text-decoration: none !important;
        color: inherit !important;
      }

      .lyfe-sidebar-logo {
        width: 38px !important;
        height: 38px !important;
        object-fit: contain !important;
        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.25)) !important;
      }

      .lyfe-sidebar-brand-text {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
      }

      .lyfe-sidebar-brand-title {
        font-family: 'Kanit', 'Prompt', sans-serif !important;
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        letter-spacing: 1.5px !important;
        color: #ffffff !important;
        line-height: 1.1 !important;
      }

      .lyfe-sidebar-badge {
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        font-size: 0.68rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px !important;
        color: #2ed573 !important;
      }

      .lyfe-sidebar-badge i {
        font-size: 6px !important;
        animation: lyfePulseDot 1.8s infinite !important;
      }

      @keyframes lyfePulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.8); }
      }

      /* Close Button */
      .lyfe-sidebar-close {
        width: 38px !important;
        height: 38px !important;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        outline: none !important;
        font-size: 1.1rem !important;
        transition: all 0.25s ease !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .lyfe-sidebar-close:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.35) !important;
        transform: rotate(90deg) scale(1.06) !important;
      }

      .lyfe-sidebar-close:active {
        transform: scale(0.92) !important;
      }

      /* Status Card */
      .lyfe-sidebar-status-card {
        margin: 14px 18px 6px !important;
        padding: 12px 14px !important;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        flex-shrink: 0 !important;
      }

      .lyfe-sidebar-status-icon {
        width: 34px !important;
        height: 34px !important;
        border-radius: 9px !important;
        background: rgba(245, 158, 11, 0.15) !important;
        border: 1px solid rgba(245, 158, 11, 0.3) !important;
        color: #f59e0b !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.95rem !important;
      }

      .lyfe-sidebar-status-info {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
      }

      .lyfe-sidebar-status-title {
        font-size: 0.85rem !important;
        font-weight: 600 !important;
        color: #ffffff !important;
      }

      .lyfe-sidebar-status-sub {
        font-size: 0.68rem !important;
        color: rgba(255, 255, 255, 0.5) !important;
        letter-spacing: 0.5px !important;
      }

      /* Scroll Area */
      .lyfe-sidebar-scroll-area {
        flex: 1 !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
        padding: 12px 16px 20px !important;
      }

      .lyfe-sidebar-scroll-area::-webkit-scrollbar {
        width: 4px !important;
      }
      .lyfe-sidebar-scroll-area::-webkit-scrollbar-track {
        background: transparent !important;
      }
      .lyfe-sidebar-scroll-area::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15) !important;
        border-radius: 4px !important;
      }

      /* Section Label */
      .lyfe-sidebar-section-label {
        padding: 12px 4px 6px !important;
        font-size: 0.68rem !important;
        font-weight: 600 !important;
        letter-spacing: 1.2px !important;
        color: rgba(255, 255, 255, 0.45) !important;
        text-transform: uppercase !important;
      }

      /* Navigation List */
      .lyfe-sidebar-nav {
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
      }

      .lyfe-sidebar-link {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 11px 14px !important;
        background: rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        border-radius: 12px !important;
        text-decoration: none !important;
        color: rgba(255, 255, 255, 0.85) !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none !important;
      }

      .lyfe-sidebar-link:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
        color: #ffffff !important;
        transform: translateX(4px) !important;
      }

      .lyfe-sidebar-link:active {
        transform: scale(0.98) !important;
      }

      .lyfe-sidebar-link.active {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04)) !important;
        border-color: rgba(255, 255, 255, 0.35) !important;
        border-left: 3px solid #ffffff !important;
        color: #ffffff !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.05) !important;
      }

      .lyfe-sidebar-link-icon {
        width: 34px !important;
        height: 34px !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.95rem !important;
        color: #ffffff !important;
        transition: all 0.25s ease !important;
        flex-shrink: 0 !important;
      }

      .lyfe-sidebar-link.active .lyfe-sidebar-link-icon {
        background: #ffffff !important;
        color: #000000 !important;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.5) !important;
      }

      .lyfe-sidebar-link-content {
        display: flex !important;
        flex-direction: column !important;
        flex: 1 !important;
        min-width: 0 !important;
      }

      .lyfe-sidebar-link-th {
        font-size: 0.92rem !important;
        font-weight: 500 !important;
        line-height: 1.2 !important;
      }

      .lyfe-sidebar-link-en {
        font-size: 0.65rem !important;
        color: rgba(255, 255, 255, 0.45) !important;
        letter-spacing: 0.8px !important;
      }

      .lyfe-sidebar-link.active .lyfe-sidebar-link-en {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      .lyfe-sidebar-link-arrow {
        font-size: 0.75rem !important;
        color: rgba(255, 255, 255, 0.3) !important;
        transition: transform 0.2s ease, color 0.2s ease !important;
      }

      .lyfe-sidebar-link:hover .lyfe-sidebar-link-arrow {
        color: #ffffff !important;
        transform: translateX(2px) !important;
      }

      .lyfe-sidebar-link.active .lyfe-sidebar-link-arrow {
        color: #ffffff !important;
      }

      /* Controls Grid in Drawer */
      .lyfe-sidebar-controls-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
        margin-top: 4px !important;
      }

      .lyfe-sidebar-control-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        padding: 10px 12px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 10px !important;
        color: #ffffff !important;
        font-size: 0.8rem !important;
        font-family: inherit !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        outline: none !important;
        transition: all 0.25s ease !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .lyfe-sidebar-control-btn:hover {
        background: rgba(255, 255, 255, 0.12) !important;
        border-color: rgba(255, 255, 255, 0.25) !important;
        transform: translateY(-2px) !important;
      }

      .lyfe-sidebar-control-btn:active {
        transform: scale(0.96) !important;
      }

      /* Footer */
      .lyfe-sidebar-footer {
        padding: 14px 20px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        flex-shrink: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }

      .lyfe-sidebar-footer-text {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
      }

      .lyfe-sidebar-footer-text strong {
        font-size: 0.72rem !important;
        letter-spacing: 1px !important;
        color: rgba(255, 255, 255, 0.85) !important;
      }

      .lyfe-sidebar-footer-text span {
        font-size: 0.62rem !important;
        color: rgba(255, 255, 255, 0.4) !important;
        letter-spacing: 0.6px !important;
      }

      /* ══════════════════════════════════════════════════════
         LIGHT MODE STYLING FOR SIDEBAR
         ══════════════════════════════════════════════════════ */
      body.light-theme .lyfe-sidebar {
        background: rgba(255, 255, 255, 0.97) !important;
        border-left: 1px solid rgba(0, 0, 0, 0.1) !important;
        box-shadow: -15px 0 45px rgba(0, 0, 0, 0.15) !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-header {
        border-bottom-color: rgba(0, 0, 0, 0.08) !important;
      }

      body.light-theme .lyfe-sidebar-brand-title {
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-close {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: rgba(0, 0, 0, 0.1) !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-close:hover {
        background: rgba(0, 0, 0, 0.1) !important;
        border-color: rgba(0, 0, 0, 0.25) !important;
      }

      body.light-theme .lyfe-sidebar-status-card {
        background: rgba(0, 0, 0, 0.02) !important;
        border-color: rgba(0, 0, 0, 0.08) !important;
      }

      body.light-theme .lyfe-sidebar-status-title {
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-status-sub {
        color: rgba(15, 23, 42, 0.55) !important;
      }

      body.light-theme .lyfe-sidebar-section-label {
        color: rgba(15, 23, 42, 0.45) !important;
      }

      body.light-theme .lyfe-sidebar-link {
        background: rgba(0, 0, 0, 0.02) !important;
        border-color: rgba(0, 0, 0, 0.06) !important;
        color: #1e293b !important;
      }

      body.light-theme .lyfe-sidebar-link:hover {
        background: rgba(0, 0, 0, 0.06) !important;
        border-color: rgba(0, 0, 0, 0.15) !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-link.active {
        background: rgba(0, 0, 0, 0.07) !important;
        border-color: rgba(0, 0, 0, 0.2) !important;
        border-left: 3px solid #0f172a !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-link-icon {
        background: rgba(0, 0, 0, 0.05) !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-link.active .lyfe-sidebar-link-icon {
        background: #0f172a !important;
        color: #ffffff !important;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.25) !important;
      }

      body.light-theme .lyfe-sidebar-link-en {
        color: rgba(15, 23, 42, 0.5) !important;
      }

      body.light-theme .lyfe-sidebar-link-arrow {
        color: rgba(15, 23, 42, 0.35) !important;
      }

      body.light-theme .lyfe-sidebar-control-btn {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: rgba(0, 0, 0, 0.1) !important;
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-control-btn:hover {
        background: rgba(0, 0, 0, 0.1) !important;
        border-color: rgba(0, 0, 0, 0.2) !important;
      }

      body.light-theme .lyfe-sidebar-footer {
        border-top-color: rgba(0, 0, 0, 0.08) !important;
      }

      body.light-theme .lyfe-sidebar-footer-text strong {
        color: #0f172a !important;
      }

      body.light-theme .lyfe-sidebar-footer-text span {
        color: rgba(15, 23, 42, 0.5) !important;
      }

      /* ══════════════════════════════════════════════════════
         HAMBURGER BUTTON STYLING (CROSS-PAGE UNIFIED)
         ══════════════════════════════════════════════════════ */
      .hamburger {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 5px !important;
        width: 40px !important;
        height: 40px !important;
        cursor: pointer !important;
        z-index: 1050 !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        padding: 8px !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        -webkit-tap-highlight-color: transparent !important;
        box-sizing: border-box !important;
        touch-action: manipulation !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      .hamburger:hover {
        background: rgba(255, 255, 255, 0.14) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        transform: scale(1.05) !important;
      }

      .hamburger span {
        display: block !important;
        width: 22px !important;
        height: 2px !important;
        background: #ffffff !important;
        border-radius: 2px !important;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        pointer-events: none !important;
      }

      .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px) !important;
      }

      .hamburger.active span:nth-child(2) {
        opacity: 0 !important;
        transform: scaleX(0) !important;
      }

      .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px) !important;
      }

      body.light-theme .hamburger {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: rgba(0, 0, 0, 0.12) !important;
      }

      body.light-theme .hamburger span {
        background: #0f172a !important;
      }

      /* Desktop vs Mobile display rules */
      @media (max-width: 768px) {
        .nav-desktop,
        nav.nav-desktop {
          display: none !important;
        }
        .hamburger {
          display: flex !important;
        }
      }

      @media (min-width: 769px) {
        header .hamburger,
        .navbar .hamburger {
          display: none !important;
        }
      }

      /* Small mobile devices (iPhone SE, screens <= 360px) */
      @media (max-width: 360px) {
        .lyfe-sidebar {
          width: 90vw !important;
        }
        .lyfe-sidebar-header {
          padding: 12px 14px !important;
        }
        .lyfe-sidebar-scroll-area {
          padding: 8px 12px 16px !important;
        }
        .lyfe-sidebar-link {
          padding: 9px 10px !important;
          gap: 9px !important;
        }
        .lyfe-sidebar-link-th {
          font-size: 0.85rem !important;
        }
        .lyfe-sidebar-link-icon {
          width: 30px !important;
          height: 30px !important;
          font-size: 0.85rem !important;
        }
      }

      /* Mobile landscape mode */
      @media (max-height: 480px) and (orientation: landscape) {
        .lyfe-sidebar {
          width: min(80vw, 360px) !important;
        }
        .lyfe-sidebar-status-card {
          display: none !important;
        }
        .lyfe-sidebar-header {
          padding: 8px 16px !important;
        }
        .lyfe-sidebar-link {
          padding: 7px 12px !important;
        }
        .lyfe-sidebar-footer {
          padding: 8px 16px !important;
        }
      }
    `;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.documentElement.appendChild(style);
    }
  }

  function ensureSidebarDOM() {
    // 1. Overlay
    let overlay = document.getElementById("lyfeSidebarOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "lyfe-sidebar-overlay";
      overlay.id = "lyfeSidebarOverlay";
      document.body.appendChild(overlay);
    }

    // 2. Sidebar Drawer
    let sidebar = document.getElementById("lyfeMobileSidebar");
    
    // Check if an existing old .mobile-menu is present, remove or convert it
    const oldMobileMenu = document.getElementById("mobileMenu");
    if (oldMobileMenu && !sidebar) {
      oldMobileMenu.remove();
    }

    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = "lyfe-sidebar";
      sidebar.id = "lyfeMobileSidebar";
      sidebar.setAttribute("aria-label", "เมนูสไลด์บาร์สำหรับมือถือ");
      sidebar.innerHTML = `
        <div class="lyfe-sidebar-inner">
          <div class="lyfe-sidebar-header">
            <a href="index.html" class="lyfe-sidebar-brand">
              <img src="https://s.imgz.io/2026/10/12/5528f231-1046-4218-b192-4fd63f6a1d17-removebg-preview69cce28b66d71df6.png" alt="LYFESTYLE Logo" class="lyfe-sidebar-logo">
              <div class="lyfe-sidebar-brand-text">
                <span class="lyfe-sidebar-brand-title">LYFESTYLE</span>
                <span class="lyfe-sidebar-badge"><i class="fa-solid fa-circle"></i> ONLINE</span>
              </div>
            </a>
            <button type="button" class="lyfe-sidebar-close" id="lyfeSidebarCloseBtn" aria-label="ปิดเมนูสไลด์บาร์">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="lyfe-sidebar-status-card">
            <div class="lyfe-sidebar-status-icon">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div class="lyfe-sidebar-status-info">
              <div class="lyfe-sidebar-status-title">ไลฟ์สไตล์มีกูเป็นมงกฎ</div>
              <div class="lyfe-sidebar-status-sub">GANG SYSTEM • 6 YEARS</div>
            </div>
          </div>

          <div class="lyfe-sidebar-scroll-area">
            <div class="lyfe-sidebar-section-label">
              <span>เมนูหลัก (NAVIGATION)</span>
            </div>
            <nav class="lyfe-sidebar-nav">
              <a href="index.html" class="lyfe-sidebar-link" data-page="index">
                <div class="lyfe-sidebar-link-icon"><i class="fa-solid fa-house"></i></div>
                <div class="lyfe-sidebar-link-content">
                  <span class="lyfe-sidebar-link-th">หน้าแรก</span>
                  <span class="lyfe-sidebar-link-en">HOME</span>
                </div>
                <i class="fa-solid fa-chevron-right lyfe-sidebar-link-arrow"></i>
              </a>

              <a href="members.html" class="lyfe-sidebar-link" data-page="members">
                <div class="lyfe-sidebar-link-icon"><i class="fa-solid fa-users"></i></div>
                <div class="lyfe-sidebar-link-content">
                  <span class="lyfe-sidebar-link-th">สมาชิกแก๊ง</span>
                  <span class="lyfe-sidebar-link-en">MEMBERS</span>
                </div>
                <i class="fa-solid fa-chevron-right lyfe-sidebar-link-arrow"></i>
              </a>

              <a href="chat.html" class="lyfe-sidebar-link" data-page="chat">
                <div class="lyfe-sidebar-link-icon"><i class="fa-solid fa-gamepad"></i></div>
                <div class="lyfe-sidebar-link-content">
                  <span class="lyfe-sidebar-link-th">บอร์ดแก๊ง & เลานจ์</span>
                  <span class="lyfe-sidebar-link-en">BOARDGANG</span>
                </div>
                <i class="fa-solid fa-chevron-right lyfe-sidebar-link-arrow"></i>
              </a>

              <a href="official.html" class="lyfe-sidebar-link" data-page="official">
                <div class="lyfe-sidebar-link-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <div class="lyfe-sidebar-link-content">
                  <span class="lyfe-sidebar-link-th">ข้อมูลทางการ</span>
                  <span class="lyfe-sidebar-link-en">OFFICIAL</span>
                </div>
                <i class="fa-solid fa-chevron-right lyfe-sidebar-link-arrow"></i>
              </a>

              <a href="login.html" class="lyfe-sidebar-link" data-page="login">
                <div class="lyfe-sidebar-link-icon"><i class="fa-solid fa-lock"></i></div>
                <div class="lyfe-sidebar-link-content">
                  <span class="lyfe-sidebar-link-th">ระบบแอดมิน</span>
                  <span class="lyfe-sidebar-link-en">ADMIN PANEL</span>
                </div>
                <i class="fa-solid fa-chevron-right lyfe-sidebar-link-arrow"></i>
              </a>
            </nav>

            <div class="lyfe-sidebar-admin-section" id="lyfeSidebarAdminSection" style="display: none;">
              <div class="lyfe-sidebar-section-label">
                <span>เครื่องมือแอดมิน (ADMIN TOOLS)</span>
              </div>
              <nav class="lyfe-sidebar-nav">
                <a href="javascript:void(0)" class="lyfe-sidebar-link" id="sidebarAdminLinkMembers">
                  <div class="lyfe-sidebar-link-icon" style="color: #38bdf8;"><i class="fa-solid fa-user-gear"></i></div>
                  <div class="lyfe-sidebar-link-content">
                    <span class="lyfe-sidebar-link-th">จัดการสมาชิกแก๊ง</span>
                    <span class="lyfe-sidebar-link-en">MEMBERS DIRECTORY</span>
                  </div>
                </a>
                <a href="javascript:void(0)" class="lyfe-sidebar-link" id="sidebarAdminLinkRadar">
                  <div class="lyfe-sidebar-link-icon" style="color: #2ed573;"><i class="fa-solid fa-satellite-dish"></i></div>
                  <div class="lyfe-sidebar-link-content">
                    <span class="lyfe-sidebar-link-th">เรดาร์ตรวจจับ IP</span>
                    <span class="lyfe-sidebar-link-en">VISITOR RADAR</span>
                  </div>
                </a>
                <a href="javascript:void(0)" class="lyfe-sidebar-link" id="sidebarAdminLinkGang">
                  <div class="lyfe-sidebar-link-icon" style="color: #f1c40f;"><i class="fa-solid fa-shield"></i></div>
                  <div class="lyfe-sidebar-link-content">
                    <span class="lyfe-sidebar-link-th">ควบคุมแก๊ง & รหัสลับ</span>
                    <span class="lyfe-sidebar-link-en">GANG CONTROLS</span>
                  </div>
                </a>
                <a href="javascript:void(0)" class="lyfe-sidebar-link" id="sidebarAdminLinkBanner">
                  <div class="lyfe-sidebar-link-icon" style="color: #a855f7;"><i class="fa-solid fa-image"></i></div>
                  <div class="lyfe-sidebar-link-content">
                    <span class="lyfe-sidebar-link-th">จัดการแบนเนอร์</span>
                    <span class="lyfe-sidebar-link-en">BANNER MANAGER</span>
                  </div>
                </a>
              </nav>
            </div>

            <div class="lyfe-sidebar-section-label">
              <span>การตั้งค่า (SETTINGS & CONTROLS)</span>
            </div>
            <div class="lyfe-sidebar-controls-grid">
              <button type="button" class="lyfe-sidebar-control-btn theme-switch-btn" id="sidebarThemeBtn" title="สลับโหมดมืด / สว่าง">
                <i class="fa-solid fa-moon theme-switch-icon" id="sidebarThemeIcon"></i>
                <span id="sidebarThemeText">โหมดมืด</span>
              </button>
              <button type="button" class="lyfe-sidebar-control-btn" id="sidebarMusicToggleBtn" title="เปิด / ปิด เสียงเพลง">
                <i class="fa-solid fa-volume-high" id="sidebarMusicIcon"></i>
                <span id="sidebarMusicText">เสียงเพลง</span>
              </button>
            </div>
          </div>

          <div class="lyfe-sidebar-footer">
            <div class="lyfe-sidebar-footer-text">
              <strong>LYFESTYLE COMMUNITY</strong>
              <span>A N N I V E R S A R Y • 6 Y E A R S</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(sidebar);
    }
    return { overlay, sidebar };
  }

  function initUniversalMobileSidebar() {
    injectSidebarStyles();
    const { overlay, sidebar } = ensureSidebarDOM();

    let lastToggleTime = 0;

    function openSidebar() {
      lastToggleTime = Date.now();
      sidebar.classList.add("active");
      overlay.classList.add("active");
      document.body.classList.add("lyfe-sidebar-open");
      document.documentElement.classList.add("lyfe-sidebar-open");

      document.querySelectorAll(".hamburger, #hamburgerBtn").forEach(btn => {
        btn.classList.add("active");
      });

      syncSidebarAudioUI();
      syncSidebarThemeUI();
    }

    function closeSidebar() {
      lastToggleTime = Date.now();
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("lyfe-sidebar-open");
      document.documentElement.classList.remove("lyfe-sidebar-open");

      document.querySelectorAll(".hamburger, #hamburgerBtn").forEach(btn => {
        btn.classList.remove("active");
      });
    }

    function toggleSidebar() {
      const now = Date.now();
      if (now - lastToggleTime < 350) {
        return; // ป้องกันการเรียกซ้ำจากการ bubble หรือแตะหน้าจอเบิ้ล
      }
      lastToggleTime = now;
      if (sidebar.classList.contains("active")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    // Expose global API
    window.LyfeSidebar = {
      open: openSidebar,
      close: closeSidebar,
      toggle: toggleSidebar,
      isOpen: () => sidebar.classList.contains("active")
    };

    // Close on overlay or close button click
    overlay.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    });
    const closeBtn = document.getElementById("lyfeSidebarCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      });
    }

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("active")) {
        closeSidebar();
      }
    });

    // Close on navigation link click
    sidebar.querySelectorAll(".lyfe-sidebar-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("javascript:")) {
          closeSidebar();
        }
      });
    });

    // Delegate Hamburger clicks with debounce
    document.addEventListener("click", (e) => {
      const burger = e.target.closest("#hamburgerBtn, .hamburger, [data-sidebar-toggle]");
      if (burger) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      }
    });

    // Swipe right to close gesture on mobile touchscreens
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    sidebar.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
      }
    }, { passive: true });

    sidebar.addEventListener("touchmove", (e) => {
      if (!isSwiping || e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - touchStartX;
      if (diffX > 0) {
        sidebar.style.transform = `translateX(${diffX}px)`;
      }
    }, { passive: true });

    sidebar.addEventListener("touchend", (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      sidebar.style.transform = "";

      if (diffX > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        closeSidebar();
      }
    }, { passive: true });

    // Active Link Highlighting
    function syncActivePage() {
      const path = (window.location.pathname || "").toLowerCase();
      let activeKey = "index";
      if (path.includes("members.html") || path.endsWith("/members")) activeKey = "members";
      else if (path.includes("chat.html") || path.endsWith("/chat")) activeKey = "chat";
      else if (path.includes("official.html") || path.endsWith("/official")) activeKey = "official";
      else if (path.includes("login.html") || path.endsWith("/login")) activeKey = "login";
      else if (path.includes("admin.html") || path.endsWith("/admin")) activeKey = "admin";
      else activeKey = "index";

      sidebar.querySelectorAll(".lyfe-sidebar-link").forEach(link => {
        if (link.getAttribute("data-page") === activeKey) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

      // If on admin.html, show admin shortcuts
      const adminSection = document.getElementById("lyfeSidebarAdminSection");
      if (adminSection) {
        if (activeKey === "admin" || path.includes("admin.html")) {
          adminSection.style.display = "block";
          const bindScroll = (id, targetId) => {
            const btn = document.getElementById(id);
            if (btn) {
              btn.addEventListener("click", () => {
                closeSidebar();
                if (typeof window.scrollToSection === "function") {
                  window.scrollToSection(targetId);
                }
              });
            }
          };
          bindScroll("sidebarAdminLinkMembers", "membersSection");
          bindScroll("sidebarAdminLinkRadar", "visitorRadarCard");
          bindScroll("sidebarAdminLinkGang", "gangLiveControlsCard");
          bindScroll("sidebarAdminLinkBanner", "bannerQuickManager");
        } else {
          adminSection.style.display = "none";
        }
      }
    }

    // Audio Sync in Sidebar
    function syncSidebarAudioUI() {
      const audio = document.getElementById("bgMusic") || document.querySelector("audio");
      const icon = document.getElementById("sidebarMusicIcon");
      const text = document.getElementById("sidebarMusicText");
      if (!icon || !text) return;

      if (!audio) {
        text.textContent = "ไม่มีเพลง";
        icon.className = "fa-solid fa-volume-xmark";
        return;
      }

      const isMuted = audio.muted || audio.volume === 0 || audio.paused;
      if (isMuted) {
        icon.className = "fa-solid fa-volume-xmark";
        text.textContent = "ปิดเสียง";
      } else {
        icon.className = "fa-solid fa-volume-high";
        text.textContent = "เสียงเพลง";
      }
    }

    const musicBtn = document.getElementById("sidebarMusicToggleBtn");
    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        const audio = document.getElementById("bgMusic") || document.querySelector("audio");
        if (audio) {
          if (audio.paused || audio.muted || audio.volume === 0) {
            audio.muted = false;
            audio.volume = 0.5;
            audio.play().catch(() => {});
            try {
              localStorage.setItem("musicMuted", "false");
              localStorage.setItem("musicPlaying", "true");
            } catch(e) {}
          } else {
            audio.muted = true;
            try {
              localStorage.setItem("musicMuted", "true");
            } catch(e) {}
          }
          syncSidebarAudioUI();
        }
      });
    }

    // Theme Sync in Sidebar
    function syncSidebarThemeUI() {
      const isLight = document.body.classList.contains("light-theme") || document.documentElement.classList.contains("light-theme");
      const icon = document.getElementById("sidebarThemeIcon");
      const text = document.getElementById("sidebarThemeText");
      if (icon) icon.className = isLight ? "fa-solid fa-sun theme-switch-icon" : "fa-solid fa-moon theme-switch-icon";
      if (text) text.textContent = isLight ? "โหมดสว่าง" : "โหมดมืด";
    }

    syncActivePage();
    syncSidebarAudioUI();
    syncSidebarThemeUI();
  }

  // 5. Y2K Universal Loader - Disabled (Direct Fast Navigation)
  function initY2kPageTransitions() {
    try {
      sessionStorage.removeItem("y2k_trans");
      const oldLoader = document.getElementById("y2k-universal-loader");
      if (oldLoader) oldLoader.remove();
      const oldStyle = document.getElementById("y2k-loader-styles");
      if (oldStyle) oldStyle.remove();
      const intro = document.getElementById("intro-overlay");
      if (intro) intro.remove();
      if (document.body) {
        document.body.classList.remove("no-scroll");
        document.body.style.overflow = "";
      }
    } catch(e) {}
  }

  function startAllFeatures() {
    const safeRun = (fn, name) => {
      try {
        if (typeof fn === "function") fn();
      } catch (err) {
        console.warn(`[LyfeFeatures] Error during ${name}:`, err);
      }
    };

    safeRun(initY2kPageTransitions, "initY2kPageTransitions");
    safeRun(injectSharedThemeStyles, "injectSharedThemeStyles");
    safeRun(bindGlobalThemeDelegator, "bindGlobalThemeDelegator");
    safeRun(initUniversalTheme, "initUniversalTheme");
    safeRun(applyCustomBackground, "applyCustomBackground");
    safeRun(applyCustomMusic, "applyCustomMusic");
    safeRun(initCookieConsent, "initCookieConsent");
    safeRun(initAntiAiShield, "initAntiAiShield");
    safeRun(initSystemProtection, "initSystemProtection");
    safeRun(initAmbientParticles, "initAmbientParticles");
    safeRun(initCardTiltAndGlow, "initCardTiltAndGlow");
    safeRun(initAudioVisualizer, "initAudioVisualizer");
    safeRun(initUniversalMobileSidebar, "initUniversalMobileSidebar");
  }

  // ดำเนินการตรวจสอบธีมและใส่สไตล์พื้นหลังทันทีก่อน DOM เพื่อความรวดเร็ว 0 latency ไร้ FOUC
  try {
    injectSharedThemeStyles();
    injectSidebarStyles();
    bindGlobalThemeDelegator();
    if (document.body) {
      document.body.classList.add("loaded");
      document.body.style.opacity = "1";
    }
    const preTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    if (preTheme === "light") {
      document.documentElement.classList.add("light-theme");
      if (document.body) document.body.classList.add("light-theme");
    }
    const initialBg = localStorage.getItem("lyfe_site_bg") || "background.gif";
    setBackgroundStyle(initialBg);
  } catch(e) {}

  function ensurePageReady() {
    if (document.body) {
      document.body.classList.add("loaded");
      document.body.style.opacity = "1";
      if (getStoredTheme() === "light") {
        document.body.classList.add("light-theme");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      ensurePageReady();
      startAllFeatures();
    });
  } else {
    ensurePageReady();
    startAllFeatures();
  }
})();

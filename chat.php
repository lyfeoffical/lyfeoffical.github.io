<!DOCTYPE html>
<html lang="th">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ไลฟ์สไตล์.com</title>
  <link rel="icon" type="image/png"
    href="https://s.imgz.io/2026/10/12/5528f231-1046-4218-b192-4fd63f6a1d17-removebg-preview69cce28b66d71df6.png">
  <link
    href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Bebas+Neue&family=Press+Start+2P&family=Sarabun:wght@300;400&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <style>
    :root {
      color-scheme: dark;
      --bg-color: #030303;
      --surface-color: rgba(255, 255, 255, 0.03);
      --surface-border: rgba(255, 255, 255, 0.08);
      --surface-hover: rgba(255, 255, 255, 0.07);
      --accent: #ffffff;
      --accent-glow: rgba(255, 255, 255, 0.35);
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.7);
      --text-muted: rgba(255, 255, 255, 0.4);
      --gold: #facc15;
      --gold-glow: rgba(250, 204, 21, 0.4);
      --snake-green: #22c55e;
      --nav-font: 'Kanit', sans-serif;
      --heading-font: 'Kanit', sans-serif;
      --arcade-font: 'Press Start 2P', monospace;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body,
    button,
    input,
    textarea,
    h1,
    h2,
    h3,
    h4,
    p,
    span,
    div {
      font-family: 'Kanit', sans-serif;
    }

    body {
      background: var(--bg-color);
      color: var(--text-primary);
      overflow-x: hidden;
      min-height: 100vh;
      opacity: 0;
      transition: opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    body.loaded {
      opacity: 1;
    }

    /* Background Layer */
    .bg-animation {
      position: fixed;
      inset: 0;
      z-index: -3;
      background: url('background.gif') center/cover no-repeat;
    }

    .bg-overlay {
      position: fixed;
      inset: 0;
      z-index: -2;
      background: rgba(3, 3, 3, 0.82);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: background 0.4s ease;
    }

    .bg-vignette {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: radial-gradient(circle at center, transparent 30%, rgba(3, 3, 3, 0.95) 100%);
      pointer-events: none;
    }

    /* Header & Navbar */
    header {
      background: rgba(3, 3, 3, 0.25);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      padding: 18px 5%;
      position: fixed;
      width: 100%;
      top: 0;
      border-bottom: 1px solid var(--surface-border);
      z-index: 1000;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .logo img {
      height: 42px;
      filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.15));
      display: block;
      transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .logo a:hover img {
      transform: scale(1.05);
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.35));
    }

    nav ul {
      list-style: none;
      display: flex;
      gap: 36px;
    }

    nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 1.05rem;
      letter-spacing: 2px;
      position: relative;
      padding-bottom: 5px;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    nav a::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: var(--accent);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      transform: translateX(-50%);
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    nav a:hover::after,
    nav a.active::after {
      width: 100%;
    }

    nav a:hover,
    nav a.active {
      color: var(--accent);
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    /* Mobile Menu */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      z-index: 1100;
    }

    .hamburger span {
      width: 28px;
      height: 2px;
      background: #fff;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -6px);
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      height: 100vh;
      background: rgba(3, 3, 3, 0.98);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 30px;
      transition: right 0.6s cubic-bezier(0.77, 0, 0.175, 1);
      z-index: 1050;
    }

    .mobile-menu.active {
      right: 0;
    }

    .mobile-menu a {
      color: #fff;
      font-size: 2rem;
      text-decoration: none;
      letter-spacing: 4px;
      transition: all 0.3s;
    }

    /* Theme Switcher Button */
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

    /* Main Container */
    .chat-page-container {
      max-width: 1300px;
      margin: 115px auto 60px;
      padding: 0 24px;
    }

    .zone-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .zone-title {
      font-family: 'Kanit', sans-serif;
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      letter-spacing: 8px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
      text-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
    }

    .zone-title .gold-text {
      color: var(--gold);
      text-shadow: 0 0 25px var(--gold-glow);
    }

    .zone-subtitle {
      color: var(--text-muted);
      letter-spacing: 4px;
      font-size: 0.95rem;
      text-transform: uppercase;
    }

    /* Tab Switcher */
    .zone-tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .tab-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      color: var(--text-secondary);
      padding: 12px 28px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 2px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(15px);
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transform: translateY(-2px);
    }

    .tab-btn.active {
      background: #ffffff;
      color: #000000;
      font-weight: 600;
      border-color: #ffffff;
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
      transform: scale(1.03);
    }

    .tab-btn.active.snake-tab {
      background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
      color: #000;
      border-color: #facc15;
      box-shadow: 0 8px 30px rgba(250, 204, 21, 0.45);
    }

    /* Content Panes */
    .zone-view {
      display: none;
      animation: tabFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .zone-view.active {
      display: block;
    }

    @keyframes tabFadeIn {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.99);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* ═══════════════════════════════════════════
       SECTION 1: AI OPENCHAT SYSTEM
       ═══════════════════════════════════════════ */
    .chat-wrapper {
      background: var(--surface-color);
      border: 1px solid var(--surface-border);
      border-radius: 24px;
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 255, 255, 0.02);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 720px;
    }

    .chat-topbar {
      padding: 18px 24px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .ai-identity {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .ai-avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.25rem;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
      position: relative;
    }

    .ai-avatar::after {
      content: "";
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 11px;
      height: 11px;
      background: #22c55e;
      border-radius: 50%;
      border: 2px solid #000;
    }

    .ai-meta h3 {
      font-size: 1.05rem;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-badge {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    .ai-meta p {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .chat-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-btn-action {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      color: var(--text-secondary);
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .chat-btn-action:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }

    /* Messages Area */
    .chat-messages {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
      scroll-behavior: smooth;
    }

    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 10px;
    }

    .msg-row {
      display: flex;
      gap: 12px;
      max-width: 82%;
      animation: msgPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes msgPop {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .msg-row.ai {
      align-self: flex-start;
    }

    .msg-row.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .msg-bubble {
      padding: 14px 18px;
      border-radius: 18px;
      font-size: 0.95rem;
      line-height: 1.6;
      word-break: break-word;
      position: relative;
    }

    .msg-row.ai .msg-bubble {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      color: #ffffff;
      border-top-left-radius: 4px;
    }

    .msg-row.user .msg-bubble {
      background: #ffffff;
      color: #000000;
      border-top-right-radius: 4px;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
      font-weight: 400;
    }

    .msg-time {
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 5px;
      display: block;
    }

    .msg-row.user .msg-time {
      text-align: right;
      color: rgba(0, 0, 0, 0.45);
    }

    .msg-bubble pre {
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 12px 14px;
      overflow-x: auto;
      margin: 10px 0;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 0.86rem;
      color: #38bdf8;
      line-height: 1.5;
    }

    .msg-bubble code {
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 0.86rem;
      color: #facc15;
    }

    .msg-copy-btn {
      position: absolute;
      bottom: 8px;
      right: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.72rem;
      padding: 3px 8px;
      opacity: 0;
      transition: opacity 0.2s, background 0.2s, color 0.2s;
    }

    .msg-row:hover .msg-copy-btn {
      opacity: 1;
    }

    .msg-copy-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }

    .persona-select {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--surface-border);
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      cursor: pointer;
      outline: none;
      font-family: 'Kanit', sans-serif;
      transition: all 0.2s;
    }

    .persona-select:focus {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
    }

    .status-pulse-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px #22c55e;
      animation: statusPulse 2s infinite ease-in-out;
    }

    @keyframes statusPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .typing-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 10px 16px;
    }

    .typing-dot {
      width: 7px;
      height: 7px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: dotPulse 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes dotPulse {

      0%,
      60%,
      100% {
        transform: translateY(0);
        opacity: 0.4;
      }

      30% {
        transform: translateY(-6px);
        opacity: 1;
      }
    }

    /* Quick Prompts */
    .quick-prompts-row {
      padding: 8px 24px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      background: rgba(255, 255, 255, 0.01);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }

    .quick-prompts-row::-webkit-scrollbar {
      display: none;
    }

    .prompt-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      color: var(--text-secondary);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.78rem;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .prompt-chip:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.25);
    }

    /* Input Bar */
    .chat-input-bar {
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chat-input-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .chat-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      padding: 14px 18px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }

    .chat-input:focus {
      border-color: rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.07);
    }

    .btn-send-msg {
      background: #ffffff;
      color: #000000;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 14px;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.25s;
      flex-shrink: 0;
      box-shadow: 0 4px 18px rgba(255, 255, 255, 0.2);
    }

    .btn-send-msg:hover:not(:disabled) {
      transform: scale(1.06);
      box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4);
    }

    .btn-send-msg:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    /* ═══════════════════════════════════════════
       SECTION 2: SNAKE 3004 RETRO ARCADE
       ═══════════════════════════════════════════ */
    .snake-wrapper {
      background: rgba(10, 10, 14, 0.85);
      border: 2px solid rgba(250, 204, 21, 0.3);
      border-radius: 24px;
      padding: 24px;
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(250, 204, 21, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .arcade-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 640px;
      margin-bottom: 18px;
      padding: 12px 18px;
      background: rgba(250, 204, 21, 0.06);
      border: 1px dashed rgba(250, 204, 21, 0.3);
      border-radius: 12px;
    }

    .arcade-title {
      font-family: var(--arcade-font);
      font-size: 0.95rem;
      color: var(--gold);
      text-shadow: 0 0 10px var(--gold-glow);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .score-board {
      display: flex;
      gap: 20px;
      font-family: var(--arcade-font);
      font-size: 0.75rem;
    }

    .score-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .score-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.65rem;
    }

    .score-val {
      color: #fff;
      font-size: 1rem;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    }

    .score-val.gold {
      color: var(--gold);
      text-shadow: 0 0 10px var(--gold-glow);
    }

    .canvas-container {
      position: relative;
      border: 3px solid rgba(250, 204, 21, 0.4);
      border-radius: 14px;
      box-shadow: 0 0 35px rgba(250, 204, 21, 0.15) inset, 0 15px 35px rgba(0, 0, 0, 0.8);
      background: #08080c;
      overflow: hidden;
    }

    #snakeCanvas {
      display: block;
      background: radial-gradient(circle at center, #111118 0%, #060609 100%);
    }

    .canvas-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 10;
      text-align: center;
      padding: 20px;
    }

    .overlay-title {
      font-family: var(--arcade-font);
      font-size: 1.4rem;
      color: var(--gold);
      text-shadow: 0 0 15px var(--gold-glow);
    }

    .overlay-sub {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.92rem;
      max-width: 380px;
      line-height: 1.5;
    }

    .btn-arcade-start {
      background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
      color: #000;
      border: none;
      padding: 14px 34px;
      border-radius: 50px;
      font-family: var(--arcade-font);
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(250, 204, 21, 0.4);
      transition: all 0.25s;
    }

    .btn-arcade-start:hover {
      transform: scale(1.08);
      box-shadow: 0 10px 30px rgba(250, 204, 21, 0.6);
    }

    /* Mobile Virtual D-Pad */
    .dpad-container {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(3, 56px);
      grid-template-rows: repeat(3, 56px);
      gap: 6px;
      justify-content: center;
    }

    .dpad-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(250, 204, 21, 0.3);
      border-radius: 12px;
      color: #fff;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      transition: background 0.15s, transform 0.1s;
    }

    .dpad-btn:active {
      background: rgba(250, 204, 21, 0.35);
      color: #facc15;
      transform: scale(0.92);
    }

    .dpad-up {
      grid-column: 2;
      grid-row: 1;
    }

    .dpad-left {
      grid-column: 1;
      grid-row: 2;
    }

    .dpad-center {
      grid-column: 2;
      grid-row: 2;
      background: rgba(250, 204, 21, 0.15);
      font-family: var(--arcade-font);
      font-size: 0.55rem;
      color: #facc15;
    }

    .dpad-right {
      grid-column: 3;
      grid-row: 2;
    }

    .dpad-down {
      grid-column: 2;
      grid-row: 3;
    }

    .arcade-controls-guide {
      margin-top: 14px;
      color: var(--text-muted);
      font-size: 0.82rem;
      text-align: center;
    }

    .arcade-controls-guide kbd {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 2px 6px;
      color: #fff;
      font-size: 0.76rem;
    }

    /*LIGHT THEME SUPPORT */
    body.light-theme {
      color-scheme: light !important;
      --bg-color: #f1f5f9;
      --surface-color: rgba(255, 255, 255, 0.85);
      --surface-border: rgba(0, 0, 0, 0.08);
      --surface-hover: rgba(255, 255, 255, 0.98);
      --accent: #0f172a;
      --accent-glow: rgba(15, 23, 42, 0.15);
      --text-primary: #0f172a;
      --text-secondary: rgba(15, 23, 42, 0.75);
      --text-muted: rgba(15, 23, 42, 0.45);
    }

    body.light-theme .bg-overlay {
      background: rgba(241, 245, 249, 0.85);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
    }

    body.light-theme .bg-vignette {
      background: radial-gradient(circle at center, transparent 35%, rgba(203, 213, 225, 0.8) 100%);
    }

    body.light-theme header {
      background: rgba(255, 255, 255, 0.75);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    body.light-theme nav a {
      color: rgba(15, 23, 42, 0.7);
    }

    body.light-theme nav a:hover,
    body.light-theme nav a.active {
      color: #000000;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
    }

    body.light-theme nav a::after {
      background: #0f172a;
      box-shadow: 0 0 10px rgba(15, 23, 42, 0.4);
    }

    body.light-theme .hamburger span {
      background: #0f172a;
    }

    body.light-theme .mobile-menu {
      background: rgba(255, 255, 255, 0.96);
    }

    body.light-theme .mobile-menu a {
      color: #0f172a;
    }

    body.light-theme .tab-btn {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.08);
      color: rgba(15, 23, 42, 0.7);
    }

    body.light-theme .tab-btn.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2);
    }

    body.light-theme .chat-wrapper {
      background: rgba(255, 255, 255, 0.85);
      border-color: rgba(0, 0, 0, 0.08);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
    }

    body.light-theme .chat-topbar {
      background: rgba(0, 0, 0, 0.02);
      border-bottom-color: rgba(0, 0, 0, 0.06);
    }

    body.light-theme .ai-meta h3 {
      color: #0f172a;
    }

    body.light-theme .persona-select {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.12);
      color: #0f172a;
    }

    body.light-theme .persona-select option {
      background: #ffffff;
      color: #0f172a;
    }

    body.light-theme .msg-row.ai .msg-bubble {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.08);
      color: #0f172a;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    }

    body.light-theme .msg-row.user .msg-bubble {
      background: #0f172a;
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.15);
    }

    body.light-theme .chat-input {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.12);
      color: #0f172a;
    }

    body.light-theme .btn-send-msg {
      background: #0f172a;
      color: #ffffff;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.2);
    }

    body.light-theme .prompt-chip {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.08);
      color: #0f172a;
    }

    body.light-theme .snake-wrapper {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(250, 204, 21, 0.5);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.1);
    }

    body.light-theme .arcade-banner {
      background: rgba(250, 204, 21, 0.12);
    }

    body.light-theme .score-val {
      color: #0f172a;
    }

    /* Responsive */
    @media (max-width: 768px) {
      nav.nav-desktop {
        display: none;
      }

      .hamburger {
        display: flex;
      }

      .chat-wrapper {
        height: 600px;
      }

      .chat-page-container {
        margin-top: 95px;
        padding: 0 16px;
      }

      #snakeCanvas {
        width: 340px;
        height: 340px;
      }

      .arcade-banner {
        max-width: 340px;
      }
    }
  </style>
</head>

<body>
  <div class="bg-animation"></div>
  <div class="bg-overlay"></div>
  <div class="bg-vignette"></div>

  <!-- Header -->
  <header id="mainHeader">
    <div class="navbar">
      <div class="logo">
        <a href="index.php">
          <img
            src="https://s.imgz.io/2026/10/12/5528f231-1046-4218-b192-4fd63f6a1d17-removebg-preview69cce28b66d71df6.png"
            alt="LYFESTYLE Logo">
        </a>
      </div>

      <nav class="nav-desktop">
        <ul>
          <li><a href="index.php">HOME</a></li>
          <li><a href="members.php">MEMBERS</a></li>
          <li><a href="chat.php" class="active">OPENCHAT</a></li>
          <li><a href="official.php">OFFICIAL</a></li>
          <li><a href="login.php" title="Admin Login"><i class="fa-solid fa-lock"
                style="font-size: 0.85rem; margin-right: 4px;"></i> ADMIN</a></li>
        </ul>
      </nav>

      <div style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="theme-switch-btn" id="themeSwitchBtn" title="สลับโหมดมืด / สว่าง">
          <i class="fa-solid fa-moon theme-switch-icon" id="themeSwitchIcon"></i>
          <span id="themeSwitchText">DARK</span>
        </button>
        <div class="hamburger" id="hamburgerBtn">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Menu -->
  <div class="mobile-menu" id="mobileMenu">
    <a href="index.php">HOME</a>
    <a href="members.php">MEMBERS</a>
    <a href="chat.php">OPENCHAT</a>
    <a href="official.php">OFFICIAL</a>
    <a href="login.php">ADMIN</a>
    <button type="button" class="theme-switch-btn" id="mobileThemeSwitchBtn"
      style="margin-top: 10px; padding: 10px 24px; font-size: 1rem;">
      <i class="fa-solid fa-moon theme-switch-icon" id="mobileThemeSwitchIcon"></i>
      <span id="mobileThemeSwitchText">โหมดมืด (DARK)</span>
    </button>
  </div>

  <!-- Page Body -->
  <div class="chat-page-container">
    <div class="zone-header">
      <h1 class="zone-title">LYFESTYLE <span class="gold-text">LOUNGE</span></h1>
      <p class="zone-subtitle">AI OPENCHAT & RETRO SNAKE 3004 ARCADE</p>
    </div>

    <!-- Tabs -->
    <div class="zone-tabs">
      <button class="tab-btn active" id="tabChatBtn" onclick="switchZone('chat')">
        <i class="fa-solid fa-comments"></i>
        <span>AI OPENCHAT</span>
      </button>
      <button class="tab-btn snake-tab" id="tabSnakeBtn" onclick="switchZone('snake')">
        <i class="fa-solid fa-gamepad"></i>
        <span>เกมงู 3004 (SNAKE)</span>
      </button>
    </div>

    <!-- VIEW 1: AI OPENCHAT -->
    <div class="zone-view active" id="viewChat">
      <div class="chat-wrapper">
        <div class="chat-topbar">
          <div class="ai-identity">
            <div class="ai-avatar">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div class="ai-meta">
              <h3>LYFE AI <span class="ai-badge"><span class="status-pulse-dot"></span> LIVE ALL-KNOWING</span></h3>
              <p id="aiStatusSubtitle">ตอบได้ทุกอย่างในโลก • คุยเล่น กวนๆ ถามได้ทุกเรื่อง 24 ชม.</p>
            </div>
          </div>
          <div class="chat-actions">
            <select class="persona-select" id="personaSelect" onchange="changePersona(this.value)" title="เลือกสไตล์บุคลิก AI">
              <option value="savage">ตัวตึงสายกวน (Savage)</option>
              <option value="genius">อัจฉริยะรอบรู้ (Genius)</option>
              <option value="homie">เพื่อนคุยฟังสบาย (Chill)</option>
            </select>
            <button class="chat-btn-action" onclick="clearChatHistory()" title="ล้างประวัติการคุย">
              <i class="fa-solid fa-trash-can"></i>
              <span>ล้างแชท</span>
            </button>
          </div>
        </div>

        <div class="chat-messages" id="chatMessages">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Quick Prompts -->
        <div class="quick-prompts-row">
          <button class="prompt-chip" onclick="randomSurprisePrompt()">สุ่มเรื่องคุยแปลกๆ</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('ประวัติแก๊ง LYFESTYLE คืออะไร?')">ประวัติแก๊ง LYFESTYLE</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('3004 มีความหมายว่าอะไร?')">ความหมาย 3004</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('ช่วยสอนวิธีเขียนโค้ดเว็บเจ๋งๆ ให้หน่อย')">สอนเขียนเว็บเจ๋งๆ</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('เล่าเรื่องตลกให้ฟังสักเรื่อง555')">ขอมุกตลก 555+</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('วันนี้กินอะไรดี แนะนำเมนูเด็ดๆ หน่อย')">วันนี้กินอะไรดี?</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('ทำไมท้องฟ้าถึงเป็นสีฟ้า อธิบายแบบเข้าใจง่าย')">ทำไมฟ้าเป็นสีฟ้า?</button>
          <button class="prompt-chip" onclick="sendQuickPrompt('ช่วยแต่งกลอนจีบสาวแบบกวนๆ หน่อย')">กลอนจีบสาวกวนๆ</button>
        </div>

        <!-- Input Bar -->
        <form class="chat-input-bar" id="chatForm" onsubmit="handleChatSubmit(event)">
          <div class="chat-input-wrapper">
            <input type="text" class="chat-input" id="chatInput" placeholder="พิมพ์ข้อความคุยกับ AI ได้เลย..."
              autocomplete="off">
          </div>
          <button type="submit" class="btn-send-msg" id="btnSendMsg" title="ส่งข้อความ">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>

    <!-- VIEW 2: SNAKE 3004 ARCADE -->
    <div class="zone-view" id="viewSnake">
      <div class="snake-wrapper">
        <div class="arcade-banner">
          <div class="arcade-title">
            <i class="fa-solid fa-trophy"></i>
            <span>SNAKE 3004</span>
          </div>
          <div class="score-board">
            <div class="score-box">
              <span class="score-label">SCORE</span>
              <span class="score-val" id="snakeScore">0</span>
            </div>
            <div class="score-box">
              <span class="score-label">3004 COMBO</span>
              <span class="score-val gold" id="snakeCombos">0</span>
            </div>
            <div class="score-box">
              <span class="score-label">BEST</span>
              <span class="score-val" id="snakeHighScore">0</span>
            </div>
          </div>
        </div>

        <div class="canvas-container">
          <canvas id="snakeCanvas" width="400" height="400"></canvas>
          <div class="canvas-overlay" id="snakeOverlay">
            <h2 class="overlay-title" id="overlayTitle">SNAKE 3004</h2>
            <p class="overlay-sub" id="overlayDesc">
              กินเลข <strong style="color: #facc15;">3 - 0 - 0 - 4</strong> เพื่อทำคอมโบระเบิดแต้ม Fever Mode!<br>
              ควบคุมด้วยปุ่มลูกศร, WASD หรือ D-Pad ด้านล่าง
            </p>
            <button class="btn-arcade-start" id="btnStartGame" onclick="startGame()">
              START GAME
            </button>
          </div>
        </div>

        <!-- Mobile Virtual D-Pad -->
        <div class="dpad-container">
          <button class="dpad-btn dpad-up" onclick="changeSnakeDir('UP')"><i
              class="fa-solid fa-chevron-up"></i></button>
          <button class="dpad-btn dpad-left" onclick="changeSnakeDir('LEFT')"><i
              class="fa-solid fa-chevron-left"></i></button>
          <div class="dpad-btn dpad-center">3004</div>
          <button class="dpad-btn dpad-right" onclick="changeSnakeDir('RIGHT')"><i
              class="fa-solid fa-chevron-right"></i></button>
          <button class="dpad-btn dpad-down" onclick="changeSnakeDir('DOWN')"><i
              class="fa-solid fa-chevron-down"></i></button>
        </div>

        <p class="arcade-controls-guide">
          คีย์บอร์ด: กดปุ่ม <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> หรือ <kbd>W</kbd> <kbd>A</kbd>
          <kbd>S</kbd> <kbd>D</kbd> เพื่อเลี้ยว
        </p>
      </div>
    </div>
  </div>

  <!-- Audio Visualizer Sound System (Web Audio API Retro Synth) -->
  <script>
    // ═══════════════════════════════════════════
    // RETRO ARCADE SOUND SYNTH (Zero External File)
    // ═══════════════════════════════════════════
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playSound(type) {
      try {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'eat') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'combo') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.08);
          osc.frequency.setValueAtTime(1174.66, now + 0.16);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'die') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        }
      } catch (e) { }
    }

    // ═══════════════════════════════════════════
    // TAB NAVIGATION
    // ═══════════════════════════════════════════
    function switchZone(zone) {
      const chatBtn = document.getElementById('tabChatBtn');
      const snakeBtn = document.getElementById('tabSnakeBtn');
      const viewChat = document.getElementById('viewChat');
      const viewSnake = document.getElementById('viewSnake');

      if (zone === 'chat') {
        chatBtn.classList.add('active');
        snakeBtn.classList.remove('active');
        viewChat.classList.add('active');
        viewSnake.classList.remove('active');
        if (gameRunning) pauseGame();
      } else {
        snakeBtn.classList.add('active');
        chatBtn.classList.remove('active');
        viewSnake.classList.add('active');
        viewChat.classList.remove('active');
        initSnakeGameCanvas();
      }
    }

    // ═══════════════════════════════════════════
    // ULTRA ALL-KNOWING HYBRID AI ENGINE
    // ═══════════════════════════════════════════
    const AI_STORAGE_KEY = 'lyfe_ai_chat_history';
    const AI_PERSONA_KEY = 'lyfe_ai_persona';
    let chatHistory = [];
    let currentPersona = localStorage.getItem(AI_PERSONA_KEY) || 'savage';

    const PERSONA_CONFIGS = {
      savage: {
        name: 'ตัวตึงสายกวน',
        subtitle: 'ตอบได้ทุกอย่างในโลก • ปากแซ่บ กวนๆ คุยมันส์แบบเพื่อนซี้ 24 ชม.',
        promptDesc: 'คุณคือ LYFE AI บอทตัวตึงประจำแก๊ง LYFESTYLE (รหัส 3004) สไตล์คุยเล่น กวนๆ ฮาๆ ปากแซ่บ ขำๆ 555+ คุยได้ทุกเรื่องในโลก ตอบแบบเพื่อนสนิท ใช้ภาษาพูดที่เป็นกันเอง สนุกสนาน คารมคมคาย'
      },
      genius: {
        name: 'อัจฉริยะรอบรู้',
        subtitle: 'ตอบลึกทุกศาสตร์ • วิทยาศาสตร์ โค้ด ปรัชญา เทคโนโลยี จัดเต็ม',
        promptDesc: 'คุณคือ LYFE AI ในโหมดอัจฉริยะรอบรู้ประจำแก๊ง LYFESTYLE (รหัส 3004) ตอบละเอียด มีข้อมูล มีหลักการ ฉลาดรอบด้าน เขียนโค้ด อธิบายวิชาการได้ชัดเจน เข้าใจง่าย'
      },
      homie: {
        name: 'เพื่อนคุยฟังสบาย',
        subtitle: 'เพื่อนแท้รับฟัง • ปรึกษาชีวิต ปลอบใจ ระบายความในใจได้ตลอด',
        promptDesc: 'คุณคือ LYFE AI ในโหมดเพื่อนสนิทฟังสบายประจำแก๊ง LYFESTYLE (รหัส 3004) อบอุ่น รับฟัง ให้กำลังใจ คำปรึกษาดีๆ ปลอบใจ ชวนคุยผ่อนคลาย เป็นเซฟโซนให้เพื่อนๆ'
      }
    };

    function changePersona(val) {
      currentPersona = val;
      localStorage.setItem(AI_PERSONA_KEY, val);
      const conf = PERSONA_CONFIGS[val] || PERSONA_CONFIGS.savage;
      const sub = document.getElementById('aiStatusSubtitle');
      if (sub) sub.innerText = conf.subtitle;
    }

    // Comprehensive Local Intelligence (Offline / Fast Fallback)
    const LOCAL_KNOWLEDGE = [
      // 1. GANG SPECIFIC
      {
        match: /(ประวัติ|lyfestyle|แก๊งคือ|เกี่ยวกับแก๊ง|ประวัติแก๊ง)/i,
        reply: "**แก๊ง LYFESTYLE** คือคอมมูนิตี้ระดับหัวแถว ครบรอบ 6 ปีแห่งเกียรติยศ (Anniversary 6 Year)! ก่อตั้งขึ้นด้วยมิตรภาพที่เหนียวแน่นดั่งเหล็กกล้า มีสัญลักษณ์ศักดิ์สิทธิ์ประจำแก๊งคือ **3004** ใครที่อยู่แก๊งนี้บอกเลยว่าใจถึงพึ่งได้ทุกคน!"
      },
      {
        match: /(3004|รหัสลับ|ความหมาย3004|รหัสแก๊ง)/i,
        reply: "**3004** คือตัวเลขจิตวิญญาณของ LYFESTYLE! ไม่ใช่แค่เลขธรรมดา แต่มันคือตราประทับของแกนนำและพี่น้องร่วมสาบาน ใครมี 3004 อยู่ข้างหลัง แปลว่าพร้อมลุยไปด้วยกันทุกสถานการณ์!"
      },
      {
        match: /(หัวหน้า|leader|owner|theboss|แอดมิน|เจ้าของแก๊ง)/i,
        reply: "หัวหน้าใหญ่และผู้ก่อตั้งแก๊งคือ **Theboss Lyfestye** ผู้ครองยศสูงสุด (Owner & Leader) ผู้นำทัพครอบครัว LYFESTYLE ให้ยืนหนึ่งมาตลอด 6 ปีเต็ม!"
      },

      // 2. JOKES & HUMOR
      {
        match: /(ตลก|มุก|ขำ|ฮา|555|joke)/i,
        replies: [
          "ถาม: ข้าวอะไรเอ่ยแพงที่สุด? ตอบ: ข้าว...ที่ไม่ได้จ่ายตังค์แล้วโดนตำรวจจับ! 55555555",
          "ถาม: ปลาอะไรบินได้? ตอบ: ปาเจโร่! ปิ๊นๆๆ 555555",
          "หมอ: คุณลุงครับ ตับลุงแข็งมากเลยนะ ลุง: แน่นอนครับหมอ ลุงซิทอัพทุกวัน! 55555555",
          "เมื่อวานไปกินก๋วยเตี๋ยว สั่งเส้นใหญ่ต้มยำ ป้าบอกไม่มีเส้นใหญ่... อ้าว แล้วป้ายหน้าร้านเขียนเส้นใหญ่โตทำไมล่ะป้า! 55555",
          "อยากมีแฟนเป็นหมอ... จะได้ให้หมอช่วยตรวจว่าในใจเรามีแต่เธอจริงมั้ย ฮิ้ววววว!"
        ]
      },

      // 3. FOOD & LIFE
      {
        match: /(กินอะไรดี|หิว|เมนู|กินไรดี|ของกิน)/i,
        replies: [
          "คิดไม่ออกบอก **กะเพราหมูกรอบไข่ดาวไม่สุก** เลยเพื่อน! หรือไม่ก็ส้มตำคอหมูย่าง แซ่บๆ ฟินแน่นอน!",
          "จัดไก่ทอดร้อนๆ กับน้ำอัดลมซ่าๆ ไปเลยวันนี้ ชีวิตมันสั้น อยากกินอะไรต้องได้กิน!",
          "วันนี้จัดชาบูกับเพื่อนๆ ในแก๊งมั้ยล่ะ ต้มหมูร้อนๆ ซดน้ำซุปให้คล่องคอ!",
          "ข้าวผัดโบราณ หรือ บะหมี่เกี๊ยวแห้งหมูแดงต้มยำ จัดไปอย่าให้เสียเที่ยว!"
        ]
      },

      // 4. LOVE & DATING
      {
        match: /(จีบ|รัก|ชอบใคร|แฟน|อกหัก|คนคุย|เหงา)/i,
        replies: [
          "เรื่องความรักมันเหมือนสัญญาณ Wi-Fi ถ้าเข้าใกล้แล้วยังไม่ติด... ก็เปลี่ยนไปต่ออันอื่นเถอะเพื่อน! 555555",
          "กลอนจีบด่วน: *'ท้องฟ้ายังมีดาว กาแฟยังมีนม ถ้าเธอไม่มีใคร สนใจมาเป็นแฟนแก๊งเรามั้ยครับ'* คมพอมั้ย!",
          "ถ้าอกหักมา มานั่งคุยกับพวกเราในแก๊ง LYFESTYLE นี่! คนอื่นทิ้งเราได้ แต่มิตรภาพ 3004 ไม่เคยทิ้งใคร!",
          "ความรักไม่ใช่การตามหาคนที่เพอร์เฟกต์ แต่เป็นการเจอคนที่บ้าพอกันแล้วอยู่ด้วยกันได้ต่างหาก 555+"
        ]
      },

      // 5. CODING & TECH
      {
        match: /(เขียนโค้ด|code|html|javascript|css|เว็บ|โปรแกรม|ไอที)/i,
        reply: "พูดเรื่องโค้ดเหรอ! เว็บแก๊ง LYFESTYLE เราเขียนด้วย **HTML5 + Vanilla CSS + Modern JavaScript** รัน Realtime บน Cloud ซิงค์ข้อมูลสดทั้งแบนเนอร์ เพลง และธีมสว่าง-มืด! ถ้าอยากเริ่มเขียนเว็บ ลองฝึก HTML/CSS ก่อน แล้วต่อด้วย JS ทำ DOM manipulation บอกเลยว่าสนุกสุดๆ!"
      },

      // 6. SCIENCE & NATURE
      {
        match: /(ฟ้าเป็นสีฟ้า|ทำไม|วิทยาศาสตร์|ดวงดาว|อวกาศ)/i,
        reply: "**ทำไมท้องฟ้าถึงเป็นสีฟ้า?** เพราะเกิดจากปรากฏการณ์ *Rayleigh Scattering* (การกระเจิงของแสงเรย์ลี) แสงอาทิตย์มีทุกสี แต่แสงสีฟ้ามีความยาวคลื่นสั้น ทำให้ชนกับโมเลกุลแก๊สในบรรยากาศโลกแล้วกระเจิงไปทั่วท้องฟ้า ตาเราเลยมองเห็นเป็นสีฟ้าไงล่ะครับ!"
      },

      // 7. GAMING
      {
        match: /(เกม|rov|val|fivem|gta|roblox|free fire)/i,
        replies: [
          "เกมเมอร์ตัวจริงต้องไม่พลาด! แก๊งเราก็ชอบเล่นเกม ถ้าว่างๆ อย่าลืมแวะไปกด **เกมงู 3004 (SNAKE)** ที่แท็บข้างบนนะ กินตัวเลข 3-0-0-4 ทำคอมโบแข่งกับคนอื่นได้ด้วย!",
          "เล่นเกมต้องมีสติ แต่ถ้าเจอเพื่อนร่วมทีมแจก... สติก็อาจจะแตกได้เหมือนกัน 55555555+",
          "จะ FiveM, GTA หรือเกมไหนๆ ถ้าเล่นกับเพื่อนในแก๊ง LYFESTYLE ยังไงก็เดือด!"
        ]
      },

      // 8. GREETINGS
      {
        match: /(หวัดดี|สวัสดี|hello|hi|ดีครับ|ดีจ้า|ว่าไง|เฮ้ย)/i,
        replies: [
          "โย่ววว! สวัสดีสมาชิกแก๊ง LYFESTYLE! วันนี้มีอะไรเด็ดๆ มาคุยกัน หรือมีอะไรข้องใจ ถาม AI ตัวตึงคนนี้ได้เลย!",
          "ดีครับผม! พร้อมคุย พร้อมกวน พร้อมให้คำปรึกษาตลอด 24 ชั่วโมง จัดมาได้เลยเพื่อน!",
          "หวัดดีคร้าบบบ! วันนี้อากาศดี หรืออารมณ์ดีมั้ย พิมพ์คุยเล่นกันได้เล้ยยย 55555"
        ]
      }
    ];

    // Online LLM Fetcher (Pollinations.ai Free Public Gateway)
    async function fetchOnlineLLM(userPrompt) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      const persona = PERSONA_CONFIGS[currentPersona] || PERSONA_CONFIGS.savage;
      const systemInstruction = `${persona.promptDesc}
กฎการตอบ:
- ตอบเป็นภาษาไทย มีชีวิตชีวา เหมือนมนุษย์จริงๆ คุยสนุก กวนๆ หรือลึกซึ้งตามสไตล์
- ตอบได้ทุกเรื่องในโลก ทั้งวิทยาศาสตร์ สาระ เกม มุกตลก แฟชั่น ความรัก จีบสาว ปรึกษาชีวิต
- มีอิสระในการใช้คำว่า 55555, นะคะ/นะครับ, เพื่อน, ตัวตึง, เฟี้ยว
- หากคำถามเกี่ยวกับแก๊ง LYFESTYLE หรือ 3004 ให้เชิดชูแก๊งอย่างเท่ๆ`;

      const messages = [
        { role: 'system', content: systemInstruction },
        ...chatHistory.slice(-6).map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text
        })),
        { role: 'user', content: userPrompt }
      ];

      try {
        const res = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages,
            model: 'openai',
            seed: Math.floor(Math.random() * 99999)
          }),
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) {
          const reply = await res.text();
          if (reply && reply.trim() && !reply.includes('<!DOCTYPE')) {
            return reply.trim();
          }
        }
      } catch (err) {
        clearTimeout(timer);
      }
      return null;
    }

    // Dynamic Offline Engine
    function getDynamicOfflineReply(text) {
      const clean = text.trim().toLowerCase();

      for (const item of LOCAL_KNOWLEDGE) {
        if (item.match.test(clean)) {
          if (item.replies) {
            return item.replies[Math.floor(Math.random() * item.replies.length)];
          }
          return item.reply;
        }
      }

      if (currentPersona === 'savage') {
        const savagePool = [
          `5555555 ถามมาได้เฉียบมากเรื่อง "${text}"! บอกเลยว่าในแก๊ง LYFESTYLE เรื่องนี้พวกเราคุยกันยันสว่างได้เลยเพื่อน! มีอะไรข้องใจอีกถามมาเล้ย!`,
          `เออว่ะ ข้อความนี้ลึกซึ้ง! ถ้าให้ AI ตัวตึงคนนี้ตอบนะ... บอกได้คำเดียวว่า "สุดยอด" 555555 อยากให้ขยายความตรงไหนบอกมา!`,
          `55555555 มาถูกที่แล้วเพื่อน! เรื่องนี้ตอบง่ายมาก ขอแค่ใจเราถึง อะไรๆ ก็ไม่ยากในวิถี LYFESTYLE 3004!`,
          `คำถามนี้โคตรเท่! "${text}" ใช่มั้ยล่ะ เดี๋ยวจัดคำตอบโดนๆ ให้เลยว่า... ให้โฟกัสที่ความสุขของตัวเอง แล้วลุยให้เต็มที่ 555+`
        ];
        return savagePool[Math.floor(Math.random() * savagePool.length)];
      } else if (currentPersona === 'genius') {
        return `สำหรับประเด็น **"${text}"** นั้น สามารถมองได้หลายมิติครับ ทั้งในแง่ของตรรกะ ข้อมูลรอบตัว และการนำไปปรับใช้ในชีวิตจริง หากต้องการเจาะลึกด้านไหนเป็นพิเศษ ถามต่อได้เลยครับ!`;
      } else {
        return `เข้าใจความรู้สึกเลยนะคะ ข้อความ "${text}" นี้ฟังแล้วอบอุ่นใจมาก ไม่ว่าจะเจอเรื่องอะไรมา แก๊ง LYFESTYLE และ AI คนนี้พร้อมอยู่ข้างๆ เสมอนะคะ สู้ๆ ค่ะ!`;
      }
    }

    function loadChatHistory() {
      try {
        const saved = localStorage.getItem(AI_STORAGE_KEY);
        if (saved) {
          chatHistory = JSON.parse(saved);
        } else {
          chatHistory = [
            {
              role: 'ai',
              text: 'โย่ววว! ยินดีต้อนรับสู่ **LYFESTYLE OPENCHAT** ค่ะ!\nฉันคือ AI ตัวตึงประจำแก๊ง อยากคุยเล่น กวนๆ ถามความรู้ ถามมุกตลก ปรึกษาเรื่องอะไร ถามมาได้หมดเลยน้าาา 55555+',
              time: formatCurrentTime()
            }
          ];
        }
      } catch (e) {
        chatHistory = [];
      }

      const pSelect = document.getElementById('personaSelect');
      if (pSelect) pSelect.value = currentPersona;
      changePersona(currentPersona);

      renderMessages();
    }

    function saveChatHistory() {
      try {
        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(chatHistory.slice(-60)));
      } catch (e) { }
    }

    function formatCurrentTime() {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    function renderMessages() {
      const container = document.getElementById('chatMessages');
      if (!container) return;

      container.innerHTML = chatHistory.map((msg, index) => `
        <div class="msg-row ${msg.role}">
          <div class="msg-bubble" id="msgBubble-${index}">
            <div class="msg-content">${formatMarkdown(msg.text)}</div>
            <span class="msg-time">${msg.time}</span>
            ${msg.role === 'ai' ? `<button class="msg-copy-btn" onclick="copyMessageText(${index}, this)" title="คัดลอกข้อความ"><i class="fa-regular fa-copy"></i></button>` : ''}
          </div>
        </div>
      `).join('');

      container.scrollTop = container.scrollHeight;
    }

    function formatMarkdown(text) {
      if (!text) return '';
      let formatted = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Code Blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline Code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // New lines
        .replace(/\n/g, '<br>');

      return formatted;
    }

    function copyMessageText(index, btn) {
      const msg = chatHistory[index];
      if (!msg) return;
      navigator.clipboard.writeText(msg.text).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> คัดลอกแล้ว';
        btn.style.color = '#22c55e';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.color = '';
        }, 1500);
      });
    }

    function showTypingIndicator() {
      const container = document.getElementById('chatMessages');
      const typingEl = document.createElement('div');
      typingEl.id = 'aiTypingBubble';
      typingEl.className = 'msg-row ai';
      typingEl.innerHTML = `
        <div class="msg-bubble">
          <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
    }

    function hideTypingIndicator() {
      const el = document.getElementById('aiTypingBubble');
      if (el) el.remove();
    }

    async function handleChatSubmit(e) {
      if (e) e.preventDefault();
      const input = document.getElementById('chatInput');
      const text = input.value.trim();
      if (!text) return;

      chatHistory.push({
        role: 'user',
        text: text,
        time: formatCurrentTime()
      });
      renderMessages();
      input.value = '';

      showTypingIndicator();
      const sendBtn = document.getElementById('btnSendMsg');
      if (sendBtn) sendBtn.disabled = true;

      // 1. ลองเชื่อมต่อ Online Open LLM
      let finalReply = await fetchOnlineLLM(text);

      // 2. ถ้าต่อเน็ตไม่ได้ หรือไม่มีคำตอบ ใช้ Dynamic Offline Knowledge
      if (!finalReply) {
        finalReply = getDynamicOfflineReply(text);
      }

      hideTypingIndicator();

      chatHistory.push({
        role: 'ai',
        text: finalReply,
        time: formatCurrentTime()
      });
      saveChatHistory();
      renderMessages();

      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }

    function sendQuickPrompt(promptText) {
      const input = document.getElementById('chatInput');
      if (input) {
        input.value = promptText;
        handleChatSubmit();
      }
    }

    function randomSurprisePrompt() {
      const prompts = [
        "ถ้าเปรียบแก๊ง LYFESTYLE เป็นรถยนต์ คิดว่าจะเป็นรถรุ่นไหน?",
        "เล่าเรื่องผีสั้นๆ ให้ฟังหน่อย เอาแบบหลอนๆ ปนฮา555",
        "ช่วยคิดมุกจีบสาวแบบคนในแก๊งหน่อยครับ",
        "สมมุติว่าโลกนี้ไม่มีอินเทอร์เน็ต พวกเราจะทำอะไรกัน?",
        "ทำไมแมวถึงชอบทำตัวเป็นเจ้านายมนุษย์55555",
        "ช่วยแนะนำวิธีหาเงินล้านแบบไม่ขัดใจแม่หน่อย!"
      ];
      const p = prompts[Math.floor(Math.random() * prompts.length)];
      sendQuickPrompt(p);
    }

    function clearChatHistory() {
      if (confirm('คุณต้องการล้างประวัติการคุยทั้งหมดใช่หรือไม่?')) {
        localStorage.removeItem(AI_STORAGE_KEY);
        loadChatHistory();
      }
    }

    // ═══════════════════════════════════════════
    // SNAKE 3004 ARCADE ENGINE
    // ═══════════════════════════════════════════
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const GRID_SIZE = 20;
    const TILE_COUNT = 20; // 400x400

    let snake = [];
    let food = { x: 5, y: 5, digit: '3' };
    let dx = 1;
    let dy = 0;
    let nextDx = 1;
    let nextDy = 0;
    let gameLoop = null;
    let score = 0;
    let combos = 0;
    let highScore = parseInt(localStorage.getItem('lyfe_snake_high_score') || '0', 10);
    let gameRunning = false;
    let comboTarget = ['3', '0', '0', '4'];
    let comboIndex = 0;

    function initSnakeGameCanvas() {
      document.getElementById('snakeHighScore').innerText = highScore;
      if (!gameRunning) {
        drawInitialBoard();
      }
    }

    function drawInitialBoard() {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGridLines();
    }

    function drawGridLines() {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }

    function startGame() {
      initAudio();
      document.getElementById('snakeOverlay').style.display = 'none';

      snake = [
        { x: 10, y: 10, label: '3' },
        { x: 9, y: 10, label: '0' },
        { x: 8, y: 10, label: '0' },
        { x: 7, y: 10, label: '4' }
      ];
      dx = 1;
      dy = 0;
      nextDx = 1;
      nextDy = 0;
      score = 0;
      combos = 0;
      comboIndex = 0;
      gameRunning = true;

      document.getElementById('snakeScore').innerText = '0';
      document.getElementById('snakeCombos').innerText = '0';

      spawnFood();
      if (gameLoop) clearInterval(gameLoop);
      gameLoop = setInterval(updateSnakeGame, 110);
    }

    function spawnFood() {
      const nextDigit = comboTarget[comboIndex % comboTarget.length];
      let valid = false;
      let newX = 0;
      let newY = 0;

      while (!valid) {
        newX = Math.floor(Math.random() * TILE_COUNT);
        newY = Math.floor(Math.random() * TILE_COUNT);
        valid = !snake.some(segment => segment.x === newX && segment.y === newY);
      }

      food = {
        x: newX,
        y: newY,
        digit: nextDigit
      };
    }

    function updateSnakeGame() {
      dx = nextDx;
      dy = nextDy;

      const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy,
        label: food.digit
      };

      // Wall collision (wrap around or wall die - here: classic wrap around for fun)
      if (head.x < 0) head.x = TILE_COUNT - 1;
      if (head.x >= TILE_COUNT) head.x = 0;
      if (head.y < 0) head.y = TILE_COUNT - 1;
      if (head.y >= TILE_COUNT) head.y = 0;

      // Self collision
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          gameOver();
          return;
        }
      }

      snake.unshift(head);

      // Check eat food
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        comboIndex++;
        if (comboIndex % 4 === 0) {
          combos++;
          score += 50; // Bonus for full "3004"
          playSound('combo');
          document.getElementById('snakeCombos').innerText = combos;
        } else {
          playSound('eat');
        }

        document.getElementById('snakeScore').innerText = score;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('lyfe_snake_high_score', highScore);
          document.getElementById('snakeHighScore').innerText = highScore;
        }

        spawnFood();
      } else {
        snake.pop();
      }

      renderSnakeGame();
    }

    function renderSnakeGame() {
      ctx.fillStyle = '#08080c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGridLines();

      // Draw Food (3004 Digit Coin)
      const foodX = food.x * GRID_SIZE;
      const foodY = food.y * GRID_SIZE;

      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(foodX + GRID_SIZE / 2, foodY + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Number on food
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Kanit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food.digit, foodX + GRID_SIZE / 2, foodY + GRID_SIZE / 2 + 1);
      ctx.restore();

      // Draw Snake
      snake.forEach((segment, idx) => {
        const segX = segment.x * GRID_SIZE;
        const segY = segment.y * GRID_SIZE;

        ctx.save();
        if (idx === 0) {
          // Head
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fillRect(segX + 1, segY + 1, GRID_SIZE - 2, GRID_SIZE - 2);

          // Head Eyes
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(segX + 4, segY + 4, 3, 3);
          ctx.fillRect(segX + 13, segY + 4, 3, 3);
        } else {
          // Body
          const hue = (idx * 15) % 360;
          ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
          ctx.fillRect(segX + 2, segY + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        }
        ctx.restore();
      });
    }

    function gameOver() {
      playSound('die');
      clearInterval(gameLoop);
      gameRunning = false;

      const overlay = document.getElementById('snakeOverlay');
      document.getElementById('overlayTitle').innerText = 'GAME OVER!';
      document.getElementById('overlayDesc').innerHTML = `
        คะแนนที่ทำได้: <strong style="color: #fff; font-size: 1.2rem;">${score}</strong> แต้ม<br>
        3004 COMBO: <strong style="color: #facc15;">${combos}</strong> ครั้ง<br>
        คะแนนสูงสุด: ${highScore} แต้ม
      `;
      document.getElementById('btnStartGame').innerText = 'PLAY AGAIN';
      overlay.style.display = 'flex';
    }

    function changeSnakeDir(dir) {
      if (!gameRunning) return;
      if (dir === 'UP' && dy === 0) { nextDx = 0; nextDy = -1; }
      else if (dir === 'DOWN' && dy === 0) { nextDx = 0; nextDy = 1; }
      else if (dir === 'LEFT' && dx === 0) { nextDx = -1; nextDy = 0; }
      else if (dir === 'RIGHT' && dx === 0) { nextDx = 1; nextDy = 0; }
    }

    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (!gameRunning) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        changeSnakeDir('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        changeSnakeDir('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeSnakeDir('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeSnakeDir('RIGHT');
      }
    });

    // Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburgerBtn && mobileMenu) {
      hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburgerBtn.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Init Page
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('loaded');
      loadChatHistory();
      initSnakeGameCanvas();
    });
  </script>
  <script src="site-features.js"></script>
</body>

</html>
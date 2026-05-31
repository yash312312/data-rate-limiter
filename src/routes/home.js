
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rate Limiter</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0a;
      --surface: #111111;
      --border: #222222;
      --green: #00ff87;
      --red: #ff3c3c;
      --yellow: #ffd700;
      --text: #e8e8e8;
      --muted: #555;
      --font-mono: 'JetBrains Mono', monospace;
      --font-display: 'Syne', sans-serif;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-mono);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      gap: 2.5rem;
    }

    /* ── Header ── */
    .header {
      text-align: center;
    }

    .header h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, var(--green) 0%, #00c9ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      color: var(--muted);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      letter-spacing: 0.05em;
    }

    /* ── Instructions card ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 560px;
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .step-number {
      background: var(--border);
      color: var(--green);
      font-size: 0.75rem;
      font-weight: 700;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-text {
      font-size: 0.85rem;
      line-height: 1.6;
      color: #aaa;
    }

    .step-text strong {
      color: var(--text);
      font-weight: 700;
    }

    .step-text code {
      background: #1a1a1a;
      border: 1px solid var(--border);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
      color: var(--green);
    }

    /* ── Button ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--green);
      color: #000;
      font-family: var(--font-mono);
      font-size: 0.9rem;
      font-weight: 700;
      padding: 0.85rem 2rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      box-shadow: 0 0 0 0 rgba(0,255,135,0.4);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 24px rgba(0,255,135,0.3);
    }

    .btn:active {
      transform: translateY(0);
    }

    /* ── Live tester ── */
    .tester {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      width: 100%;
      max-width: 560px;
    }

    .tester-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .tester-title {
      font-family: var(--font-display);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .token-bar-wrap {
      margin-bottom: 1.5rem;
    }

    .token-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .token-bar-label span:last-child {
      color: var(--green);
      font-weight: 700;
    }

    .token-bar-bg {
      background: var(--border);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
    }

    .token-bar-fill {
      height: 100%;
      background: var(--green);
      border-radius: 4px;
      transition: width 0.3s ease, background 0.3s ease;
      width: 100%;
    }

    /* ── Response log ── */
    .log {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 220px;
      overflow-y: auto;
    }

    .log::-webkit-scrollbar { width: 4px; }
    .log::-webkit-scrollbar-track { background: transparent; }
    .log::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.78rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      background: #161616;
      border: 1px solid transparent;
      animation: slideIn 0.2s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .log-entry.allowed {
      border-color: rgba(0,255,135,0.15);
    }

    .log-entry.blocked {
      border-color: rgba(255,60,60,0.2);
      background: rgba(255,60,60,0.05);
    }

    .log-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      letter-spacing: 0.05em;
    }

    .allowed .log-badge { background: rgba(0,255,135,0.15); color: var(--green); }
    .blocked .log-badge { background: rgba(255,60,60,0.15); color: var(--red); }

    .log-meta { color: var(--muted); font-size: 0.72rem; margin-left: auto; }

    /* ── Fire button ── */
    .fire-btn {
      width: 100%;
      margin-top: 1.25rem;
      justify-content: center;
      font-size: 0.85rem;
      padding: 0.75rem;
    }

    .fire-btn.exhausted {
      background: var(--red);
      box-shadow: 0 0 24px rgba(255,60,60,0.2);
    }

    .fire-btn.exhausted:hover {
      box-shadow: 0 0 32px rgba(255,60,60,0.35);
    }

    /* ── Footer note ── */
    .note {
      font-size: 0.72rem;
      color: var(--muted);
      text-align: center;
      max-width: 400px;
      line-height: 1.7;
    }

    .note a {
      color: var(--green);
      text-decoration: none;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h1>Rate Limiter</h1>
    <p>TOKEN BUCKET</p>
  </div>

  <!-- Instructions -->
  <div class="card">
    <div class="card-title">// How to trigger rate limiting</div>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-text">
          Click the <strong>Fire Request</strong> button below repeatedly, or visit
          <code>/api/hello</code> and keep refreshing.
        </div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-text">
          You have <strong>10 tokens</strong> in your bucket. Each request consumes one.
          Watch the bar drain in real time.
        </div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-text">
          After <strong>10 requests</strong>, you'll hit a <code>429 Too Many Requests</code>.
          The button turns red.
        </div>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-text">
          Wait a few seconds — tokens <strong>refill at 2/sec</strong>. Then try again.
          You can also watch state live in <code>redis-cli</code> → <code>HGETALL ::1</code>
        </div>
      </div>
    </div>
  </div>

  <!-- Live Tester -->
  <div class="tester">
    <div class="tester-header">
      <div class="tester-title">// Live tester</div>
      <a href="/api/hello" target="_blank" style="font-size:0.75rem; color: var(--muted); text-decoration:none;">
        open /api/hello ↗
      </a>
    </div>

    <!-- Token bar -->
    <div class="token-bar-wrap">
      <div class="token-bar-label">
        <span>tokens remaining</span>
        <span id="tokenCount">10 / 10</span>
      </div>
      <div class="token-bar-bg">
        <div class="token-bar-fill" id="tokenBar"></div>
      </div>
    </div>

    <!-- Log -->
    <div class="log" id="log">
      <div class="log-entry" style="justify-content:center; color: var(--muted); border:none; background:transparent;">
        No requests yet — fire one below
      </div>
    </div>

    <!-- Button -->
    <button class="btn fire-btn" id="fireBtn" onclick="fireRequest()">
      ▶ Fire Request
    </button>
  </div>

  <div class="note">
    Rate limit state is stored in Redis per IP.<br/>
    Check it live: <a href="#" onclick="return false">redis-cli → HGETALL "::1"</a>
  </div>

  <script>
    const CAPACITY = 10;
    let requestCount = 0;

    async function fireRequest() {
      const btn = document.getElementById('fireBtn');
      btn.disabled = true;
      btn.textContent = '⏳ Sending...';

      try {
        const res = await fetch('/api/hello');
        const data = await res.json();

        const remaining = parseInt(res.headers.get('x-ratelimit-remaining') || '0');
        const limit     = parseInt(res.headers.get('x-ratelimit-limit') || CAPACITY);
        const allowed   = res.status === 200;

        requestCount++;
        updateBar(remaining, limit);
        addLog(allowed, res.status, remaining, limit);

        if (!allowed) {
          btn.classList.add('exhausted');
          btn.textContent = '🚫 Rate Limited — wait a moment';
          setTimeout(() => {
            btn.classList.remove('exhausted');
            btn.textContent = '▶ Fire Request';
            btn.disabled = false;
          }, 2000);
        } else {
          btn.textContent = '▶ Fire Request';
          btn.disabled = false;
        }

      } catch (err) {
        addLog(false, 'ERR', 0, CAPACITY, err.message);
        btn.textContent = '▶ Fire Request';
        btn.disabled = false;
      }
    }

    function updateBar(remaining, limit) {
      const pct = Math.max(0, (remaining / limit) * 100);
      const bar = document.getElementById('tokenBar');
      bar.style.width = pct + '%';
      bar.style.background = pct > 40
        ? 'var(--green)'
        : pct > 15
          ? 'var(--yellow)'
          : 'var(--red)';
      document.getElementById('tokenCount').textContent = remaining + ' / ' + limit;
    }

    function addLog(allowed, status, remaining, limit) {
      const log = document.getElementById('log');

      // Clear placeholder
      if (requestCount === 1) log.innerHTML = '';

      const entry = document.createElement('div');
      entry.className = 'log-entry ' + (allowed ? 'allowed' : 'blocked');

      const time = new Date().toLocaleTimeString('en-US', { hour12: false });

      entry.innerHTML = \`
        <span class="log-badge">\${status}</span>
        <span style="color: \${allowed ? 'var(--green)' : 'var(--red)'}">
          \${allowed ? 'Request allowed' : 'Too Many Requests'}
        </span>
        <span class="log-meta">\${remaining}/\${limit} · \${time}</span>
      \`;

      log.prepend(entry);
    }
  </script>

</body>
</html>
  `);
});

module.exports = router;
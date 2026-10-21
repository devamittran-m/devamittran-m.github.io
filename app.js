// ============================================================
// Devamittran M — portfolio scripts
// 1. Theme toggle   2. Resume link check   3. Signal illustration
// ============================================================

(function () {
  const root = document.documentElement;

  // ---------- 1. Theme toggle ----------
  const toggle = document.getElementById('theme-toggle');
  function currentTheme() {
    const set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    draw(false);
  });

  // ---------- 2. Resume link ----------
  // Upload resume.pdf to the repo root and the button works.
  // Until then it falls back to LinkedIn so visitors never hit a 404.
  const resume = document.getElementById('resume-link');
  fetch(resume.getAttribute('href'), { method: 'HEAD' })
    .then(r => { if (!r.ok) throw new Error('missing'); })
    .catch(() => {
      resume.removeAttribute('download');
      resume.href = 'https://www.linkedin.com/in/devamittran-m-2723a3269/';
      resume.target = '_blank';
      resume.rel = 'noopener';
      resume.textContent = 'Resume on request';
    });

  // ---------- 3. Signal illustration ----------
  // A random walk with drift and stochastic volatility (the "observed series"),
  // then a 1-D Kalman filter over it (the "filtered estimate").
  const canvas = document.getElementById('signal-canvas');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let series = null;
  let frame = null;

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function makeSeries(n) {
    const truth = [], obs = [];
    let level = 0, vol = 1, drift = 0;
    for (let i = 0; i < n; i++) {
      if (i % 60 === 0) drift = gauss() * 0.06;          // regime shifts
      vol = Math.max(0.4, vol + gauss() * 0.08);          // wandering volatility
      level += drift + gauss() * 0.12;
      truth.push(level);
      obs.push(level + gauss() * 0.9 * vol);
    }
    // 1-D Kalman filter (local level model)
    const Q = 0.03, R = 0.9;
    let x = obs[0], P = 1;
    const est = obs.map(z => {
      P += Q;
      const K = P / (P + R);
      x += K * (z - x);
      P *= (1 - K);
      return x;
    });
    return { obs, est };
  }

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function draw(animate) {
    if (frame) cancelAnimationFrame(frame);
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { obs, est } = series;
    const all = obs.concat(est);
    const min = Math.min(...all), max = Math.max(...all);
    const pad = 8;
    const X = i => (i / (obs.length - 1)) * w;
    const Y = v => pad + (1 - (v - min) / (max - min || 1)) * (h - 2 * pad);
    const noise = cssVar('--noise'), signal = cssVar('--signal');

    function render(progress) {
      ctx.clearRect(0, 0, w, h);
      const nObs = Math.floor(obs.length * Math.min(1, progress * 1.6));
      const nEst = Math.floor(obs.length * Math.max(0, (progress - 0.35) / 0.65));

      ctx.lineJoin = 'round';
      ctx.strokeStyle = noise; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < nObs; i++) i ? ctx.lineTo(X(i), Y(obs[i])) : ctx.moveTo(X(i), Y(obs[i]));
      ctx.stroke();

      ctx.strokeStyle = signal; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < nEst; i++) i ? ctx.lineTo(X(i), Y(est[i])) : ctx.moveTo(X(i), Y(est[i]));
      ctx.stroke();

      if (nEst > 0 && nEst < obs.length) {
        ctx.fillStyle = signal;
        ctx.beginPath(); ctx.arc(X(nEst - 1), Y(est[nEst - 1]), 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (!animate || reduceMotion) { render(1); return; }
    const start = performance.now(), dur = 2200;
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      render(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    })(start);
  }

  function resample(animate) {
    const n = Math.max(240, Math.min(520, Math.round(canvas.clientWidth / 2.2)));
    series = makeSeries(n);
    draw(animate);
  }

  document.getElementById('resample').addEventListener('click', () => resample(true));
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => draw(false), 150);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => draw(false));

  resample(true);
  document.getElementById('year').textContent = new Date().getFullYear();
})();

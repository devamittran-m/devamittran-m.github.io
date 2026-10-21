// ============================================================
// Devamittran M | portfolio scripts
// 1 Theme  2 Resume link  3 Kalman playground  4 Track filter
// 5 Copy email  6 Active nav link
// ============================================================

(function () {
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // ---------- 1. Theme (dark by default) ----------
  $('#theme-toggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    draw(1);
  });

  // ---------- 2. Resume link ----------
  // Upload resume.pdf to the repo root and the button downloads it.
  // Until then it falls back to LinkedIn so nobody hits a missing file.
  const resume = $('#resume-link');
  fetch(resume.getAttribute('href'), { method: 'HEAD' })
    .then((r) => { if (!r.ok) throw new Error('missing'); })
    .catch(() => {
      resume.removeAttribute('download');
      resume.href = 'https://www.linkedin.com/in/devamittran-m/';
      resume.target = '_blank';
      resume.rel = 'noopener';
      resume.textContent = 'Resume on request';
    });

  // ---------- 3. Kalman playground ----------
  // Hidden trend: random walk with regime shifts in drift.
  // Observation: trend + noise with wandering volatility.
  // Estimate: 1D Kalman filter (local level model). The slider sets
  // the ratio of process noise to measurement noise.
  const canvas = $('#signal-canvas');
  const ctx = canvas.getContext('2d');
  const gain = $('#gain');
  const showTruth = $('#show-truth');
  const errOut = $('#err-value');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let data = null, est = null, frame = null;

  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function makeData(n) {
    const truth = [], obs = [];
    let level = 0, vol = 1, drift = 0;
    for (let i = 0; i < n; i++) {
      if (i % 70 === 0) drift = gauss() * 0.07;
      vol = Math.min(2.2, Math.max(0.45, vol + gauss() * 0.07));
      level += drift + gauss() * 0.11;
      truth.push(level);
      obs.push(level + gauss() * 0.9 * vol);
    }
    return { truth, obs };
  }

  function kalman(obs, ratio) {
    const R = 1, Q = ratio * R;
    let x = obs[0], P = 1;
    return obs.map((z) => {
      P += Q;
      const K = P / (P + R);
      x += K * (z - x);
      P *= 1 - K;
      return x;
    });
  }

  function ratioFromSlider() {
    // 0 → very smooth (Q/R = 0.0005), 100 → very responsive (Q/R = 2)
    return Math.pow(10, -3.3 + (gain.value / 100) * 3.6);
  }

  function update() {
    est = kalman(data.obs, ratioFromSlider());
    let se = 0;
    for (let i = 0; i < est.length; i++) se += (est[i] - data.truth[i]) ** 2;
    errOut.textContent = Math.sqrt(se / est.length).toFixed(2);
  }

  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  function draw(progress) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const { obs, truth } = data;
    const all = obs.concat(est, truth);
    const min = Math.min(...all), max = Math.max(...all);
    const pad = 14;
    const X = (i) => (i / (obs.length - 1)) * w;
    const Y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - 2 * pad);

    const nObs = Math.floor(obs.length * Math.min(1, progress * 1.6));
    const nEst = Math.floor(obs.length * Math.max(0, (progress - 0.35) / 0.65));

    function line(arr, n, color, width, dash) {
      if (n < 2) return;
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      for (let i = 0; i < n; i++) i ? ctx.lineTo(X(i), Y(arr[i])) : ctx.moveTo(X(i), Y(arr[i]));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    line(obs, nObs, css('--noise'), 1);
    if (showTruth.checked) line(truth, nEst, css('--analytics'), 2, [6, 5]);
    line(est, nEst, css('--quant'), 2.75);

    if (nEst > 1) {
      const i = nEst - 1;
      ctx.fillStyle = css('--quant');
      ctx.beginPath(); ctx.arc(X(i), Y(est[i]), 4.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function animateIn() {
    if (frame) cancelAnimationFrame(frame);
    if (reduceMotion) { draw(1); return; }
    const start = performance.now(), dur = 2200;
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      draw(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    })(start);
  }

  function resample() {
    const n = Math.max(240, Math.min(520, Math.round(canvas.clientWidth / 2.2)));
    data = makeData(n);
    update();
    animateIn();
  }

  gain.addEventListener('input', () => { if (frame) cancelAnimationFrame(frame); update(); draw(1); });
  showTruth.addEventListener('change', () => { if (frame) cancelAnimationFrame(frame); draw(1); });
  $('#resample').addEventListener('click', resample);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => draw(1), 120); });

  // Start the animation when the playground scrolls into view
  let started = false;
  data = makeData(Math.max(240, Math.min(520, Math.round(canvas.clientWidth / 2.2))));
  update();
  draw(0);
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting && !started) { started = true; animateIn(); obs.disconnect(); }
  }, { threshold: 0.3 }).observe(canvas);

  // ---------- 4. Track filter ----------
  const names = { quant: 'Quant research', analytics: 'Analytics', ai: 'AI engineering and policy' };
  const trackBtns = $$('.track');
  const filterable = $$('[data-tracks]');
  const status = $('#filter-status');
  const clearBtn = $('#clear-filter');
  let active = null;

  function applyFilter(track) {
    active = track;
    trackBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.track === track)));
    filterable.forEach((el) => {
      const match = !track || el.dataset.tracks.split(' ').includes(track);
      el.classList.toggle('dim', !match);
    });
    status.firstChild.textContent = track ? `Highlighting work in ${names[track]}. ` : 'Showing everything. ';
    clearBtn.hidden = !track;
  }
  trackBtns.forEach((b) => b.addEventListener('click', () => applyFilter(active === b.dataset.track ? null : b.dataset.track)));
  clearBtn.addEventListener('click', () => applyFilter(null));

  // ---------- 5. Copy email ----------
  const copyBtn = $('#copy-email');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = 'Copied';
    } catch (e) {
      copyBtn.textContent = 'Select and copy the address';
    }
    setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 2000);
  });

  // ---------- 6. Active nav link ----------
  const links = $$('.topbar nav a').filter((a) => a.getAttribute('href').startsWith('#'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => s && navObserver.observe(s));


  // ---------- 7. Certificate lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-caption');
  $$('[data-full]').forEach((el) => el.addEventListener('click', () => {
    lbImg.src = el.dataset.full;
    lbImg.alt = el.dataset.caption || '';
    lbCap.textContent = el.dataset.caption || '';
    if (typeof lb.showModal === 'function') lb.showModal();
    else window.open(el.dataset.full, '_blank');
  }));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

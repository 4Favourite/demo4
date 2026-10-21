/* OAKLINE — app. Zero dependencies: custom scroll engine, hero sequence, widgets. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const eo = (t) => 1 - Math.pow(1 - t, 3);
  const eio = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);
  const touch = matchMedia('(hover:none)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const A = window.ART;
  let vw = innerWidth, vh = innerHeight, sy = scrollY, ready = false;

  /* ---------- wordmark paths ---------- */
  $$('.wmp').forEach((p) => p.setAttribute('d', A.WM));

  /* ---------- art injection ---------- */
  const artCache = {};
  function artSrc(spec) {
    if (artCache[spec]) return artCache[spec];
    const [n, arg] = spec.split(':');
    const svg = n === 'mini' ? A.mini(+arg) : A[n]();
    return (artCache[spec] = A.uri(svg));
  }
  $$('img[data-art]').forEach((img) => { img.src = artSrc(img.dataset.art); img.decoding = 'async'; });

  /* ---------- time-of-day themes ---------- */
  const bldCache = {}; let clouds = null, curTheme = 'day', T = A.THEMES.day;
  function bldSrc(t) { return bldCache[t] || (bldCache[t] = A.uri(A.building(t))); }
  const TIMES = ['dawn', 'day', 'golden', 'night'];
  const LABEL = { dawn: 'Dawn', day: 'Midday', golden: 'Golden hour', night: 'Night' };
  function buildClouds() {
    clouds = [0, 1, 2, 3].map((i) => A.cloudSprite(T.cloud, 11 + i * 7));
  }
  function applyTime(t, instant) {
    curTheme = t; T = A.THEMES[t];
    if (!T.fillRGB) { const h = T.sky[2].replace('#', ''); T.fillRGB = [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)).join(','); }
    root.dataset.time = t; document.body.dataset.time = t;
    const s = root.style;
    s.setProperty('--paper', T.paper); s.setProperty('--ink', T.ink);
    s.setProperty('--s0', T.sky[0]); s.setProperty('--s1', T.sky[1]); s.setProperty('--s2', T.sky[2]);
    s.setProperty('--sx', T.sun[0] * 100 + '%'); s.setProperty('--sy', T.sun[1] * 100 + '%'); s.setProperty('--sc', T.sun[2]);
    $('#stars').style.opacity = T.stars; $('#sky').style.background = T.tint;
    $('#sun').style.opacity = t === 'night' ? .55 : .9;
    $$('[data-bld]').forEach((i) => (i.src = bldSrc(t)));
    $('#wmImg').setAttribute('href', bldSrc(t));
    ['wmS0', 'wmS1', 'wmS2'].forEach((id, i) => $('#' + id).setAttribute('stop-color', T.sky[i]));
    { const tc = $('meta[name=theme-color]'); if (tc) tc.content = T.paper; }
    buildClouds();
    $$('#timeSeg button').forEach((b, i) => { const on = b.dataset.t === t; b.classList.toggle('on', on); if (on) $('#timeSeg .thumb').style.transform = `translateX(${i * 40}px)`; });
    $('#vibeTxt').textContent = LABEL[t] + ' · 40.7128° N 74.0060° W';
    $$('.card .ph img').forEach((im) => { im.style.filter = t === 'night' ? 'brightness(.7) saturate(1.1)' : ''; });
  }

  /* ---------- text splitting ---------- */
  function wrapWords(node, cls, withInner) {
    const out = []; let idx = 0;
    (function walk(n) {
      Array.from(n.childNodes).forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const sp = document.createElement('span');
            if (withInner) { sp.className = 'mw'; const i = document.createElement('span'); i.className = 'mi'; i.style.setProperty('--i', idx++); i.textContent = tok; sp.appendChild(i); }
            else { sp.className = cls; sp.textContent = tok; out.push(sp); }
            frag.appendChild(sp);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(node);
    return out;
  }
  // hero h1: per-character
  (function () {
    const h = $('#heroH1'), txt = h.textContent; h.textContent = ''; let i = 0;
    txt.split(' ').forEach((w, wi, arr) => {
      const ws = document.createElement('span'); ws.className = 'w';
      [...w].forEach((ch) => { const c = document.createElement('span'); c.className = 'ch'; c.style.setProperty('--i', i++); c.textContent = ch; ws.appendChild(c); });
      h.appendChild(ws); if (wi < arr.length - 1) h.appendChild(document.createTextNode(' '));
    });
  })();
  $$('[data-split]').forEach((el) => wrapWords(el, null, true));
  const scrubs = $$('[data-scrub]').map((el) => ({ el, words: wrapWords(el, 'sw', false), mode: el.dataset.scrub }));

  /* ---------- scroll tracking ---------- */
  const items = [];
  function add(el, fn) { const it = { el, fn, t: 0, h: 0 }; items.push(it); return it; }
  function measure() {
    vw = innerWidth; vh = innerHeight;
    items.forEach((it) => { const r = it.el.getBoundingClientRect(); it.t = r.top + scrollY; it.h = r.height; });
    sizeCanvas();
  }
  const heroEl = $('#hero');

  /* ---------- canvas clouds ---------- */
  const cb = $('#cloudsBack'), cf = $('#cloudsFront'), cbx = cb.getContext('2d'), cfx = cf.getContext('2d');
  let dpr = 1;
  function sizeCanvas() { dpr = Math.min(devicePixelRatio || 1, 1.5); [cb, cf].forEach((c) => { c.width = Math.floor(vw * dpr); c.height = Math.floor(vh * dpr); }); }
  const backC = Array.from({ length: 9 }, (_, i) => ({ s: .45 + ((i * 37) % 10) / 14, y: .52 + ((i * 53) % 10) / 34, x: (i / 9), sp: .006 + ((i * 29) % 7) / 700, a: .4 + ((i * 17) % 6) / 12, k: i % 4, d: .4 + (i % 3) * .3 }));
  function drawBack(t, tb) {
    const W = cb.width, H = cb.height; cbx.clearRect(0, 0, W, H); if (!clouds) return;
    backC.forEach((c) => {
      const w = W * c.s, h = w * 300 / 700;
      const x = ((c.x + t * c.sp) % 1.5) * (W + w) - w * 1.1 + mx * 20 * c.d * dpr;
      const y = H * c.y - tb * H * .35 * c.d + Math.sin(t * .3 + c.x * 9) * 6 * dpr;
      cbx.globalAlpha = c.a * (curTheme === 'night' ? .55 : 1); cbx.drawImage(clouds[c.k], x, y, w, h);
    });
    cbx.globalAlpha = 1;
  }
  function drawFront(t, bank) {
    const W = cf.width, H = cf.height; cfx.clearRect(0, 0, W, H); if (!clouds) return;
    const top = H * (1.03 - 1.55 * bank);
    const c = T.fillRGB;
    const g = cfx.createLinearGradient(0, top + H * .03, 0, top + H * .24);
    g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},1)`);
    cfx.fillStyle = g; cfx.fillRect(0, top + H * .03, W, H * 2.2);
    for (let row = 0; row < 8; row++) {
      const y0 = top + row * H * .13; if (y0 > H + 40) break;
      for (let i = 0; i < 9; i++) {
        const w = W * (.42 + ((i * 7 + row * 3) % 5) * .07), h = w * 300 / 700;
        const x = (i / 8) * (W + w * .4) - w * .55 + Math.sin(t * .22 + i * 1.7 + row * 2.1) * 34 * dpr * (1 + row * .15) + mx * 30 * dpr;
        const y = y0 - h * .5 + Math.cos(t * .3 + i + row) * 8 * dpr;
        cfx.globalAlpha = Math.max(.35, .95 - row * .07); cfx.drawImage(clouds[(i + row) % 4], x, y, w, h);
      }
    }
    cfx.globalAlpha = 1;
  }

  /* ---------- hero timeline ---------- */
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  const hCopy = $('#heroCopy'), bld = $('#bld'), ghostWrap = $('#ghostWrap'), ghostEl = $('.ghost'), ghostCap = $('#ghostCap'), wmClip = $('#wmClip'), wmImg = $('#wmImg'), veil = $('#veil');
  ghostEl.querySelector('path').style.strokeDasharray = '3200';
  const hMeta = $('.hero-meta'), hBadge = $('.hero-badge'), cue = $('#cue');
  function hero(t) {
    const hh = heroEl.offsetHeight - vh; const p = clamp(sy / hh);
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    const tA = eio(clamp(p / .15));
    hCopy.style.opacity = 1 - tA; hCopy.style.transform = `translate3d(${mx * -8}px,${-90 * tA}px,0)`; hCopy.style.filter = tA > .01 ? `blur(${tA * 14}px)` : 'none';
    hCopy.style.visibility = tA >= 1 ? 'hidden' : 'visible';
    const tB = eio(clamp(p / .62));
    const bo = 1 - clamp((p - .56) / .14);
    bld.style.transform = `translate3d(calc(-50% + ${mx * 14 * (1 - tB)}px),${my * 8 + tB * 7 * vh / 100}px,0) scale(${1 + 1.35 * tB})`;
    bld.style.opacity = bo; bld.style.visibility = bo <= 0 ? 'hidden' : 'visible';
    const bl = clamp((p - .4) / .3) * 7; bld.style.filter = bl > .2 ? `blur(${bl}px)` : 'none';
    const bank = .1 * clamp(p / .3) + .9 * eio(clamp((p - .3) / .4));
    drawBack(t, tB); drawFront(t, bank);
    // ghost outline
    const gi = clamp((p - .2) / .1), go = clamp((p - .46) / .08), gv = gi * (1 - go);
    ghostWrap.style.opacity = gv; ghostWrap.style.transform = `translate(-50%,-50%) scale(${.92 + .2 * clamp((p - .2) / .4)})`;
    ghostEl.style.setProperty('--dash', 3200 * (1 - clamp((p - .19) / .2)));
    ghostCap.style.opacity = clamp((p - .27) / .08);
    // clipped wordmark
    const wi = eo(clamp((p - .5) / .12)), wo = clamp((p - .9) / .08);
    wmClip.style.opacity = wi * (1 - wo);
    wmClip.style.transform = `translate(-50%,-50%) scale(${.9 + .26 * clamp((p - .5) / .46)}) translateY(${(1 - wi) * 4}vh)`;
    wmImg.setAttribute('y', (-96 + 32 * clamp((p - .5) / .46)).toFixed(1));
    veil.style.opacity = clamp((p - .86) / .14);
    const fo = 1 - clamp(p / .05); hMeta.style.opacity = fo; hBadge.style.opacity = fo; cue.style.opacity = fo;
  }

  /* ---------- smooth scroll to ---------- */
  let tweening = false;
  function goTo(y, dur) {
    const s0 = scrollY, d = y - s0, D = dur || clamp(Math.abs(d) / 3.2, 800, 2400), t0 = performance.now(); tweening = true;
    (function step(n) {
      if (!tweening) return;
      const k = clamp((n - t0) / D); scrollTo(0, s0 + d * eio(k)); if (k < 1) requestAnimationFrame(step); else tweening = false;
    })(t0);
  }
  ['wheel', 'touchstart', 'keydown'].forEach((e) => addEventListener(e, () => { tweening = false; }, { passive: true }));
  function goSel(sel) {
    closeAll(); const el = $(sel); if (!el) return;
    if (sel === '#hero') return goTo(0);
    goTo(el.getBoundingClientRect().top + scrollY - (sel === '#listings' || sel === '#tools' ? 0 : 0));
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); goSel(a.getAttribute('href')); }
    const k = e.target.closest('[data-cmdk]'); if (k) { e.preventDefault(); openCmd(); }
    const ts = e.target.closest('[data-toast]'); if (ts) { e.preventDefault(); toast(ts.dataset.toast); burst(e.clientX, e.clientY, 60); }
    if (e.target.closest('a[href="#"]:not([data-go]):not([data-cmdk])')) e.preventDefault();
  });

  /* ---------- statement ---------- */
  const strip = $('#strip'); add(strip, (p, it) => { const q = clamp((vh * .95 - (it.t - sy)) / (vh * .95)); strip.style.setProperty('--ci', ((1 - eo(q)) * 14).toFixed(2) + 'vw'); });
  const slants = $$('.slant'); add($('#slants'), (p, it) => {
    const q = clamp((vh * .95 - (it.t - sy)) / (vh * .75));
    slants.forEach((s, i) => { const l = eo(clamp(q * 1.7 - i * .24)); s.style.setProperty('--ty', ((1 - l) * 110 + (i % 2 ? 1 : -1) * (q - .5) * 26).toFixed(1) + 'px'); s.style.setProperty('--o', l.toFixed(3)); });
  });
  scrubs.forEach((sc) => add(sc.el, (p, it) => {
    const top = it.t - sy, q = clamp((vh * .88 - top) / (vh * .36 + it.h)), n = sc.words.length;
    for (let i = 0; i < n; i++) sc.words[i].classList.toggle('on', i / n < q * 1.06);
  }));
  // parallax images
  $$('img[data-par]').forEach((img) => {
    const par = +img.dataset.par; add(img.parentElement, (p, it) => {
      const c = it.t - sy + it.h / 2 - vh / 2, cap = Math.min(it.h * .09, 56);
      img.style.transform = `translate3d(0,${clamp(-c * par, -cap, cap).toFixed(1)}px,0)`;
    });
  });
  // reveals
  let pend = $$('[data-reveal],[data-split]');
  function checkReveals() { pend = pend.filter((el) => { if (el.getBoundingClientRect().top < vh * .88) { el.classList.add('in'); return false; } return true; }); if (!counted && statsEl.getBoundingClientRect().top < vh * .85) { counted = true; $$('[data-count]').forEach((b) => countTo(b)); } }

  /* ---------- process steps ---------- */
  const steps = $$('#steps li'), stepNum = $('#stepNum'), spine = $('#spineFill'); let stepIdx = -1;
  const stepsOl = $('#steps');
  add(stepsOl, (p, it) => {
    let best = 0, bd = 1e9;
    steps.forEach((li, i) => { const r = li.getBoundingClientRect(), d = Math.abs(r.top + r.height * .35 - vh * .5); if (d < bd) { bd = d; best = i; } });
    if (best !== stepIdx) { stepIdx = best; steps.forEach((li, i) => li.classList.toggle('on', i === best)); stepNum.textContent = String(best + 1).padStart(2, '0'); }
    spine.style.transform = `scaleY(${clamp((sy + vh * .5 - it.t) / it.h).toFixed(3)})`;
  });

  /* ---------- counters ---------- */
  let counted = false;
  const statsEl = $('#stats');
  function fmt(b, v) { const dec = +b.dataset.dec || 0; return (b.dataset.pre || '') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (b.dataset.suf || ''); }
  function countTo(b) { const to = +b.dataset.count, t0 = performance.now(); (function s(n) { const k = clamp((n - t0) / 1900); b.textContent = fmt(b, to * eo(k)); if (k < 1) requestAnimationFrame(s); })(t0); }

  /* ---------- voices ---------- */
  const V = [
    ['BERNADETTE HOGA', 'OAKLINE made buying our first home feel human. Our agent knew every block, every owner, and exactly when to push. We closed in 31 days — $40k under asking.', 'First-time buyer · Brooklyn Heights'],
    ['MARCUS & DELILAH OYELARAN', 'We sold in six days with three offers over ask. The staging, the pricing, the open-house energy — it felt like a campaign, not a listing.', 'Seller · Tribeca'],
    ['PRIYA NATARAJAN', 'I was priced out of every rental portal. My agent found a quiet off-market one-bed two stops from work — before it was ever listed.', 'Renter · Astoria'],
    ['JAMES WHITFIELD', 'I’ve used five brokerages as an investor. OAKLINE is the only one where my agent texted me a better deal than the one I asked for.', 'Investor · Harlem'],
  ];
  let vi = 0, vt = null; const vq = $('#vqText'), vdots = $('#vqDots'), VDUR = 6500;
  V.forEach((_, i) => { const d = document.createElement('i'); d.innerHTML = '<b></b>'; d.onclick = () => showV(i); vdots.appendChild(d); });
  vdots.style.setProperty('--dur', VDUR + 'ms'); vdots.parentElement.style.setProperty('--dur', VDUR + 'ms');
  function showV(i, first) {
    vi = (i + V.length) % V.length; clearTimeout(vt);
    const set = () => { $('#vqName').textContent = V[vi][0]; vq.textContent = '“' + V[vi][1] + '”'; $('#vqRole').textContent = V[vi][2]; $$('i', vdots).forEach((d, k) => { d.classList.remove('on'); void d.offsetWidth; d.classList.toggle('on', k === vi); }); vq.classList.remove('out'); };
    if (first) set(); else { vq.classList.add('out'); setTimeout(set, 380); }
    vt = setTimeout(() => showV(vi + 1), VDUR);
  }
  $('#vqPrev').onclick = () => showV(vi - 1); $('#vqNext').onclick = () => showV(vi + 1);
  showV(0, true);

  /* ---------- services ---------- */
  const rows = $$('.row'), svcTrack = $('#svcTrack'); let rowIdx = 0;
  function setRow(i) { if (i === rowIdx) return; rowIdx = i; rows.forEach((r, k) => r.classList.toggle('on', k === i)); }
  rows.forEach((r, i) => { r.addEventListener('mouseenter', () => setRow(i)); r.addEventListener('focus', () => setRow(i)); r.addEventListener('click', () => setRow(i)); });
  add(svcTrack, (p, it) => { const q = clamp((sy - it.t) / (it.h - vh)); const i = q < .34 ? 0 : q < .67 ? 1 : 2; if (i !== svcLast) { svcLast = i; setRow(i); } });
  let svcLast = -1;

  /* ---------- listings ---------- */
  const L = [
    { n: 'The Cloudline Penthouse', loc: 'Hudson Yards, Manhattan', p: 6850000, b: 4, ba: 4.5, sf: 4120, k: 'penthouse', sc: 'tower', sd: 3, tag: 'New' },
    { n: 'Hale Street Brownstone', loc: 'Brooklyn Heights', p: 4290000, b: 5, ba: 3.5, sf: 3600, k: 'brownstone', sc: 'brownstone', sd: 2, tag: 'Open Sun' },
    { n: 'The Foundry Loft', loc: 'Tribeca, Manhattan', p: 3150000, b: 2, ba: 2, sf: 2480, k: 'loft', sc: 'loft', sd: 4, tag: 'Off-market' },
    { n: 'Pier 9 Residence', loc: 'Williamsburg Waterfront', p: 2780000, b: 3, ba: 3, sf: 2210, k: 'waterfront', sc: 'waterfront', sd: 5, tag: 'Price drop' },
    { n: 'Sky Garden Duplex', loc: 'Midtown West', p: 5400000, b: 3, ba: 3.5, sf: 3340, k: 'penthouse', sc: 'tower', sd: 8, tag: 'Exclusive' },
    { n: 'Willow Row Townhouse', loc: 'Park Slope, Brooklyn', p: 3680000, b: 4, ba: 3, sf: 3010, k: 'brownstone', sc: 'brownstone', sd: 6, tag: 'New' },
    { n: 'The Ironworks Loft', loc: 'DUMBO, Brooklyn', p: 2290000, b: 2, ba: 2, sf: 1980, k: 'loft', sc: 'loft', sd: 9, tag: 'Tour today' },
    { n: 'Harbor Light Villa', loc: 'Red Hook Waterfront', p: 3920000, b: 4, ba: 4, sf: 3550, k: 'waterfront', sc: 'villa', sd: 7, tag: 'Waterfront' },
  ];
  const saved = new Set(); const railIn = $('#railIn'), rail = $('#rail');
  const money = (n) => '$' + n.toLocaleString('en-US');
  L.forEach((l, i) => {
    const c = document.createElement('article'); c.className = 'card'; c.dataset.k = l.k; c.dataset.i = i;
    c.innerHTML = `<div class="ph"><img alt="" src="${A.uri(A.listing(l.sc, l.sd, 'golden'))}"><span class="tag">${l.tag}</span><button class="heart" aria-label="Save ${l.n}"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.800-8 11-8 11z"/></svg></button></div><div class="bd"><h4>${l.n}</h4><span class="loc">${l.loc}</span><div class="row2"><div><div class="price">${money(l.p)}</div><div class="spec"><span>${l.b} bd</span><span>${l.ba} ba</span><span>${l.sf.toLocaleString()} sf</span></div></div><button class="tour">Tour</button></div></div>`;
    railIn.appendChild(c);
    $('.heart', c).addEventListener('click', (e) => { e.stopPropagation(); const on = !saved.has(i); on ? saved.add(i) : saved.delete(i); e.currentTarget.classList.toggle('on', on); updSaved(); if (on) { const r = e.currentTarget.getBoundingClientRect(); burst(r.left + 20, r.top + 20, 18, ['#ff3b4e', '#ff8aa0', '#fff']); toast('Saved “' + l.n + '”'); } });
    $('.tour', c).addEventListener('click', (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); burst(r.left + 30, r.top, 40); toast('Tour requested for ' + l.n); });
    // 3D tilt
    c.addEventListener('pointermove', (e) => { if (dragging || touch) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; c.style.transform = `rotateY(${((x - .5) * 12).toFixed(2)}deg) rotateX(${((.5 - y) * 9).toFixed(2)}deg) translateY(-6px)`; c.style.boxShadow = `${(.5 - x) * 40}px 40px 70px -30px rgba(10,30,60,.5)`; });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; c.style.boxShadow = ''; });
  });
  function updSaved() { const n = $('#savedN'); n.textContent = saved.size; n.classList.toggle('has', saved.size > 0); }
  $$('#chips button').forEach((b) => b.addEventListener('click', () => {
    $$('#chips button').forEach((x) => x.classList.toggle('on', x === b)); const f = b.dataset.f; let cnt = 0;
    $$('.card').forEach((c) => { const ok = f === 'all' || c.dataset.k === f; c.classList.toggle('gone', !ok); if (ok) cnt++; });
    $('#railCount').textContent = cnt + (cnt === 1 ? ' home' : ' homes'); rail.scrollTo({ left: 0, behavior: 'smooth' });
  }));
  // drag rail with inertia
  let dragging = false, dx0 = 0, sl0 = 0, vel = 0, lastX = 0, moved = 0;
  rail.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; dragging = true; dx0 = lastX = e.clientX; sl0 = rail.scrollLeft; vel = 0; moved = 0; rail.setPointerCapture(e.pointerId); cursorEl.classList.add('down'); });
  rail.addEventListener('pointermove', (e) => { if (!dragging) return; vel = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(vel); rail.scrollLeft = sl0 - (e.clientX - dx0); });
  const endDrag = () => { if (!dragging) return; dragging = false; cursorEl.classList.remove('down'); (function inertia() { if (dragging || Math.abs(vel) < .4) return; rail.scrollLeft -= vel; vel *= .94; requestAnimationFrame(inertia); })(); };
  rail.addEventListener('pointerup', endDrag); rail.addEventListener('pointercancel', endDrag);
  const railBar = $('#railBar');
  function railProg() { const sw = rail.scrollWidth, cw = rail.clientWidth; const w = clamp(cw / sw, .08, 1); railBar.style.width = (w * 100) + '%'; railBar.style.transform = `translateX(${(rail.scrollLeft / Math.max(1, sw - cw)) * (1 / w - 1) * 100}%)`; }
  rail.addEventListener('scroll', railProg, { passive: true });

  /* ---------- calculator ---------- */
  const iP = $('#iPrice'), iD = $('#iDown'), iR = $('#iRate'); let years = 30, shown = 0;
  const circ = 2 * Math.PI * 48;
  function setFill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
  function calc() {
    [iP, iD, iR].forEach(setFill);
    const price = +iP.value, dn = +iD.value, rate = +iR.value;
    $('#oPrice').textContent = money(price); $('#oDown').textContent = dn + '% · ' + money(Math.round(price * dn / 100)); $('#oRate').textContent = rate.toFixed(2) + '%';
    const loan = price * (1 - dn / 100), r = rate / 1200, n = years * 12;
    const pi = loan * r / (1 - Math.pow(1 + r, -n)), tax = price * .0118 / 12, ins = price * .0032 / 12 + 240, tot = pi + tax + ins;
    $('#lPI').textContent = money(Math.round(pi)); $('#lTax').textContent = money(Math.round(tax)); $('#lIns').textContent = money(Math.round(ins));
    $('#cLoan').textContent = 'Loan ' + money(Math.round(loan));
    const parts = [pi, tax, ins].map((v) => v / tot * circ); let off = 0;
    ['s1', 's2', 's3'].forEach((c, i) => { const el = $('.' + c, $('.donut')); const len = Math.max(0, parts[i] - 2.5); el.style.strokeDasharray = `${len} ${circ - len}`; el.style.strokeDashoffset = -off; off += parts[i]; });
    const from = shown, t0 = performance.now(); (function s(nw) { const k = clamp((nw - t0) / 500); shown = lerp(from, tot, eo(k)); $('#oMonthly').textContent = money(Math.round(shown)); if (k < 1) requestAnimationFrame(s); })(t0);
  }
  [iP, iD, iR].forEach((r) => r.addEventListener('input', calc));
  $$('#term button').forEach((b, i) => b.addEventListener('click', () => { years = +b.dataset.y; $$('#term button').forEach((x) => x.classList.toggle('on', x === b)); $('#term i').style.transform = `translateX(${i * 100}%)`; calc(); }));
  $('#preapprove').addEventListener('click', (e) => { e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 90); toast('Pre-approval started — check your inbox in a minute.'); });
  calc();

  /* ---------- vibe finder ---------- */
  const N = [['Brooklyn Heights', 'Historic · leafy · calm', 30, 15, 25], ['Williamsburg', 'Creative · waterfront · buzzing', 85, 70, 70], ['Tribeca', 'Cast-iron lofts · quiet luxury', 55, 55, 80], ['Upper West Side', 'Prewar · park-side · classic', 45, 25, 40], ['Hudson Yards', 'Glass towers · skyline · fast', 78, 96, 95], ['Park Slope', 'Brownstones · strollers · green', 38, 18, 20], ['Astoria', 'Food-first · relaxed · diverse', 55, 45, 55], ['Harlem', 'Soulful · stoops · rising', 62, 25, 58]];
  const rank = $('#rank'); rank.style.setProperty('--n', 6);
  const rLis = N.map((n) => { const li = document.createElement('li'); li.innerHTML = `<i class="bar"></i><span class="n"></span><span class="nm">${n[0]}<small>${n[1]}</small></span><span class="pc"></span>`; rank.appendChild(li); return li; });
  function vibe() {
    const pv = [+$('#vPace').value, +$('#vStyle').value, +$('#vSet').value]; ['#vPace', '#vStyle', '#vSet'].forEach((s) => setFill($(s)));
    const sc = N.map((n, i) => { const d = Math.hypot(n[2] - pv[0], n[3] - pv[1], n[4] - pv[2]); return { i, pc: Math.round(clamp(100 - d / 1.55, 0, 100)) }; }).sort((a, b) => b.pc - a.pc);
    sc.forEach((s, r) => { const li = rLis[s.i]; li.style.transform = `translateY(${r * 58}px)`; li.style.opacity = r < 6 ? 1 : 0; li.style.pointerEvents = r < 6 ? '' : 'none'; $('.n', li).textContent = String(r + 1).padStart(2, '0'); $('.pc', li).textContent = s.pc + '%'; $('.bar', li).style.width = s.pc + '%'; li.style.background = ''; li.classList.toggle('top', r === 0); });
  }
  ['#vPace', '#vStyle', '#vSet'].forEach((s) => $(s).addEventListener('input', vibe)); vibe();

  /* ---------- footer ---------- */
  const ftWm = $('#ftWm'), footer = $('#footer');
  add(footer, (p, it) => { const q = clamp((sy + vh - it.t) / (vh * .9)); ftWm.style.setProperty('--wy', ((1 - eo(q)) * 46).toFixed(1) + '%'); });
  const shimRect = $('#shimRect'); let shimBusy = false;
  function shimmer() { if (shimBusy) return; shimBusy = true; const t0 = performance.now(); (function s(n) { const k = clamp((n - t0) / 1400); shimRect.setAttribute('x', (-120 + 900 * eio(k)).toFixed(1)); shimRect.setAttribute('opacity', (Math.sin(k * Math.PI) * .7).toFixed(2)); if (k < 1) requestAnimationFrame(s); else shimBusy = false; })(t0); }
  ftWm.addEventListener('mouseenter', shimmer); setInterval(() => { if (footer.getBoundingClientRect().top < vh * .6) shimmer(); }, 5200);
  $('#news').addEventListener('submit', (e) => { e.preventDefault(); const r = $('#news button').getBoundingClientRect(); burst(r.left, r.top, 100); toast('You’re in. Welcome to OAKLINE, ' + $('#newsIn').value.split('@')[0] + '.'); $('#newsIn').value = ''; });
  $('#portal').addEventListener('click', (e) => { e.preventDefault(); toast('Agent portal is for demo purposes only.'); });

  /* ---------- dots + nav ---------- */
  const secs = $$('main > section, main > footer'), dotsEl = $('#dots');
  secs.forEach((s) => { const a = document.createElement('a'); a.href = '#' + s.id; a.dataset.go = ''; a.innerHTML = `<span>${s.dataset.label}</span><i></i>`; dotsEl.appendChild(a); });
  const dotA = $$('a', dotsEl), nav = $('#nav'); const darkSecs = [$('#services'), $('#cta'), $('#footer')];
  let lastY = 0, secTops = [];
  function navState() {
    nav.classList.toggle('solid', sy > 80);
    const dy = sy - lastY; if (Math.abs(dy) > 6) { nav.classList.toggle('hide', dy > 0 && sy > vh * .5 && !hovNav); lastY = sy; }
    const probe = (y) => { const tools = $('#tools'); const tr = tools.getBoundingClientRect(); if (tr.top + vh * .25 < y && tr.bottom > y) return true; return darkSecs.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; }); };
    nav.classList.toggle('on-dark', probe(40)); dotsEl.classList.toggle('on-dark', probe(vh / 2));
    let act = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= vh * .5) act = i; }); dotA.forEach((a, i) => a.classList.toggle('on', i === act));
    $('#progress b').style.transform = `scaleX(${clamp(sy / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(4)})`;
  }
  let hovNav = false; nav.addEventListener('mouseenter', () => { hovNav = true; nav.classList.remove('hide'); }); nav.addEventListener('mouseleave', () => { hovNav = false; });

  /* ---------- dock ---------- */
  $$('#timeSeg button').forEach((b) => b.addEventListener('click', () => applyTime(b.dataset.t)));
  $('#savedBtn').addEventListener('click', openSaved);

  /* ---------- toast / confetti ---------- */
  let tt; const toastEl = $('#toast');
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 3000); }
  const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], cRun = false;
  function burst(x, y, n = 60, cols) {
    cv.width = innerWidth; cv.height = innerHeight; cols = cols || ['#7fb4ff', '#ffb870', '#ffffff', '#c58cff', '#5be0a4', '#ff6b8b'];
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, g: .28 + Math.random() * .12, r: 3 + Math.random() * 5, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1 }); }
    if (!cRun) { cRun = true; requestAnimationFrame(cLoop); }
  }
  function cLoop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => { p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= .011; cx.save(); cx.globalAlpha = clamp(p.life * 1.4); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c; cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); cx.restore(); });
    parts = parts.filter((p) => p.life > 0 && p.y < cv.height + 20);
    if (parts.length) requestAnimationFrame(cLoop); else { cRun = false; cx.clearRect(0, 0, cv.width, cv.height); }
  }

  /* ---------- overlays: cmdk / sign in / saved ---------- */
  const cmd = $('#cmdk'), cmdIn = $('#cmdIn'), cmdList = $('#cmdList'); let cmdSel = 0, cmdItems = [];
  const PAGES = [['Home', '#hero', '⌂'], ['Our story', '#about', '✦'], ['How it works', '#process', '↻'], ['Join the movement', '#movement', '◐'], ['Client voices', '#voices', '❝'], ['Buy · Sell · Rent', '#services', '▤'], ['Featured listings', '#listings', '⌂'], ['Mortgage calculator', '#tools', '＄'], ['Neighborhood vibe finder', '#tools', '◎'], ['Blog & resources', '#journal', '✎'], ['Contact & newsletter', '#footer', '✉']];
  function cmdAll() {
    const o = PAGES.map((p) => ({ t: p[0], k: 'Page', ic: p[2], run: () => goSel(p[1]) }));
    L.forEach((l, i) => o.push({ t: l.n + ' — ' + l.loc, k: 'Home', ic: '⌂', run: () => { goSel('#listings'); setTimeout(() => { const c = $$('.card')[i]; rail.scrollTo({ left: c.offsetLeft - 60, behavior: 'smooth' }); c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 900 }); }, 1500); } }));
    N.forEach((n) => o.push({ t: n[0] + ' — ' + n[1], k: 'Area', ic: '◎', run: () => goSel('#tools') }));
    TIMES.forEach((t) => o.push({ t: 'Set hero to ' + LABEL[t], k: 'Action', ic: '☼', run: () => { applyTime(t); goTo(0); } }));
    o.push({ t: 'Open saved homes', k: 'Action', ic: '♡', run: openSaved }, { t: 'Sign in', k: 'Action', ic: '→', run: openSign });
    return o;
  }
  function renderCmd() {
    const q = cmdIn.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    cmdItems = cmdAll().filter((o) => q.every((w) => o.t.toLowerCase().includes(w) || o.k.toLowerCase().includes(w))).slice(0, 9); cmdSel = 0;
    cmdList.innerHTML = cmdItems.length ? cmdItems.map((o, i) => `<li data-i="${i}" class="${i ? '' : 'on'}"><span class="ic">${o.ic}</span>${o.t}<small>${o.k}</small></li>`).join('') : '<li class="none">No results</li>';
  }
  function openCmd() { closeAll(); cmd.hidden = false; cmdIn.value = ''; renderCmd(); setTimeout(() => cmdIn.focus(), 30); }
  function runCmd(i) { const o = cmdItems[i]; if (!o) return; cmd.hidden = true; o.run(); }
  cmdIn.addEventListener('input', renderCmd);
  cmdList.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) runCmd(+li.dataset.i); });
  cmdList.addEventListener('mousemove', (e) => { const li = e.target.closest('li[data-i]'); if (li) { cmdSel = +li.dataset.i; $$('li', cmdList).forEach((x, i) => x.classList.toggle('on', i === cmdSel)); } });
  cmd.addEventListener('mousedown', (e) => { if (e.target === cmd) cmd.hidden = true; });
  const signin = $('#signin'), saveM = $('#saved');
  function openSign() { closeAll(); signin.hidden = false; setTimeout(() => $('input', signin).focus(), 30); }
  function openSaved() { closeAll(); saveM.hidden = false; const list = $('#savedList'); list.innerHTML = saved.size ? [...saved].map((i) => `<div class="sv"><img alt="" src="${A.uri(A.listing(L[i].sc, L[i].sd, 'golden'))}"><div><b>${L[i].n}</b><small>${L[i].loc} · ${money(L[i].p)}</small></div><small>${L[i].b} bd</small></div>`).join('') : '<div class="empty">Nothing saved yet — tap the heart on any listing.</div>'; }
  function closeAll() { cmd.hidden = true; signin.hidden = true; saveM.hidden = true; }
  $('#openSignin').addEventListener('click', openSign);
  $$('.overlay').forEach((o) => o.addEventListener('mousedown', (e) => { if (e.target === o) o.hidden = true; }));
  $$('[data-close]').forEach((b) => b.addEventListener('click', closeAll));
  $('#signForm').addEventListener('submit', (e) => { e.preventDefault(); closeAll(); burst(innerWidth / 2, innerHeight / 3, 120); toast('Welcome back. Your tours are synced.'); });
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmd.hidden ? openCmd() : closeAll(); return; }
    if (e.key === 'Escape') closeAll();
    if (!cmd.hidden) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); cmdSel = (cmdSel + (e.key === 'ArrowDown' ? 1 : -1) + cmdItems.length) % Math.max(1, cmdItems.length); $$('li', cmdList).forEach((x, i) => x.classList.toggle('on', i === cmdSel)); const on = $('li.on', cmdList); on && on.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') runCmd(cmdSel);
      return;
    }
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === '/') { e.preventDefault(); openCmd(); }
    if (e.key.toLowerCase() === 't') applyTime(TIMES[(TIMES.indexOf(curTheme) + 1) % 4]);
  });

  /* ---------- cursor + magnets ---------- */
  const cursorEl = $('#cursor'), cDot = $('#cursor i'), cRing = $('#cursor b'); let cX = -100, cY = -100, rX = -100, rY = -100;
  if (!touch) {
    document.body.classList.add('hascursor');
    addEventListener('pointermove', (e) => {
      cX = e.clientX; cY = e.clientY; tmx = (e.clientX / vw - .5) * 2; tmy = (e.clientY / vh - .5) * 2;
      const t = e.target; if (!t.closest) return;
      const btn = t.closest('button,input,label,.row,a:not([data-cursor]),.chips'); const lab = t.closest('[data-cursor]');
      if (btn) { cursorEl.classList.add('link'); cursorEl.classList.remove('label'); cRing.textContent = ''; }
      else if (lab) { cursorEl.classList.add('label'); cursorEl.classList.remove('link'); cRing.textContent = lab.dataset.cursor; }
      else { cursorEl.classList.remove('link', 'label'); cRing.textContent = ''; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cX = -100; cY = -100; });
    $$('.magnet').forEach((m) => {
      m.addEventListener('pointermove', (e) => { const r = m.getBoundingClientRect(); m.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .28).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .38).toFixed(1)}px)`; });
      m.addEventListener('pointerleave', () => { m.style.transform = ''; });
    });
  }

  /* ---------- clock ---------- */
  function clock() { $('#clock').textContent = 'NYC ' + new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' }); }
  clock(); setInterval(clock, 15000);

  /* ---------- main loop ---------- */
  function frame(now) {
    const t = now / 1000, target = scrollY;
    sy += (target - sy) * (reduce ? 1 : .11); if (Math.abs(target - sy) < .1) sy = target;
    if (sy < heroEl.offsetHeight + 40) hero(t);
    for (let i = 0; i < items.length; i++) { const it = items[i], top = it.t - sy; if (top > vh * 1.6 || top + it.h < -vh * .6) continue; it.fn(0, it); }
    navState(); checkReveals();
    if (!touch) { rX += (cX - rX) * .18; rY += (cY - rY) * .18; cDot.style.transform = `translate(${cX}px,${cY}px)`; cRing.style.transform = `translate(${rX}px,${rY}px)`; }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  const preLetters = $('#preLetters');
  A.WM_PATHS.forEach((d, i) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('fill-rule', 'evenodd'); p.style.transitionDelay = (i * 90) + 'ms'; preLetters.appendChild(p); });
  applyTime(qs.get('t') && A.THEMES[qs.get('t')] ? qs.get('t') : 'day');
  measure(); [400, 1500, 3500].forEach((d) => setTimeout(measure, d)); addEventListener('load', measure); addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  document.body.classList.add('lock');
  scrollTo(0, 0); if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  requestAnimationFrame(frame);
  requestAnimationFrame(() => preLetters.classList.add('go'));

  function finishPre() {
    $('#pre').classList.add('done'); document.body.classList.remove('lock'); measure();
    setTimeout(() => { hCopy.classList.add('in'); }, 500);
    setTimeout(() => $('#dock').classList.add('show'), 1700);
    setTimeout(() => { $('#pre').style.display = 'none'; }, 1400);
  }
  if (qs.has('nopre')) { $('#pre').style.display = 'none'; document.body.classList.remove('lock'); hCopy.classList.add('in'); $('#dock').classList.add('show'); }
  else {
    const t0 = performance.now(), D = 2400, num = $('#preNum'), bar = $('#preBar');
    (function s(n) { const k = clamp((n - t0) / D), v = eio(k); num.textContent = String(Math.round(v * 100)).padStart(3, '0'); bar.style.width = v * 100 + '%'; if (k < 1) requestAnimationFrame(s); else setTimeout(finishPre, 350); })(t0);
  }
  window.__oakline = { applyTime, goTo, burst, toast };
})();

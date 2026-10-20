/* ALOFT — procedural art. Every "photo" on the site is generated here as SVG,
   so the whole site is one portable file. Swap any scene for a real <img> later. */
(function () {
  const R = (s) => { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  let U = 0;
  const f = (n) => +n.toFixed(1);
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map((s, i) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops) => `<radialGradient id="${id}">${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}" stop-opacity="${s[2] == null ? 1 : s[2]}"/>`).join('')}</radialGradient>`;
  const blur = (id, d) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${d}"/></filter>`;
  const grain = (k, w, h, o = 0.5) => `<filter id="n${k}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.1 0 0 0 -.5"/></filter><rect width="${w}" height="${h}" filter="url(#n${k})" opacity="${o}"/>`;
  const vign = (k, w, h, a = 0.45) => `<radialGradient id="v${k}" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${a}"/></radialGradient><rect width="${w}" height="${h}" fill="url(#v${k})"/>`;
  const svg = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;
  const uri = (s) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

  /* ---------- themes (time of day) ---------- */
  const THEMES = {
    dawn:   { sky: ['#6f7fc4', '#e8a1b4', '#ffd5b0'], cloud: [255, 226, 214], glow: .35, paper: '#fbeee9', ink: '#1a1218', sun: [.30, .70, '#ffe2b8'], tint: 'rgba(255,170,150,.10)', stars: 0, night: 0 },
    day:    { sky: ['#4f9de0', '#8cc6ee', '#d7ecfa'], cloud: [255, 255, 255], glow: .12, paper: '#e8f3fb', ink: '#0b0e13', sun: [.78, .22, '#fff6d8'], tint: 'rgba(0,0,0,0)', stars: 0, night: 0 },
    golden: { sky: ['#4a6fb5', '#f0a36e', '#ffd9a3'], cloud: [255, 224, 190], glow: .75, paper: '#fcefdc', ink: '#17100b', sun: [.22, .62, '#ffd28a'], tint: 'rgba(255,150,60,.12)', stars: 0, night: .1 },
    night:  { sky: ['#050a1c', '#14224a', '#3a3f7a'], cloud: [120, 134, 190], glow: 1, paper: '#0d1426', ink: '#e9eeff', sun: [.74, .20, '#dfe7ff'], tint: 'rgba(10,20,80,.30)', stars: 1, night: 1 },
  };

  /* ---------- the wordmark: custom geometric ALOFT, 496 x 100 ---------- */
  const WM_PATHS = [
    'M0 100 L34 0 H66 L100 100 H72 L66 78 H34 L28 100 Z M42 54 H58 L50 26 Z',
    'M112 0 H140 V74 H192 V100 H112 Z',
    'M234 0 H274 A30 30 0 0 1 304 30 V70 A30 30 0 0 1 274 100 H234 A30 30 0 0 1 204 70 V30 A30 30 0 0 1 234 0 Z M232 26 A14 14 0 0 0 232 74 H276 A14 14 0 0 0 276 26 Z',
    'M316 0 H394 V26 H344 V40 H382 V64 H344 V100 H316 Z',
    'M406 0 H496 V26 H465 V100 H437 V26 H406 Z',
  ];
  const WM = WM_PATHS.join(' ');

  /* ---------- HERO BUILDING (golden-hour rooftop, transparent bg) ---------- */
  function building(theme) {
    const T = THEMES[theme] || THEMES.day, k = 'b' + U++, r = R(7), W = 1400, H = 720;
    const g = T.glow;
    let defs = lg(k + 'f', [[0, '#f2dcc8'], [1, '#c79f86']]) + lg(k + 'f2', [[0, '#ecd2bb'], [1, '#b98e77']]) +
      lg(k + 'w', [[0, '#10243b'], [.55, '#274866'], [1, g > .5 ? '#ffbe74' : '#3b6488']]) +
      lg(k + 'wl', [[0, '#17283c'], [.6, '#5b3d2e'], [1, '#ffc27a']]) +
      lg(k + 'sh', [[0, '#fff', .35], [.5, '#fff', 0], [1, '#fff', .1]], 0, 0, 1, 1) + blur(k + 'bl', 5) + blur(k + 'bl2', 1.4) +
      lg(k + 'pool', [[0, '#79d3e8'], [1, '#2a7fa6']]) + rg(k + 'glow', [[0, '#ffbf70', .9], [1, '#ffbf70', 0]]);
    let b = '';
    // shadow base
    // lower tier
    b += `<rect x="60" y="430" width="1280" height="300" fill="url(#${k}f)"/>`;
    b += `<rect x="60" y="424" width="1280" height="12" fill="#fff4e8" opacity=".85"/>`;
    // lower windows
    for (let i = 0; i < 9; i++) {
      const x = 96 + i * 138, lit = r() < (.25 + g * .65);
      b += `<rect x="${x}" y="470" width="112" height="190" fill="url(#${k}${lit ? 'wl' : 'w'})"/><rect x="${x}" y="470" width="112" height="190" fill="url(#${k}sh)"/>`;
      for (let m = 1; m < 4; m++) b += `<rect x="${x + m * 28 - 1}" y="470" width="2" height="190" fill="#2b2420" opacity=".55"/>`;
      b += `<rect x="${x}" y="560" width="112" height="2" fill="#2b2420" opacity=".5"/>`;
    }
    // mid tier
    b += `<rect x="300" y="250" width="820" height="190" fill="url(#${k}f2)"/><rect x="290" y="242" width="840" height="14" fill="#fff4e8"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 340 + i * 152, lit = r() < (.3 + g * .6);
      b += `<rect x="${x}" y="290" width="124" height="130" fill="url(#${k}${lit ? 'wl' : 'w'})"/><rect x="${x}" y="290" width="124" height="130" fill="url(#${k}sh)"/>`;
      b += `<rect x="${x + 61}" y="290" width="2" height="130" fill="#2b2420" opacity=".6"/>`;
    }
    // pool strip
    b += `<rect x="300" y="420" width="820" height="16" fill="url(#${k}pool)" opacity=".9"/><rect x="300" y="420" width="820" height="4" fill="#fff" opacity=".5"/>`;
    // top tier
    b += `<rect x="660" y="96" width="380" height="160" fill="url(#${k}f)"/><rect x="646" y="84" width="408" height="16" fill="#fff4e8"/>`;
    for (let i = 0; i < 4; i++) {
      const x = 690 + i * 84, lit = r() < (.35 + g * .6);
      b += `<rect x="${x}" y="120" width="68" height="112" fill="url(#${k}${lit ? 'wl' : 'w'})"/><rect x="${x}" y="120" width="68" height="112" fill="url(#${k}sh)"/><rect x="${x + 33}" y="120" width="2" height="112" fill="#2b2420" opacity=".6"/>`;
    }
    // pergola top-left
    b += `<rect x="330" y="205" width="260" height="6" fill="#6a4b3a"/>` + [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${336 + i * 40}" y="205" width="5" height="40" fill="#6a4b3a"/>`).join('');
    // plants
    const plant = (x, y, n, s) => { let o = ''; for (let i = 0; i < n; i++) { const px = x + (r() - .5) * s * 2.4, py = y - r() * s * .7, rr = s * (.35 + r() * .5); const c = ['#3d5a2c', '#58722f', '#7d8a35', '#a0702d', '#c0722b', '#2f4a28'][Math.floor(r() * 6)]; o += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(rr * 1.3)}" ry="${f(rr)}" fill="${c}" opacity=".95"/>`; } return o; };
    b += `<g filter="url(#${k}bl2)">` + plant(380, 250, 22, 36) + plant(560, 244, 18, 30) + plant(1060, 246, 20, 34) + plant(880, 96, 16, 26) + plant(740, 92, 12, 22) + plant(120, 430, 18, 34) + plant(300, 436, 14, 26) + plant(1230, 430, 20, 38) + plant(1090, 438, 14, 24) + plant(470, 438, 10, 22) + `</g>`;
    // glow spill
    if (g > .3) b += `<ellipse cx="700" cy="560" rx="560" ry="190" fill="url(#${k}glow)" opacity="${f(g * .35)}"/>`;
    // cloud-bottom fade
    defs += lg(k + 'fade', [[.55, '#fff', 0], [1, '#fff', 0]]);
    return svg(W, H, defs, b + grain(k, W, H, .12));
  }

  /* ---------- reusable fragments ---------- */
  const skyGrad = (k, stops) => lg(k, stops.map((c, i) => [i / (stops.length - 1), c]));
  const bokeh = (r, n, w, h, cols, k) => { let o = ''; for (let i = 0; i < n; i++) { const c = cols[Math.floor(r() * cols.length)]; o += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(6 + r() * 26)}" fill="${c}" opacity="${f(.12 + r() * .35)}"/>`; } return `<g filter="url(#${k}bk)">${o}</g>`; };

  /* ---------- STREET (red brick houses, cars, motion blur) ---------- */
  function street() {
    const k = 's' + U++, r = R(11), W = 1600, H = 560;
    const defs = skyGrad(k + 'sk', ['#f4c595', '#f6dcc0']) + lg(k + 'rd', [[0, '#1b1b21'], [1, '#08080b']]) + blur(k + 'mb', 7) + blur(k + 'b1', 2.5) +
      lg(k + 'br', [[0, '#d65a2c'], [1, '#a53f20']]);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/>`;
    for (let i = 0; i < 6; i++) {
      const x = i * 290 - 40, w = 270, y = 40 + r() * 30;
      b += `<rect x="${x}" y="${y}" width="${w}" height="330" fill="${i % 2 ? '#e9dccd' : 'url(#' + k + 'br)'}"/>`;
      b += `<rect x="${x - 6}" y="${y - 8}" width="${w + 12}" height="14" fill="#f5efe6"/>`;
      for (let c = 0; c < 3; c++) for (let rw = 0; rw < 2; rw++) b += `<rect x="${x + 22 + c * 82}" y="${y + 34 + rw * 120}" width="56" height="82" fill="#25313d"/><rect x="${x + 22 + c * 82}" y="${y + 34 + rw * 120}" width="56" height="82" fill="none" stroke="#f7f2ea" stroke-width="5"/><rect x="${x + 48 + c * 82}" y="${y + 34 + rw * 120}" width="4" height="82" fill="#f7f2ea"/>`;
      b += `<rect x="${x + 100}" y="${y + 270}" width="66" height="60" fill="#f4ede2"/>`;
    }
    b += `<rect y="350" width="${W}" height="${H - 350}" fill="url(#${k}rd)"/><rect y="344" width="${W}" height="10" fill="#807a72"/>`;
    b += `<rect y="470" width="${W}" height="4" fill="#fff" opacity=".18"/>`;
    const car = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 40 Q4 20 36 16 L96 12 Q128 12 140 38 L150 44 V58 H0 Z" fill="${c}"/><path d="M34 20 L92 16 Q112 18 120 36 H28 Z" fill="#0b1119" opacity=".85"/><circle cx="34" cy="60" r="16" fill="#0c0c0f"/><circle cx="118" cy="60" r="16" fill="#0c0c0f"/><circle cx="34" cy="60" r="7" fill="#9aa"/><circle cx="118" cy="60" r="7" fill="#9aa"/></g>`;
    b += `<g filter="url(#${k}mb)" opacity=".85"><rect x="40" y="380" width="360" height="56" rx="26" fill="#b5c6d9"/></g>` + car(60, 360, 1.7, '#cfd9e6');
    b += car(560, 400, 1.9, '#12141a') + `<g filter="url(#${k}mb)" opacity=".7"><rect x="1100" y="410" width="500" height="60" rx="28" fill="#3a2a2a"/></g>` + car(1180, 390, 1.9, '#20232b');
    b += `<rect y="${H - 60}" width="${W}" height="60" fill="#000" opacity=".25"/>`;
    return svg(W, H, defs, b + vign(k, W, H, .3) + grain(k, W, H, .16));
  }

  /* ---------- PORTRAIT (selfie, red trousers, blue slats) ---------- */
  function portrait() {
    const k = 'p' + U++, W = 800, H = 1000;
    const defs = lg(k + 'w', [[0, '#2d7fa6'], [1, '#144a6e']], 0, 0, 1, 0) + lg(k + 'wl', [[0, '#fff', .2], [.5, '#fff', 0], [1, '#000', .25]], 0, 0, 1, 0);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}w)"/>`;
    for (let i = 0; i < 40; i++) b += `<rect x="${i * 20}" width="2" height="${H}" fill="#06243a" opacity=".35"/>`;
    b += `<rect width="${W}" height="${H}" fill="url(#${k}wl)"/>`;
    b += `<ellipse cx="410" cy="960" rx="260" ry="40" fill="#000" opacity=".25"/>`;
    // legs red
    b += `<path d="M330 590 L300 960 H368 L412 700 L452 960 H520 L486 590 Z" fill="#d12a2f"/><path d="M412 700 L428 590 H486 L452 960" fill="#a81c22" opacity=".35"/>`;
    // top
    b += `<path d="M322 330 Q410 300 498 330 L520 600 H300 Z" fill="#eef0f2"/><path d="M322 330 L290 420 L318 430 L340 380" fill="#e1e5e8"/>`;
    // raised arm
    b += `<path d="M496 336 L560 250 L584 150 L560 144 L534 236 L474 310 Z" fill="#c98e6c"/><rect x="552" y="96" width="40" height="64" rx="8" fill="#0d0f13" transform="rotate(8 570 128)"/>`;
    // other arm + bag
    b += `<path d="M326 340 L282 520 L312 528 L350 380 Z" fill="#c98e6c"/><rect x="262" y="500" width="76" height="62" rx="8" fill="#6b1f24"/>`;
    // head
    b += `<rect x="388" y="268" width="40" height="64" rx="16" fill="#c08463"/><ellipse cx="410" cy="230" rx="52" ry="62" fill="#cd9573"/><path d="M356 226 Q352 150 420 148 Q480 152 468 232 Q452 180 410 184 Q372 190 356 226 Z" fill="#2a1a14"/><path d="M360 214 Q344 280 372 300 Q356 250 370 214Z" fill="#2a1a14"/>`;
    return svg(W, H, defs, b + vign(k, W, H, .3) + grain(k, W, H, .15));
  }

  /* ---------- GREENHOUSE / vertical garden ---------- */
  function greenhouse() {
    const k = 'g' + U++, r = R(23), W = 1200, H = 700;
    const defs = lg(k + 'bg', [[0, '#0c2216'], [1, '#05130b']]) + blur(k + 'bl', 1.6) + blur(k + 'bk', 9);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/>`;
    const cols = ['#1d5a2b', '#2f7a34', '#467f2b', '#7aa33a', '#154a24', '#8bb04a', '#245c3d'];
    for (let i = 0; i < 520; i++) { const x = r() * W, y = r() * H, c = cols[Math.floor(r() * cols.length)]; b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 22)}" ry="${f(4 + r() * 10)}" fill="${c}" opacity="${f(.55 + r() * .4)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; }
    for (let i = 0; i < 7; i++) { const x = 90 + i * 160 + r() * 30, y = 190 + r() * 120; b += `<g filter="url(#${k}bl)"><path d="M${x} ${y + 150} V${y + 40} Q${x} ${y - 10} ${x + 34} ${y - 10} Q${x + 70} ${y - 10} ${x + 70} ${y + 40} V${y + 150} Z" fill="#a9c4c0" opacity=".55"/><path d="M${x + 8} ${y + 146} V${y + 44} Q${x + 8} ${y} ${x + 34} ${y} Q${x + 62} ${y} ${x + 62} ${y + 44} V${y + 146} Z" fill="#ffe3a6" opacity="${f(.3 + r() * .5)}"/></g>`; }
    for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H; b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(10 + r() * 26)}" ry="${f(5 + r() * 12)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${f(.5 + r() * .4)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; }
    b += bokeh(r, 14, W, H, ['#ffe9a8', '#bff0a8'], k);
    return svg(W, H, defs, b + vign(k, W, H, .55) + grain(k, W, H, .14));
  }

  /* ---------- TWO PEOPLE WITH COFFEE ---------- */
  function coffee() {
    const k = 'c' + U++, r = R(31), W = 1200, H = 640;
    const defs = lg(k + 'bg', [[0, '#8d9fb3'], [1, '#2b3646']]) + blur(k + 'bk', 14) + blur(k + 'b', 2);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/>` + bokeh(r, 22, W, H, ['#ffd9a0', '#9fd0ff', '#fff'], k);
    // left person navy coat
    b += `<path d="M30 640 L70 300 Q200 220 330 300 L400 640 Z" fill="#14233d"/><path d="M160 250 L200 420 L240 250 Z" fill="#e8ecf2"/><rect x="170" y="150" width="60" height="110" rx="26" fill="#c68f70"/>`;
    b += `<path d="M232 380 L300 330 L330 380 L250 440 Z" fill="#14233d"/><rect x="300" y="290" width="62" height="86" rx="10" fill="#d9d2c4"/><rect x="298" y="282" width="66" height="16" rx="6" fill="#f2efe8"/>`;
    // right person plaid
    b += `<path d="M520 640 L560 300 Q700 220 830 300 L900 640 Z" fill="#2c2f36"/>`;
    for (let i = 0; i < 12; i++) b += `<rect x="${540 + i * 30}" y="300" width="4" height="340" fill="#7a808c" opacity=".35"/><rect x="520" y="${310 + i * 28}" width="390" height="4" fill="#7a808c" opacity=".3"/>`;
    b += `<path d="M640 150 Q700 110 760 150 L770 360 Q700 400 630 360 Z" fill="#4a2b1d"/><ellipse cx="700" cy="215" rx="42" ry="56" fill="#d2a184"/><path d="M650 200 Q690 150 750 190 Q730 150 690 150 Q650 160 650 200Z" fill="#4a2b1d"/>`;
    b += `<rect x="560" y="360" width="62" height="86" rx="10" fill="#d9d2c4"/><rect x="558" y="352" width="66" height="16" rx="6" fill="#f2efe8"/>`;
    return svg(W, H, defs, b + vign(k, W, H, .35) + grain(k, W, H, .15));
  }

  /* ---------- BUY: classic facade with tree ---------- */
  function facade() {
    const k = 'f' + U++, r = R(41), W = 1400, H = 700;
    const defs = skyGrad(k + 'sk', ['#6a93b8', '#e8c7a1']) + lg(k + 'st', [[0, '#c9b49a'], [1, '#8b7761']]) + blur(k + 'b', 3);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/><rect x="380" width="1100" height="${H}" fill="url(#${k}st)"/>`;
    for (let row = 0; row < 6; row++) { b += `<rect x="380" y="${row * 130 + 40}" width="1100" height="4" fill="#5b4b3a" opacity=".4"/>`; for (let c = 0; c < 8; c++) { const x = 420 + c * 128, y = row * 130 + 62; b += `<rect x="${x}" y="${y}" width="62" height="86" fill="#1c2733"/><rect x="${x}" y="${y}" width="62" height="86" fill="none" stroke="#e7d9c3" stroke-width="5"/><rect x="${x - 8}" y="${y + 86}" width="78" height="9" fill="#3a3027"/><rect x="${x + 29}" y="${y}" width="3" height="86" fill="#e7d9c3"/>`; } }
    b += `<path d="M0 ${H} V120 Q140 40 300 140 Q420 60 440 250 V${H} Z" fill="#2b4a24" filter="url(#${k}b)"/>`;
    for (let i = 0; i < 80; i++) b += `<circle cx="${f(r() * 420)}" cy="${f(60 + r() * 420)}" r="${f(8 + r() * 24)}" fill="${['#c9822b', '#a05a1e', '#3d6a2a'][Math.floor(r() * 3)]}" opacity=".7"/>`;
    return svg(W, H, defs, b + vign(k, W, H, .45) + grain(k, W, H, .14));
  }

  /* ---------- SELL: profile portrait with bokeh ---------- */
  function profile() {
    const k = 'q' + U++, r = R(53), W = 1400, H = 700;
    const defs = lg(k + 'bg', [[0, '#0c1424'], [1, '#202e44']], 0, 0, 1, 0) + blur(k + 'bk', 12) + blur(k + 'h', 1.2);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/>` + bokeh(r, 20, W, H, ['#e8b27a', '#8aa7d6', '#fff'], k);
    b += `<path d="M360 700 Q380 560 470 520 L620 480 L760 520 Q840 560 860 700 Z" fill="#0c1018"/><rect x="560" y="400" width="70" height="120" fill="#c89b7e"/>`;
    b += `<path d="M470 150 Q470 70 590 60 Q700 64 720 170 Q730 260 690 340 L670 420 Q630 450 580 430 Q560 360 520 330 Q470 290 470 150Z" fill="#d6aa8c"/>`;
    b += `<path d="M430 220 Q430 40 600 30 Q760 30 760 210 Q760 330 700 420 Q740 250 700 190 Q630 130 520 170 Q480 220 500 360 Q430 330 430 220Z" fill="#c9a064"/><path d="M455 250 Q430 330 470 420" stroke="#c9a064" stroke-width="40" fill="none" stroke-linecap="round"/>`;
    b += `<ellipse cx="520" cy="250" rx="10" ry="6" fill="#3a2a22"/><path d="M468 300 Q480 322 506 318" stroke="#9b6a5a" stroke-width="5" fill="none"/>`;
    b += `<g transform="translate(1000 300)"><rect x="-4" y="-4" width="8" height="8" fill="none"/></g>`;
    return svg(W, H, defs, b + vign(k, W, H, .5) + grain(k, W, H, .14));
  }

  /* ---------- RENT: night windows ---------- */
  function nightflats() {
    const k = 'n' + U++, r = R(61), W = 1400, H = 700;
    const defs = lg(k + 'bg', [[0, '#0a1226'], [1, '#1b1630']]) + blur(k + 'bk', 6);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/>`;
    for (let c = 0; c < 6; c++) { const x = c * 240 - 20, h = 320 + r() * 280; b += `<rect x="${x}" y="${H - h}" width="220" height="${h}" fill="#10162a"/>`; for (let i = 0; i < 7; i++) for (let j = 0; j < Math.floor(h / 60); j++) if (r() < .55) b += `<rect x="${x + 16 + i * 29}" y="${H - h + 16 + j * 56}" width="19" height="32" fill="${['#ffcf8a', '#ffb866', '#9fd0ff', '#fff2c4'][Math.floor(r() * 4)]}" opacity="${f(.5 + r() * .5)}"/>`; }
    b += bokeh(r, 16, W, H, ['#ffcf8a', '#ff9f6e', '#8ab4ff'], k);
    return svg(W, H, defs, b + vign(k, W, H, .45) + grain(k, W, H, .14));
  }

  /* ---------- BRIDGE + skyline ---------- */
  function bridge() {
    const k = 'r' + U++, r = R(71), W = 1200, H = 700;
    const defs = skyGrad(k + 'sk', ['#2f8fe0', '#9fd3f5', '#f3ddc6']) + lg(k + 'wt', [[0, '#3b86b0'], [1, '#0d4468']]) + lg(k + 'st', [[0, '#9a8a78'], [1, '#6a5c4e']]);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/>`;
    for (let i = 0; i < 9; i++) { const x = i * 56 - 10, h = 120 + r() * 300; b += `<rect x="${x}" y="${470 - h}" width="48" height="${h}" fill="${['#33516d', '#46657f', '#2a425a'][i % 3]}"/>`; for (let j = 0; j < h / 14; j++) b += `<rect x="${x + 6}" y="${470 - h + 6 + j * 14}" width="36" height="2" fill="#bfe0ff" opacity=".35"/>`; }
    b += `<rect y="470" width="${W}" height="${H - 470}" fill="url(#${k}wt)"/>`;
    b += `<rect x="780" y="190" width="70" height="320" fill="url(#${k}st)"/><path d="M780 280 Q815 210 850 280 V510 H780Z" fill="#0b1b2a" opacity=".5"/><path d="M788 190 L815 150 L842 190Z" fill="#8c7c6a"/>`;
    b += `<path d="M1200 360 L850 300 L850 322 L1200 392Z" fill="#6a5c4e"/><path d="M0 400 L780 300 L780 322 L0 420Z" fill="#6a5c4e"/>`;
    for (let i = 0; i < 28; i++) { const x = 810 + i * 14; b += `<line x1="815" y1="205" x2="${x + 100}" y2="${340 + i * 2}" stroke="#4a3f36" stroke-width="1.2" opacity=".8"/>`; }
    for (let i = 0; i < 26; i++) { const x = 800 - i * 30; b += `<line x1="815" y1="205" x2="${x}" y2="${312 + i * 3.2}" stroke="#4a3f36" stroke-width="1.2" opacity=".8"/>`; }
    for (let i = 0; i < 6; i++) { const x = 40 + i * 190 + r() * 60, h = 160 + r() * 120; b += `<rect x="${x}" y="${510 - h * .2}" width="150" height="${h * .35}" fill="#3a465a" opacity=".6"/>`; }
    b += `<rect y="470" width="${W}" height="3" fill="#fff" opacity=".35"/>`;
    return svg(W, H, defs, b + grain(k, W, H, .1));
  }

  /* ---------- BROWNSTONE with stairs ---------- */
  function brownstone() {
    const k = 'o' + U++, W = 1200, H = 700;
    const defs = lg(k + 'bs', [[0, '#b5766b'], [1, '#7c4339']]) + skyGrad(k + 'sk', ['#aac6d8', '#dfe8ef']);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/><rect width="${W}" y="60" height="${H}" fill="url(#${k}bs)"/>`;
    for (let i = 0; i < 6; i++) { const x = 90 + i * 190; b += `<rect x="${x}" y="90" width="70" height="${H}" fill="#c89386"/><rect x="${x - 8}" y="90" width="86" height="16" fill="#e6c6bb"/><rect x="${x - 8}" y="${H - 120}" width="86" height="18" fill="#e6c6bb"/>`; b += `<rect x="${x + 80}" y="150" width="80" height="200" fill="#2a1814"/>`; }
    for (let i = 0; i < 14; i++) b += `<path d="M${40 + i * 14} ${H} L${40 + i * 14} ${H - 80 - i * 6} L${54 + i * 14} ${H - 80 - i * 6} L${54 + i * 14} ${H}Z" fill="#241816" opacity=".85"/>`;
    b += `<path d="M20 ${H - 140} L560 ${H - 260}" stroke="#1d1311" stroke-width="8"/><path d="M20 ${H - 110} L560 ${H - 230}" stroke="#1d1311" stroke-width="3"/>`;
    for (let i = 0; i < 30; i++) b += `<rect x="${24 + i * 18}" y="${H - 140 - i * 4}" width="3" height="${60 + i * 2}" fill="#1d1311"/>`;
    return svg(W, H, defs, b + vign(k, W, H, .3) + grain(k, W, H, .15));
  }

  /* ---------- PARK AVENUE skyline ---------- */
  function parkAve() {
    const k = 'a' + U++, r = R(83), W = 1200, H = 700;
    const defs = skyGrad(k + 'sk', ['#9dc7ee', '#e8f1f6']) + blur(k + 'b', 2);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/>`;
    for (let i = 0; i < 12; i++) { const x = 480 + i * 60, h = 120 + r() * 320; b += `<rect x="${x}" y="${440 - h}" width="52" height="${h}" fill="${['#8da6b6', '#6f8ea4', '#5e7a90', '#b5c6d2'][i % 4]}"/>`; for (let j = 0; j < h / 12; j++) b += `<rect x="${x + 4}" y="${440 - h + 6 + j * 12}" width="44" height="2" fill="#fff" opacity=".45"/>`; }
    b += `<path d="M480 700 L580 440 H760 L880 700Z" fill="#5c6670"/><path d="M640 700 L668 440 H672 L700 700Z" fill="#e9d79c" opacity=".7"/>`;
    b += `<g filter="url(#${k}b)">`; for (let i = 0; i < 160; i++) { const left = r() < .55, x = left ? r() * 520 : 700 + r() * 500, y = 80 + r() * 600; b += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(14 + r() * 34)}" fill="${['#2f5d2a', '#3e7a33', '#26501f', '#58903a'][Math.floor(r() * 4)]}" opacity=".9"/>`; } b += `</g>`;
    return svg(W, H, defs, b + vign(k, W, H, .25) + grain(k, W, H, .12));
  }

  /* ---------- sofa / living room (dark CTA backdrop) ---------- */
  function sofa() {
    const k = 'z' + U++, r = R(97), W = 1600, H = 900;
    const defs = lg(k + 'bg', [[0, '#1b1a1d'], [1, '#08080a']]) + blur(k + 'bk', 18) + blur(k + 'b', 6) + rg(k + 'l', [[0, '#ffcf9a', .55], [1, '#ffcf9a', 0]]);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/>`;
    b += `<g filter="url(#${k}b)"><rect x="120" y="80" width="340" height="380" fill="#2b2926"/>${[0, 1, 2, 3].map((i) => `<rect x="130" y="${120 + i * 90}" width="320" height="8" fill="#4a4540"/>`).join('')}<ellipse cx="1180" cy="210" rx="170" ry="190" fill="url(#${k}l)"/><rect x="880" y="360" width="600" height="400" rx="40" fill="#25303a"/><rect x="940" y="330" width="260" height="260" rx="40" fill="#34414d"/><circle cx="1080" cy="330" r="62" fill="#c28f72"/><path d="M1000 400 L1180 400 L1220 640 L960 640Z" fill="#e9e6e0"/><rect x="1180" y="400" width="190" height="240" rx="40" fill="#8b9bb0" opacity=".8"/></g>`;
    b += bokeh(r, 12, W, H, ['#ffcf9a', '#9fb4d6'], k);
    return svg(W, H, defs, b + `<rect width="${W}" height="${H}" fill="#000" opacity=".35"/>` + grain(k, W, H, .18));
  }

  /* ---------- little tiles for the slanted row ---------- */
  function mini(i) {
    const k = 'm' + U++, r = R(101 + i * 7), W = 600, H = 420;
    const pal = [['#27384c', '#ffcf8a'], ['#2f241f', '#f4b36a'], ['#1b2a3f', '#8cc7ff'], ['#3b2a35', '#ffb7a0']][i % 4];
    const defs = lg(k + 'bg', [[0, pal[0]], [1, '#0a0b10']]) + rg(k + 'l', [[0, pal[1], .85], [1, pal[1], 0]]) + blur(k + 'b', 8);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}bg)"/><circle cx="${[150, 450, 300, 100][i % 4]}" cy="150" r="170" fill="url(#${k}l)"/>`;
    if (i % 4 === 0) b += `<rect x="40" y="250" width="340" height="110" rx="26" fill="#0f1620"/><rect x="40" y="220" width="340" height="60" rx="26" fill="#18222f"/><rect x="420" y="80" width="130" height="280" fill="#ffd9a0" opacity=".85"/>`;
    if (i % 4 === 1) { for (let j = 0; j < 4; j++) b += `<line x1="${120 + j * 110}" y1="0" x2="${120 + j * 110}" y2="120" stroke="#e8c48a" stroke-width="2"/><ellipse cx="${120 + j * 110}" cy="128" rx="30" ry="18" fill="#ffd98f"/>`; b += `<rect y="280" width="${W}" height="140" fill="#14100e"/><rect x="60" y="250" width="480" height="50" fill="#e9e2d6"/>`; }
    if (i % 4 === 2) b += `<rect x="60" y="150" width="300" height="210" fill="#0f2238"/><rect x="60" y="150" width="300" height="210" fill="none" stroke="#e7eefc" stroke-width="6"/><rect x="208" y="150" width="4" height="210" fill="#e7eefc"/><rect x="380" y="260" width="180" height="100" fill="#233a55"/>`;
    if (i % 4 === 3) { b += `<path d="M0 330 H${W} V${H} H0Z" fill="#241b20"/>`; for (let j = 0; j < 9; j++) b += `<circle cx="${40 + j * 62}" cy="${300 - r() * 40}" r="${16 + r() * 22}" fill="#3f6a2f" opacity=".85"/>`; b += `<rect x="150" y="190" width="300" height="12" fill="#ffd0b0"/>`; }
    return svg(W, H, defs, b + vign(k, W, H, .4) + grain(k, W, H, .16));
  }

  /* ---------- listing hero scenes ---------- */
  function listing(kind, seed, theme) {
    const k = 'l' + U++, r = R(seed * 13 + 5), W = 900, H = 640;
    const sk = { dawn: ['#7f8fcf', '#f4b6b0'], day: ['#5aa6e8', '#cde8f8'], golden: ['#6c7fbd', '#ffc58a'], night: ['#0b1230', '#2f3c78'] }[theme || 'golden'];
    const defs = lg(k + 'sh', [[0, '#fff', .35], [.5, '#fff', 0], [1, '#000', .25]], 0, 0, 1, 0) + skyGrad(k + 'sk', sk) + lg(k + 'g', [[0, '#2f3b2a'], [1, '#141b12']]) + blur(k + 'b', 2) + lg(k + 'wt', [[0, '#5ea9c9'], [1, '#164a69']]) + lg(k + 'w', [[0, '#15263a'], [1, '#ffbf7a']]);
    let b = `<rect width="${W}" height="${H}" fill="url(#${k}sk)"/>`;
    if (kind === 'tower') { b += `<circle cx="${700 + r() * 80}" cy="${160}" r="190" fill="#ffd9a0" opacity=".28" filter="url(#${k}b)"/>`; for (let i = 0; i < 5; i++) { const x = 90 + i * 152, h = 250 + r() * 290, y0 = H - 70 - h; b += `<rect x="${x}" y="${y0}" width="136" height="${h}" fill="${['#b8c6d6', '#9fb0c4', '#cfd9e5', '#8a9db3'][i % 4]}"/><rect x="${x}" y="${y0}" width="136" height="${h}" fill="url(#${k}sh)"/>`; for (let j = 0; j < h / 16; j++) for (let c = 0; c < 6; c++) { const lit = r() < .28; b += `<rect x="${x + 7 + c * 21}" y="${y0 + 8 + j * 16}" width="16" height="9" fill="${lit ? '#ffd58a' : '#1a2d44'}" opacity="${lit ? .95 : .7}"/>`; } } }
    if (kind === 'brownstone') { b += `<rect x="90" y="140" width="720" height="${H}" fill="#9c5c4e"/>`; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) b += `<rect x="${150 + i * 220}" y="${190 + j * 130}" width="90" height="90" fill="url(#${k}w)"/><rect x="${142 + i * 220}" y="${180 + j * 130}" width="106" height="10" fill="#ecd3c8"/>`; for (let i = 0; i < 9; i++) b += `<rect x="${60 + i * 12}" y="${H - 120 + i * 6}" width="${300 - i * 20}" height="8" fill="#d8b9aa"/>`; }
    if (kind === 'loft') { b += `<rect x="60" y="120" width="780" height="${H}" fill="#6d6560"/>`; for (let i = 0; i < 4; i++) b += `<rect x="${100 + i * 190}" y="160" width="160" height="${H - 280}" fill="url(#${k}w)"/><rect x="${100 + i * 190}" y="160" width="160" height="${H - 280}" fill="none" stroke="#161515" stroke-width="7"/><rect x="${178 + i * 190}" y="160" width="4" height="${H - 280}" fill="#161515"/>`; }
    if (kind === 'waterfront') { b += `<rect y="${H - 190}" width="${W}" height="190" fill="url(#${k}wt)"/><rect x="140" y="250" width="620" height="${H - 440}" fill="#eee5d9"/><rect x="110" y="236" width="680" height="20" fill="#cfc2b1"/>`; for (let i = 0; i < 4; i++) b += `<rect x="${170 + i * 148}" y="290" width="120" height="${H - 560 + 80}" fill="url(#${k}w)"/>`; b += `<rect x="60" y="${H - 190}" width="780" height="12" fill="#9b7b5c"/>`; }
    if (kind === 'villa') { b += `<rect y="${H - 150}" width="${W}" height="150" fill="url(#${k}g)"/><rect x="120" y="240" width="460" height="250" fill="#f1ebe1"/><rect x="520" y="180" width="260" height="310" fill="#d9cdbb"/>`; for (let i = 0; i < 3; i++) b += `<rect x="${150 + i * 140}" y="290" width="110" height="170" fill="url(#${k}w)"/>`; b += `<rect x="560" y="230" width="180" height="230" fill="url(#${k}w)"/>`; for (let i = 0; i < 24; i++) b += `<circle cx="${f(60 + r() * 780)}" cy="${f(H - 130 + r() * 90)}" r="${f(14 + r() * 24)}" fill="#2c5a2a" opacity=".9"/>`; }
    return svg(W, H, defs, b + `<rect y="${H - 70}" width="${W}" height="70" fill="#000" opacity=".12"/>` + vign(k, W, H, .35) + grain(k, W, H, .15));
  }

  /* ---------- cloud sprites for the canvas (pure canvas, not SVG) ---------- */
  function cloudSprite(rgb, seed, w = 700, h = 300) {
    const r = R(seed), c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const n = 38;
    for (let i = 0; i < n; i++) {
      const t = i / n, px = w * (.12 + .76 * r()), py = h * (.35 + .35 * r()) - Math.sin(t * Math.PI) * h * .12, rad = 36 + r() * 86;
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.55)`); g.addColorStop(.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},.22)`); g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, 7); x.fill();
    }
    return c;
  }

  window.ART = { THEMES, WM, WM_PATHS, uri, building, street, portrait, greenhouse, coffee, facade, profile, nightflats, bridge, brownstone, parkAve, sofa, mini, listing, cloudSprite, R };
})();

/* ============================================================
   PORTFOLIO  |  bg.js — Rustic hand-scribbled SVG background
   Light: mountains · clouds · scattered birds (gliding) · sun
   Dark : mountains · clouds · scattered birds (gliding) · moon · twinkling stars
   Light ink: #5a3e2b   Dark ink: #d4b896
   ============================================================ */
(function () {
  'use strict';

  const svg = document.getElementById('bg-canvas');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';

  /* ── Theme ───────────────────────────────────────────────── */
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function ink()    { return isDark() ? '#d4b896' : '#5a3e2b'; }
  function op()     { return isDark() ? 0.18 : 0.28; }

  /* ── SVG factory ─────────────────────────────────────────── */
  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  }

  /* ── Seeded LCG — same seed = same jitter every build ───── */
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }
  function j(rng, val, range) { return val + (rng() - 0.5) * 2 * range; }

  /* ── Keyframes (injected once) ───────────────────────────── */
  let stylesReady = false;
  function ensureStyles() {
    if (stylesReady) return; stylesReady = true;
    const s = document.createElement('style');
    // Cloud drift
    // Bird glide: each bird gets a unique translateX + slight Y bob
    // Star twinkle: opacity pulse
    s.textContent = `
      @keyframes rs-drift-a{0%,100%{transform:translateX(0)}50%{transform:translateX(13px)}}
      @keyframes rs-drift-b{0%,100%{transform:translateX(0)}50%{transform:translateX(-10px)}}
      @keyframes rs-drift-c{0%,100%{transform:translateX(0)}50%{transform:translateX(16px)}}
      @keyframes rs-float  {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

      @keyframes rs-bird-0 {0%,100%{transform:translate(0,0)}  33%{transform:translate(18px,-5px)}  66%{transform:translate(36px,2px)}}
      @keyframes rs-bird-1 {0%,100%{transform:translate(0,0)}  40%{transform:translate(-22px,4px)}  70%{transform:translate(-10px,-3px)}}
      @keyframes rs-bird-2 {0%,100%{transform:translate(0,0)}  50%{transform:translate(25px,-7px)}}
      @keyframes rs-bird-3 {0%,100%{transform:translate(0,0)}  45%{transform:translate(-16px,6px)}  80%{transform:translate(8px,-2px)}}
      @keyframes rs-bird-4 {0%,100%{transform:translate(0,0)}  30%{transform:translate(20px,-4px)}  60%{transform:translate(38px,3px)}}
      @keyframes rs-bird-5 {0%,100%{transform:translate(0,0)}  55%{transform:translate(-28px,-6px)}}
      @keyframes rs-bird-6 {0%,100%{transform:translate(0,0)}  40%{transform:translate(15px,5px)}   75%{transform:translate(-5px,-4px)}}
      @keyframes rs-bird-7 {0%,100%{transform:translate(0,0)}  50%{transform:translate(30px,-8px)}}
      @keyframes rs-bird-8 {0%,100%{transform:translate(0,0)}  35%{transform:translate(-20px,3px)}  70%{transform:translate(-35px,-5px)}}
      @keyframes rs-bird-9 {0%,100%{transform:translate(0,0)}  60%{transform:translate(22px,-6px)}}

      @keyframes rs-twinkle-a{0%,100%{opacity:0.55} 50%{opacity:0.12}}
      @keyframes rs-twinkle-b{0%,100%{opacity:0.40} 50%{opacity:0.08}}
      @keyframes rs-twinkle-c{0%,100%{opacity:0.65} 50%{opacity:0.18}}
      @keyframes rs-twinkle-d{0%,100%{opacity:0.30} 50%{opacity:0.06}}
    `;
    document.head.appendChild(s);
  }

  /* ════════════════════════════════════════════════════════════
     SHAPE BUILDERS
     ════════════════════════════════════════════════════════════ */

  /* ── Mountain silhouette ──────────────────────────────────── */
  function mountainPath(W, H, rng) {
    const peaks = [
      { x: W*0.00, y: H },
      { x: W*0.09, y: H*j(rng,0.63,0.05) },
      { x: W*0.18, y: H*j(rng,0.79,0.03) },
      { x: W*0.27, y: H*j(rng,0.53,0.06) },
      { x: W*0.36, y: H*j(rng,0.69,0.04) },
      { x: W*0.45, y: H*j(rng,0.49,0.07) },
      { x: W*0.54, y: H*j(rng,0.73,0.04) },
      { x: W*0.63, y: H*j(rng,0.57,0.05) },
      { x: W*0.72, y: H*j(rng,0.71,0.03) },
      { x: W*0.81, y: H*j(rng,0.61,0.05) },
      { x: W*0.91, y: H*j(rng,0.76,0.04) },
      { x: W*1.00, y: H*j(rng,0.66,0.04) },
      { x: W*1.00, y: H },
    ];
    let d = `M ${peaks[0].x},${peaks[0].y}`;
    for (let i = 1; i < peaks.length; i++) {
      const p = peaks[i-1], c = peaks[i];
      d += ` Q ${(p.x+c.x)/2+j(rng,0,6)},${(p.y+c.y)/2+j(rng,0,8)} ${c.x},${c.y}`;
    }
    return d + ' Z';
  }

  /* ── Scribbled cloud ─────────────────────────────────────── */
  function cloudPath(cx, cy, w, rng) {
    const h = w*0.42, x0 = cx-w/2, yb = cy;
    const C = (ax,ay,bx,by,ex,ey) =>
      `C ${j(rng,ax,5)},${j(rng,ay,5)} ${j(rng,bx,5)},${j(rng,by,5)} ${j(rng,ex,4)},${j(rng,ey,4)}`;
    return [
      `M ${j(rng,x0,4)},${j(rng,yb,3)}`,
      C(x0,        yb-h*.10, x0+w*.12, yb-h*.58, x0+w*.20, yb-h*.54),
      C(x0+w*.27,  yb-h*.48, x0+w*.31, yb-h*.44, x0+w*.35, yb-h*.47),
      C(x0+w*.39,  yb-h*.52, x0+w*.45, yb-h,     x0+w*.50, yb-h),
      C(x0+w*.55,  yb-h,     x0+w*.60, yb-h*.52, x0+w*.65, yb-h*.47),
      C(x0+w*.69,  yb-h*.43, x0+w*.77, yb-h*.60, x0+w*.83, yb-h*.56),
      C(x0+w*.89,  yb-h*.52, x0+w,     yb-h*.10, x0+w,     yb),
      'Z',
    ].join(' ');
  }

  /* ── Scribbled bird — V-wing shape ──────────────────────────
     animIdx cycles 0–9 to pick one of the 10 glide keyframes  */
  function addBird(cx, cy, size, color, rng, animIdx, dur, delay) {
    const s = size;
    const d = [
      `M ${j(rng,cx-s,3)},${j(rng,cy-s*0.28,3)}`,
      `Q ${j(rng,cx-s*0.38,4)},${j(rng,cy-s*0.72,5)} ${j(rng,cx,3)},${j(rng,cy,3)}`,
      `Q ${j(rng,cx+s*0.38,4)},${j(rng,cy-s*0.72,5)} ${j(rng,cx+s,3)},${j(rng,cy-s*0.28,3)}`,
    ].join(' ');
    return el('path', {
      d,
      fill: 'none', stroke: color,
      'stroke-width': j(rng, 1.1, 0.35),
      'stroke-linecap': 'round',
      opacity: op(),
      style: `animation:rs-bird-${animIdx} ${dur} ease-in-out ${delay} infinite;` +
             `transform-origin:${cx}px ${cy}px`,
    });
  }

  /* ── Scribbled sun ────────────────────────────────────────── */
  function addSun(cx, cy, r, color, rng) {
    const g = el('g', {
      opacity: op() * 1.15,
      style: `animation:rs-float 9s ease-in-out 0s infinite;transform-origin:${cx}px ${cy}px`,
    });
    const rc = r * 0.38;
    g.appendChild(el('path', {
      d: `M ${cx},${cy-rc} C ${cx+rc*1.3},${cy-rc} ${cx+rc*1.3},${cy+rc} ${cx},${cy+rc} ` +
         `C ${cx-rc*1.3},${cy+rc} ${cx-rc*1.3},${cy-rc} ${cx},${cy-rc} Z`,
      fill: 'none', stroke: color, 'stroke-width': '1.2', 'stroke-linecap': 'round',
    }));
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4 + j(rng, 0, 0.12);
      const ir = r * j(rng, 0.50, 0.06), or = r * j(rng, 0.76, 0.08);
      g.appendChild(el('line', {
        x1: cx+Math.cos(ang)*ir, y1: cy+Math.sin(ang)*ir,
        x2: cx+Math.cos(ang)*or, y2: cy+Math.sin(ang)*or,
        stroke: color, 'stroke-width': j(rng, 0.9, 0.3), 'stroke-linecap': 'round',
      }));
    }
    return g;
  }

  /* ── Scribbled crescent moon ─────────────────────────────── */
  function addMoon(cx, cy, r, color, rng) {
    const g = el('g', {
      opacity: op() * 1.15,
      style: `animation:rs-float 11s ease-in-out 0s infinite;transform-origin:${cx}px ${cy}px`,
    });
    const ro = r, ri = r * 0.68;
    const ox = j(rng,cx,3), oy = j(rng,cy,3);
    // Outer wobbly circle
    g.appendChild(el('path', {
      d: `M ${ox},${oy-ro} C ${ox+ro*1.3},${oy-ro} ${ox+ro*1.3},${oy+ro} ${ox},${oy+ro} ` +
         `C ${ox-ro*1.3},${oy+ro} ${ox-ro*1.3},${oy-ro} ${ox},${oy-ro} Z`,
      fill: 'none', stroke: color, 'stroke-width': '1.1', 'stroke-linecap': 'round',
    }));
    // Crescent cut-out (filled with bg colour)
    const ix = j(rng,cx+r*0.38,4), iy = j(rng,cy-r*0.08,4);
    g.appendChild(el('path', {
      d: `M ${ix},${iy-ri} C ${ix+ri*1.3},${iy-ri} ${ix+ri*1.3},${iy+ri} ${ix},${iy+ri} ` +
         `C ${ix-ri*1.3},${iy+ri} ${ix-ri*1.3},${iy-ri} ${ix},${iy-ri} Z`,
      fill: '#1e1a16', stroke: 'none',
    }));
    return g;
  }

  /* ── Illustrative hand-drawn star ───────────────────────────
     One continuous pentagram stroke visiting 5 points in
     skip-2 order (0→2→4→1→3→0), every point jittered so each
     star looks uniquely scribbled. Returns a <path>.          */
  function starPath(cx, cy, r, rng) {
    // 5 outer points of a regular pentagon, starting at top
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      pts.push([
        j(rng, cx + Math.cos(a) * r, r * 0.13),
        j(rng, cy + Math.sin(a) * r, r * 0.13),
      ]);
    }
    // visit in skip-2 order: 0→2→4→1→3→0
    const order = [0, 2, 4, 1, 3, 0];
    // Build path with wobbly quadratic curves between each point
    // so the strokes look hand-drawn rather than ruler-straight
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < order.length; i++) {
      const [px, py] = pts[order[i]];
      const [lx, ly] = pts[order[i - 1]];
      // control point nudged slightly off the midpoint
      const qx = (lx + px) / 2 + j(rng, 0, r * 0.18);
      const qy = (ly + py) / 2 + j(rng, 0, r * 0.18);
      d += ` Q ${qx},${qy} ${px},${py}`;
    }
    return d;
  }

  /* ── Stars — illustrative pentagrams, dark mode only ────────
     Each star: jittered shape + independent twinkle animation  */
  const TWINKLE = ['rs-twinkle-a','rs-twinkle-b','rs-twinkle-c','rs-twinkle-d'];
  function addStars(W, H, color, rng) {
    // [xFrac, yFrac, radius, twinkleIdx, dur, delay]
    const starDefs = [
      [0.04, 0.06,  7, 0, '3.1s', '0s'   ],
      [0.10, 0.22,  5, 2, '4.5s', '-1.2s'],
      [0.15, 0.10,  8, 1, '3.8s', '-0.5s'],
      [0.20, 0.32,  5, 3, '5.2s', '-2.1s'],
      [0.28, 0.08,  7, 0, '4.0s', '-1.8s'],
      [0.34, 0.19,  6, 2, '3.5s', '-0.3s'],
      [0.38, 0.38,  4, 1, '4.8s', '-2.6s'],
      [0.46, 0.12,  8, 3, '3.3s', '-0.9s'],
      [0.51, 0.28,  5, 0, '5.0s', '-1.5s'],
      [0.57, 0.07,  7, 2, '3.7s', '-2.0s'],
      [0.62, 0.22,  6, 1, '4.3s', '-0.7s'],
      [0.67, 0.40,  4, 3, '3.9s', '-1.1s'],
      [0.73, 0.14,  8, 0, '4.6s', '-2.4s'],
      [0.76, 0.31,  5, 2, '3.2s', '-0.4s'],
      [0.82, 0.09,  7, 1, '5.1s', '-1.7s'],
      [0.86, 0.25,  6, 3, '3.6s', '-0.6s'],
      [0.91, 0.42,  4, 0, '4.9s', '-2.3s'],
      [0.95, 0.16,  8, 2, '3.4s', '-1.4s'],
      [0.22, 0.48,  5, 1, '4.2s', '-0.8s'],
      [0.43, 0.52,  6, 3, '3.8s', '-2.2s'],
      [0.68, 0.55,  5, 0, '5.3s', '-1.0s'],
      [0.79, 0.49,  7, 2, '3.1s', '-1.9s'],
    ];
    return starDefs.map(function ([xf, yf, r, ti, dur, delay]) {
      const cx = j(rng, W * xf, W * 0.022);
      const cy = j(rng, H * yf, H * 0.018);
      const sr = j(rng, r, r * 0.2);           // slightly randomise size too
      return el('path', {
        d:    starPath(cx, cy, sr, makeRng(rng() * 0xffff | 0)),
        fill: 'none', stroke: color,
        'stroke-width':  j(rng, 0.9, 0.25),
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        style: `animation:${TWINKLE[ti]} ${dur} ease-in-out ${delay} infinite`,
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     BUILD SCENE
     ════════════════════════════════════════════════════════════ */
  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const W = window.innerWidth, H = window.innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const color = ink();
    ensureStyles();

    /* Mountains */
    svg.appendChild(el('path', {
      d: mountainPath(W, H, makeRng(42)),
      fill: 'none', stroke: color, 'stroke-width': '1.2',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      opacity: op() * 0.7,
    }));

    /* Clouds */
    [
      { cx:W*0.13, cy:H*0.09, w:118, seed:7,  anim:'rs-drift-a', dur:'22s', delay:'0s'  },
      { cx:W*0.45, cy:H*0.05, w: 84, seed:13, anim:'rs-drift-b', dur:'27s', delay:'-7s' },
      { cx:W*0.74, cy:H*0.11, w:134, seed:19, anim:'rs-drift-c', dur:'20s', delay:'-4s' },
    ].forEach(function (c) {
      svg.appendChild(el('path', {
        d: cloudPath(c.cx, c.cy, c.w, makeRng(c.seed)),
        fill: 'none', stroke: color, 'stroke-width': '1.1',
        'stroke-linecap': 'round', opacity: op(),
        style: `animation:${c.anim} ${c.dur} ease-in-out ${c.delay} infinite;` +
               `transform-origin:${c.cx}px ${c.cy}px`,
      }));
    });

    /* Light: birds gliding across sky | Dark: twinkling stars */
    if (!isDark()) {
      [
        // flock 1 — upper-left cluster
        { cx:W*0.08, cy:H*0.14, s: 9, seed:31, ai:0, dur:'18s', delay:'0s'    },
        { cx:W*0.13, cy:H*0.11, s: 7, seed:37, ai:1, dur:'22s', delay:'-4s'   },
        { cx:W*0.18, cy:H*0.17, s:11, seed:41, ai:2, dur:'16s', delay:'-2s'   },
        // flock 2 — centre
        { cx:W*0.30, cy:H*0.22, s: 8, seed:43, ai:3, dur:'20s', delay:'-6s'   },
        { cx:W*0.36, cy:H*0.18, s:10, seed:47, ai:4, dur:'24s', delay:'-1s'   },
        { cx:W*0.41, cy:H*0.25, s: 7, seed:53, ai:5, dur:'19s', delay:'-9s'   },
        { cx:W*0.46, cy:H*0.14, s: 9, seed:59, ai:6, dur:'21s', delay:'-3s'   },
        // flock 3 — centre-right
        { cx:W*0.55, cy:H*0.20, s:12, seed:61, ai:7, dur:'17s', delay:'-5s'   },
        { cx:W*0.60, cy:H*0.13, s: 8, seed:67, ai:8, dur:'25s', delay:'-11s'  },
        { cx:W*0.65, cy:H*0.27, s: 7, seed:71, ai:9, dur:'23s', delay:'-7s'   },
        { cx:W*0.70, cy:H*0.18, s:10, seed:73, ai:0, dur:'20s', delay:'-2s'   },
        // scattered solo birds
        { cx:W*0.23, cy:H*0.34, s: 6, seed:79, ai:1, dur:'26s', delay:'-13s'  },
        { cx:W*0.50, cy:H*0.38, s: 8, seed:83, ai:2, dur:'19s', delay:'-8s'   },
        { cx:W*0.77, cy:H*0.31, s: 9, seed:89, ai:3, dur:'22s', delay:'-4s'   },
        { cx:W*0.84, cy:H*0.22, s: 7, seed:97, ai:4, dur:'18s', delay:'-1s'   },
        { cx:W*0.15, cy:H*0.42, s: 6, seed:101,ai:5, dur:'24s', delay:'-10s'  },
        { cx:W*0.38, cy:H*0.46, s: 8, seed:103,ai:6, dur:'21s', delay:'-6s'   },
        { cx:W*0.72, cy:H*0.44, s: 7, seed:107,ai:7, dur:'17s', delay:'-3s'   },
      ].forEach(function (b) {
        svg.appendChild(addBird(b.cx, b.cy, b.s, color, makeRng(b.seed), b.ai, b.dur, b.delay));
      });
    } else {
      addStars(W, H, color, makeRng(200)).forEach(function (s) { svg.appendChild(s); });
    }

    /* Celestial body — top-right */
    const cRng = makeRng(99);
    if (isDark()) {
      svg.appendChild(addMoon(W*0.87, H*0.10, 34, color, cRng));
    } else {
      svg.appendChild(addSun(W*0.87, H*0.10, 52, color, cRng));
    }
  }

  build();

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });

  document.addEventListener('themechange', build);
}());

// Canvas-drawn textures: text labels, the "other program" windows used on the
// without-AetherSDR side of a scenario, and the real app screenshots.

import * as THREE from 'three';
import heroShot from '../assets/hero-3dss.jpg';
import multiShot from '../assets/pan-multislice.jpg';
import audioShot from '../assets/aetherial-strip.jpg';
import claudeShot from '../assets/aetherclaude-dashboard.jpg';
import logoPng from '../assets/logo-256.png';

export const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, "Helvetica Neue", Arial, sans-serif';
export const MONO = '"SF Mono", "JetBrains Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace';

// The four real screenshots, keyed by what they show.
export const SHOTS = {
  stack3d: { src: heroShot, w: 1640, h: 830, caption: 'AetherSDR v26.6.5 — 3D stacked-trace panadapter over 40 m, live waterfall, full control surface' },
  multislice: { src: multiShot, w: 1400, h: 1098, caption: 'AetherSDR — three panadapters across 20 m with waterfalls, slices, S-meter and TX controls' },
  audio: { src: audioShot, w: 1400, h: 926, caption: 'Aetherial Audio — the per-slice RX strip: NR engines, gate, parametric EQ, compressor, de-esser' },
  claude: { src: claudeShot, w: 1440, h: 827, caption: 'AetherClaude — the project’s agent operations dashboard (development tooling, not an operating feature)' },
};
export const LOGO = logoPng;

const loader = new THREE.TextureLoader();
const cache = new Map();
export function shotTexture(key) {
  if (cache.has(key)) return cache.get(key);
  const tex = loader.load(SHOTS[key].src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

function canvasTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// A text label as a sprite. `height` is world units; width follows the text.
export function labelSprite(text, { height = 6, color = '#eaf2fb', sub = null, subColor = '#8598b4', weight = 650, bg = 'rgba(6,11,19,0.72)', border = 'rgba(120,190,230,0.35)', mono = false } = {}) {
  const px = 64, pad = 26;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const f1 = `${weight} ${px}px ${mono ? MONO : FONT}`, f2 = `500 ${Math.round(px * 0.62)}px ${FONT}`;
  g.font = f1;
  let w = g.measureText(text).width;
  if (sub) { g.font = f2; w = Math.max(w, g.measureText(sub).width); }
  const h = sub ? px * 1.95 : px * 1.25;
  c.width = Math.ceil(w + pad * 2);
  c.height = Math.ceil(h + pad * 1.2);
  if (bg) {
    g.fillStyle = bg;
    g.strokeStyle = border;
    g.lineWidth = 3;
    roundRect(g, 1.5, 1.5, c.width - 3, c.height - 3, 22);
    g.fill(); g.stroke();
  }
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = f1; g.fillStyle = color;
  g.fillText(text, c.width / 2, sub ? c.height * 0.38 : c.height / 2);
  if (sub) { g.font = f2; g.fillStyle = subColor; g.fillText(sub, c.width / 2, c.height * 0.74); }
  const mat = new THREE.SpriteMaterial({ map: canvasTexture(c), transparent: true, depthWrite: false, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(height * c.width / c.height, height, 1);
  s.renderOrder = 10;
  return s;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// A generic desktop-program window: title bar, OS badge, and a body that hints
// at what kind of program it is. Deliberately schematic — these stand for
// categories of tools, not screenshots of anyone's product.
export function toolWindowTexture({ name, role, os = '', kind = 'list', accent = '#f0a35e' }) {
  const W = 640, H = 400;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#121a26'; roundRect(g, 0, 0, W, H, 18); g.fill();
  g.strokeStyle = accent; g.globalAlpha = 0.65; g.lineWidth = 4; roundRect(g, 2, 2, W - 4, H - 4, 16); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = '#1d2738'; g.fillRect(4, 4, W - 8, 58);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(30 + i * 26, 33, 8, 0, 7); g.fill(); });
  g.fillStyle = '#eaf2fb'; g.font = `650 30px ${FONT}`; g.textBaseline = 'middle';
  g.fillText(name, 118, 34, W - 250);
  if (os) {
    g.font = `600 20px ${FONT}`;
    const tw = g.measureText(os).width + 24;
    g.fillStyle = 'rgba(240,163,94,0.18)'; roundRect(g, W - tw - 16, 18, tw, 32, 10); g.fill();
    g.fillStyle = accent; g.fillText(os, W - tw - 4, 35);
  }
  g.fillStyle = '#8598b4'; g.font = `500 22px ${FONT}`;
  g.fillText(role, 24, 92, W - 48);
  // body
  g.save();
  g.translate(24, 118);
  const bw = W - 48, bh = H - 140;
  g.fillStyle = '#0b111b'; g.fillRect(0, 0, bw, bh);
  g.strokeStyle = 'rgba(133,152,180,0.35)'; g.fillStyle = 'rgba(133,152,180,0.45)'; g.lineWidth = 2;
  const rnd = mulberry(name.length * 97 + role.length);
  if (kind === 'wave') {
    g.strokeStyle = accent; g.beginPath();
    for (let x = 0; x <= bw; x += 4) { const y = bh * 0.7 - Math.pow(rnd(), 6) * bh * 0.6 - rnd() * 8; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  } else if (kind === 'meter') {
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(133,152,180,0.25)'; g.fillRect(14, 16 + i * 46, bw - 28, 22); g.fillStyle = accent; g.fillRect(14, 16 + i * 46, (bw - 28) * (0.25 + rnd() * 0.65), 22); }
  } else if (kind === 'term') {
    g.font = `500 19px ${MONO}`; g.fillStyle = '#9fe8a8';
    // Placeholder calls only — never real stations.
    const lines = ['DX de N0CALL:  14025.0  XX1ABC  CW', 'DX de N0XYZ:    7004.2  XX2DEF', 'DX de N1ABC:   21074.0  FT8 -12dB', 'DX de N2XYZ:   14195.0  XX9ZZ up 5', '> set/filter ...'];
    lines.forEach((l, i) => g.fillText(l, 12, 26 + i * 42, bw - 24));
  } else if (kind === 'grid') {
    for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) { g.fillStyle = (r + k) % 2 ? 'rgba(133,152,180,0.18)' : 'rgba(133,152,180,0.32)'; g.fillRect(10 + k * (bw - 20) / 4, 10 + r * 38, (bw - 20) / 4 - 6, 30); }
  } else if (kind === 'cable') {
    g.strokeStyle = accent; g.lineWidth = 4;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(20, 30 + i * 52); g.bezierCurveTo(bw * 0.4, 10 + i * 60 + rnd() * 30, bw * 0.6, 40 + i * 40, bw - 20, 30 + i * 52); g.stroke(); }
  } else {
    for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(133,152,180,0.35)'; g.fillRect(14, 16 + i * 34, (bw - 28) * (0.4 + rnd() * 0.55), 14); }
  }
  g.restore();
  return canvasTexture(c);
}

// A contest logger window for the station monitors: entry line with the call
// being typed, the recent log, a band map, and a rate meter. Schematic, with
// placeholder calls only — it stands for "a logger", not a product.
export function loggerTexture({ title, band, mode, accent = '#ffb547', seed = 1 }) {
  const W = 800, H = 460;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = mulberry(seed * 7919);
  const L = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
  const call = () => 'XX' + Math.floor(rnd() * 10) + L[Math.floor(rnd() * 25)] + L[Math.floor(rnd() * 25)] + (rnd() > 0.4 ? L[Math.floor(rnd() * 25)] : '');
  g.fillStyle = '#0d141f'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1d2738'; g.fillRect(0, 0, W, 46);
  g.fillStyle = '#eaf2fb'; g.font = `650 24px ${FONT}`; g.textBaseline = 'middle';
  g.fillText(title, 16, 24);
  g.fillStyle = accent; g.font = `700 22px ${MONO}`; g.textAlign = 'right';
  g.fillText(`${band} · ${mode}`, W - 16, 24); g.textAlign = 'left';
  // entry line
  g.fillStyle = '#16233a'; g.fillRect(14, 60, 500, 58);
  g.strokeStyle = accent; g.lineWidth = 3; g.strokeRect(14, 60, 500, 58);
  g.fillStyle = '#fff'; g.font = `700 34px ${MONO}`;
  const typing = call().slice(0, 4);
  g.fillText(typing, 30, 90);
  const tw = g.measureText(typing).width;
  g.fillStyle = accent; g.fillRect(32 + tw, 72, 14, 36);
  g.fillStyle = '#8598b4'; g.font = `500 22px ${MONO}`; g.fillText('599  14', 330, 90);
  // log rows
  g.font = `500 20px ${MONO}`;
  for (let i = 0; i < 9; i++) {
    const y = 146 + i * 32;
    g.fillStyle = i % 2 ? 'rgba(133,152,180,0.06)' : 'rgba(133,152,180,0.12)'; g.fillRect(14, y - 14, 500, 30);
    g.fillStyle = '#9fb3cc';
    const mm = String(59 - i * 2).padStart(2, '0');
    g.fillText(`23${mm}`, 24, y + 1);
    g.fillStyle = '#eaf2fb'; g.fillText(call().padEnd(8), 110, y + 1);
    g.fillStyle = '#9fb3cc'; g.fillText(`599 ${String(3 + Math.floor(rnd() * 37)).padStart(2, '0')}`, 260, y + 1);
    if (rnd() > 0.7) { g.fillStyle = '#ffd166'; g.fillText('MULT', 400, y + 1); }
  }
  // band map
  g.fillStyle = '#0b111b'; g.fillRect(530, 60, 256, 330);
  g.strokeStyle = 'rgba(133,152,180,0.35)'; g.lineWidth = 2; g.strokeRect(530, 60, 256, 330);
  g.font = `500 18px ${MONO}`;
  for (let i = 0; i < 11; i++) {
    const y = 82 + i * 29;
    const f = (band === '20 m' ? 14000 : 7000) + 4 + i * 3 + Math.floor(rnd() * 3);
    g.fillStyle = '#5d6f88'; g.fillText(`${f}.${Math.floor(rnd() * 10)}`, 540, y);
    const k = rnd();
    g.fillStyle = k > 0.75 ? '#ff6b5e' : k > 0.45 ? '#ffd166' : '#8ef7a8';
    g.fillText(call(), 650, y);
  }
  // rate meter
  g.fillStyle = '#16233a'; g.fillRect(14, 420, 772, 30);
  g.fillStyle = accent; g.fillRect(14, 420, 772 * 0.72, 30);
  g.fillStyle = '#05080d'; g.font = `700 20px ${MONO}`; g.fillText(`RATE ${110 + Math.floor(rnd() * 60)}/h`, 26, 436);
  return canvasTexture(c);
}

// The digital-mode operator's big screen, in four quadrants laid out like
// the real apps: GridTracker2 (top left), WSJT-X (top right), AetherSDR
// (bottom left, the real screenshot) and OpsLog (bottom right). Schematic,
// with placeholder calls only.
export function digitalDeskTexture(shotKey) {
  const W = 2048, H = 1188, QW = W / 2, QH = H / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rnd = mulberry(4242);
  const L = 'ABCDEFGHJKLMNOPRSTUVWYZ';
  const call = () => 'XX' + Math.floor(rnd() * 10) + L[Math.floor(rnd() * L.length)] + L[Math.floor(rnd() * L.length)] + (rnd() > 0.5 ? L[Math.floor(rnd() * L.length)] : '');
  const grid4 = () => 'ABCDEFGHIJKLMNOPQR'[Math.floor(rnd() * 18)] + 'ABCDEFGHIJKLMNOPQR'[Math.floor(rnd() * 18)] + Math.floor(rnd() * 10) + Math.floor(rnd() * 10);
  const titleBar = (x, y, w, text, dark = true) => {
    g.fillStyle = dark ? '#1f1f1f' : '#a8a8a8'; g.fillRect(x, y, w, 30);
    g.fillStyle = dark ? '#d8d8d8' : '#333'; g.font = `500 17px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(text, x + 12, y + 16, w - 24);
  };
  const T = (txt, x, y, font, col, align = 'left') => { g.font = font; g.fillStyle = col; g.textAlign = align; g.fillText(txt, x, y); g.textAlign = 'left'; };

  // ---------------- top left: GridTracker2
  {
    const x0 = 0, y0 = 0;
    titleBar(x0, y0, QW, 'GridTracker2 [Band: 20m Mode: FT8 Layer: Grids]  Worked 180 Confirmed 164');
    const mx = x0, my = y0 + 30, mw = QW * 0.72, mh = QH - 30;
    g.fillStyle = '#4f7f99'; g.fillRect(mx, my, mw, mh);                       // ocean
    const land = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo : g.moveTo).call(g, mx + u * mw, my + v * mh)); g.closePath(); g.fill(); };
    land([[0.04, 0.2], [0.16, 0.13], [0.32, 0.11], [0.46, 0.07], [0.6, 0.09], [0.71, 0.16], [0.8, 0.27], [0.77, 0.36], [0.72, 0.45], [0.69, 0.54], [0.64, 0.6], [0.66, 0.7], [0.61, 0.64], [0.53, 0.63], [0.47, 0.71], [0.43, 0.8], [0.37, 0.78], [0.31, 0.67], [0.23, 0.56], [0.17, 0.43], [0.12, 0.31], [0.05, 0.27]], '#8f8a70');
    land([[0.53, 0.84], [0.64, 0.82], [0.73, 0.9], [0.71, 1], [0.57, 1]], '#8f8a70');
    land([[0.7, 0.04], [0.85, 0.02], [0.89, 0.12], [0.78, 0.19]], '#a9adb2');
    g.strokeStyle = 'rgba(40,40,40,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(mx + mw * 0.38, my + mh * 0.48, mh * 0.38, 0, 7); g.stroke();
    g.beginPath(); g.arc(mx + mw * 0.38, my + mh * 0.48, mh * 0.7, 0, 7); g.stroke();
    for (let i = 0; i < 120; i++) {                                              // worked grid squares
      const u = 0.24 + rnd() * 0.44, v = 0.3 + rnd() * 0.32;
      if (u > 0.62 && v > 0.55) continue;
      const k = rnd();
      g.fillStyle = k > 0.93 ? 'rgba(80,200,80,0.85)' : k > 0.86 ? 'rgba(240,230,60,0.85)' : k > 0.8 ? 'rgba(60,80,230,0.8)' : 'rgba(225,50,50,0.8)';
      g.fillRect(mx + u * mw, my + v * mh, 16, 14);
      g.strokeStyle = 'rgba(60,0,0,0.6)'; g.lineWidth = 1; g.strokeRect(mx + u * mw, my + v * mh, 16, 14);
    }
    g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(mx + 30, my + 10, 300, 28);
    T('3.499, -78.662  3897mi  123°  FJ03QL', mx + 40, my + 25, `600 16px ${FONT}`, '#fff');
    // control panel
    const px = mx + mw, pw = QW - mw;
    g.fillStyle = '#000'; g.fillRect(px, my, pw, mh);
    g.strokeStyle = '#4a4a4a'; g.strokeRect(px + 8, my + 8, pw - 16, 78);
    T('GridTracker2', px + pw / 2, my + 28, `700 18px ${FONT}`, '#fff', 'center');
    T('14.074.000 Hz (20m)  FT8', px + pw / 2, my + 52, `600 15px ${FONT}`, '#ffd23f', 'center');
    T('16:30:32 UTC', px + pw / 2, my + 74, `500 14px ${FONT}`, '#ddd', 'center');
    g.fillStyle = '#1fa31f'; g.fillRect(px + 8, my + 96, pw - 16, 26); T('RECEIVE', px + pw / 2, my + 110, `700 16px ${FONT}`, '#fff', 'center');
    for (let i = 0; i < 12; i++) { const h = 6 + rnd() * 40; g.fillStyle = i === 9 ? '#4f6dff' : '#e03030'; g.fillRect(px + 22 + i * 18, my + 180 - h, 10, h); }
    [['Rx Calls', '338'], ['QSO', '2831'], ['Rx DXCC', '58'], ['QSL', '2506']].forEach(([k, v], i) => {
      T(k, px + 20 + (i % 2) * 130, my + 210 + Math.floor(i / 2) * 28, `500 15px ${FONT}`, '#fff');
      g.fillStyle = '#1730c8'; g.fillRect(px + 92 + (i % 2) * 130, my + 197 + Math.floor(i / 2) * 28, 44, 22);
      T(v, px + 114 + (i % 2) * 130, my + 213 + Math.floor(i / 2) * 28, `600 14px ${FONT}`, '#fff', 'center');
    });
    T('Map View Filters', px + pw / 2, my + 286, `700 15px ${FONT}`, '#fff', 'center');
    [['Band', 'Auto'], ['Mode', 'Auto'], ['Prop', 'Mixed'], ['Data', 'Logbook & Live']].forEach(([k, v], i) => {
      T(k, px + 24, my + 316 + i * 28, `500 15px ${FONT}`, '#ffd23f');
      g.fillStyle = '#1730c8'; g.fillRect(px + 92, my + 302 + i * 28, pw - 112, 22); T(v, px + 100, my + 318 + i * 28, `500 14px ${FONT}`, '#fff');
    });
    const icons = ['#1e88e5', '#fbc02d', '#8e24aa', '#43a047', '#9e9e9e', '#fb8c00', '#00acc1', '#e53935', '#5e35b1', '#3949ab'];
    for (let i = 0; i < 10; i++) { g.fillStyle = icons[i]; g.beginPath(); g.arc(px + 36 + (i % 5) * 46, my + 450 + Math.floor(i / 5) * 46, 17, 0, 7); g.fill(); }
  }

  // ---------------- top right: WSJT-X (light theme, as in the manual)
  {
    const x0 = QW, y0 = 0;
    g.fillStyle = '#838383'; g.fillRect(x0, y0, QW, QH);
    titleBar(x0, y0, QW, 'WSJT-X   v2.7.0   by K1JT, G4WJS, K9AN, and IV3NWV', false);
    // Wide Graph
    const wy = y0 + 34, wh = 120;
    g.fillStyle = '#979797'; g.fillRect(x0 + 8, wy, QW - 16, 22);
    for (let f = 500; f <= 3000; f += 500) { const x = x0 + 8 + (f / 3200) * (QW - 16); T(String(f), x, wy + 15, `500 14px ${FONT}`, '#222', 'center'); }
    for (let yy = 0; yy < 56; yy += 2) for (let xx = 0; xx < QW - 16; xx += 4) {
      const v = rnd(); g.fillStyle = v > 0.985 ? '#e7e047' : v > 0.6 ? '#1a3bb0' : '#0d1f7a'; g.fillRect(x0 + 8 + xx, wy + 22 + yy, 4, 2);
    }
    for (let i = 0; i < 14; i++) {                                               // FT8 signals in the waterfall
      const x = x0 + 30 + rnd() * (QW - 70), hot = rnd() > 0.75;
      g.fillStyle = hot ? '#e8251f' : '#3fbf6a'; g.fillRect(x, wy + 22 + rnd() * 20, 12, 30);
      if (hot) { g.fillStyle = '#f5d33a'; g.fillRect(x + 3, wy + 34, 6, 10); }
    }
    g.fillStyle = '#05054a'; g.fillRect(x0 + 8, wy + 78, QW - 16, 42);
    g.strokeStyle = '#3cff5a'; g.lineWidth = 2; g.beginPath();
    for (let xx = 0; xx < QW - 16; xx += 4) { const yv = wy + 112 - Math.pow(rnd(), 5) * 30; xx ? g.lineTo(x0 + 8 + xx, yv) : g.moveTo(x0 + 8, yv); }
    g.stroke();
    // Band Activity / Rx Frequency
    const ty = wy + wh + 10, half = (QW - 24) / 2;
    [['Band Activity', 0], ['Rx Frequency', 1]].forEach(([name, k]) => {
      const bx = x0 + 8 + k * (half + 8);
      T(name, bx + half / 2, ty + 16, `500 18px ${FONT}`, '#111', 'center');
      g.fillStyle = '#7d7d7d'; g.fillRect(bx, ty + 28, half, 26);
      T('UTC   dB   DT Freq   Message', bx + 10, ty + 42, `500 15px ${MONO}`, '#111');
      g.fillStyle = '#979797'; g.fillRect(bx, ty + 58, half, 270);
    });
    for (let i = 0; i < 13; i++) {
      const y = ty + 72 + i * 20, cq = rnd() > 0.72, me = !cq && rnd() > 0.86;
      if (cq || me) { g.fillStyle = cq ? '#3fa34a' : '#b8454a'; g.fillRect(x0 + 9, y - 10, half - 2, 19); }
      const db = String(Math.round(-20 + rnd() * 30)).padStart(3), dt = (rnd() * 0.8 - 0.2).toFixed(1).padStart(4), fq = String(Math.floor(300 + rnd() * 2600)).padStart(4);
      const msg = cq ? `CQ ${call()} ${grid4()}` : me ? `XX0AA ${call()} -${String(Math.floor(rnd() * 20)).padStart(2, '0')}` : `${call()} ${call()} ${rnd() > 0.5 ? 'RR73' : grid4()}`;
      T(`163030 ${db} ${dt} ${fq} ~  ${msg}`, x0 + 14, y + 1, `500 14px ${MONO}`, '#111');
    }
    [0, 1].forEach((i) => { const y = ty + 72 + i * 20; g.fillStyle = '#b8454a'; g.fillRect(x0 + 16 + half + 1, y - 10, half - 2, 19); T(`163030 -1${i + 2}  0.1 1${i}48 ~  XX0AA ${call()} R-1${i}`, x0 + 22 + half, y + 1, `500 14px ${MONO}`, '#111'); });
    // controls
    const cy = ty + 338;
    ['Log QSO', 'Stop', 'Monitor', 'Erase', 'Decode', 'Enable Tx', 'Halt Tx', 'Tune'].forEach((b, i) => {
      const bx = x0 + 10 + i * 124; g.fillStyle = b === 'Monitor' ? '#3fa34a' : b === 'Enable Tx' ? '#b8454a' : '#b8b8b8';
      g.fillRect(bx, cy, 116, 26); g.strokeStyle = '#999'; g.lineWidth = 1; g.strokeRect(bx, cy, 116, 26);
      T(b, bx + 58, cy + 14, `500 14px ${FONT}`, '#111', 'center');
    });
    g.fillStyle = '#000'; g.fillRect(x0 + 10, cy + 36, 300, 46);
    T('14.074 000', x0 + 160, cy + 60, `700 30px ${MONO}`, '#6af06a', 'center');
    T('20m', x0 + 340, cy + 60, `600 22px ${FONT}`, '#111');
  }

  // ---------------- bottom left: AetherSDR (the real screenshot, drawn when it loads)
  const tex = canvasTexture(c);
  {
    const x0 = 0, y0 = QH;
    g.fillStyle = '#0b111b'; g.fillRect(x0, y0, QW, QH);
    titleBar(x0, y0, QW, 'AetherSDR');
    const img = new Image();
    img.onload = () => {
      const s2 = Math.min(QW / img.width, (QH - 30) / img.height), w = img.width * s2, h = img.height * s2;
      g.drawImage(img, x0 + (QW - w) / 2, y0 + 30 + (QH - 30 - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = SHOTS[shotKey].src;
  }

  // ---------------- bottom right: OpsLog (dark, Log4OM-style entry strip)
  {
    const x0 = QW, y0 = QH;
    g.fillStyle = '#14171c'; g.fillRect(x0, y0, QW, QH);
    titleBar(x0, y0, QW, 'OpsLog — XX0AA');
    const ey = y0 + 40;
    g.fillStyle = '#1d222a'; g.fillRect(x0 + 8, ey, QW - 16, 92);
    [['Callsign', 'XX9ZZ', 150], ['RST S', '-12', 70], ['RST R', '-08', 70], ['Name', 'Pat', 110], ['Grid', 'FN31', 90], ['Band', '20m', 70], ['Mode', 'FT8', 70], ['Freq', '14.074', 110]].reduce((x, [k, v, w]) => {
      T(k, x, ey + 18, `500 13px ${FONT}`, '#8fa1b8');
      g.fillStyle = k === 'Callsign' ? '#2a3d5c' : '#262c36'; g.fillRect(x, ey + 26, w, 34);
      T(v, x + 8, ey + 44, k === 'Callsign' ? `700 20px ${MONO}` : `500 17px ${MONO}`, k === 'Callsign' ? '#ffd23f' : '#e6edf5');
      return x + w + 12;
    }, x0 + 18);
    T('Pat · Example, ST · CQ 5 · ITU 8 · NA', x0 + 18, ey + 80, `500 14px ${FONT}`, '#8fa1b8');
    // worked-before matrix
    const bands = ['160', '80', '40', '30', '20', '17', '15', '12', '10', '6'], modes = ['CW', 'SSB', 'DIG'];
    const wx = x0 + 18, wy = ey + 108;
    T('Worked before', wx, wy, `600 14px ${FONT}`, '#cfd8e3');
    bands.forEach((b, i) => T(b, wx + 60 + i * 34 + 15, wy + 22, `500 12px ${FONT}`, '#8fa1b8', 'center'));
    modes.forEach((m, r) => { T(m, wx, wy + 44 + r * 26, `500 13px ${FONT}`, '#8fa1b8'); bands.forEach((b, i) => { const k = rnd(); g.fillStyle = k > 0.6 ? '#2e7d32' : k > 0.35 ? '#c79100' : '#2a3038'; g.fillRect(wx + 60 + i * 34, wy + 32 + r * 26, 30, 20); }); });
    // great-circle map + cluster
    const gx = x0 + 440, gy = ey + 104, gr = 92;
    g.fillStyle = '#0e2238'; g.beginPath(); g.arc(gx + gr, gy + gr, gr, 0, 7); g.fill();
    g.strokeStyle = 'rgba(120,170,220,0.35)'; g.lineWidth = 1;
    for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(gx + gr, gy + gr, gr * k / 4, 0, 7); g.stroke(); }
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(gx + gr, gy + gr); g.lineTo(gx + gr + Math.cos(a) * gr, gy + gr + Math.sin(a) * gr); g.stroke(); }
    g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.beginPath(); g.moveTo(gx + gr, gy + gr); g.lineTo(gx + gr + 70, gy + gr - 50); g.stroke();
    const cx = x0 + 650;
    T('DX Cluster', cx, gy + 4, `600 14px ${FONT}`, '#cfd8e3');
    for (let i = 0; i < 8; i++) { const y = gy + 26 + i * 21; T(`${(14074 + rnd() * 3).toFixed(1)}  ${call().padEnd(7)} FT8`, cx, y, `500 13px ${MONO}`, i === 2 ? '#ff6a6a' : '#cfd8e3'); }
    // recent QSOs
    const ry = y0 + 330;
    g.fillStyle = '#262c36'; g.fillRect(x0 + 8, ry, QW - 16, 26);
    T('Date        Time   Call       Band  Mode  RST S RST R  Grid  Country', x0 + 16, ry + 14, `600 14px ${MONO}`, '#cfd8e3');
    for (let i = 0; i < 9; i++) {
      const y = ry + 44 + i * 24;
      g.fillStyle = i % 2 ? '#181c22' : '#1c2128'; g.fillRect(x0 + 8, y - 12, QW - 16, 24);
      T(`2026-10-23  16${String(29 - i * 3).padStart(2, '0')}   ${call().padEnd(9)}  20m   FT8   -${String(5 + Math.floor(rnd() * 15)).padStart(2, '0')}   -${String(5 + Math.floor(rnd() * 15)).padStart(2, '0')}   ${grid4()}`, x0 + 16, y + 1, `500 14px ${MONO}`, '#e6edf5');
    }
  }
  // quadrant dividers
  g.fillStyle = '#05080d'; g.fillRect(QW - 3, 0, 6, H); g.fillRect(0, QH - 3, W, 6);
  tex.needsUpdate = true;
  return tex;
}

// A café chalkboard menu.
export function menuTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 340;
  const g = c.getContext('2d');
  g.fillStyle = '#5a3d24'; g.fillRect(0, 0, 512, 340);
  g.fillStyle = '#1b2421'; g.fillRect(14, 14, 484, 312);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f3efe2'; g.font = `700 46px ${FONT}`; g.fillText('COFFEE', 256, 58);
  g.font = `500 28px ${FONT}`;
  [['Espresso', '3'], ['Latte', '4'], ['Cappuccino', '4'], ['Cold brew', '5']].forEach(([k, v], i) => {
    g.textAlign = 'left'; g.fillStyle = '#e8e3d3'; g.fillText(k, 60, 120 + i * 40);
    g.textAlign = 'right'; g.fillStyle = '#ffd166'; g.fillText(v, 452, 120 + i * 40);
  });
  g.textAlign = 'center'; g.fillStyle = '#8ef7e6'; g.font = `700 32px ${FONT}`; g.fillText('FREE Wi-Fi', 256, 292);
  return canvasTexture(c);
}

// A spiral notepad page: ruled lines and scribbled calls.
export function notepadTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 360;
  const g = c.getContext('2d');
  g.fillStyle = '#f2ead3'; g.fillRect(0, 0, 256, 360);
  g.strokeStyle = 'rgba(80,120,190,0.45)'; g.lineWidth = 2;
  for (let y = 50; y < 360; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  g.strokeStyle = 'rgba(210,70,70,0.6)'; g.beginPath(); g.moveTo(36, 0); g.lineTo(36, 360); g.stroke();
  g.fillStyle = '#2a2f3a'; g.font = `italic 600 24px ${FONT}`;
  ['XX9ZZ up 5?', '14.195 / 14.200', 'QSX 14.201', 'mult! 40m', 'dupe XX1AB'].forEach((t, i) => g.fillText(t, 46, 44 + i * 52));
  g.strokeStyle = '#2a2f3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(46, 74); g.lineTo(200, 66); g.stroke();
  return canvasTexture(c);
}

function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

let glow;
export function glowTexture() {
  if (glow) return glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  glow = canvasTexture(c);
  return glow;
}

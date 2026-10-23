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

// The hub: a live 3D stacked-trace panadapter, the same view AetherSDR draws
// (its "3D stacked-trace" mode), re-tuned for whatever scenario is on screen.
//
// Band activity is synthetic and labelled as modeled in the UI. Each profile
// is shaped like the real thing: CW contest = dense keyed carriers; FT8 =
// 50 Hz tones locked to 15 s cycles in a 3 kHz sub-band; split pileup = one
// DX station plus a wall of callers "up"; RTTY = paired mark/space tones.
// A profile change only affects new traces, so the old band scrolls away.

import * as THREE from 'three';

const BINS = 512, ROWS = 90;
export const SIZE = { width: 240, depth: 230, height: 30 };
const RATE = 22;

const g = (u, c, w) => Math.exp(-((u - c) ** 2) / (2 * w * w));
const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

// u is 0..1 across the span, t seconds. Each profile returns signal functions.
const PROFILES = {
  mixed: {
    label: '20 m · mixed activity', floor: 0.04,
    make() {
      const out = [];
      [0.08, 0.12, 0.17, 0.22].forEach((c, i) => out.push(cw(c, 0.5 + i * 0.07, 7 + i * 2, i)));
      for (let i = 0; i < 12; i++) out.push(ft8(0.3 + hash(i + 1) * 0.07, 0.2 + hash(i + 40) * 0.35, i));
      [0.62, 0.7, 0.8, 0.88].forEach((c, i) => out.push(ssb(c, 0.75 + i * 0.05, i)));
      out.push((u, t) => 0.8 * g(u, 0.45 + Math.sin(t * 0.08) * 0.01, 0.0018));
      return out;
    },
  },
  contest: {
    label: '40 m CW · contest weekend', floor: 0.05,
    make() {
      const out = [];
      for (let i = 0; i < 46; i++) {
        const c = 0.03 + (i / 46) * 0.94 + (hash(i * 3) - 0.5) * 0.012;
        out.push(cw(c, 0.28 + hash(i + 9) * 0.6, 8 + hash(i) * 9, i, 0.68));
      }
      return out;
    },
  },
  ft8: {
    label: '14.074 MHz · FT8 sub-band', floor: 0.035,
    make() {
      const out = [];
      for (let i = 0; i < 52; i++) out.push(ft8(0.12 + hash(i + 1) * 0.76, 0.15 + Math.pow(hash(i + 40), 2) * 0.6, i));
      return out;
    },
  },
  pileup: {
    label: '20 m SSB · DX working split, listening up 5–15', floor: 0.04,
    make() {
      const out = [ssb(0.16, 1.0, 0, true)];
      for (let i = 0; i < 26; i++) out.push(ssb(0.42 + hash(i + 3) * 0.48, 0.35 + hash(i + 70) * 0.45, i + 1));
      return out;
    },
  },
  dxcw: {
    label: '30 m CW · rare DX with a pileup', floor: 0.04,
    make() {
      const out = [cw(0.22, 1.0, 9, 1, 0.3)];
      for (let i = 0; i < 30; i++) out.push(cw(0.46 + hash(i + 11) * 0.3, 0.3 + hash(i + 5) * 0.4, 10 + hash(i) * 8, i + 3, 0.55));
      out.push(cw(0.85, 0.5, 7, 99, 0.2));
      return out;
    },
  },
  rtty: {
    label: '20 m RTTY · contest', floor: 0.045,
    make() {
      const out = [];
      for (let i = 0; i < 16; i++) {
        const c = 0.08 + (i / 16) * 0.84;
        out.push((u, t) => {
          const on = Math.sin(t * 0.3 + i * 1.7) > -0.4;
          if (!on) return 0;
          const k = hash(Math.floor(t * 45.45) + i * 31) > 0.5;   // 45.45 baud mark/space
          return (0.4 + hash(i) * 0.3) * (k ? g(u, c, 0.0015) : g(u, c + 0.012, 0.0015));
        });
      }
      return out;
    },
  },
  quiet: {
    label: '17 m · quiet band, weak signals (portable)', floor: 0.03,
    make() {
      return [cw(0.3, 0.22, 6, 1, 0.5), ft8(0.55, 0.18, 2), ft8(0.57, 0.14, 3), ssb(0.8, 0.3, 4)];
    },
  },
  ragchew: {
    label: '3.9 MHz · 75 m phone round tables', floor: 0.04,
    make() {
      // Round tables: several stations take turns on one frequency, each at
      // its own strength, with slow fading (QSB). Plus a couple of lone QSOs.
      return [roundtable(0.2, [1.0, 0.45, 0.7, 0.28], 1), roundtable(0.47, [0.8, 0.55, 0.35], 2), roundtable(0.71, [0.6, 0.9], 3), ssb(0.88, 0.32, 7)];
    },
  },
  digital: {
    label: '20 m · FT8, FT4, JS8, RTTY and FreeDV side by side', floor: 0.035,
    make() {
      const out = [];
      for (let i = 0; i < 18; i++) out.push(ft8(0.1 + hash(i + 1) * 0.14, 0.2 + hash(i + 40) * 0.4, i));
      for (let i = 0; i < 8; i++) out.push(ft8(0.32 + hash(i + 7) * 0.08, 0.2 + hash(i + 50) * 0.3, i + 30, 7.5));
      out.push((u, t) => (0.45 + 0.1 * Math.sin(t)) * Math.max(0, 1 - Math.abs(u - 0.62) / 0.012) * (0.85 + 0.15 * Math.sin(u * 4000 + t * 30)));  // FreeDV/RADE: flat OFDM block
      for (let i = 0; i < 4; i++) out.push(cw(0.78 + i * 0.03, 0.4, 0, i, 0.9));
      return out;
    },
  },
};
export const PROFILE_NAMES = Object.keys(PROFILES);

function cw(c, amp, wpm, seed, duty = 0.58) {
  return (u, t) => {
    if (Math.abs(u - c) > 0.01) return 0;
    if (!wpm) return amp * g(u, c, 0.0012);
    const slot = Math.floor(t * wpm);
    const on = hash(slot * 3.1 + seed * 17) < duty && Math.floor(t / 5 + seed) % 4 !== 0;
    return on ? amp * g(u, c, 0.0012) : 0;
  };
}
function ft8(c, amp, seed, cycle = 15) {
  return (u, t) => {
    if (Math.abs(u - c) > 0.008) return 0;
    const cyc = Math.floor(t / cycle), ph = t % cycle;
    const active = hash(cyc * 13 + seed) > 0.35 && ph > 0.4 && ph < cycle * 0.85;
    const wob = Math.sin(t * 6.28 * 6.25 + seed) * 0.0007;
    return active ? amp * g(u, c + wob, 0.0012) : 0;
  };
}
function roundtable(c, amps, seed, turn = 7) {
  return (u, t) => {
    if (u < c - 0.017 || u > c + 0.017) return 0;
    const k = t / turn + seed * 1.37, who = Math.floor(k) % amps.length;
    if (k % 1 < 0.07) return 0;                      // the gap between overs
    const fade = 0.6 + 0.4 * Math.sin(t * 0.4 + who * 2.1 + seed);
    const syll = 0.5 + 0.5 * Math.sin(t * (7 + who) + Math.sin(t * 3.1 + who) * 2);
    const shape = g(u, c, 0.0068) * (0.7 + 0.3 * Math.sin(u * 1400 + t * 20 + who));
    return (0.35 + 0.4 * syll) * amps[who] * fade * shape;
  };
}
function ssb(c, amp, seed, dx = false) {
  return (u, t) => {
    if (u < c - 0.016 || u > c + 0.016) return 0;
    const talking = dx ? Math.sin(t * 0.5) > -0.6 : Math.sin(t * (0.35 + hash(seed) * 0.5) + seed * 2.3) > 0.1;
    if (!talking) return 0;
    const syll = 0.5 + 0.5 * Math.sin(t * (8 + seed % 5) + Math.sin(t * 3.3 + seed) * 2);
    const shape = g(u, c, 0.0065) * (0.7 + 0.3 * Math.sin(u * 1400 + t * 20 + seed));
    return (0.35 + 0.4 * syll) * amp * shape;
  };
}

export function createSpectrum() {
  const group = new THREE.Group();
  const levels = new Float32Array(BINS * ROWS);
  const tex = new THREE.DataTexture(levels, BINS, ROWS, THREE.RedFormat, THREE.FloatType);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;

  const uniforms = {
    uLevels: { value: tex }, uHead: { value: 0 }, uFrac: { value: 0 }, uRows: { value: ROWS },
    uSize: { value: new THREE.Vector3(SIZE.width, SIZE.height, SIZE.depth) },
    uLow: { value: new THREE.Color('#3aa7ff') }, uMid: { value: new THREE.Color('#5de3ff') }, uHigh: { value: new THREE.Color('#e0fff9') },
  };
  const uPx = { value: 1 };
  const placeGLSL = /* glsl */`
    uniform sampler2D uLevels; uniform float uHead, uFrac, uRows; uniform vec3 uSize;
    vec3 place(float u, float row, out float lvl, out float a) {
      a = mod(uHead - row + uRows, uRows);
      lvl = texture(uLevels, vec2(u, (row + 0.5) / uRows)).r;
      float z = uSize.z * 0.5 - (a + uFrac) / (uRows - 1.0) * uSize.z;
      return vec3((u - 0.5) * uSize.x, lvl * uSize.y, z);
    }`;
  const colorGLSL = /* glsl */`
    uniform vec3 uLow, uMid, uHigh;
    vec3 ramp(float l) { return mix(mix(uLow, uMid, smoothstep(0.05, 0.35, l)), uHigh, smoothstep(0.45, 0.95, l)); }`;
  const grid = (pairs) => {
    const n = pairs ? BINS - 1 : BINS;
    const pos = new Float32Array(ROWS * n * (pairs ? 6 : 3));
    let k = 0;
    for (let r = 0; r < ROWS; r++) for (let b = 0; b < n; b++) {
      pos[k++] = b / (BINS - 1); pos[k++] = r; pos[k++] = 0;
      if (pairs) { pos[k++] = (b + 1) / (BINS - 1); pos[k++] = r; pos[k++] = 0; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    return geo;
  };
  group.add(new THREE.LineSegments(grid(true), new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: placeGLSL + `varying float vL, vA; void main(){ vec3 p = place(position.x, position.y, vL, vA); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: colorGLSL + `uniform float uRows; varying float vL, vA; void main(){ float fresh = 1.0 - vA / uRows; float a = (0.08 + 0.9 * smoothstep(0.04, 0.6, vL)) * fresh * fresh; if (vA < 0.5) a = 0.9 + vL; gl_FragColor = vec4(ramp(vL) * a, 1.0); }`,
  })));
  group.add(new THREE.Points(grid(false), new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPx }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: placeGLSL + `uniform float uPx; varying float vL, vA; void main(){ vec3 p = place(position.x, position.y, vL, vA); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = smoothstep(0.22, 0.9, vL) * uPx * 420.0 / -mv.z; }`,
    fragmentShader: colorGLSL + `uniform float uRows; varying float vL, vA; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float k = exp(-d * d * 4.0); float fresh = 1.0 - vA / uRows; gl_FragColor = vec4(ramp(vL) * k * 0.22 * fresh, 1.0); }`,
  })));

  let profile = PROFILES.mixed, signals = profile.make();
  let row = 0, acc = 0, now = 0;
  function pushTrace(t) {
    row = (row + 1) % ROWS;
    const base = row * BINS;
    for (let b = 0; b < BINS; b++) {
      const u = b / (BINS - 1);
      let v = profile.floor + 0.03 * Math.random() * Math.random() + 0.01 * Math.sin(u * 9 + t * 0.3);
      for (const s of signals) { const x = s(u, t); if (x > v) v = x; }
      levels[base + b] = v;
    }
    uniforms.uHead.value = row;
    tex.needsUpdate = true;
  }
  const t0 = performance.now() / 1000;
  for (let i = 0; i < ROWS; i++) pushTrace(t0 + (i - ROWS) / RATE);

  return {
    group,
    get label() { return profile.label; },
    setProfile(name) {
      const p = PROFILES[name] || PROFILES.mixed;
      if (p === profile) return false;
      profile = p; signals = p.make();
      return true;
    },
    setPixelScale(v) { uPx.value = v; },
    // The live signal level at u (0..1 across the span), without the noise
    // floor — so overlays can sit on, and react to, the modelled signals.
    sample(u, t = now) { let v = 0; for (const s of signals) { const x = s(u, t); if (x > v) v = x; } return v; },
    // Local maxima above `min`, as [{u, v}], scanning `n` points.
    peaks(min = 0.25, n = 360, t = now) {
      const out = []; let a = 0, b = this.sample(0, t);
      for (let i = 1; i < n; i++) {
        const c = this.sample(i / (n - 1), t);
        if (b > min && b >= a && b > c) out.push({ u: (i - 1) / (n - 1), v: b });
        a = b; b = c;
      }
      return out;
    },
    update(t, dt) {
      now = t;
      acc += dt * RATE;
      while (acc >= 1) { pushTrace(t); acc -= 1; }
      uniforms.uFrac.value = acc;
    },
  };
}

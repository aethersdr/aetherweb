// A live 3D stacked-trace panadapter: the hero's backdrop on its own, and the
// first station of the 3D stage.
//
// The band is synthetic but shaped like a real one: a noise floor, CW keying,
// SSB voice bursts, an FT8 sub-band on 15-second cycles, and a drifting
// carrier. The middle of the span is left to the noise floor so the hero copy
// sits over a quiet stretch of band. Each new trace is pushed into a ring
// buffer texture that the vertex shader reads, so the CPU writes BINS floats
// per trace and never touches the geometry again.

const BINS = 384;          // points per trace
const ROWS = 72;           // traces in the stack
const WIDTH = 120;         // world units across the band
const DEPTH = 150;         // world units from newest trace to oldest
const HEIGHT = 14;         // world units for a full-scale signal
const RATE = 22;           // traces pushed per second

export const SPECTRUM_DEPTH = DEPTH;

export function createSpectrum(THREE) {
  const group = new THREE.Group();

  const levels = new Float32Array(BINS * ROWS);
  const tex = new THREE.DataTexture(levels, BINS, ROWS, THREE.RedFormat, THREE.FloatType);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;

  const uniforms = {
    uLevels: { value: tex },
    uHead: { value: 0 },        // row index of the newest trace
    uFrac: { value: 0 },        // 0..1 progress toward the next push, for smooth scroll
    uRows: { value: ROWS },
    uSize: { value: new THREE.Vector3(WIDTH, HEIGHT, DEPTH) },
    uLow: { value: new THREE.Color('#3aa7ff') },
    uMid: { value: new THREE.Color('#5de3ff') },
    uHigh: { value: new THREE.Color('#d8fff8') },
  };
  const uPx = { value: 1 };

  // Shared vertex logic: (u, row) -> local position, level, age.
  const placeGLSL = /* glsl */`
    uniform sampler2D uLevels; uniform float uHead, uFrac, uRows; uniform vec3 uSize;
    float age(float row) { return mod(uHead - row + uRows, uRows); }
    vec3 place(float u, float row, out float lvl, out float a) {
      a = age(row);
      lvl = texture(uLevels, vec2(u, (row + 0.5) / uRows)).r;
      float z = -(a + uFrac) / (uRows - 1.0) * uSize.z;
      return vec3((u - 0.5) * uSize.x, lvl * uSize.y, z);
    }`;
  const colorGLSL = /* glsl */`
    uniform vec3 uLow, uMid, uHigh;
    vec3 ramp(float l) { return mix(mix(uLow, uMid, smoothstep(0.05, 0.35, l)), uHigh, smoothstep(0.45, 0.95, l)); }`;

  // One (u, row) vertex grid, reused by the traces and the glow points.
  const grid = (pairs) => {
    const pos = new Float32Array(ROWS * (pairs ? (BINS - 1) * 2 : BINS) * 3);
    let k = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let b = 0; b < (pairs ? BINS - 1 : BINS); b++) {
        pos[k++] = b / (BINS - 1); pos[k++] = r; pos[k++] = 0;
        if (pairs) { pos[k++] = (b + 1) / (BINS - 1); pos[k++] = r; pos[k++] = 0; }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    return geo;
  };

  // Traces: one line strip per row, drawn as LineSegments so it is one draw call.
  group.add(new THREE.LineSegments(grid(true), new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: placeGLSL + /* glsl */`
      varying float vL, vA;
      void main() {
        vec3 p = place(position.x, position.y, vL, vA);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: colorGLSL + /* glsl */`
      uniform float uRows; varying float vL, vA;
      void main() {
        float fresh = 1.0 - vA / uRows;
        float a = (0.10 + 0.9 * smoothstep(0.04, 0.6, vL)) * fresh * fresh;
        if (vA < 0.5) a = 0.9 + vL;                 // the live trace, bright
        gl_FragColor = vec4(ramp(vL) * a, 1.0);
      }`,
  })));

  // Glow points riding the signals — additive soft sprites stand in for bloom,
  // so there is no post-processing pass and no addons to vendor.
  group.add(new THREE.Points(grid(false), new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPx },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: placeGLSL + /* glsl */`
      uniform float uPx; varying float vL, vA;
      void main() {
        vec3 p = place(position.x, position.y, vL, vA);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float s = smoothstep(0.22, 0.9, vL);
        gl_PointSize = s * uPx * 260.0 / -mv.z;
      }`,
    fragmentShader: colorGLSL + /* glsl */`
      uniform float uRows; varying float vL, vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float g = exp(-d * d * 4.0);
        float fresh = 1.0 - vA / uRows;
        gl_FragColor = vec4(ramp(vL) * g * 0.24 * fresh, 1.0);
      }`,
  })));

  const signals = makeBand();
  let row = 0, acc = 0;
  function pushTrace(t) {
    row = (row + 1) % ROWS;
    const base = row * BINS;
    for (let b = 0; b < BINS; b++) {
      const u = b / (BINS - 1);
      // Noise floor: grainy, with a slow QSB-like swell across the band.
      let v = 0.035 + 0.03 * Math.random() * Math.random() + 0.012 * Math.sin(u * 9 + t * 0.3);
      for (const s of signals) v = Math.max(v, s(u, t));
      levels[base + b] = v;
    }
    uniforms.uHead.value = row;
    tex.needsUpdate = true;
  }
  const t0 = performance.now() / 1000;
  for (let i = 0; i < ROWS; i++) pushTrace(t0 + (i - ROWS) / RATE);

  return {
    group,
    // Glow sprite scale: device pixels per CSS pixel times viewport height / 900.
    setPixelScale(v) { uPx.value = v; },
    update(t, dt) {
      acc += dt * RATE;
      while (acc >= 1) { pushTrace(t); acc -= 1; }
      uniforms.uFrac.value = acc;
    },
  };
}

// A band plan's worth of activity. Each entry is (u, t) -> level, where u is
// 0..1 across the span and t is seconds. Shapes are Gaussians; what makes each
// one read as its mode is how it moves over time.
function makeBand() {
  const g = (u, c, w) => Math.exp(-((u - c) ** 2) / (2 * w * w));
  const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const out = [];

  // CW: narrow carriers keyed in pseudo-random dits and dahs.
  [0.13, 0.16, 0.19, 0.22].forEach((c, i) => {
    out.push((u, t) => {
      const slot = Math.floor(t * (7 + i * 2));
      const on = hash(slot * 3.1 + i * 17) > 0.42 && Math.floor(t / 6 + i) % 3 !== 0;
      return on ? (0.45 + i * 0.08) * g(u, c, 0.0018) : 0;
    });
  });

  // FT8: a cluster of 50 Hz-wide tones that all start and stop on 15 s cycles.
  for (let i = 0; i < 14; i++) {
    const c = 0.255 + hash(i + 1) * 0.07, amp = 0.2 + hash(i + 40) * 0.35;
    out.push((u, t) => {
      const cyc = Math.floor(t / 15), ph = t % 15;
      const active = hash(cyc * 13 + i) > 0.35 && ph > 0.4 && ph < 13.0;
      const wob = Math.sin(t * 6.28 * 6.25 + i) * 0.0009;   // 8-FSK shimmer
      return active ? amp * g(u, c + wob, 0.0016) : 0;
    });
  }

  // SSB: 2.7 kHz voice, a ragged hump that comes and goes with syllables.
  [0.63, 0.70, 0.78, 0.85].forEach((c, i) => {
    out.push((u, t) => {
      if (u < c - 0.02 || u > c + 0.02) return 0;
      const talking = Math.sin(t * 0.21 + i * 2.3) > -0.3;
      if (!talking) return 0;
      const syll = 0.5 + 0.5 * Math.sin(t * (9 + i) + Math.sin(t * 3.3 + i) * 2);
      const shape = g(u, c, 0.008) * (0.7 + 0.3 * Math.sin(u * 900 + t * 20));
      return (0.35 + 0.35 * syll) * (0.75 + i * 0.07) * shape;
    });
  });

  // A strong broadcast-style carrier drifting slowly, for the eye to follow.
  out.push((u, t) => 0.8 * g(u, 0.36 + Math.sin(t * 0.08) * 0.012, 0.0022));

  return out;
}

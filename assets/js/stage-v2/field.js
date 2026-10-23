// One shared particle field that re-forms into a new shape at every station.
// Shapes are in station-local units: x across, y up, -z away from the camera,
// centred on the station origin. On a move every particle flies from wherever
// it is now to its new spot, each with its own small delay, so the field
// streams across the ring alongside the camera.

const N = 6000;
const TAU = Math.PI * 2;
const R = (a, b) => a + (b - a) * Math.random();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Each shape takes a particle index and returns [x, y, z].
export const SHAPES = {
  // Hero: a thin ionospheric sheet arched high over the band.
  ionosphere: () => {
    const x = R(-110, 110), z = R(-200, 10);
    return [x, 46 + Math.cos(x * 0.012) * 8 + Math.sin(z * 0.03 + x * 0.02) * 3 + R(-1, 1), z];
  },
  // Features: a 4 x 2 wall of panadapter windows, each with a trace inside.
  windows: (i) => {
    const w = 24, h = 13, c = i % 8, ox = ((c % 4) - 1.5) * (w + 5), oy = (c < 4 ? 1 : -1) * (h + 4) / 2 + 4;
    let x, y;
    if (Math.random() < 0.45) {
      const e = Math.floor(R(0, 4)), t = Math.random();
      [x, y] = e === 0 ? [t * w, 0] : e === 1 ? [t * w, h] : e === 2 ? [0, t * h] : [w, t * h];
    } else {
      x = R(1, w - 1);
      const peak = Math.exp(-(((x / w) - 0.3 - 0.4 * ((c * 37) % 10) / 10) ** 2) / 0.002);
      y = 2 + Math.random() * 0.6 + peak * 8;
    }
    return [ox + x - w / 2, oy + y - h / 2, -30];
  },
  // Spectrum: a waterfall plane, signals as streaks running into the distance.
  waterfall: () => {
    const cols = [-44, -30, -27, -6, 12, 15, 18, 38];
    const x = Math.random() < 0.55 ? pick(cols) + R(-0.8, 0.8) : R(-60, 60);
    return [x, -8 + R(-0.2, 0.2), R(-120, 0)];
  },
  // Hardware: a radio front panel — display, big tuning knob, small knobs.
  radio: () => {
    const r = Math.random();
    if (r < 0.3) { const e = Math.floor(R(0, 4)), t = Math.random(); const [x, y] = e === 0 ? [t, 0] : e === 1 ? [t, 1] : e === 2 ? [0, t] : [1, t]; return [-48 + x * 96, -12 + y * 30, -30]; }
    if (r < 0.55) { const e = Math.floor(R(0, 4)), t = Math.random(); const [x, y] = e === 0 ? [t, 0] : e === 1 ? [t, 1] : e === 2 ? [0, t] : [1, t]; return [-42 + x * 46, -2 + y * 16, -29]; }
    if (r < 0.62) { const x = R(0, 46); return [-42 + x, 2 + Math.exp(-((x - 30) ** 2) / 4) * 9 + Math.random() * 0.5, -29]; }
    if (r < 0.85) { const a = R(0, TAU), rr = Math.random() < 0.7 ? 9 : R(0, 9); return [26 + Math.cos(a) * rr, 3 + Math.sin(a) * rr, -29]; }
    const k = Math.floor(R(0, 4)), a = R(0, TAU); return [-34 + k * 12 + Math.cos(a) * 2.2, -7 + Math.sin(a) * 2.2, -29];
  },
  // Download: three platform columns, released together.
  columns: (i) => {
    const c = (i % 3) - 1, a = R(0, TAU), r = 7 + R(-0.3, 0.3);
    return [c * 34 + Math.cos(a) * r, R(-18, 26), -34 + Math.sin(a) * r];
  },
  // How it's built: a double helix with rungs.
  helix: (i) => {
    const t = R(0, 1), a = t * TAU * 3.5;
    if (i % 5 === 0) { const s = R(-1, 1); return [(t - 0.5) * 130, Math.cos(a) * 10 * s + 4, Math.sin(a) * 10 * s - 34]; }
    const s = (i % 2) * Math.PI;
    return [(t - 0.5) * 130, Math.cos(a + s) * 10 + 4, Math.sin(a + s) * 10 - 34];
  },
  // Partners: separate clusters joined by threads.
  clusters: (i) => {
    const C = [[-46, 8, -40], [-20, -6, -30], [6, 14, -44], [30, -4, -32], [52, 10, -42]];
    if (i % 4 === 0) { const k = Math.floor(R(0, 4)), t = Math.random(), a = C[k], b = C[k + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    const c = C[i % 5], u = R(-1, 1), a = R(0, TAU), s = Math.sqrt(1 - u * u), r = 6 + R(-0.4, 0.4);
    return [c[0] + r * s * Math.cos(a), c[1] + r * u, c[2] + r * s * Math.sin(a)];
  },
  // Contribute: a lattice — many hands, one structure.
  lattice: () => {
    const s = 9;
    return [Math.round(R(-7, 7)) * s + R(-0.2, 0.2), Math.round(R(-2, 4)) * s + R(-0.2, 0.2), -24 - Math.round(R(0, 4)) * s];
  },
  // Sponsor: an S-meter — the arc, its tick marks, and a needle well up the scale.
  smeter: (i) => {
    const r = Math.random(), a0 = Math.PI * 0.85, a1 = Math.PI * 0.15;
    if (r < 0.5) { const a = R(a1, a0), rr = 34 + R(-0.4, 0.4); return [Math.cos(a) * rr, Math.sin(a) * rr - 20, -34]; }
    if (r < 0.75) { const k = Math.floor(R(0, 13)), a = a0 + (a1 - a0) * (k / 12), rr = R(30, 34); return [Math.cos(a) * rr, Math.sin(a) * rr - 20, -34]; }
    const a = a0 + (a1 - a0) * 0.78, t = Math.random() * 36; return [Math.cos(a) * t, Math.sin(a) * t - 20, -33];
  },
};

export function createField(THREE) {
  const geo = new THREE.BufferGeometry();
  const to = new Float32Array(N * 3), from = new Float32Array(N * 3);
  const delay = new Float32Array(N), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { delay[i] = Math.random() * 0.45; seed[i] = Math.random(); }
  geo.setAttribute('position', new THREE.BufferAttribute(to, 3));
  geo.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
  geo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);

  const uniforms = {
    uP: { value: 1 }, uTime: { value: 0 }, uScale: { value: 300 },
    uColor: { value: new THREE.Color('#5de3ff') }, uOpacity: { value: 1.0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aFrom; attribute float aDelay, aSeed;
      uniform float uP, uTime, uScale;
      varying float vTw;
      void main() {
        float k = clamp((uP - aDelay) / 0.55, 0.0, 1.0);
        k = k * k * (3.0 - 2.0 * k);
        vec3 p = mix(aFrom, position, k);
        p.y += sin(k * 3.14159) * (10.0 + aSeed * 30.0);
        p += 0.35 * vec3(sin(uTime * 0.7 + aSeed * 40.0), cos(uTime * 0.9 + aSeed * 31.0), sin(uTime * 0.5 + aSeed * 17.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uScale * (0.5 + aSeed * 0.9) / -mv.z;
        vTw = 0.55 + 0.45 * sin(uTime * 1.3 + aSeed * 60.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity; varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float g = exp(-d * d * 5.0);
        gl_FragColor = vec4(uColor * g * vTw * uOpacity, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);

  const ease = (x) => x * x * (3 - 2 * x);
  const v = new THREE.Vector3();
  let morphT = 1;               // seconds into the current morph / morph length
  const target = new THREE.Color();

  return {
    points,
    // Re-form into `shape`, placed by the station's local->world matrix.
    morph(shape, matrix, color, instant = false) {
      // Start from where each particle is *now*, mid-flight or not.
      const p = uniforms.uP.value;
      for (let i = 0; i < N; i++) {
        const k = ease(Math.min(1, Math.max(0, (p - delay[i]) / 0.55)));
        for (let a = 0; a < 3; a++) from[i * 3 + a] += (to[i * 3 + a] - from[i * 3 + a]) * k;
        const s = SHAPES[shape](i);
        v.set(s[0], s[1], s[2]).applyMatrix4(matrix);
        to[i * 3] = v.x; to[i * 3 + 1] = v.y; to[i * 3 + 2] = v.z;
        if (instant) { from[i * 3] = v.x; from[i * 3 + 1] = v.y; from[i * 3 + 2] = v.z; }
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aFrom.needsUpdate = true;
      uniforms.uP.value = instant ? 1 : 0;
      morphT = instant ? 1 : 0;
      target.set(color);
      if (instant) uniforms.uColor.value.copy(target);
    },
    update(t, dt, pxScale) {
      morphT = Math.min(1, morphT + dt / 2.0);
      uniforms.uP.value = morphT;
      uniforms.uTime.value = t;
      uniforms.uScale.value = 420 * pxScale;
      uniforms.uColor.value.lerp(target, 1 - Math.exp(-3 * dt));
    },
  };
}

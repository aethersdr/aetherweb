// Renderer, bloom, camera rig, picking, and the frame loop.
//
// The camera never jumps: every move is a flight from where it is to a new
// (position, target) pair, arcing up and out so the world reads as one place.
// With reduced motion the flight is a cut.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function createEngine(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
  renderer.setClearColor(0x05090f, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05090f, 0.0016);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);

  scene.add(new THREE.HemisphereLight(0x9fdcff, 0x05090f, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(120, 260, 180);
  scene.add(key);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.45, 0.6);   // threshold 0.6: only real highlights glow, not label text
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- camera rig
  const pos = new THREE.Vector3(0, 900, 1400), tgt = new THREE.Vector3(0, 0, 0);
  const want = { pos: pos.clone(), tgt: tgt.clone() };
  const flight = { on: false, u: 0, dur: 2, p0: new THREE.Vector3(), t0: new THREE.Vector3(), lift: 0, done: null };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function flyTo(p, t, { dur = 2.2, lift = null, instant = REDUCED } = {}) {
    want.pos.copy(p); want.tgt.copy(t);
    if (instant) { pos.copy(p); tgt.copy(t); flight.on = false; return Promise.resolve(); }
    flight.p0.copy(pos); flight.t0.copy(tgt);
    const d = pos.distanceTo(p);
    flight.lift = lift ?? Math.min(160, d * 0.22);
    flight.dur = Math.min(3.2, Math.max(1.1, dur * (0.5 + d / 900)));
    flight.u = 0; flight.on = true;
    return new Promise((res) => { flight.done = res; });
  }

  // ---- picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickables = [];
  let hovered = null;
  function pickAt(clientX, clientY) {
    ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables.map((p) => p.object), true);
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.pick) o = o.parent;
      if (o && o.visible !== false) return o.userData.pick;
    }
    return null;
  }
  canvas.addEventListener('pointermove', (e) => {
    const p = pickAt(e.clientX, e.clientY);
    if (p !== hovered) {
      if (hovered && hovered.onHover) hovered.onHover(false);
      hovered = p;
      if (p && p.onHover) p.onHover(true);
      canvas.style.cursor = p ? 'pointer' : '';
      api.onHoverChange && api.onHoverChange(p);
    }
  });
  let downAt = null;
  canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const p = pickAt(e.clientX, e.clientY);
    if (p && p.onClick) p.onClick();
  });

  // ---- size
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(Math.round(w / 2), Math.round(h / 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    api.pxScale = renderer.getPixelRatio() * h / 900;
  }
  addEventListener('resize', resize);

  // ---- loop
  const updaters = [];
  // The panels cover the sides of the screen; shift the projection so the
  // scene centres in the gap between them.
  let shiftPx = 0, wantShift = 0;
  let last = performance.now(), raf = 0, warp = 0;
  const shake = new THREE.Vector3();
  function frame(now) {
    raf = 0;
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-2.5 * dt));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-2.5 * dt));

    warp = 0;
    if (flight.on) {
      flight.u = Math.min(1, flight.u + dt / flight.dur);
      const e = easeInOut(flight.u), s = Math.sin(flight.u * Math.PI);
      pos.lerpVectors(flight.p0, want.pos, e);
      pos.y += flight.lift * s;
      tgt.lerpVectors(flight.t0, want.tgt, e);
      warp = s;
      if (flight.u >= 1) { flight.on = false; flight.done && flight.done(); }
    } else {
      const k = 1 - Math.exp(-3 * dt);
      pos.lerp(want.pos, k); tgt.lerp(want.tgt, k);
    }
    // Pointer parallax: orbit slightly around the target, never through it.
    const off = pos.clone().sub(tgt);
    const dist = off.length();
    const side = new THREE.Vector3().crossVectors(off, camera.up).normalize();
    shake.copy(side).multiplyScalar(mouse.x * dist * 0.035).addScaledVector(camera.up, -mouse.y * dist * 0.02);
    camera.position.copy(pos).add(shake);
    camera.lookAt(tgt);
    shiftPx += (wantShift - shiftPx) * (1 - Math.exp(-4 * dt));
    if (Math.abs(shiftPx) > 0.5) camera.setViewOffset(innerWidth, innerHeight, -shiftPx, 0, innerWidth, innerHeight);
    else camera.clearViewOffset();

    for (const u of updaters) u(t, dt, warp);
    composer.render();
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });

  const api = {
    THREE, renderer, scene, camera, bloom, pxScale: 1,
    flyTo,
    get flying() { return flight.on; },
    setInsets(left, right) { wantShift = (left - right) / 2; },
    addPickable(object, pick) { object.userData.pick = pick; pickables.push({ object, pick }); },
    onUpdate(fn) { updaters.push(fn); },
    onHoverChange: null,
    start() { resize(); raf = requestAnimationFrame(frame); },
    resize,
  };
  return api;
}

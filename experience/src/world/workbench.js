// The with / without workbench that floats over a station.
//
// WITHOUT: each separate program the workflow needs is a window, and every
// hand-off between them (virtual audio, virtual serial CAT, telnet, PTT) is a
// cable with traffic moving along it. The windows drift a little out of step,
// on purpose. WITH: the windows fly into the real AetherSDR screen, the cables
// pull in after them, and the AetherSDR features that replaced them light up
// around it. One value, mix (0 = without, 1 = with), drives everything.

import * as THREE from 'three';
import { toolWindowTexture, shotTexture, SHOTS, labelSprite, glowTexture } from './textures.js';

const LINK = {
  audio: { color: '#f0a35e', label: 'virtual audio' },
  cat: { color: '#e879f9', label: 'virtual serial / CAT' },
  net: { color: '#86efac', label: 'telnet / network' },
  ptt: { color: '#fca5a5', label: 'PTT / keying' },
  usb: { color: '#fde68a', label: 'USB / hardware' },
};
export const LINK_TYPES = LINK;

const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

export function createWorkbench(engine) {
  const root = new THREE.Group();
  root.visible = false;
  engine.scene.add(root);

  let windows = [], cables = [], chips = [], screen = null, frame = null;
  let mix = 0, want = 0, presence = 0, wantPresence = 0;

  function clear() {
    // Per-scenario canvases (window faces, labels) are freed; the shared
    // screenshots and glow texture are kept.
    const kill = (o) => {
      o.traverse((n) => {
        if (n.geometry) n.geometry.dispose();
        if (!n.material) return;
        const map = n.material.map;
        if (map && map.isCanvasTexture && map !== glowTexture()) map.dispose();
        n.material.dispose();
      });
      root.remove(o);
    };
    windows.forEach((w) => kill(w.mesh)); cables.forEach((c) => { kill(c.line); c.pulses.forEach(kill); }); chips.forEach((c) => kill(c.sprite));
    if (screen) kill(screen);
    windows = []; cables = []; chips = []; screen = null;
  }

  function build(sc, features) {
    clear();
    const tools = sc.without.tools;
    const n = tools.length;
    // Scatter the windows on a loose arc, never quite aligned.
    tools.forEach((tool, i) => {
      const tex = toolWindowTexture(tool);
      const w = 17, h = w * 400 / 640;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
      const a = n === 1 ? 0 : (i / (n - 1) - 0.5) * 1.9;
      const home = new THREE.Vector3(Math.sin(a) * 40 + (rnd() - 0.5) * 6, (i % 2 ? 8 : -8) + (rnd() - 0.5) * 7, -Math.cos(a) * 14 + 10 + (rnd() - 0.5) * 6);
      const rot = new THREE.Euler((rnd() - 0.5) * 0.25, -a * 0.55 + (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.22);
      mesh.renderOrder = 4;
      root.add(mesh);
      windows.push({ mesh, home, rot, phase: rnd() * 6.28, w, h });
    });

    // Cables between windows, typed by what they carry.
    (sc.without.links || []).forEach(([a, b, type], k) => {
      if (!windows[a] || !windows[b]) return;
      const color = new THREE.Color(LINK[type] ? LINK[type].color : '#f0a35e');
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(40 * 3), 3));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false }));
      line.renderOrder = 3;
      line.frustumCulled = false;
      root.add(line);
      const pulses = [0, 0.5].map(() => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
        s.scale.set(3.2, 3.2, 1);
        s.renderOrder = 5;
        root.add(s);
        return s;
      });
      cables.push({ a, b, type, line, pulses, sag: 6 + rnd() * 10, speed: 0.25 + rnd() * 0.3, off: k * 0.37, curve: new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]) });
    });

    // The real app.
    const shot = SHOTS[sc.with.shot || 'stack3d'];
    const sw = 56, shh = sw * shot.h / shot.w;
    screen = new THREE.Group();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(sw, shh), new THREE.MeshBasicMaterial({ map: shotTexture(sc.with.shot || 'stack3d'), transparent: true, toneMapped: false, depthWrite: false }));
    face.renderOrder = 6;
    screen.add(face);
    const border = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(sw + 1.4, shh + 1.4)), new THREE.LineBasicMaterial({ color: '#5de3ff', transparent: true, toneMapped: false }));
    border.renderOrder = 7;
    screen.add(border);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#3aa7ff', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(sw * 1.9, shh * 2.2, 1);
    glow.position.z = -2;
    screen.add(glow);
    screen.userData = { face, border, glow, w: sw, h: shh };
    root.add(screen);

    // The features that replaced the tools, ringed around the screen.
    // Centred rows above the screen, wrapped to its width — open sky there.
    const short = (n) => n.split(' — ')[0].split(' (')[0].split(' & four')[0];
    const sprites = features.slice(0, 9).map((f) => labelSprite(short(f.name), { height: 2.6, color: f.aether ? '#eaf2fb' : '#8ef7e6', bg: 'rgba(6,16,24,0.88)', border: f.aether ? 'rgba(142,247,230,0.9)' : 'rgba(93,227,255,0.5)' }));
    const rows = [[]];
    let width = 0;
    for (const s of sprites) {
      if (width + s.scale.x > sw * 1.05 && rows[rows.length - 1].length) { rows.push([]); width = 0; }
      rows[rows.length - 1].push(s); width += s.scale.x + 1.2;
    }
    rows.forEach((row, r) => {
      const total = row.reduce((a, s) => a + s.scale.x, 0) + (row.length - 1) * 1.2;
      let x = -total / 2;
      row.forEach((sprite) => {
        const home = new THREE.Vector3(x + sprite.scale.x / 2, shh / 2 + 3.4 + (rows.length - 1 - r) * 3.6, 2);
        x += sprite.scale.x + 1.2;
        sprite.renderOrder = 8;
        root.add(sprite);
        chips.push({ sprite, home, i: chips.length });
      });
    });
  }

  const tmp = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler();
  engine.onUpdate((t, dt) => {
    mix += (want - mix) * (1 - Math.exp(-4 * dt));
    presence += (wantPresence - presence) * (1 - Math.exp(-5 * dt));
    root.visible = presence > 0.01;
    if (!root.visible) return;
    if (frame) { root.matrix.copy(frame); root.matrixAutoUpdate = false; root.matrixWorldNeedsUpdate = true; }

    const m = mix, chaos = 1 - m;
    // Windows: drift in place without, fly into the screen with.
    windows.forEach((w, i) => {
      const k = Math.min(1, Math.max(0, m * 1.4 - (i / Math.max(1, windows.length)) * 0.4));
      const ek = k * k * (3 - 2 * k);
      tmp.copy(w.home);
      tmp.x += Math.sin(t * 0.7 + w.phase) * 1.2 * chaos;
      tmp.y += Math.cos(t * 0.9 + w.phase) * 1.0 * chaos;
      tmp.lerp(new THREE.Vector3((i - (windows.length - 1) / 2) * 5, 0, 0), ek);
      w.mesh.position.copy(tmp);
      e.set(w.rot.x * (1 - ek) + Math.sin(t * 0.5 + w.phase) * 0.03 * chaos, w.rot.y * (1 - ek), w.rot.z * (1 - ek));
      w.mesh.quaternion.setFromEuler(e);
      const s = (1 - ek * 0.85) * presence;
      w.mesh.scale.setScalar(Math.max(0.001, s));
      w.mesh.material.opacity = (1 - ek) * presence;
    });
    // Cables follow their windows; traffic pulses run along them.
    cables.forEach((c) => {
      const A = windows[c.a].mesh.position, B = windows[c.b].mesh.position;
      const mid = tmp.copy(A).add(B).multiplyScalar(0.5);
      mid.y -= c.sag * chaos + Math.sin(t * 1.3 + c.off * 9) * 1.5 * chaos;
      mid.z += 6 * chaos;
      c.curve.points[0].copy(A); c.curve.points[1].copy(mid); c.curve.points[2].copy(B);
      const arr = c.line.geometry.attributes.position.array;
      for (let i = 0; i < 40; i++) { const p = c.curve.getPoint(i / 39); arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; }
      c.line.geometry.attributes.position.needsUpdate = true;
      c.line.material.opacity = 0.85 * Math.pow(chaos, 1.5) * presence;
      c.pulses.forEach((s, j) => {
        const u = (t * c.speed + c.off + j * 0.5) % 1;
        s.position.copy(c.curve.getPoint(u));
        s.material.opacity = Math.pow(chaos, 2) * presence;
      });
    });
    // The real app arrives as the tools leave.
    if (screen) {
      const k = Math.min(1, Math.max(0, (m - 0.25) / 0.75));
      const ek = k * k * (3 - 2 * k);
      screen.scale.setScalar(Math.max(0.001, (0.6 + 0.4 * ek) * presence));
      screen.position.set(0, 0, -6 + 6 * ek);
      screen.userData.face.material.opacity = ek * presence;
      screen.userData.border.material.opacity = ek * presence * (0.7 + 0.3 * Math.sin(t * 2));
      screen.userData.glow.material.opacity = 0.3 * ek * presence;
    }
    chips.forEach((c) => {
      const k = Math.min(1, Math.max(0, (m - 0.5 - c.i * 0.04) / 0.4));
      c.sprite.position.copy(c.home).add(tmp.set(0, (1 - k) * -4, 0));
      c.sprite.material.opacity = k * presence;
    });
  });

  return {
    root,
    show(sc, features, frameMatrix) {
      build(sc, features);
      frame = frameMatrix;
      wantPresence = 1;
    },
    hide() { wantPresence = 0; },
    setMode(withAether, instant = false) { want = withAether ? 1 : 0; if (instant) mix = want; },
    get mode() { return want; },
  };
}

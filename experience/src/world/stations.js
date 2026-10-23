// Operator stations: one per persona, on a ring around the hub. Every prop is
// a dark solid with glowing edges in the persona's colour, so the stations
// share the panadapter's visual language. Monitors show the real app.
//
// Station-local frame: -z points at the hub. The operator sits facing the hub
// with the monitors in front of them, so the camera can look over their
// shoulder, through the screens, to the live band beyond.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { labelSprite, shotTexture, glowTexture, loggerTexture, notepadTexture, digitalDeskTexture, menuTexture } from './textures.js';

export const RING = 300;

const solid = new THREE.MeshStandardMaterial({ color: 0x0d1724, roughness: 0.75, metalness: 0.35 });

function edged(geo, color, { opacity = 0.9, mat = solid } = {}) {
  const m = new THREE.Mesh(geo, mat);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  m.add(e);
  return m;
}
const box = (w, h, d, color, o) => edged(new THREE.BoxGeometry(w, h, d), color, o);
const cyl = (rt, rb, h, color, seg = 10) => edged(new THREE.CylinderGeometry(rt, rb, h, seg), color);

function screen(shot, w, color) {
  const tex = typeof shot === 'string' ? shotTexture(shot) : shot;
  const h = w * 0.58;
  const grp = new THREE.Group();
  const bezel = box(w + 1.2, h + 1.2, 0.8, color);
  grp.add(bezel);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  face.position.z = 0.45;
  grp.add(face);
  const stand = box(1, 5, 1, color); stand.position.set(0, -h / 2 - 2.5, -0.6); grp.add(stand);
  return grp;
}

// A laptop: keyboard deck with a key grid, and a lid hinged at the back edge,
// tipped back, showing the real app.
function laptop(shot, w, color) {
  const grp = new THREE.Group();
  const h = w * 0.58, d = h * 0.95;
  const deck = box(w + 0.8, 0.5, d, color); deck.position.set(0, 0.25, 0); grp.add(deck);
  const keys = [];
  for (let r = 0; r <= 4; r++) { const z = -d / 2 + 0.8 + r * (d * 0.55 / 4); keys.push(-w / 2 + 0.6, 0.52, z, w / 2 - 0.6, 0.52, z); }
  for (let k = 0; k <= 12; k++) { const x = -w / 2 + 0.6 + k * ((w - 1.2) / 12); keys.push(x, 0.52, -d / 2 + 0.8, x, 0.52, -d / 2 + 0.8 + d * 0.55); }
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute(keys, 3));
  grp.add(new THREE.LineSegments(kg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })));
  const pad = box(w * 0.28, 0.1, d * 0.22, color); pad.position.set(0, 0.55, d / 2 - d * 0.16); grp.add(pad);
  const lid = new THREE.Group();
  lid.position.set(0, 0.5, -d / 2); lid.rotation.x = -0.28; grp.add(lid);
  const bezel = box(w + 0.8, h + 0.8, 0.35, color); bezel.position.y = (h + 0.8) / 2; lid.add(bezel);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: typeof shot === 'string' ? shotTexture(shot) : shot, toneMapped: false }));
  face.position.set(0, (h + 0.8) / 2, 0.2); lid.add(face);
  return grp;
}

function radio(color, w = 11) {
  const grp = new THREE.Group();
  const body = box(w, 4.2, 8, color); grp.add(body);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.45, 2.4), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.7), toneMapped: false }));
  disp.position.set(-w * 0.18, 0.2, 4.01); grp.add(disp);
  const knob = cyl(1.2, 1.2, 0.8, color, 16); knob.rotation.x = Math.PI / 2; knob.position.set(w * 0.3, 0, 4.3); grp.add(knob);
  return grp;
}

// A seated operator: low-poly, edge-lit, wearing headphones unless the
// station has speakers. `lean` tips the chair back and the upper body with it.
// `reach` (two x positions) puts the hands on the desk in front: the
// contester's keyboard and paddle. `mic` adds a headset boom.
function operator(color, { lean = 0, phones = true, reach = null, mic = false, chair = true } = {}) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x0f1c2c, roughness: 0.6, metalness: 0.2, emissive: new THREE.Color(color), emissiveIntensity: 0.12 });
  const part = (geo) => edged(geo, color, { mat, opacity: 0.7 });
  if (chair === 'bistro') {
    // A café chair: round seat, four thin legs, a hoop back.
    const seat = cyl(3.4, 3.4, 0.6, color, 16); seat.position.set(0, 7.2, 0.4); grp.add(seat);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const leg = cyl(0.22, 0.22, 7, color, 6); leg.position.set(x * 2.3, 3.5, 0.4 + z * 2.3); leg.rotation.set(-z * 0.08, 0, x * 0.08); grp.add(leg); });
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(3, 0.22, 6, 20, Math.PI), solid); hoop.position.set(0, 10.4, 3.6); grp.add(hoop);
    hoop.add(new THREE.LineSegments(new THREE.EdgesGeometry(hoop.geometry, 25), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })));
  } else if (chair) {
    const chairSeat = box(7, 1, 7, color, { opacity: 0.5 }); chairSeat.position.set(0, 7, 0); grp.add(chairSeat);
    const chairPost = cyl(0.4, 0.4, 6, color); chairPost.position.set(0, 3.5, 0); grp.add(chairPost);
  }
  const hips = part(new THREE.BoxGeometry(5.4, 2.4, 5)); hips.position.set(0, 8.8, 0.4); grp.add(hips);
  // Everything above the hips pivots back together.
  const upper = new THREE.Group();
  upper.position.set(0, 8.8, 0.4);
  upper.rotation.x = lean;
  grp.add(upper);
  const at = (o, x, y, z) => { o.position.set(x, y - 8.8, z - 0.4); upper.add(o); return o; };
  if (chair === true) at(box(7, 9, 1, color, { opacity: 0.5 }), 0, 12, 3.6);
  const torso = at(part(new THREE.CylinderGeometry(2.4, 2.8, 8, 8)), 0, 14, 0.8); torso.rotation.x = -0.12;
  at(part(new THREE.IcosahedronGeometry(2.1, 1)), 0, 20.2, 0.1);
  const glow = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  if (phones) at(new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.35, 8, 20, Math.PI), glow), 0, 20.4, 0.1);
  // A limb (or boom) from a to b, in the operator's own unrotated frame.
  const limb = (a, b, t, m = null) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const geo = new THREE.BoxGeometry(t, t, d.length());
    const o = m ? new THREE.Mesh(geo, m) : part(geo);
    at(o, ...A.clone().addScaledVector(d, 0.5).toArray());
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.normalize());
    return o;
  };
  if (mic) { limb([-2.5, 19.9, 0.1], [-1.6, 18.6, -1.6], 0.28, glow); limb([-1.6, 18.6, -1.6], [-0.3, 18.5, -2.2], 0.28, glow); }
  // Where a hand at desk height (y 12.4, 1.5 in front of the desk edge)
  // sits in the unrotated frame, given the lean.
  const handAt = (x) => {
    const y1 = 12.4 - 8.8, z1 = (1.5 - 7) - 0.4, c = Math.cos(lean), sn = Math.sin(lean);
    return [x, 8.8 + y1 * c + z1 * sn, 0.4 - y1 * sn + z1 * c];
  };
  [-1, 1].forEach((s) => {
    if (phones) { const cup = at(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12), new THREE.MeshBasicMaterial({ color, toneMapped: false })), s * 2.4, 20.2, 0.1); cup.rotation.z = Math.PI / 2; }
    const thigh = part(new THREE.BoxGeometry(1.9, 1.8, 6)); thigh.position.set(s * 1.4, 8.6, -2.6); grp.add(thigh);
    const shin = part(new THREE.BoxGeometry(1.7, 7, 1.7)); shin.position.set(s * 1.4, 4.4, -5.4); grp.add(shin);
    if (reach) {
      // Hunched over the desk: shoulder, elbow out and down, hand on the gear.
      const hand = handAt(reach[(s + 1) / 2]), sh = [s * 3.1, 17.3, 0.4];
      const elbow = [s * 3.9 + (hand[0] - s * 3.1) * 0.25, 13.6, -1.0];
      limb(sh, elbow, 1.5); limb(elbow, hand, 1.4);
    } else if (lean) {
      // Leaning back: elbows down, hands folded on the stomach.
      const arm = at(part(new THREE.BoxGeometry(1.5, 5.5, 1.5)), s * 3.2, 14.4, 0.6); arm.rotation.z = s * 0.12;
      const fore = at(part(new THREE.BoxGeometry(4, 1.4, 1.4)), s * 1.6, 11.8, -1.6); fore.rotation.y = s * 0.35;
    } else {
      const arm = at(part(new THREE.BoxGeometry(1.5, 5.5, 1.5)), s * 3.2, 14.6, -0.4); arm.rotation.x = 0.5;
      at(part(new THREE.BoxGeometry(1.4, 1.4, 5.5)), s * 3, 12.2, -4.2);
    }
  });
  return grp;
}

// A box from a to b (station-local), for boom arms and rods.
function rod(a, b, t, color) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
  const m = box(t, t, d.length(), color);
  m.position.copy(A).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.normalize());
  return m;
}

// A broadcast dynamic mic on a boom arm (SM7B-style: a fat body in a yoke,
// big windscreen), clamped to the desk at `clamp`, aimed at the mouth.
function boomMic(color, clamp, mouth) {
  const grp = new THREE.Group();
  const [cx, cy, cz] = clamp, [mx, my, mz] = mouth;
  const mic = [mx, my - 0.4, mz - 5.4];           // body centre, a hand's width from the face
  const elbow = [cx + (mx - cx) * 0.35, my + 9, cz + (mz - cz) * 0.3];
  const yokeTop = [mic[0], mic[1] + 2.6, mic[2] - 0.6];
  grp.add(rod([cx, cy, cz], [cx, cy + 3, cz], 0.9, color));
  grp.add(rod([cx, cy + 3, cz], elbow, 0.55, color));
  grp.add(rod(elbow, yokeTop, 0.5, color));
  const body = cyl(1.25, 1.25, 4.4, color, 14); body.rotation.x = Math.PI / 2; body.position.set(...mic); grp.add(body);
  const screen = cyl(1.55, 1.55, 2.2, color, 14); screen.rotation.x = Math.PI / 2; screen.position.set(mic[0], mic[1], mic[2] + 3.2); grp.add(screen);
  [-1, 1].forEach((s) => grp.add(rod([mic[0] + s * 1.6, mic[1], mic[2]], [mic[0] + s * 0.5, yokeTop[1], yokeTop[2]], 0.35, color)));
  return grp;
}

// A studio monitor speaker, front facing +z: woofer and tweeter rings.
function speaker(color) {
  const grp = new THREE.Group();
  grp.add(box(5, 7.5, 5.5, color));
  const ring = (r, y) => { const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.72, r, 24), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.85 })); m.position.set(0, y, 2.8); grp.add(m); };
  ring(1.9, -1.2); ring(0.8, 2.3);
  return grp;
}

// Antennas, by the kind of station.
function antenna(kind, color) {
  const grp = new THREE.Group();
  const line = (pts, opacity = 0.85) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  const tower = (h) => {
    const s = 3;
    for (const [x, z] of [[-s, -s], [s, -s], [s, s], [-s, s]]) grp.add(line([[x, 0, z], [x * 0.5, h, z * 0.5]]));
    for (let y = 0; y < h; y += 8) {
      const k = 1 - (y / h) * 0.5, k2 = 1 - ((y + 8) / h) * 0.5;
      grp.add(line([[-s * k, y, -s * k], [s * k2, y + 8, -s * k2], [s * k, y, s * k], [-s * k2, y + 8, s * k2], [-s * k, y, -s * k]], 0.45));
    }
  };
  const yagi = (y, len, els) => {
    grp.add(line([[0, y, -len / 2], [0, y, len / 2]]));
    for (let i = 0; i < els; i++) { const z = -len / 2 + (i / (els - 1)) * len, w = 22 - i * 1.6; grp.add(line([[-w / 2, y, z], [w / 2, y, z]])); }
  };
  if (kind === 'stack') { tower(70); yagi(52, 26, 6); yagi(70, 30, 7); grp.add(line([[0, 46, 0], [0, 78, 0]])); }
  else if (kind === 'yagi') { tower(58); yagi(62, 34, 8); grp.add(line([[0, 56, 0], [0, 66, 0]])); }
  else if (kind === 'vertical') {
    grp.add(line([[0, 0, 0], [0, 34, 0]]));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; grp.add(line([[0, 1, 0], [Math.cos(a) * 14, 0, Math.sin(a) * 14]], 0.5)); }
  } else if (kind === 'endfed') {
    grp.add(line([[0, 0, 0], [0, 26, 0]])); // telescoping mast
    grp.add(line([[0, 26, 0], [-18, 14, -10], [-40, 2, -18]], 0.8));
  } else if (kind === 'dipole') {
    // An inverted V for 75 m: one mast, two long legs sloping away.
    grp.add(line([[0, 0, 0], [0, 44, 0]]));
    grp.add(line([[14, 5, -40], [0, 44, 0], [14, 5, 34]], 0.8));   // legs recede from the camera
  } else if (kind === 'hexport') {
    // A portable hex beam: tripod, push-up mast, spreaders and wire.
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; grp.add(line([[Math.cos(a) * 6, 0, Math.sin(a) * 6], [0, 9, 0]])); }
    grp.add(line([[0, 0, 0], [0, 28, 0]]));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; grp.add(line([[0, 25, 0], [Math.cos(a) * 12, 28, Math.sin(a) * 12]], 0.6)); }
    const hex = [];
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI * 2; hex.push([Math.cos(a) * 12, 28, Math.sin(a) * 12]); }
    grp.add(line(hex, 0.8));
  } else if (kind === 'hex') {
    grp.add(line([[0, 0, 0], [0, 40, 0]]));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, b = ((i + 1) / 6) * Math.PI * 2; grp.add(line([[0, 40, 0], [Math.cos(a) * 14, 38, Math.sin(a) * 14], [Math.cos(b) * 14, 38, Math.sin(b) * 14]], 0.6)); }
  }
  return grp;
}

// A pile-up over the station: the DX, and a wall of callers flickering in
// and out. Placeholder calls only; hidden while a scenario is open.
function pileup(grp, anims, { dx, color, y = 39, z = -9 }) {
  const calls = ['XX1ABC', 'XX5KZ', 'XX2DEF', 'XX7RT', 'XX3MNO', 'XX4WB', 'XX8JQ', 'XX6PL'];
  const top = labelSprite(dx, { height: 3.4, color: '#ffffff', border: 'rgba(255,255,255,0.6)', mono: true });
  top.position.set(0, y, z); top.userData.hideInScenario = true; grp.add(top);
  const callers = calls.map((c, i) => {
    const sp = labelSprite(c, { height: 2.6, color, mono: true });
    sp.position.set(-27 + (i % 4) * 16 + (i > 3 ? 8 : 0), y - (i > 3 ? 9 : 4.5), z + 1 - (i % 3) * 2.5);
    sp.material.opacity = 0; sp.userData.hideInScenario = true; grp.add(sp); return sp;
  });
  anims.push((t) => {
    callers.forEach((sp, i) => { const k = Math.max(0, Math.sin(t * (2.3 + i * 0.37) + i * 1.9)); sp.material.opacity = k * k; });
    top.material.opacity = 0.75 + 0.25 * Math.sin(t * 1.3);
  });
}

// Per-persona dressing. `look` comes from the persona data.
function dress(grp, look, color) {
  const desk = (w, d) => { const top = box(w, 1.2, d, color); top.position.set(0, 11, -2); grp.add(top); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const leg = box(1, 11, 1, color, { opacity: 0.5 }); leg.position.set(x * (w / 2 - 1), 5.5, -2 + z * (d / 2 - 1)); grp.add(leg); }); };
  const mon = (shot, x, w = 16, rot = 0) => { const s = screen(shot, w, color); s.position.set(x, 11.6 + 2.5 + w * 0.29 + 2.6, -6.5); s.rotation.y = rot; s.rotation.x = -0.05; grp.add(s); return s; };
  const rig = (x, w) => { const r = radio(color, w); r.position.set(x, 13.8, -4); grp.add(r); };

  const anims = grp.userData.anims = [];
  if (look.desk === 'contest') {
    desk(56, 15);
    // Four screens in an arc: a logger at each end (run radio, S&P radio),
    // AetherSDR in the middle.
    const arc = [[-21.6, 0.42, -3.4], [-7.6, 0.1, -6.5], [7.6, -0.1, -6.5], [21.6, -0.42, -3.4]];
    const faces = [
      loggerTexture({ title: 'Contest log — Radio 1', band: '40 m', mode: 'RUN', seed: 3 }),
      look.shots[0], look.shots[1] || look.shots[0],
      loggerTexture({ title: 'Contest log — Radio 2', band: '20 m', mode: 'S&P', accent: '#5de3ff', seed: 8 }),
    ];
    arc.forEach(([x, rot, z], i) => { const m = mon(faces[i], x, 13.5, rot); m.position.z = z; });
    rig(-13.6, 8.5); rig(13.6, 8.5);
    const kb = box(11, 0.6, 3.6, color); kb.position.set(-3.5, 11.9, 0.6); grp.add(kb);
    const paddle = box(2.4, 0.8, 3, color); paddle.position.set(6.5, 12, 1.2); grp.add(paddle);
    [-0.35, 0.35].forEach((x) => { const lever = box(0.25, 1.6, 1.2, color); lever.position.set(6.5 + x, 13.1, 0.4); grp.add(lever); });
    // Notepad and pencil.
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(5, 7), new THREE.MeshBasicMaterial({ map: notepadTexture(), color: 0x8a8a8a, toneMapped: false }));
    pad.rotation.set(-Math.PI / 2, 0, 0.35); pad.position.set(-15, 11.66, 1.4); grp.add(pad);
    const pencil = new THREE.Group();
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 5.6, 6), new THREE.MeshBasicMaterial({ color: '#f5c542', toneMapped: false }));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), new THREE.MeshBasicMaterial({ color: '#3a2f25', toneMapped: false }));
    tip.position.y = -3.15; tip.rotation.x = Math.PI; pencil.add(wood, tip);
    pencil.rotation.set(0, 0, Math.PI / 2); pencil.rotation.y = 0.9; pencil.position.set(-14.2, 11.9, 2.2); grp.add(pencil);
    const can = cyl(0.85, 0.85, 3, color, 12); can.position.set(18, 13.1, 3); grp.add(can);
    // The hands: live, so they can key the paddle and hammer the keyboard.
    const handMat = new THREE.MeshStandardMaterial({ color: 0x0f1c2c, roughness: 0.6, emissive: new THREE.Color(color), emissiveIntensity: 0.35 });
    const hands = [[-3.5, 12.75, 1.4], [6.5, 13.0, 1.9]].map((pos) => {
      const h = edged(new THREE.BoxGeometry(1.5, 0.9, 1.9), color, { mat: handMat });
      h.position.set(...pos); h.userData.live = true; grp.add(h); return h;
    });
    anims.push((t) => {
      hands[0].position.y = 12.75 + Math.abs(Math.sin(t * 17)) * 0.35;           // typing a call
      hands[1].position.x = 6.5 + Math.sin(t * 38) * Math.max(0, Math.sin(t * 2.7)) * 0.3;   // keying bursts
    });
    pileup(grp, anims, { dx: 'XX9ZZ  UP 5', color: look.color || '#ffb547' });
  } else if (look.desk === 'island') {
    // A DXpedition on a sandbar: lagoon, sand mound, palm; crates for a
    // desk and a seat; solar panels charging a battery that runs the radio;
    // a portable hex beam on a tripod.
    const water = new THREE.Mesh(new THREE.CircleGeometry(45.5, 64), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime; varying vec2 vP;
        void main(){
          float r = length(vP);
          float w = sin(r * 0.7 - uTime * 1.2) * 0.6 + sin(vP.x * 0.22 + uTime * 0.5) * sin(vP.y * 0.27 - uTime * 0.4) * 0.4;
          float crest = smoothstep(0.7, 1.0, w);
          vec3 c = mix(vec3(0.01, 0.05, 0.09), vec3(0.03, 0.16, 0.22), smoothstep(46.0, 26.0, r)) + crest * vec3(0.05, 0.14, 0.17);
          gl_FragColor = vec4(c, 0.9);
        }`,
    }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.05; water.userData.live = true; grp.add(water);
    anims.push((t) => { water.material.uniforms.uTime.value = t; });
    const sand = new THREE.Mesh(new THREE.SphereGeometry(30, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#c9a66b', roughness: 1, emissive: '#3a2a12', emissiveIntensity: 0.6, transparent: true, opacity: 0.3, depthWrite: false }));
    sand.scale.set(1, 0.09, 0.85); sand.position.set(2, 0, 2); sand.userData.live = true; grp.add(sand);

    const wood = new THREE.MeshStandardMaterial({ color: '#7a5634', roughness: 0.9, emissive: '#2a1a0c', emissiveIntensity: 0.5 });
    const crate = (w, h, d, x, y, z, ry = 0) => {
      const c = edged(new THREE.BoxGeometry(w, h, d), '#e0b07a', { mat: wood, opacity: 0.7 });
      c.position.set(x, y, z); c.rotation.y = ry; c.userData.live = true; grp.add(c);
      // slats
      const sl = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([-0.33, 0.33].flatMap((k) => [new THREE.Vector3(-w / 2, h * k, d / 2 + 0.02), new THREE.Vector3(w / 2, h * k, d / 2 + 0.02)])), new THREE.LineBasicMaterial({ color: '#e0b07a', transparent: true, opacity: 0.5 }));
      c.add(sl); return c;
    };
    const base = 2.2;                                     // the sand's height under the station
    crate(13, 6.5, 9, -1, base + 3.25, -3);               // the desk: two crates stacked
    crate(11, 3, 8, -1.5, base + 8, -3.2, 0.06);
    crate(8, 9.4, 7, 13, base + 4.7, -3, -0.12);          // a taller crate for the radio
    crate(6.5, 6.6, 6.5, 0, base + 3.3, 7);              // the seat
    const lap = screen(look.shots[0], 11, color); lap.position.set(-1.5, base + 9.5 + 3.6, -4.5); lap.rotation.set(-0.22, 0, 0); grp.add(lap);
    const r = radio(color, 8); r.position.set(13, base + 9.4 + 2.1, -3.4); grp.add(r);
    const mic = cyl(0.5, 0.5, 2.2, color, 8); mic.position.set(5, base + 9.5 + 1.1, -0.5); grp.add(mic);

    // Power: two panels on A-frames, a battery, and cables.
    [[-30, -4], [-30, 9]].forEach(([x, z]) => {
      const panel = new THREE.Group();
      // Wireframe: the frame and the cell grid, 8 × 4.
      const seg = [];
      for (let k = 0; k <= 8; k++) { const x = -6 + k * 1.5; seg.push(x, -3.75, 0, x, 3.75, 0); }
      for (let k = 0; k <= 4; k++) { const y = -3.75 + k * 1.875; seg.push(-6, y, 0, 6, y, 0); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
      const grid = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 }));
      grid.userData.live = true; panel.add(grid);   // keep its own dimmer colour
      // A near-black backing so the grid reads as cells.
      const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.5), new THREE.MeshBasicMaterial({ color: '#050a16', side: THREE.DoubleSide }));
      back.position.z = -0.05; panel.add(back);
      panel.position.set(x, base + 4.6, z); panel.rotation.set(-1.05, 0.9, 0, 'YXZ'); grp.add(panel);
      grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x + 3.6, base, z - 1.5), new THREE.Vector3(x + 1.6, base + 4.6, z), new THREE.Vector3(x + 3.6, base, z + 1.5)]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })));
    });
    const batt = box(5, 3.6, 3.5, color); batt.position.set(-17, base + 1.8, 3); grp.add(batt);
    [[-1.3, '#ff5a5a'], [1.3, '#1d1d1d']].forEach(([dx, col]) => { const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); tm.position.set(-17 + dx, base + 3.95, 3); grp.add(tm); });
    const cable = (pts) => { const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))); grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(24)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }))); };
    cable([[-27, base + 2, -3], [-23, base + 0.3, 0], [-18.5, base + 3.6, 2.5]]);
    cable([[-27, base + 2, 8], [-22, base + 0.3, 6], [-18.5, base + 3.6, 3.5]]);
    cable([[-15.5, base + 3.6, 3], [-5, base + 0.3, 6], [8, base + 0.3, 2], [12, base + 9.4, -0.2]]);
    // Feedline from the hex beam to the radio.
    cable([[24, base + 1, 14], [20, base + 0.3, 6], [15, base + 2, 0], [14, base + 10.5, -1]]);

    // A palm tree.
    const palm = new THREE.Group(); palm.userData.live = true;
    const trunkPts = []; for (let k = 0; k <= 10; k++) trunkPts.push(new THREE.Vector3(Math.sin(k / 10 * 1.2) * 4, k * 3.2, 0));
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trunkPts), 20, 0.9, 6), new THREE.MeshStandardMaterial({ color: '#6b4a2c', roughness: 1, emissive: '#2a1a0c', emissiveIntensity: 0.6 }));
    palm.add(trunk);
    const crown = trunkPts[10];
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, pts = [];
      for (let u = 0; u <= 8; u++) { const d = u * 1.4; pts.push(new THREE.Vector3(crown.x + Math.cos(a) * d, crown.y + 1.2 - (d * d) * 0.09, Math.sin(a) * d)); }
      palm.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.45, 4), new THREE.MeshBasicMaterial({ color: '#2b7d45', toneMapped: false })));
    }
    palm.position.set(-25, base - 0.5, -9); palm.scale.setScalar(0.85); grp.add(palm);

    pileup(grp, anims, { dx: 'XX9ZZ  QRZ?', color: look.color || '#5de3ff', y: 37, z: -12 });
  } else if (look.desk === 'digital') {
    // One big screen, four apps: GridTracker2, WSJT-X, AetherSDR, OpsLog.
    desk(40, 14);
    const quad = digitalDeskTexture(look.shots[0]);
    const big = screen(quad, 34, color);
    big.traverse((o) => { if (o.material && o.material.map === quad) o.material.color.setScalar(0.82); });   // keep the light apps out of the bloom
    big.position.set(0, 11.6 + 2.5 + 34 * 0.29 + 2.6, -6.8); big.rotation.x = -0.05; grp.add(big);
    rig(15, 8);
    const kb = box(11, 0.6, 3.6, color); kb.position.set(-2, 11.9, 0.8); grp.add(kb);
    const mouse = box(1.4, 0.6, 2.2, color); mouse.position.set(6, 11.9, 1); grp.add(mouse);
  } else if (look.desk === 'picnic') {
    const top = box(30, 1, 13, color); top.position.set(0, 10, -2); grp.add(top);
    [-1, 1].forEach((s) => { const bench = box(30, 0.8, 4, color, { opacity: 0.6 }); bench.position.set(0, 6, -2 + s * 10); grp.add(bench); const a = box(1, 10, 12, color, { opacity: 0.5 }); a.position.set(s * 12, 5, -2); grp.add(a); });
    const lap = laptop(look.shots[0], 13, color); lap.position.set(0, 10.5, -1.5); grp.add(lap);
    const batt = box(4, 3, 3, color); batt.position.set(9, 12, -4); grp.add(batt);
    rig(-8, 7);
  } else if (look.desk === 'cafe') {
    // A coffee shop: a bistro table with the laptop and a coffee, a counter
    // with an espresso machine and a chalkboard menu, pendant lamps, a window,
    // another table and a plant.
    const top = cyl(9, 9, 0.8, color, 20); top.position.set(0, 11, -3); grp.add(top);
    const post = cyl(0.6, 0.6, 11, color); post.position.set(0, 5.5, -3); grp.add(post);
    const foot = cyl(3.5, 3.5, 0.5, color, 16); foot.position.set(0, 0.25, -3); grp.add(foot);
    const lap = laptop(look.shots[0], 12, color); lap.position.set(-0.5, 11.4, -2); grp.add(lap);
    const saucer = cyl(1.7, 1.5, 0.25, color, 16); saucer.position.set(6.4, 11.55, 0); grp.add(saucer);
    const cup = cyl(1.05, 0.8, 2.2, color, 14); cup.position.set(6.4, 12.8, 0); grp.add(cup);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.18, 6, 12), solid); handle.position.set(7.55, 12.9, 0); handle.rotation.y = Math.PI / 2; grp.add(handle);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.95, 14), new THREE.MeshBasicMaterial({ color: '#3b2414', toneMapped: false })); coffee.rotation.x = -Math.PI / 2; coffee.position.set(6.4, 13.85, 0); grp.add(coffee);
    const steam = [0, 1, 2].map((k) => {
      const pts = []; for (let u = 0; u <= 10; u++) pts.push(new THREE.Vector3(Math.sin(u * 0.9 + k * 2) * 0.35, u * 0.45, 0));
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#e8f1ff', transparent: true, opacity: 0.5 }));
      l.position.set(6.4 + (k - 1) * 0.45, 14, 0); l.userData.live = true; grp.add(l); return l;
    });
    anims.push((t) => steam.forEach((l, k) => { const ph = (t * 0.45 + k / 3) % 1; l.position.y = 14 + ph * 2.5; l.material.opacity = 0.55 * Math.sin(ph * Math.PI); l.rotation.y = t * 0.4 + k; }));

    // The counter along the left, espresso machine, menu board.
    const counter = box(7, 10, 34, color); counter.position.set(-32, 5, -4); grp.add(counter);
    const topSlab = box(8.4, 0.6, 35, color); topSlab.position.set(-32, 10.3, -4); grp.add(topSlab);
    const machine = box(5, 4.6, 7, color); machine.position.set(-32, 12.9, -10); grp.add(machine);
    [-2, 0, 2].forEach((z) => { const g1 = cyl(0.35, 0.35, 1.4, color, 6); g1.position.set(-29.3, 12, -10 + z); g1.rotation.z = Math.PI / 2; grp.add(g1); });
    const grinder = cyl(1.2, 1.6, 4, color, 10); grinder.position.set(-32, 12.6, -2); grp.add(grinder);
    [0, 1, 2].forEach((k) => { const c = cyl(0.8, 0.65, 1.6, color, 10); c.position.set(-31 + k * 0.1, 11.4, 5 + k * 2.2); grp.add(c); });
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(13, 8.6), new THREE.MeshBasicMaterial({ map: menuTexture(), color: 0xb8b8b8, toneMapped: false }));
    menu.position.set(-35.4, 24, -4); menu.rotation.y = Math.PI / 2; grp.add(menu);

    // Pendant lamps over the table and the counter.
    [[0, -3], [-32, -10], [-32, 4]].forEach(([x, z]) => {
      grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 44, z), new THREE.Vector3(x, 33, z)]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 })));
      const shade = edged(new THREE.ConeGeometry(2.2, 2.4, 14, 1, true), color, { opacity: 0.8 }); shade.position.set(x, 32, z); grp.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffe2a8', toneMapped: false })); bulb.position.set(x, 30.9, z); grp.add(bulb);
    });

    // A window on the right: frame and mullions.
    const win = [];
    const wx = 33, y0 = 8, y1 = 32, z0 = -20, z1 = 6;
    for (const z of [z0, (z0 + z1) / 2, z1]) win.push(wx, y0, z, wx, y1, z);
    for (const y of [y0, (y0 + y1) / 2, y1]) win.push(wx, y, z0, wx, y, z1);
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(win, 3));
    grp.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, y1 - y0), new THREE.MeshBasicMaterial({ color: '#0d2236', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
    glass.position.set(wx + 0.05, (y0 + y1) / 2, (z0 + z1) / 2); glass.rotation.y = Math.PI / 2; glass.userData.live = true; grp.add(glass);
    const sill = box(2, 1, z1 - z0 + 2, color); sill.position.set(wx - 0.5, y0 - 0.5, (z0 + z1) / 2); grp.add(sill);

    // Another table, empty but for a cup, and a plant.
    const t2 = cyl(6, 6, 0.7, color, 18); t2.position.set(18, 11, -18); grp.add(t2);
    const p2 = cyl(0.5, 0.5, 11, color); p2.position.set(18, 5.5, -18); grp.add(p2);
    const c2 = cyl(0.9, 0.7, 2, color, 12); c2.position.set(19.5, 12.4, -17); grp.add(c2);
    const pot = cyl(2.6, 2, 5, color, 12); pot.position.set(24, 2.5, 18); grp.add(pot);
    const leaves = new THREE.Group(); leaves.userData.live = true;
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2, pts = [];
      for (let u = 0; u <= 6; u++) { const d = u * 0.9; pts.push(new THREE.Vector3(Math.cos(a) * d, 5 + u * 1.6 - (d * d) * 0.12, Math.sin(a) * d)); }
      leaves.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, 0.35, 4), new THREE.MeshBasicMaterial({ color: '#2b7d45', toneMapped: false })));
    }
    leaves.position.set(24, 0, 18); grp.add(leaves);
  } else if (look.desk === 'studio') {
    desk(44, 14);
    mon(look.shots[0], -7.5, 14, -0.1); mon(look.shots[1] || look.shots[0], 7.5, 14, 0.1);
    [-1, 1].forEach((s) => { const sp = speaker(color); sp.position.set(s * 18, 15.6, -4); sp.rotation.y = -s * 0.4; grp.add(sp); });
    const iface = box(6, 1.6, 4, color); iface.position.set(9, 12.4, 0.5); grp.add(iface);
    [-1.5, 0.5].forEach((x) => { const k = cyl(0.6, 0.6, 0.6, color, 12); k.position.set(9 + x, 13.5, 0.8); grp.add(k); });
    const mug = cyl(1, 0.85, 2.4, color, 12); mug.position.set(-12, 12.8, 1); grp.add(mug);
    // The mouth of the leaning operator, worked out from the figure's pivot.
    const lean = look.lean || 0, opZ = 7, r = 20.2 - 0.8 - 8.8;
    grp.add(boomMic(color, [-20, 11.6, -4], [0, 8.8 + r * Math.cos(lean), opZ + 0.4 + r * Math.sin(lean) - 2.1]));
    const onAir = labelSprite('ON AIR', { height: 2.2, color: '#ff6b5e', border: 'rgba(255,107,94,0.6)' });
    onAir.position.set(0, 31.5, -8); onAir.userData.hideInScenario = true; grp.add(onAir);
  } else {
    desk(32, 13);
    mon(look.shots[0], look.shots.length > 1 ? -7.5 : 0, look.shots.length > 1 ? 15 : 22, look.shots.length > 1 ? -0.12 : 0);
    if (look.shots.length > 1) mon(look.shots[1], 8.5, 15, 0.12);
    rig(12, 9);
  }
  // The operator faces the hub (-z), screens in front of them.
  const island = look.desk === 'island';
  const op = operator(color, { lean: look.lean || 0, phones: look.phones !== false, reach: look.reach || null, mic: !!look.reach, chair: island ? false : look.desk === 'cafe' ? 'bistro' : true });
  op.position.set(0, look.desk === 'picnic' ? -1 : island ? 2.2 - 0.6 : 0, look.desk === 'picnic' ? 8 : 7);
  grp.add(op);
  const ant = antenna(look.antenna, color);
  ant.position.set(...(island ? [24, 2, 15] : [36, 0, 14]));
  grp.add(ant);
}

// A station is built from many small parts; draw it in a handful of calls.
// Every edge and antenna wire becomes one LineSegments (opacity baked into
// vertex colour), the dark solids one mesh, the operator figure one mesh.
// Textured screens and the glowing bits stay as they are.
function mergeProps(props, color) {
  props.updateMatrixWorld(true);
  const inv = props.matrixWorld.clone().invert();
  const rel = (o) => inv.clone().multiply(o.matrixWorld);
  const lines = [], solids = [], figures = [], dead = [];
  let figureMat = null;
  const live = (o) => { for (; o && o !== props; o = o.parent) if (o.userData.live) return true; return false; };
  props.traverse((o) => {
    if (live(o)) return;
    if (o.isLineSegments || o.isLine) {
      let g = o.geometry.clone().applyMatrix4(rel(o));
      if (!o.isLineSegments) {           // strip -> segment pairs
        const src = g.attributes.position.array, out = [];
        for (let i = 0; i + 5 < src.length; i += 3) out.push(src[i], src[i + 1], src[i + 2], src[i + 3], src[i + 4], src[i + 5]);
        g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
      }
      const k = o.material.opacity ?? 1;
      const n = g.attributes.position.count, c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { c[i * 3] = color.r * k; c[i * 3 + 1] = color.g * k; c[i * 3 + 2] = color.b * k; }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      lines.push(g); dead.push(o);
    } else if (o.isMesh && o.material === solid) {
      solids.push(prep(o.geometry.clone().applyMatrix4(rel(o)))); dead.push(o);
    } else if (o.isMesh && o.material.emissive && o.material !== solid) {
      figureMat = o.material;
      figures.push(prep(o.geometry.clone().applyMatrix4(rel(o)))); dead.push(o);
    }
  });
  // Detach merged parts, keeping any unmerged children (screens, displays).
  for (const o of dead) {
    for (const ch of [...o.children]) if (!dead.includes(ch)) { ch.applyMatrix4(o.matrix); o.parent.add(ch); }
    o.parent && o.parent.remove(o);
  }
  if (lines.length) props.add(new THREE.LineSegments(mergeGeometries(lines), new THREE.LineBasicMaterial({ vertexColors: true })));
  if (solids.length) props.add(new THREE.Mesh(mergeGeometries(solids), solid));
  if (figures.length) props.add(new THREE.Mesh(mergeGeometries(figures), figureMat));
}
function prep(g) {
  const ng = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal') ng.deleteAttribute(k);
  if (!ng.attributes.normal) ng.computeVertexNormals();
  return ng;
}

export function createStations(engine, personas, onSelect) {
  const root = new THREE.Group();
  const list = personas.map((p, i) => {
    const a = (i / personas.length) * Math.PI * 2;
    const grp = new THREE.Group();
    // Facing the hub: local -z points at the origin.
    grp.position.set(Math.sin(a) * RING, 0, Math.cos(a) * RING);
    grp.rotation.y = a;
    const color = new THREE.Color(p.color);

    // Platform: a dark disc with a glowing rim.
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 1, 64), new THREE.MeshStandardMaterial({ color: 0x08111c, roughness: 0.9, metalness: 0.1 }));
    disc.position.y = -0.5;
    grp.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(46, 0.35, 8, 128), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.8 }));
    rim.rotation.x = Math.PI / 2;
    grp.add(rim);

    const props = new THREE.Group();
    grp.add(props);
    dress(props, p.look, p.color);
    mergeProps(props, color);

    const label = labelSprite(p.name, { height: 7, sub: p.tagline, color: p.color });
    label.position.set(0, 48, 0);
    grp.add(label);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(120, 120, 1);
    halo.position.y = 18;
    grp.add(halo);

    // Click target: an invisible cylinder over the whole station.
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 60, 16), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 28;
    grp.add(hit);
    const extras = [];
    grp.traverse((o) => { if (o.userData.hideInScenario) extras.push(o); });
    const st = { persona: p, group: grp, angle: a, rim, halo, label, extras, anims: props.userData.anims || [], hover: false, active: false };
    engine.addPickable(hit, {
      kind: 'persona', id: p.id, title: p.name,
      onClick: () => onSelect(p.id),
      onHover: (on) => { st.hover = on; },
    });
    root.add(grp);
    return st;
  });

  engine.onUpdate((t, dt) => {
    for (const s of list) {
      const want = s.active ? 0.07 : s.hover ? 0.06 : 0.0;
      s.halo.material.opacity += (want - s.halo.material.opacity) * (1 - Math.exp(-5 * dt));
      s.rim.material.opacity = 0.55 + 0.35 * Math.sin(t * 2 + s.angle * 3) * (s.active ? 1 : 0.4);
      for (const f of s.anims) f(t);
    }
  });

  return {
    root, list,
    byId: (id) => list.find((s) => s.persona.id === id),
    setActive(id, { label = true } = {}) { list.forEach((s) => { s.active = s.persona.id === id; s.label.visible = !(s.active && !label); s.extras.forEach((o) => { o.visible = s.label.visible; }); }); },
    // Over-the-shoulder view toward the hub, in world space.
    view(id, variant = 'shoulder') {
      const s = this.byId(id);
      const m = s.group.matrixWorld;
      s.group.updateMatrixWorld();
      const local = variant === 'wide' ? [[42, 50, 100], [0, 20, -8]] : [[10, 50, 76], [0, 38, -48]];
      return { pos: new THREE.Vector3(...local[0]).applyMatrix4(m), tgt: new THREE.Vector3(...local[1]).applyMatrix4(m) };
    },
    // Where a scenario's workbench floats: above and in front of the desk.
    benchFrame(id) {
      const s = this.byId(id);
      s.group.updateMatrixWorld();
      return s.group.matrixWorld.clone().multiply(new THREE.Matrix4().makeTranslation(0, 40, -48));
    },
  };
}

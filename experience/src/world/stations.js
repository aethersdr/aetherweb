// Operator stations: one per persona, on a ring around the hub. Every prop is
// a dark solid with glowing edges in the persona's colour, so the stations
// share the panadapter's visual language. Monitors show the real app.
//
// Station-local frame: -z points at the hub. The operator sits facing the hub
// with the monitors in front of them, so the camera can look over their
// shoulder, through the screens, to the live band beyond.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { labelSprite, shotTexture, glowTexture } from './textures.js';

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
  const tex = shotTexture(shot);
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
function operator(color, { lean = 0, phones = true } = {}) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x0f1c2c, roughness: 0.6, metalness: 0.2, emissive: new THREE.Color(color), emissiveIntensity: 0.12 });
  const part = (geo) => edged(geo, color, { mat, opacity: 0.7 });
  const chairSeat = box(7, 1, 7, color, { opacity: 0.5 }); chairSeat.position.set(0, 7, 0); grp.add(chairSeat);
  const chairPost = cyl(0.4, 0.4, 6, color); chairPost.position.set(0, 3.5, 0); grp.add(chairPost);
  const hips = part(new THREE.BoxGeometry(5.4, 2.4, 5)); hips.position.set(0, 8.8, 0.4); grp.add(hips);
  // Everything above the hips pivots back together.
  const upper = new THREE.Group();
  upper.position.set(0, 8.8, 0.4);
  upper.rotation.x = lean;
  grp.add(upper);
  const at = (o, x, y, z) => { o.position.set(x, y - 8.8, z - 0.4); upper.add(o); return o; };
  at(box(7, 9, 1, color, { opacity: 0.5 }), 0, 12, 3.6);
  const torso = at(part(new THREE.CylinderGeometry(2.4, 2.8, 8, 8)), 0, 14, 0.8); torso.rotation.x = -0.12;
  at(part(new THREE.IcosahedronGeometry(2.1, 1)), 0, 20.2, 0.1);
  if (phones) at(new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.35, 8, 20, Math.PI), new THREE.MeshBasicMaterial({ color, toneMapped: false })), 0, 20.4, 0.1);
  [-1, 1].forEach((s) => {
    if (phones) { const cup = at(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 12), new THREE.MeshBasicMaterial({ color, toneMapped: false })), s * 2.4, 20.2, 0.1); cup.rotation.z = Math.PI / 2; }
    const thigh = part(new THREE.BoxGeometry(1.9, 1.8, 6)); thigh.position.set(s * 1.4, 8.6, -2.6); grp.add(thigh);
    const shin = part(new THREE.BoxGeometry(1.7, 7, 1.7)); shin.position.set(s * 1.4, 4.4, -5.4); grp.add(shin);
    if (lean) {
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
  } else if (kind === 'hex') {
    grp.add(line([[0, 0, 0], [0, 40, 0]]));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, b = ((i + 1) / 6) * Math.PI * 2; grp.add(line([[0, 40, 0], [Math.cos(a) * 14, 38, Math.sin(a) * 14], [Math.cos(b) * 14, 38, Math.sin(b) * 14]], 0.6)); }
  }
  return grp;
}

// Per-persona dressing. `look` comes from the persona data.
function dress(grp, look, color) {
  const desk = (w, d) => { const top = box(w, 1.2, d, color); top.position.set(0, 11, -2); grp.add(top); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const leg = box(1, 11, 1, color, { opacity: 0.5 }); leg.position.set(x * (w / 2 - 1), 5.5, -2 + z * (d / 2 - 1)); grp.add(leg); }); };
  const mon = (shot, x, w = 16, rot = 0) => { const s = screen(shot, w, color); s.position.set(x, 11.6 + 2.5 + w * 0.29 + 2.6, -6.5); s.rotation.y = rot; s.rotation.x = -0.05; grp.add(s); return s; };
  const rig = (x, w) => { const r = radio(color, w); r.position.set(x, 13.8, -4); grp.add(r); };

  if (look.desk === 'contest') {
    desk(40, 14);
    mon(look.shots[0], -9.5, 17, -0.18); mon(look.shots[1] || look.shots[0], 9.5, 17, 0.18);
    rig(-11, 10); rig(11, 10);
  } else if (look.desk === 'picnic') {
    const top = box(30, 1, 13, color); top.position.set(0, 10, -2); grp.add(top);
    [-1, 1].forEach((s) => { const bench = box(30, 0.8, 4, color, { opacity: 0.6 }); bench.position.set(0, 6, -2 + s * 10); grp.add(bench); const a = box(1, 10, 12, color, { opacity: 0.5 }); a.position.set(s * 12, 5, -2); grp.add(a); });
    const lap = screen(look.shots[0], 11, color); lap.position.set(0, 15.5, -5); lap.rotation.set(-0.25, 0, 0); grp.add(lap);
    const batt = box(4, 3, 3, color); batt.position.set(9, 12, -4); grp.add(batt);
    rig(-8, 7);
  } else if (look.desk === 'cafe') {
    const top = cyl(9, 9, 0.8, color, 20); top.position.set(0, 11, -3); grp.add(top);
    const post = cyl(0.6, 0.6, 11, color); post.position.set(0, 5.5, -3); grp.add(post);
    const lap = screen(look.shots[0], 12, color); lap.position.set(0, 16, -5); lap.rotation.set(-0.2, 0, 0); grp.add(lap);
    const cup = cyl(1, 0.8, 2.4, color, 12); cup.position.set(6, 12.6, -1); grp.add(cup);
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
  const op = operator(color, { lean: look.lean || 0, phones: look.phones !== false });
  op.position.set(0, look.desk === 'picnic' ? -1 : 0, look.desk === 'picnic' ? 8 : 7);
  grp.add(op);
  const ant = antenna(look.antenna, color);
  ant.position.set(36, 0, 14);
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
  props.traverse((o) => {
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
    const st = { persona: p, group: grp, angle: a, rim, halo, label, extras, hover: false, active: false };
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

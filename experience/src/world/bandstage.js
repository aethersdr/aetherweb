// The use-case stage: the live band explains itself. Each use case gets a
// script of annotations that sit on, and react to, the modelled signals in
// the hub spectrum (tags with drop lines, brackets, slice cursors, spots and
// decodes that pop on real peaks), the use case's numbers rising as glass
// monoliths behind the band, and light paths out to the operators who work
// this way. Everything fades in on arrival and out on the way to the next.
//
// Keys match data/onband.js, so hovering a legend line in the panel lights
// its twin here. Text is dimmed under the bloom threshold, like the atlas.

import * as THREE from 'three';
import { SIZE } from './spectrum.js';
import { labelSprite } from './textures.js';
import { REDUCED } from './engine.js';

const W = SIZE.width, H = SIZE.height, FZ = SIZE.depth / 2;
const X = (u) => (u - 0.5) * W;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const plain = (s) => String(s).replace(/\[\[[^\]]*\]\]/g, '').trim();
const short = (s, n = 44) => { let t = plain(s).split(/ — |\(|;/)[0].trim().replace(/[.,]$/, ''); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const TEXT_DIM = 0.66;          // keeps label text under the bloom threshold
// The camera stands far enough back for the whole band to fit between the
// side panels, so annotation sizes and offsets scale up by K to stay legible.
const K = 2.5;

// High and straight on, like looking down at a panadapter: the station on
// the ring nearest the camera drops out below the frame.
const VANTAGE = { pos: new THREE.Vector3(0, 300, 470), tgt: new THREE.Vector3(0, 14, -20) };
const HIGH = { pos: new THREE.Vector3(0, 330, 490), tgt: new THREE.Vector3(0, 44, -20) };

export function createBandStage(engine, hub, stations) {
  const spec = hub.spectrum;
  bindSpectrum(spec);
  const root = new THREE.Group();
  engine.scene.add(root);
  let clock = 0, cur = null, hot = null;
  const dying = [];

  // ---------------------------------------------------------------- builder
  function build(uc, personaIds) {
    const group = new THREE.Group();
    root.add(group);
    const st = { id: uc.id, group, items: [], anims: [], born: clock, out: null };
    const color = new THREE.Color(uc.color);
    const reg = (obj, mat, base, key, delay = 0) => { st.items.push({ obj, mat, base, key, delay, k: 1 }); return obj; };
    const anim = (f) => st.anims.push(f);

    const b = {
      color,
      sprite(text, { height = 4 * K, color: c = '#eaf2fb', key = null, delay = 0, mono = false, sub = null, bg = 'rgba(6,11,19,0.78)', border = null } = {}) {
        const s = labelSprite(text, { height, color: c, mono, sub, bg, border: border || 'rgba(120,190,230,0.3)' });
        s.material.color.setScalar(TEXT_DIM);
        s.material.opacity = 0;
        group.add(s);
        return reg(s, s.material, 1, key, delay);
      },
      line(points, { color: c = '#ffffff', opacity = 0.7, key = null, delay = 0, dashed = false } = {}) {
        const g = new THREE.BufferGeometry().setFromPoints(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))));
        const m = dashed
          ? new THREE.LineDashedMaterial({ color: new THREE.Color(c).multiplyScalar(0.8), transparent: true, opacity: 0, dashSize: 1.6, gapSize: 1.2, depthWrite: false })
          : new THREE.LineBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.8), transparent: true, opacity: 0, depthWrite: false });
        const l = new THREE.Line(g, m);
        if (dashed) l.computeLineDistances();
        group.add(l);
        return reg(l, m, opacity, key, delay);
      },
      // A label over the front edge with a drop line to the live trace.
      tag(u, text, { key, color: c = '#eaf2fb', y = H + 9 * K, height = 4 * K, delay = 0, mono = true, drop = true } = {}) {
        const s = b.sprite(text, { height, color: c, key, delay, mono, border: c });
        s.position.set(X(u), y, FZ);
        let line = null;
        if (drop) {
          line = b.line([[X(u), y - height * 0.6, FZ], [X(u), 0, FZ]], { color: c, opacity: 0.55, key, delay });
          const pos = line.geometry.attributes.position;
          anim(() => { pos.setY(1, spec.sample(t.u) * H + 0.6 * K); pos.setX(0, X(t.u)); pos.setX(1, X(t.u)); pos.needsUpdate = true; s.position.x = X(t.u); });
        }
        const t = { u, sprite: s, line, move(nu) { t.u = nu; if (!drop) s.position.x = X(nu); } };
        return t;
      },
      // A bracket over a span of the band, with a label.
      bracket(u0, u1, text, { key, color: c = '#eaf2fb', y = H + 4 * K, height = 3.6 * K, delay = 0, dashed = false, sub = null } = {}) {
        const x0 = X(u0), x1 = X(u1);
        b.line([[x0, y - 2.4 * K, FZ], [x0, y, FZ], [x1, y, FZ], [x1, y - 2.4 * K, FZ]], { color: c, opacity: 0.8, key, delay, dashed });
        const s = b.sprite(text, { height, color: c, key, delay, mono: true, sub, border: c });
        s.position.set((x0 + x1) / 2, y + height * 0.9, FZ);
        return s;
      },
      // A slice cursor: a line down the front edge and back across the
      // waterfall history, like a slice marker on the panadapter.
      cursor(u, text, { key, color: c = '#ffd166', y = H + 6 * K, delay = 0 } = {}) {
        const front = b.line([[X(u), 0, FZ], [X(u), y, FZ]], { color: c, opacity: 0.8, key, delay });
        const track = b.line([[X(u), 0.3, -FZ], [X(u), 0.3, FZ]], { color: c, opacity: 0.35, key, delay });
        const s = text ? b.sprite(text, { height: 3.4 * K, color: c, key, delay, mono: true, border: c }) : null;
        if (s) s.position.set(X(u), y + 2.6 * K, FZ);
        const cur = { u, set(nu) {
          cur.u = nu; const x = X(nu);
          for (const l of [front, track]) { const p = l.geometry.attributes.position; p.setX(0, x); p.setX(1, x); p.needsUpdate = true; }
          if (s) s.position.x = x;
        } };
        return cur;
      },
      // A pool of labels that pop over the band, rise and fade.
      pool(texts, { key, colors = null, height = 3 * K, y = H + 3 * K, rise = 7 * K, life = 3.6 } = {}) {
        const live = texts.map((text, i) => {
          const c = colors ? colors[i % colors.length] : '#eaf2fb';
          const s = b.sprite(text, { height, color: c, key, mono: true, border: c });
          const it = st.items[st.items.length - 1];
          it.k = 0;
          return { s, it, start: -1e9, u: 0.5, life, dy: 0 };
        });
        anim(() => live.forEach((p) => {
          const a = (clock - p.start) / p.life;
          if (a < 0 || a > 1) { p.it.k = 0; return; }
          p.it.k = Math.min(1, a * 6) * Math.min(1, (1 - a) * 3);
          p.s.position.set(X(p.u), y + p.dy + ease(a) * rise, FZ);
        }));
        let next = 0;
        return {
          pop(u, i = null, delay = 0, dy = 0) {
            const p = i != null ? live[i % live.length] : live[next++ % live.length];
            p.u = u; p.start = clock + delay; p.dy = dy;
          },
        };
      },
      // A flat ring that pings outward from a point on the front edge.
      ping(u, { key, color: c = '#ffd166' } = {}) {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.7), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), m);
        ring.scale.setScalar(0.001);
        group.add(ring);
        const it = st.items[reg(ring, m, 0.8, key) && st.items.length - 1];
        let start = -1e9, pu = u;
        anim(() => {
          const a = (clock - start) / 1.6;
          if (a < 0 || a > 1) { it.k = 0; return; }
          it.k = 1 - a; const r = (1.2 + a * 6) * K;
          ring.scale.set(r, r, 1); ring.position.set(X(pu), spec.sample(pu) * H + 1 * K, FZ + 0.5);
        });
        return { fire(nu = pu) { pu = nu; start = clock; } };
      },
      // A point out in the world with a label (remote laptop, station gear).
      node(pos, text, { key, color: c = '#eaf2fb', height = 3.6 * K, delay = 0, sub = null } = {}) {
        const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.6), transparent: true, opacity: 0, depthWrite: false });
        const dot = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 * K, 1), m);
        dot.position.copy(pos); group.add(dot); reg(dot, m, 0.9, key, delay);
        const s = b.sprite(text, { height, color: c, key, delay, sub, border: c });
        s.position.copy(pos).add(new THREE.Vector3(0, 4.6 * K, 0));
        return dot;
      },
      // A curved link from a to b with packets running along it.
      link(a, z, { key, color: c = '#eaf2fb', lift = 60, packets = 3, speed = 0.25, both = false, delay = 0, opacity = 0.4 } = {}) {
        const A = a.clone(), Z = z.clone();
        const mid = A.clone().lerp(Z, 0.5).add(new THREE.Vector3(0, lift, 0));
        const curve = new THREE.QuadraticBezierCurve3(A, mid, Z);
        b.line(curve.getPoints(48), { color: c, opacity, key, delay });
        const geo = new THREE.SphereGeometry(0.7 * K, 8, 6);
        const dots = [];
        for (let i = 0; i < packets * (both ? 2 : 1); i++) {
          const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.75), transparent: true, opacity: 0, depthWrite: false });
          const d = new THREE.Mesh(geo, m); group.add(d); reg(d, m, 0.9, key, delay);
          dots.push({ d, ph: i / packets, back: both && i >= packets });
        }
        anim(() => dots.forEach((p) => { const f = (clock * speed + p.ph) % 1; curve.getPoint(p.back ? 1 - f : f, p.d.position); }));
        return curve;
      },
      // Strongest steady carrier between u0 and u1, looking a few seconds ahead.
      carrier(u0, u1, fallback) {
        let best = fallback, bv = 0;
        for (let u = u0; u <= u1; u += 0.0008) {
          let v = 0; for (let k = 0; k < 24; k++) v = Math.max(v, spec.sample(u, clock + k * 0.25));
          if (v > bv) { bv = v; best = u; }
        }
        return best;
      },
      // The quietest window between u0 and u1 over the next few seconds.
      gap(u0, u1, w = 0.02) {
        let best = (u0 + u1) / 2, bv = 1e9;
        for (let u = u0 + w; u <= u1 - w; u += 0.004) {
          let v = 0; for (let k = 0; k < 8; k++) for (let j = -2; j <= 2; j++) v += spec.sample(u + j * w / 2, clock + k * 0.4);
          if (v < bv) { bv = v; best = u; }
        }
        return best;
      },
      anim,
      item(obj) { return st.items.find((x) => x.obj === obj); },
    };

    // The numbers, as glass monoliths rising behind the band.
    const facts = uc.facts || [];
    facts.forEach((f, i) => {
      const n = facts.length, x = n === 1 ? 0 : -84 + (168 * i) / (n - 1), z = -135 - (i % 2) * 16, h = 46 + ((i * 7) % 3) * 9;
      const geo = new THREE.BoxGeometry(26, 1, 3);
      const slabM = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(0.22), transparent: true, opacity: 0, depthWrite: false });
      const slab = new THREE.Mesh(geo, slabM);
      group.add(slab); reg(slab, slabM, 0.55, `fact-${i}`, 0.2 + i * 0.16);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: color.clone().multiplyScalar(0.75), transparent: true, opacity: 0, depthWrite: false }));
      group.add(edge); reg(edge, edge.material, 0.9, `fact-${i}`, 0.2 + i * 0.16);
      // Only the value floats here; the sourced sentence is in the panel.
      const val = b.sprite(f.value, { height: 6.5 * K, color: '#ffffff', key: `fact-${i}`, delay: 0.5 + i * 0.16, border: uc.color });
      const t0 = clock + 0.2 + i * 0.16;
      anim(() => {
        const r = REDUCED ? 1 : ease((clock - t0) / 1.2), hh = Math.max(0.01, h * r);
        for (const o of [slab, edge]) { o.scale.y = hh; o.position.set(x, hh / 2, z); }
        val.position.set(x, hh + 5.5 * K, z);
      });
    });

    // Light paths out to every operator who works this way.
    personaIds.forEach((pid, i) => {
      const s = stations.byId(pid);
      if (!s) return;
      const P = s.group.position.clone().setY(30);
      b.link(new THREE.Vector3(0, H + 4 * K, 0), P, { key: 'who', color: s.persona.color, lift: 70, packets: 2, speed: 0.12, delay: 0.8 + i * 0.12, opacity: 0.3 });
    });

    const script = SCRIPTS[uc.id];
    const view = script ? script(b, uc) || VANTAGE : VANTAGE;
    return { st, view };
  }

  // ---------------------------------------------------------------- frame loop
  engine.onUpdate((t) => {
    clock = t;
    const tick = (st) => {
      for (const f of st.anims) f(t);
      const out = st.out == null ? 1 : 1 - clamp01((t - st.out) / 0.45);
      for (const it of st.items) {
        const inn = REDUCED ? 1 : ease((t - st.born - it.delay) / 0.7);
        const hl = !hot ? 1 : it.key === hot ? 1.25 : it.key ? 0.4 : 1;
        it.mat.opacity = Math.min(1, it.base * it.k * inn * out * hl);
      }
    };
    if (cur) tick(cur);
    for (let i = dying.length - 1; i >= 0; i--) {
      tick(dying[i]);
      if (t - dying[i].out > 0.5) { dispose(dying[i]); dying.splice(i, 1); }
    }
  });

  function dispose(st) {
    st.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    });
    root.remove(st.group);
  }

  return {
    // Show a use case (or nothing). Returns the camera vantage.
    set(uc, personaIds = []) {
      if (cur && uc && cur.id === uc.id) return cur.view;
      if (cur) { cur.out = clock; dying.push(cur); cur = null; }
      hot = null;
      if (!uc) return null;
      const { st, view } = build(uc, personaIds);
      st.view = view;
      cur = st;
      return view;
    },
    highlight(key) { hot = key || null; },
  };
}

// ---------------------------------------------------------------- scripts
// Each returns an optional camera vantage. Placeholder calls only.
const CALLS = ['XX1ABC', 'XX5KZ', 'XX2DEF', 'XX7RT', 'XX3MNO', 'XX4WB', 'XX8JQ', 'XX6PL', 'XX9QQ', 'XX0LM'];

const SCRIPTS = {
  contesting(b) {
    const fq = (u) => (7000 + u * 80).toFixed(1);
    const run = b.carrier(0.24, 0.36, 0.3);
    b.cursor(run, 'A', { key: 'run', color: '#ffb547' });
    b.tag(run, `RUN  ${fq(run)}`, { key: 'run', color: '#ffb547', y: H + 15 * K, height: 4.4 * K });
    const sp = b.cursor(0.5, 'B · S&P', { key: 'sp', color: '#5de3ff', y: H + 6 * K });
    const kinds = [['MULT', '#ffd166'], ['CQ', '#8ef7a8'], ['dupe', '#8598b4']];
    const texts = [], colors = [];
    for (let i = 0; i < 12; i++) { const [k, c] = kinds[i % 3]; texts.push(`${CALLS[i % CALLS.length]} ${k}`); colors.push(c); }
    const spots = b.pool(texts, { key: 'spots', colors, height: 2.8 * K, y: H + 1.5 * K, rise: 5 * K });
    let lastPop = 0, lastSweep = 0, i = 0;
    b.anim((t) => {
      const u = 0.44 + ((t * 0.011) % 0.52);
      sp.set(u);
      if (t - lastSweep > 1.4 && b && spOnSignal(u)) { spots.pop(u, (i++ * 3) % 12); lastSweep = t; }
      if (t - lastPop > 1.1) {
        lastPop = t;
        const pk = specPeaks(0.32).filter((p) => Math.abs(p.u - run) > 0.03 && Math.abs(p.u - u) > 0.03);
        if (pk.length) spots.pop(pk[Math.floor(Math.random() * pk.length)].u, i++);
      }
    });
    function spOnSignal(u) { return specSample(u) > 0.3; }
  },

  dxing(b) {
    b.bracket(0.135, 0.185, 'THE DX', { key: 'dx', color: '#ffffff', y: H + 8 * K, height: 4.2 * K });
    const ping = b.ping(0.16, { key: 'dx', color: '#ffffff' });
    b.bracket(0.41, 0.91, 'THE PILEUP · UP 5–15', { key: 'pile', color: '#5de3ff', y: H + 8 * K, height: 3.8 * K });
    const tx = b.cursor(0.6, 'YOUR TX', { key: 'tx', color: '#ffd166', y: H + 2 * K });
    let target = 0.6, last = -10, wasTalking = false;
    b.anim((t, dt) => {
      if (t - last > 4.5) { last = t; target = b.gap(0.44, 0.88); }
      tx.set(tx.u + (target - tx.u) * 0.04);
      const talking = specSample(0.16) > 0.4;
      if (talking && !wasTalking) ping.fire(0.16);
      wasTalking = talking;
    });
  },

  ft8(b) {
    b.bracket(0.11, 0.89, 'FT8 SUB-BAND · 14.074', { key: 'band', color: '#5de3ff', y: H + 16 * K, height: 3.6 * K });
    // the 15-second cycle as a bar along the front edge
    const x0 = X(0.11), x1 = X(0.89), y = 0.6, z = FZ + 7;
    b.line([[x0, y, z], [x1, y, z]], { color: '#8ef7a8', opacity: 0.25, key: 'cycle' });
    const fill = b.line([[x0, y, z], [x0, y, z]], { color: '#8ef7a8', opacity: 0.95, key: 'cycle' });
    const lab = b.sprite('15 s', { height: 2.6 * K, color: '#8ef7a8', key: 'cycle', mono: true, border: '#8ef7a8' });
    const msgs = [];
    for (let i = 0; i < 12; i++) {
      const a = CALLS[i % CALLS.length], bb = CALLS[(i + 3) % CALLS.length];
      msgs.push([`CQ ${a} FN31`, `${a} ${bb} -12`, `${bb} ${a} RR73`, `${a} ${bb} R-08`][i % 4]);
    }
    const decodes = b.pool(msgs, { key: 'decodes', height: 2.4 * K, y: H + 1 * K, rise: 4 * K, life: 11, colors: ['#8ef7a8', '#eaf2fb', '#eaf2fb', '#eaf2fb'] });
    let captured = [], cyc = -1, fired = -1;
    b.anim((t) => {
      const c = Math.floor(t / 15), ph = t % 15, p = fill.geometry.attributes.position;
      const x = x0 + (x1 - x0) * (ph / 15);
      p.setX(1, x); p.needsUpdate = true; lab.position.set(x, y + 3, z);
      if (ph > 9 && ph < 12 && cyc !== c) { cyc = c; captured = specPeaks(0.12); }
      if (ph > 12.9 && fired !== c) {
        fired = c;
        // the strongest, spaced out so the messages don't overlap
        const pick = [];
        for (const pk of captured.sort((a, bb) => bb.v - a.v)) if (pick.length < 7 && pick.every((q) => Math.abs(q.u - pk.u) > 0.11)) pick.push(pk);
        pick.sort((a, bb) => a.u - bb.u).forEach((pk, k) => decodes.pop(pk.u, null, k * 0.12, (k % 2) * 3.4 * K));
      }
    });
  },

  datamodes(b) {
    const pairAt = (i) => 0.08 + (i / 16) * 0.84;
    const c = pairAt(7);
    b.bracket(c - 0.005, c + 0.017, 'MARK · SPACE', { key: 'pair', color: '#7bf2dc', y: H + 6 * K });
    [3, 12].forEach((i) => b.tag(pairAt(i) + 0.006, 'RTTY', { key: 'pair', color: '#7bf2dc', y: H + 5 * K, height: 2.6 * K }));
    const words = 'CQ TEST XX1ABC XX1ABC CQ TEST XX1ABC K XX5KZ 599 14 TU'.split(' ');
    const text = b.pool(words, { key: 'text', height: 3 * K, y: H + 13 * K, rise: 9 * K, life: 4.2, colors: ['#ffffff'] });
    let last = 0, w = 0;
    b.anim((t) => {
      const on = Math.sin(t * 0.3 + 7 * 1.7) > -0.4;
      if (on && t - last > 0.55) { last = t; text.pop(c + 0.006 + (Math.random() - 0.5) * 0.01, w++ % words.length); }
    });
  },

  digivoice(b) {
    b.bracket(0.596, 0.644, 'SSB WIDTH', { key: 'ssb', color: '#8598b4', y: H + 4 * K, dashed: true, height: 3.2 * K });
    b.bracket(0.608, 0.632, 'RADE · ~1.5 kHz', { key: 'rade', color: '#c9a7ff', y: H + 12 * K, height: 4 * K });
    b.bracket(0.1, 0.24, 'FT8', { key: 'others', color: '#8ef7a8', y: H + 2 * K });
    b.bracket(0.32, 0.4, 'FT4', { key: 'others', color: '#8ef7a8', y: H + 2 * K });
    b.bracket(0.775, 0.875, 'CW', { key: 'others', color: '#8ef7a8', y: H + 2 * K });
  },

  portable(b) {
    const act = 0.8;
    b.tag(0.3, 'WEAK CW · COPIED', { key: 'weak', color: '#8ef7a8', y: H + 4 * K, height: 3 * K });
    b.tag(0.56, 'FT8', { key: 'weak', color: '#8ef7a8', y: H + 2 * K, height: 2.6 * K });
    const spot = b.pool(['XX0AA · PARK SPOTTED'], { key: 'spot', colors: ['#ffd166'], height: 3.8 * K, y: H + 10 * K, rise: 2 * K, life: 10 });
    const ping = b.ping(act, { key: 'spot', color: '#ffd166' });
    const cur = b.cursor(0.35, 'ONE CLICK', { key: 'tune', color: '#5de3ff', y: H + 3 * K });
    let cyc = -1;
    b.anim((t) => {
      const c = Math.floor(t / 12), ph = t % 12;
      if (c !== cyc) { cyc = c; spot.pop(act); ping.fire(act); }
      const go = ph < 2.2 ? 0 : ph < 3.8 ? ease((ph - 2.2) / 1.6) : ph < 10.5 ? 1 : 1 - ease((ph - 10.5) / 1.5);
      cur.set(0.35 + (act - 0.35) * go);
    });
  },

  ragchew(b) {
    const tables = [
      { c: 0.2, seed: 1, names: ['XX1ABC', 'XX2DEF', 'XX3MNO', 'XX4WB'] },
      { c: 0.47, seed: 2, names: ['XX5KZ', 'XX6PL', 'XX7RT'] },
      { c: 0.71, seed: 3, names: ['XX8JQ', 'XX9QQ'] },
    ];
    tables.forEach((tb) => {
      b.bracket(tb.c - 0.022, tb.c + 0.022, `ROUND TABLE · ${tb.names.length}`, { key: 'tables', color: '#ff8a65', y: H + 5 * K, height: 3 * K });
      // One name per station; the one with the mic shows, in step with the
      // round-table signal in spectrum.js (same turn length and seed).
      const tags = tb.names.map((n) => {
        const sp = b.sprite(`${n} · MIC`, { height: 3 * K, color: '#ffffff', key: 'mic', mono: true, border: '#ffffff' });
        sp.position.set(X(tb.c), H + 12.5 * K, FZ);
        const it = b.item(sp); it.k = 0; return it;
      });
      b.anim((t) => {
        const k = t / 7 + tb.seed * 1.37, w = (k % 1 < 0.07) ? -1 : Math.floor(k) % tb.names.length;
        tags.forEach((it, i) => { it.k += ((i === w ? 1 : 0) - it.k) * 0.2; });
      });
    });
    b.bracket(0.866, 0.894, 'A LONG QSO', { key: 'qso', color: '#ffd166', y: H + 5 * K, height: 3 * K });
  },

  remote(b) {
    const home = new THREE.Vector3(0, H + 6 * K, 0);
    b.node(home, 'THE STATION · HOME', { key: 'home', color: '#7db7ff', height: 3.8 * K });
    const you = new THREE.Vector3(-78, 112, 30);
    b.node(you, 'YOU · ANYWHERE', { key: 'you', color: '#8ef7a8', height: 4.2 * K, sub: 'Linux · macOS · Windows' });
    b.link(home, you, { key: 'link', color: '#ffffff', lift: 60, packets: 4, speed: 0.3, both: true, opacity: 0.5 });
    return HIGH;
  },

  accessible(b) {
    const phrases = ['good morning', 'the band is open', 'QSL', 'how copy?', 'seventy-three', 'five nine'];
    const words = b.pool(phrases, { key: 'words', colors: ['#f9a8d4'], height: 3 * K, y: H + 3 * K, rise: 10 * K, life: 4.5 });
    const cw = b.pool(['CQ', 'CQ', 'DE', 'XX1ABC', 'K'], { key: 'cw', colors: ['#ffffff'], height: 3 * K, y: H + 3 * K, rise: 9 * K, life: 4 });
    b.tag(0.45, 'FREQUENCY · S-METER · SPOKEN', { key: 'speak', color: '#8ef7a8', y: H + 14 * K, height: 3.2 * K });
    let lw = 0, lc = 0, iw = 0, ic = 0;
    b.anim((t) => {
      if (t - lw > 1.3) { const pk = specPeaks(0.35).filter((p) => p.u > 0.6); if (pk.length) { lw = t; words.pop(pk[Math.floor(Math.random() * pk.length)].u, iw++); } }
      if (t - lc > 0.9) { lc = t; cw.pop([0.08, 0.12, 0.17, 0.22][ic % 4], ic++); }
    });
  },

  integration(b) {
    const hubP = new THREE.Vector3(0, H + 8 * K, 0);
    b.node(hubP, 'AETHERSDR', { key: 'hub', color: '#f472b6', height: 4.2 * K });
    const gear = ['Amplifier', 'Tuner', 'Antenna switch', 'Rotator', 'Logger', 'MQTT', 'Control surface'];
    gear.forEach((g, i) => {
      const a = Math.PI * (1.08 + (i / (gear.length - 1)) * 0.84);
      const p = new THREE.Vector3(Math.cos(a) * 112, 92 + (i % 2) * 16, Math.sin(a) * 60 - 10);
      b.node(p, g.toUpperCase(), { key: 'gear', color: '#ffffff', height: 3 * K, delay: 0.3 + i * 0.08 });
      b.link(hubP, p, { key: 'gear', color: '#f472b6', lift: 18, packets: 2, speed: 0.35, both: true, delay: 0.3 + i * 0.08, opacity: 0.35 });
    });
    return HIGH;
  },
};

// The scripts read the live band through these; bound when the stage exists.
let specSample = () => 0, specPeaks = () => [];
export function bindSpectrum(spec) { specSample = (u) => spec.sample(u); specPeaks = (m) => spec.peaks(m); }

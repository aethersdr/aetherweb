// The 3D stage: every homepage section becomes a station on a ring. Moving
// between sections pulls the camera back toward the middle of the ring, swings
// it round, and pushes it into the next station, while the section itself (the
// real DOM, unchanged) turns out in 3D and the next one turns in.
//
// A section taller than the screen is split into pages (paginate.js), each its
// own stop a few degrees apart, so every move is a turn rather than a scroll.
// Pages are re-cut whenever the window size changes. Internal scrolling is
// still honoured as a last resort, for content that can't fit at all.

import { createSpectrum, SPECTRUM_DEPTH } from './spectrum.js';
import { createField } from './field.js';
import { createSky } from './sky.js';
import { paginate } from './paginate.js';

const RING = 340;              // world units from ring centre to each section
const PAGE_ARC = 0.24;         // radians between pages of one section
const FLIGHT = 1.7;            // seconds for a one-section move
const PAGE_FLIGHT = 1.05;      // seconds for a move between pages of a section
const LABELS = {
  features: 'Features', spectrum: 'Spectrum', hardware: 'Hardware', download: 'Download',
  built: "How it's built", partners: 'Partners', contribute: 'Contribute', sponsor: 'Sponsor',
};
// Per section: field shape, field colour, camera (position, target) in station units.
const LOOKS = {
  hero: ['ionosphere', '#8ef7e6', [0, 42, 50], [0, 0, -SPECTRUM_DEPTH * 0.5]],
  features: ['windows', '#5de3ff'],
  spectrum: ['waterfall', '#3aa7ff', [0, 22, 70], [0, -6, -40]],
  hardware: ['radio', '#7bf2dc'],
  download: ['columns', '#5de3ff'],
  built: ['helix', '#8ef7e6'],
  partners: ['clusters', '#7bf2dc'],
  contribute: ['lattice', '#3aa7ff'],
  sponsor: ['smeter', '#ffd970'],
};
const FALLBACK = ['lattice', '#5de3ff'];
const CAM = [0, 8, 74], TGT = [0, 3, -20];

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpAngle = (a, b, t) => a + (Math.atan2(Math.sin(b - a), Math.cos(b - a))) * t;

export function startStage(THREE, onExit) {
  const sections = collectSections();
  if (sections.length < 2) return false;
  // Where the visitor already is, if they scrolled before the stage loaded.
  let inView = 0;
  sections.forEach((s, i) => { if (s.els[0].getBoundingClientRect().top < innerHeight * 0.4) inView = i; });
  scrollTo(0, 0);

  // ---------------------------------------------------------------- DOM
  const host = document.createElement('div');
  host.id = 'stage-panels';
  const makePanel = (s, continuation = false) => {
    const panel = document.createElement('div');
    panel.className = 'stage-panel to-right';
    panel.dataset.scene = s.id;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', s.label);
    panel.tabIndex = -1;
    panel.inert = true;
    const inner = document.createElement('div');
    inner.className = 'stage-inner';
    if (continuation && s.id !== 'hero') {
      // Continuation pages have no heading of their own: say where we are.
      // (The hero's second page is the product shot; it needs no label.)
      const tag = document.createElement('div');
      tag.className = 'stage-cont';
      tag.setAttribute('aria-hidden', 'true');
      tag.innerHTML = '<span></span> <b></b>';
      tag.firstChild.textContent = s.label;
      inner.appendChild(tag);
    }
    panel.appendChild(inner);
    return panel;
  };
  sections.forEach((s) => {
    s.panel = makePanel(s);
    s.els.forEach((e) => s.panel.firstElementChild.appendChild(e));
    host.appendChild(s.panel);
  });
  document.querySelector('header.nav').after(host);

  const canvas = document.createElement('canvas');
  canvas.id = 'stage-gl';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  document.documentElement.classList.add('stage-on');

  const rail = document.createElement('nav');
  rail.id = 'stage-rail';
  rail.setAttribute('aria-label', 'Sections');
  const dots = sections.map((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stage-dot';
    b.title = s.label;
    b.setAttribute('aria-label', s.label);
    b.addEventListener('click', () => go(s.first));
    rail.appendChild(b);
    return b;
  });
  const exit = document.createElement('button');
  exit.type = 'button';
  exit.className = 'stage-exit';
  exit.textContent = 'Scroll view';
  exit.title = 'Switch to the classic scrolling page';
  exit.addEventListener('click', onExit);
  document.body.append(rail, exit);

  // ---------------------------------------------------------------- world
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
  renderer.setClearColor(0x060b13, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);

  const sky = createSky(THREE);
  scene.add(sky.mesh);

  // Section i sits at angle i * step around the ring; local -z points outward,
  // so a camera at local +z looks out from near the centre.
  const ringMatrix = (a) => new THREE.Matrix4().makeRotationY(-a).setPosition(Math.sin(a) * RING, 0, -Math.cos(a) * RING);
  const step = (Math.PI * 2) / sections.length;
  sections.forEach((s, i) => {
    s.index = i;
    s.angle = i * step;
    s.matrix = ringMatrix(s.angle);
    const look = LOOKS[s.id] || FALLBACK;
    s.shape = look[0];
    s.color = look[1];
    s.cam = look[2] || CAM;
    s.tgt = look[3] || TGT;
  });

  const spectrum = createSpectrum(THREE);
  spectrum.group.applyMatrix4(sections[0].matrix);
  scene.add(spectrum.group);

  const field = createField(THREE);
  scene.add(field.points);

  // Stations: every page of every section, in reading order.
  let stations = [];
  function layout() {
    stations = [];
    sections.forEach((s) => {
      if (s.cut) s.cut.restore();
      s.cut = paginate(s.panel, () => host.appendChild(makePanel(s, true)));
      // Keep extra pages right after their section's first page in the DOM.
      let after = s.panel;
      s.cut.pages.slice(1).forEach((p) => { after.after(p); after = p; });
      s.first = stations.length;
      const n = s.cut.pages.length;
      s.cut.pages.forEach((panel, k) => {
        const a = s.angle + (k - (n - 1) / 2) * PAGE_ARC;
        panel.dataset.page = String(k + 1);
        if (n > 1) panel.setAttribute('aria-label', `${s.label} (${k + 1} of ${n})`);
        if (k > 0 && panel.querySelector('.stage-cont')) panel.querySelector('.stage-cont b').textContent = `${k + 1} / ${n}`;
        stations.push({ section: s, page: k, panel, matrix: ringMatrix(a) });
      });
    });
  }

  // ---------------------------------------------------------------- state
  let cur = 0, pxScale = 1;
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();
  const wantPos = new THREE.Vector3(), wantTgt = new THREE.Vector3();
  const flight = { on: false, u: 0, dur: FLIGHT, pull: 0.4, lift: 45, p0: null, t0: null };
  let enterTimer = 0, lockUntil = 0;

  const polar = (v) => ({ a: Math.atan2(v.x, -v.z), r: Math.hypot(v.x, v.z), y: v.y });
  const fromPolar = (out, a, r, y) => out.set(Math.sin(a) * r, y, -Math.cos(a) * r);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', (e) => {
    tmx = (e.clientX / innerWidth - 0.5) * 2;
    tmy = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function poseFor(i, t) {
    const st = stations[i], s = st.section;
    const drift = s.index === 0 ? Math.sin(t * 0.05) * 10 : Math.sin(t * 0.07 + s.index) * 3;
    wantPos.set(s.cam[0] + drift + mx * 7, s.cam[1] - my * 4, s.cam[2]).applyMatrix4(st.matrix);
    wantTgt.set(s.tgt[0], s.tgt[1], s.tgt[2]).applyMatrix4(st.matrix);
  }

  function setSide(panel, side, animate) {
    if (!animate) panel.classList.add('no-anim');
    panel.classList.remove('is-current', 'to-left', 'to-right');
    panel.classList.add(side);
    if (!animate) { void panel.offsetWidth; panel.classList.remove('no-anim'); }
  }

  function go(i, { instant = false, anchor = null, stepped = false } = {}) {
    i = Math.max(0, Math.min(stations.length - 1, i));
    const from = cur;
    const was = stations[from] && stations[from].section;
    const now = stations[i].section;
    if (i !== from || instant) {
      const dir = i >= from ? 1 : -1;
      clearTimeout(enterTimer);
      stations.forEach((st, j) => {
        if (j === i) return;
        st.panel.inert = true;
        setSide(st.panel, j < i ? 'to-left' : 'to-right', !instant && j === from);
      });
      const nu = stations[i].panel;
      nu.inert = false;
      // Stepping back lands at a page's end, as scrolling would; jumps land at the top.
      if (!anchor) nu.scrollTop = stepped && dir < 0 ? nu.scrollHeight : 0;
      const enter = () => {
        nu.classList.remove('to-left', 'to-right');
        nu.classList.add('is-current');
        nu.focus({ preventScroll: true });
      };
      const sameSection = was === now;
      const hops = Math.abs(now.index - (was ? was.index : 0));
      flight.dur = sameSection ? PAGE_FLIGHT : FLIGHT + 0.25 * Math.min(3, Math.max(0, hops - 1));
      flight.pull = sameSection ? 0.12 : 0.4;
      flight.lift = sameSection ? 12 : 45;
      if (instant) {
        setSide(nu, 'is-current', false);
        poseFor(i, performance.now() / 1000);
        camPos.copy(wantPos); camTgt.copy(wantTgt);
        flight.on = false;
      } else {
        // Leave the old panel time to turn away before the new one turns in.
        enterTimer = setTimeout(enter, flight.dur * 1000 * 0.42);
        flight.on = true; flight.u = 0;
        flight.p0 = polar(camPos); flight.t0 = polar(camTgt);
      }
      if (!sameSection || instant) field.morph(now.shape, now.matrix, now.color, instant);
      cur = i;
      const hash = now.index === 0 ? '' : '#' + now.id;
      if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
      dots.forEach((d, j) => d.classList.toggle('on', j === now.index));
      lockUntil = performance.now() + flight.dur * 1000 * (instant ? 0 : 0.85);
    }
    if (anchor) {
      const panel = stations[i].panel;
      let y = 0;
      for (let n = anchor; n && n !== panel; n = n.offsetParent) y += n.offsetTop;
      panel.scrollTop = Math.max(0, y - 90);
    }
  }

  // ---------------------------------------------------------------- input
  let lastWheel = 0, wheelAcc = 0, gestureAtEdge = false;
  const atEdge = (p, dir) => (dir > 0 ? p.scrollTop + p.clientHeight >= p.scrollHeight - 2 : p.scrollTop <= 1);

  addEventListener('wheel', (e) => {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const now = performance.now();
    const fresh = now - lastWheel > 180;
    lastWheel = now;
    const dir = Math.sign(e.deltaY);
    const p = stations[cur].panel;
    if (now < lockUntil) {
      // Momentum from the last move keeps the lock alive until it dies down.
      lockUntil = Math.max(lockUntil, now + 120);
      e.preventDefault();
      return;
    }
    if (!atEdge(p, dir)) { gestureAtEdge = false; wheelAcc = 0; return; }   // panel scrolls natively
    if (fresh) { gestureAtEdge = true; wheelAcc = 0; }
    e.preventDefault();
    if (!gestureAtEdge) return;          // a scroll that ran into the edge, not one that started there
    wheelAcc += e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
    if (Math.abs(wheelAcc) > 40) { wheelAcc = 0; gestureAtEdge = false; go(cur + dir, { stepped: true }); }
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], .nav-dd')) return;
    if (e.key === ' ' && e.target.closest && e.target.closest('button, a, summary')) return;
    const fwd = ['ArrowDown', 'PageDown', ' '], back = ['ArrowUp', 'PageUp'];
    const dir = fwd.includes(e.key) ? (e.shiftKey && e.key === ' ' ? -1 : 1) : back.includes(e.key) ? -1 : 0;
    if (e.key === 'Home') { e.preventDefault(); return go(0); }
    if (e.key === 'End') { e.preventDefault(); return go(stations.length - 1); }
    if (!dir) return;
    if (!atEdge(stations[cur].panel, dir)) return;  // let the panel scroll first
    e.preventDefault();
    if (performance.now() >= lockUntil) go(cur + dir, { stepped: true });
  });

  // In-page links (#download, #features, #top...) fly instead of jumping.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const hit = locate(a.getAttribute('href').slice(1));
    if (!hit) return;
    e.preventDefault();
    go(hit.i, { anchor: hit.anchor });
  });

  addEventListener('hashchange', () => {
    const hit = locate(location.hash.slice(1));
    if (hit) go(hit.i, { anchor: hit.anchor });
  });

  function locate(id) {
    if (!id || id === 'top') return { i: 0, anchor: null };
    const s = sections.find((x) => x.id === id);
    if (s) return { i: s.first, anchor: null };
    const el = document.getElementById(id);
    if (!el) return null;
    const i = stations.findIndex((st) => st.panel.contains(el));
    return i >= 0 ? { i, anchor: el } : null;
  }

  // ---------------------------------------------------------------- size
  function resizeGL() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    pxScale = renderer.getPixelRatio() * innerHeight / 900;
    spectrum.setPixelScale(pxScale);
  }
  let relayoutTimer = 0, lastSize = innerWidth + 'x' + innerHeight;
  addEventListener('resize', () => {
    resizeGL();
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      const size = innerWidth + 'x' + innerHeight;
      if (size === lastSize) return;
      lastSize = size;
      // Re-cut the pages for the new size, staying on the same section.
      const st = stations[cur];
      layout();
      const s = st.section;
      cur = Math.min(s.first + st.page, s.first + s.cut.pages.length - 1);
      go(cur, { instant: true });
    }, 250);
  });
  resizeGL();
  layout();

  const start = locate(location.hash.slice(1)) || { i: sections[inView].first, anchor: null };
  cur = start.i;
  go(start.i, { instant: true, anchor: start.anchor });

  // ---------------------------------------------------------------- loop
  let last = performance.now(), raf = 0;
  function frame(now) {
    raf = 0;
    if (document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    mx += (tmx - mx) * (1 - Math.exp(-2 * dt));
    my += (tmy - my) * (1 - Math.exp(-2 * dt));
    poseFor(cur, t);

    let warp = 0;
    if (flight.on) {
      flight.u = Math.min(1, flight.u + dt / flight.dur);
      const e = easeInOut(flight.u), s = Math.sin(flight.u * Math.PI);
      const p1 = polar(wantPos), t1 = polar(wantTgt);
      // Out toward the middle of the ring, round, and back in.
      fromPolar(camPos, lerpAngle(flight.p0.a, p1.a, e), lerp(flight.p0.r, p1.r, e) * (1 - flight.pull * s), lerp(flight.p0.y, p1.y, e) + flight.lift * s);
      fromPolar(camTgt, lerpAngle(flight.t0.a, t1.a, e), lerp(flight.t0.r, t1.r, e), lerp(flight.t0.y, t1.y, e));
      warp = s * (flight.pull / 0.4);
      if (flight.u >= 1) flight.on = false;
    } else {
      const k = 1 - Math.exp(-3 * dt);
      camPos.lerp(wantPos, k);
      camTgt.lerp(wantTgt, k);
    }
    camera.position.copy(camPos);
    camera.lookAt(camTgt);

    spectrum.update(t, dt);
    field.update(t, dt, pxScale);
    sky.update(t, dt, camPos, warp);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  raf = requestAnimationFrame(frame);
  requestAnimationFrame(() => canvas.classList.add('on'));
  return true;
}

// Group the page into sections: each <section> starts one, and anything
// between sections (the stats row, the footer) rides with the one before it.
function collectSections() {
  const out = [], before = [];
  const nav = document.querySelector('header.nav');
  for (let n = nav && nav.nextElementSibling; n; n = n.nextElementSibling) {
    if (n.tagName === 'SCRIPT' || n.tagName === 'NOSCRIPT') continue;
    if (n.tagName === 'SECTION') {
      const hero = n.classList.contains('hero');
      const id = hero ? 'hero' : n.id || 'section-' + out.length;
      out.push({ id, label: hero ? 'Home' : LABELS[id] || id, els: [...before.splice(0), n] });
    } else if (out.length) {
      out[out.length - 1].els.push(n);
    } else {
      before.push(n);
    }
  }
  return out;
}

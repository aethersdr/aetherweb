// AetherSDR — The Station, Explored.
//
// One scenario graph, three ways in: by operator (persona), by use case, by
// feature. Routes live in the hash so every view is linkable:
//   #/                       home
//   #/operators[/<id>]       a persona and their scenarios
//   #/usecases[/<id>]        a use case, its facts, its scenarios
//   #/features[/<id>]        the atlas, or one feature
//   #/scenario/<id>[/with]   a scenario, without (default) or with AetherSDR
//   #/sources                citations, method, assumptions
// All words are DOM; the 3D world illustrates and is fully optional.

import './styles.css';
import { createEngine, REDUCED } from './world/engine.js';
import { createSky } from './world/sky.js';
import { createHub } from './world/hub.js';
import { createStations } from './world/stations.js';
import { createWorkbench, LINK_TYPES } from './world/workbench.js';
import { createAtlas } from './world/atlas.js';
import { SHOTS, LOGO } from './world/textures.js';
import { personas, usecases, features, categories, scenarios, sources, assumptions, method } from './data/index.js';
import { createTour } from './ui/tour.js';

const $ = (s, r = document) => r.querySelector(s);
const plain = (s) => String(s).replace(/\[\[[^\]]+\]\]/g, '');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = (list, id) => list.find((x) => x.id === id);
const P = (id) => byId(personas, id), U = (id) => byId(usecases, id), F = (id) => byId(features, id), S = (id) => byId(scenarios, id);
const catOf = (f) => byId(categories, f.category);

$('#brand-logo').src = LOGO;
{ const icon = document.createElement('link'); icon.rel = 'icon'; icon.href = LOGO; document.head.appendChild(icon); }

// ------------------------------------------------------------------ citations
// Inline [[src-id]] markers in copy become numbered footnotes per view.
function citer() {
  const order = [];
  const num = (id) => { if (!sources[id]) { console.warn('missing source', id); return '?'; } let i = order.indexOf(id); if (i < 0) { order.push(id); i = order.length - 1; } return i + 1; };
  const text = (s) => esc(s).replace(/\[\[([a-z0-9-]+(?:,[a-z0-9-]+)*)\]\]/g, (_, ids) => ids.split(',').map((id) => `<sup class="cite"><a href="#/sources/${id}" title="${esc(sources[id] ? sources[id].title : id)}">${num(id)}</a></sup>`).join(''));
  const list = () => order.length ? `<h2>Sources</h2><ol class="refs">${order.map((id, i) => { const s = sources[id]; return `<li data-src="${id}"><b>${i + 1}</b>${esc(s.title)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher || new URL(s.url).hostname)}</a>${s.note ? ` <span>(${esc(s.note)})</span>` : ''}</li>`; }).join('')}</ol>` : '';
  return { text, list, cite: (ids) => ids && ids.length ? text(`[[${ids.join(',')}]]`) : '' };
}

// ------------------------------------------------------------------ world
let world = null;
function startWorld() {
  const canvas = $('#gl');
  let gl;
  try { gl = canvas.getContext('webgl2'); } catch { gl = null; }
  if (!gl) { document.body.classList.add('no-gl'); return null; }
  const engine = createEngine(canvas);
  const sky = createSky();
  engine.scene.add(sky.mesh);
  const hub = createHub(engine);
  const stations = createStations(engine, personas, (id) => go(`#/operators/${id}`));
  engine.scene.add(stations.root);
  const bench = createWorkbench(engine);
  const atlas = createAtlas(engine, features, categories, (id) => go(`#/features/${id}`));
  engine.onUpdate((t, dt, warp) => sky.update(t, dt, engine.camera.position, warp));

  // Hover tooltips for anything pickable.
  const tip = $('#tip');
  engine.onHoverChange = (p) => {
    if (!p) { tip.hidden = true; return; }
    tip.innerHTML = `${esc(p.title)}<span>${p.kind === 'persona' ? 'operator' : 'feature'} · click</span>`;
    tip.hidden = false;
  };
  addEventListener('pointermove', (e) => { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; }, { passive: true });

  engine.start();
  const o = hub.overview();
  engine.flyTo(o.pos, o.tgt, { dur: 3.2, lift: 0 });
  return { engine, sky, hub, stations, bench, atlas };
}

function frame(view) {
  if (!world) return;
  if (route.name !== 'scenario') world.hub.dimWall(false);
  world.engine.flyTo(view.pos, view.tgt);
  requestAnimationFrame(insets);
}
// Tell the camera how much of each side the panels cover.
function insets() {
  if (!world) return;
  const W = innerWidth;
  if (W < 760 || document.body.classList.contains('home') || document.body.classList.contains('touring')) return world.engine.setInsets(0, 0);
  // offset* ignore transforms, so this is the final layout even mid-slide.
  const l = indexEl.classList.contains('gone') ? 0 : indexEl.offsetLeft + indexEl.offsetWidth;
  const r = detailEl.classList.contains('gone') ? 0 : W - detailEl.offsetLeft;
  world.engine.setInsets(l, r);
}
addEventListener('resize', insets);

// ------------------------------------------------------------------ views
const indexEl = $('#index'), detailEl = $('#detail');
let route = { name: 'home' }, withMode = false;

function setAxis(axis) {
  document.querySelectorAll('.axes a').forEach((a) => a.classList.toggle('on', a.dataset.axis === axis));
}

function chipP(id) { const p = P(id); return p ? `<a class="chip" href="#/operators/${p.id}"><i style="background:${p.color}"></i>${esc(p.name)}</a>` : ''; }
function chipU(id) { const u = U(id); return u ? `<a class="chip" href="#/usecases/${u.id}">${esc(u.name)}</a>` : ''; }
function chipF(id) { const f = F(id); return f ? `<a class="chip${f.aether ? ' aether' : ''}" href="#/features/${f.id}"><i style="background:${catOf(f).color}"></i>${esc(f.name)}</a>` : ''; }
function statusBadge(f) {
  const map = { shipped: ['shipped', f.since ? `Shipped ${f.since}` : 'Shipped'], progress: ['progress', 'In progress'], roadmap: ['roadmap', 'Roadmap'] };
  const [cls, label] = map[f.status] || map.shipped;
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}

// ---- index lists (left panel)
function renderIndex(axis, activeId) {
  indexEl.classList.remove('gone');
  if (axis === 'operators') {
    indexEl.innerHTML = `<h3>Operators</h3>${personas.map((p) => `<button class="item${p.id === activeId ? ' on' : ''}"${p.id === activeId ? ' aria-current="true"' : ''} data-go="#/operators/${p.id}"><i class="dot" style="background:${p.color};color:${p.color}"></i><div><b>${esc(p.name)}</b><span>${esc(p.tagline)}</span></div></button>`).join('')}`;
  } else if (axis === 'usecases') {
    indexEl.innerHTML = `<h3>Use cases</h3>${usecases.map((u) => `<button class="item${u.id === activeId ? ' on' : ''}"${u.id === activeId ? ' aria-current="true"' : ''} data-go="#/usecases/${u.id}"><i class="dot" style="background:${u.color};color:${u.color}"></i><div><b>${esc(u.name)}</b><span>${esc(u.tagline)}</span></div></button>`).join('')}`;
  } else if (axis === 'features') {
    indexEl.innerHTML = `<h3>Features</h3>${categories.map((c) => {
      const fs = features.filter((f) => f.category === c.id);
      if (!fs.length) return '';
      return `<div class="group"><i style="background:${c.color}"></i>${esc(c.name)}</div>${fs.map((f) => `<button class="item${f.id === activeId ? ' on' : ''}"${f.id === activeId ? ' aria-current="true"' : ''} data-go="#/features/${f.id}"><div><b>${esc(f.name)}${f.status === 'roadmap' ? '<em class="tag">roadmap</em>' : f.status === 'progress' ? '<em class="tag">in progress</em>' : ''}</b><span>${esc(plain(f.pitch))}</span></div></button>`).join('')}`;
    }).join('')}`;
  }
  const on = indexEl.querySelector('.item.on');
  if (on) on.scrollIntoView({ block: 'nearest' });
}

function scenarioCards(list) {
  return `<div class="cards">${list.map((s) => `<button class="card" data-go="#/scenario/${s.id}"><b>${esc(s.title)}</b><span>${esc(s.hook)}</span></button>`).join('')}</div>`;
}

// ---- home
function viewHome() {
  document.body.classList.add('home');
  setAxis(null);
  indexEl.classList.add('gone');
  const c = citer();
  detailEl.innerHTML = `
    <div class="eyebrow">Open-source · native on Linux, macOS and Windows · for FlexRadio</div>
    <h1 class="home-h">One station. <span class="grad">Every way you operate.</span></h1>
    <p class="lead">Walk the ring of operators — contester, DXer, digital-mode op, portable, remote, and more — and watch the tangle of separate programs each of them runs today fold into AetherSDR.</p>
    <div class="entries">
      <a class="entry" href="#/operators"><b><svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>By operator</b><span>${personas.length} operators, each at their own station</span></a>
      <a class="entry" href="#/usecases"><b><svg viewBox="0 0 24 24"><path d="M3 12h3l3-8 4 16 3-8h5"/></svg>By use case</b><span>${usecases.length} ways hams operate, with the numbers</span></a>
      <a class="entry" href="#/features"><b><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>By feature</b><span>${features.filter((f) => f.aether).length} Aether components · ${features.length} features in all</span></a>
    </div>
    <div class="proof">${c.text('Latest v26.10.3 · weekly releases[[aether-releases]]')}<i></i>${c.text('2,603 merged pull requests · 72 contributors[[gh-api-stats]]')}<i></i>${c.text('GPL-3.0 · free[[aether-readme]]')}</div>
    <p class="modeled-note" style="margin-top:12px">${scenarios.length} scenarios, each shown without and with AetherSDR. Every claim is sourced; anything modeled says so. <a href="#/sources">Method &amp; sources</a> · or press <b>T</b> for a guided tour.<br>AetherSDR is an independent open-source project, not affiliated with or endorsed by FlexRadio Systems, Icom or Apache Labs.</p>`;
  if (world) {
    world.bench.hide(); world.stations.setActive(null); world.atlas.setActive(null); world.atlas.focus(null);
    world.hub.setBand('mixed');
    frame(world.hub.overview());
  }
}

// ---- operators
function viewOperators(id) {
  setAxis('operators');
  const p = P(id) || null;
  renderIndex('operators', p && p.id);
  if (!p) {
    detailEl.innerHTML = `<div class="eyebrow">Operators</div><h1>Who operates with AetherSDR</h1><p class="lead">Six stations on the ring, six ways of operating. Pick an operator — on the left or by clicking their station — to see the scenarios they live in, without and with AetherSDR.</p>${personas.map((x) => `<button class="card" data-go="#/operators/${x.id}" style="margin-top:8px;border-left:3px solid ${x.color}"><b>${esc(x.name)}</b><span>${esc(x.tagline)}</span></button>`).join('')}`;
    if (world) { world.bench.hide(); world.stations.setActive(null); world.atlas.focus(null); world.hub.setBand('mixed'); frame(world.hub.overview()); }
    return;
  }
  const c = citer();
  const sc = scenarios.filter((s) => s.persona === p.id);
  const fs = [...new Set(sc.flatMap((s) => s.features))];
  detailEl.innerHTML = `
    <div class="eyebrow" style="color:${p.color}">Operator</div>
    <h1>${esc(p.name)}</h1>
    <p class="lead">${c.text(p.who)}</p>
    <h2>What they need</h2><ul class="pains" style="--c:${p.color}">${p.needs.map((n) => `<li>${c.text(n)}</li>`).join('')}</ul>
    <h2>Their scenarios</h2>${scenarioCards(sc)}
    <h2>Features they lean on</h2><div class="chips">${fs.map(chipF).join('')}</div>
    ${c.list()}`;
  if (world) {
    world.bench.hide();
    world.stations.setActive(p.id);
    world.atlas.focus(null);
    world.hub.setBand(sc[0] ? sc[0].band : 'mixed');
    frame(world.stations.view(p.id, 'wide'));
  }
}

// ---- use cases
function viewUsecases(id) {
  setAxis('usecases');
  const u = U(id) || null;
  renderIndex('usecases', u && u.id);
  if (!u) {
    detailEl.innerHTML = `<div class="eyebrow">Use cases</div><h1>How hams operate</h1><p class="lead">From a 48-hour contest to one FT8 contact at 6 a.m., each use case has its own rhythm, tools, and pain. Pick one to see the numbers and the scenarios.</p>${usecases.map((x) => `<button class="card" data-go="#/usecases/${x.id}" style="margin-top:8px;border-left:3px solid ${x.color}"><b>${esc(x.name)}</b><span>${esc(x.tagline)}</span></button>`).join('')}`;
    if (world) { world.bench.hide(); world.stations.setActive(null); world.atlas.focus(null); frame(world.hub.overview()); }
    return;
  }
  const c = citer();
  const sc = scenarios.filter((s) => s.usecase === u.id || (s.usecases || []).includes(u.id));
  detailEl.innerHTML = `
    <div class="eyebrow" style="color:${u.color}">Use case</div>
    <h1>${esc(u.name)}</h1>
    <p class="lead">${c.text(u.about)}</p>
    ${u.facts && u.facts.length ? `<h2>By the numbers</h2><div class="facts">${u.facts.map((f) => `<div class="fact"><b>${esc(f.value)}</b>${c.text(f.text)}</div>`).join('')}</div>` : ''}
    <h2>Scenarios</h2>${scenarioCards(sc)}
    <h2>Operators</h2><div class="chips">${[...new Set(sc.map((s) => s.persona))].map(chipP).join('')}</div>
    ${c.list()}`;
  if (world) {
    world.bench.hide();
    world.atlas.focus(null);
    const first = sc[0];
    world.hub.setBand(u.band || (first && first.band) || 'mixed');
    world.stations.setActive(first ? first.persona : null);
    frame(world.hub.close());
  }
}

// ---- features
function viewFeatures(id) {
  setAxis('features');
  const f = F(id) || null;
  renderIndex('features', f && f.id);
  if (!f) {
    const ae = features.filter((x) => x.aether);
    detailEl.innerHTML = `<div class="eyebrow">Feature atlas</div><h1>Everything AetherSDR brings</h1>
      <p class="lead">${ae.length} Aether components and ${features.length - ae.length} more capabilities, on orbits by category. Bigger nodes are Aether-branded. Click any node or pick one on the left.</p>
      ${categories.map((cat) => { const fs = features.filter((x) => x.category === cat.id); return fs.length ? `<h2 style="color:${cat.color}">${esc(cat.name)}</h2><div class="chips">${fs.map((x) => chipF(x.id)).join('')}</div>` : ''; }).join('')}`;
    if (world) { world.bench.hide(); world.stations.setActive(null); world.atlas.setActive(null); world.atlas.focus(null); frame(world.atlas.overview()); }
    return;
  }
  const c = citer();
  const cat = catOf(f);
  const sc = scenarios.filter((s) => s.features.includes(f.id));
  const shot = f.shot && SHOTS[f.shot];
  detailEl.innerHTML = `
    <div class="eyebrow" style="color:${cat.color}">${esc(cat.name)}</div>
    <h1>${esc(f.name)}</h1>
    <p>${statusBadge(f)}${f.aether ? '<span class="badge progress">Aether component</span>' : ''}</p>
    <p class="lead">${c.text(f.pitch)}</p>
    ${f.desc.map((d) => `<p>${c.text(d)}</p>`).join('')}
    ${shot ? `<figure class="shot"><img src="${shot.src}" alt="${esc(shot.caption)}" loading="lazy"><figcaption>${esc(shot.caption)}</figcaption></figure>` : ''}
    ${f.instead ? `<h2>Without it</h2><p>${c.text(f.instead)}</p>` : ''}
    <h2>Who it's for</h2><div class="chips">${(f.personas || []).map(chipP).join('')}</div>
    ${sc.length ? `<h2>See it in a scenario</h2>${scenarioCards(sc)}` : ''}
    ${c.list()}`;
  if (world) {
    world.bench.hide(); world.stations.setActive(null);
    world.atlas.focus(null);
    world.atlas.setActive(f.id);
    frame(world.atlas.view(f.id));
  }
}

// ---- scenario: the heart of it
function viewScenario(id, mode) {
  const s = S(id);
  if (!s) return go('#/operators', true);
  const p = P(s.persona), u = U(s.usecase);
  setAxis(route.from || 'operators');
  renderIndex(route.from || 'operators', route.from === 'usecases' ? u.id : p.id);
  withMode = mode === 'with';
  const c = citer();
  const W = s.without, A = s.with;
  const links = W.links || [];
  const linkTypes = [...new Set(links.map((l) => l[2]))];
  // Modeled metrics, derived from the workflow as written (see Sources → Method).
  // Hardware boxes appear in the scene but aren't programs, and a link that
  // touches one isn't a hand-off between programs.
  const hw = (i) => W.tools[i].os === 'hardware';
  const m = {
    without: [W.tools.filter((t) => t.os !== 'hardware').length, links.filter(([a, b]) => !hw(a) && !hw(b)).length, W.steps.length],
    with: [A.programs ?? 1, A.handoffs ?? 0, A.steps.length],
  };
  const others = scenarios.filter((x) => x.persona === s.persona && x.id !== s.id);
  detailEl.innerHTML = `
    <div class="eyebrow" style="color:${p.color}">${esc(p.name)} · ${esc(u.name)}</div>
    <h1>${esc(s.title)}</h1>
    <p class="lead">${c.text(s.setup)}</p>
    <div class="switch ${withMode ? 'with' : ''}" role="group" aria-label="Compare">
      <span class="thumb"></span>
      <button type="button" data-mode="without" aria-pressed="${!withMode}">Without AetherSDR</button>
      <button type="button" data-mode="with" aria-pressed="${withMode}">With AetherSDR</button>
    </div>
    <p class="flip-hint">${withMode ? 'The separate programs folded into AetherSDR.' : 'Flip the switch — or press <b>W</b> — and watch them fold into AetherSDR.'}</p>
    <section class="${withMode ? 'with' : 'without'}" id="cmp">
      <div class="metrics">
        ${['programs to run', 'hand-offs between programs', 'steps in the workflow'].map((label, k) => `<div class="metric"><b>${m[withMode ? 'with' : 'without'][k]}${withMode ? `<s>from ${m.without[k]}</s>` : ''}</b><span>${label}</span></div>`).join('')}
      </div>
      ${withMode && A.keeps ? `<p class="keeps">Still running alongside AetherSDR: <b>${esc(A.keeps)}</b></p>` : ''}
      <p class="modeled-note"><span class="badge modeled">Modeled</span>Counted from the workflow described here, not measured. <a href="#/sources">How</a></p>
      <p style="margin-top:12px">${c.text(withMode ? A.summary : W.summary)}</p>
      <ol class="steps">${(withMode ? A.steps : W.steps).map((x) => `<li>${c.text(x)}</li>`).join('')}</ol>
      <ul class="pains">${(withMode ? A.gains : W.pains).map((x) => `<li>${c.text(x)}</li>`).join('')}</ul>
      ${!withMode && linkTypes.length ? `<div class="legend">${linkTypes.map((t) => `<span><i style="background:${LINK_TYPES[t].color}"></i>${esc(LINK_TYPES[t].label)}</span>`).join('')}</div>` : ''}
    </section>
    <h2>AetherSDR features in play</h2><div class="chips">${s.features.map(chipF).join('')}</div>
    ${others.length ? `<h2>More from ${esc(p.name)}</h2>${scenarioCards(others)}` : ''}
    ${c.list()}`;
  if (world) {
    world.stations.setActive(p.id, { label: false });
    world.hub.dimWall(true);
    world.atlas.focus(null);
    world.hub.setBand(s.band || 'mixed');
    world.bench.show(s, s.features.map(F).filter(Boolean), world.stations.benchFrame(p.id));
    world.bench.setMode(withMode, false);
    frame(world.stations.view(p.id));
  }
}

function setMode(next) {
  if (route.name !== 'scenario') return;
  const target = `#/scenario/${route.id}${next ? '/with' : ''}`;
  history.replaceState(null, '', target);
  withMode = next;
  // Re-render the text for the new mode without moving the camera.
  const scroll = detailEl.scrollTop;
  const keepFrame = frame;
  viewScenarioText();
  detailEl.scrollTop = scroll;
  void keepFrame;
}
function viewScenarioText() {
  const was = world;
  world = null;                       // render text only
  viewScenario(route.id, withMode ? 'with' : 'without');
  world = was;
  if (world) world.bench.setMode(withMode);
}

// ---- sources
function viewSources(focusId) {
  setAxis(null);
  indexEl.classList.add('gone');
  const ids = Object.keys(sources);
  detailEl.innerHTML = `
    <div class="eyebrow">Method</div>
    <h1>Sources, method &amp; assumptions</h1>
    ${method.map((m) => `<p>${esc(m)}</p>`).join('')}
    <h2>Modeled data</h2>
    <p><span class="badge modeled">Modeled</span> marks anything not measured: the program, hand-off and step counts in each scenario are counted from the workflow as written (a program is a separate application the operator must run and configure; a hand-off is a virtual audio, virtual serial/CAT, network or keying link between two of them). The live band at the centre of the world is synthetic, shaped to look like the mode being discussed.</p>
    <h2>Assumptions</h2><ul class="pains">${assumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    <h2>All sources (${ids.length})</h2>
    <ol class="refs">${ids.map((id, i) => { const s = sources[id]; return `<li id="src-${id}"${id === focusId ? ' style="background:rgba(93,227,255,0.08)"' : ''}><b>${i + 1}</b>${esc(s.title)} — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.publisher || new URL(s.url).hostname)}</a>${s.note ? ` <span>(${esc(s.note)})</span>` : ''}</li>`; }).join('')}</ol>`;
  if (focusId) { const el = $('#src-' + focusId); if (el) el.scrollIntoView({ block: 'center' }); }
  if (world) { world.bench.hide(); world.stations.setActive(null); world.atlas.focus(null); frame(world.hub.overview()); }
}

// ------------------------------------------------------------------ router
function parse(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [a, b, c] = parts;
  if (!a) return { name: 'home' };
  if (a === 'operators') return { name: 'operators', id: b };
  if (a === 'usecases') return { name: 'usecases', id: b };
  if (a === 'features') return { name: 'features', id: b };
  if (a === 'scenario') return { name: 'scenario', id: b, mode: c };
  if (a === 'sources') return { name: 'sources', id: b };
  return { name: 'home' };
}
let lastAxis = 'operators';
function render() {
  const r = parse(location.hash);
  if (r.name === 'operators' || r.name === 'usecases' || r.name === 'features') lastAxis = r.name;
  route = { ...r, from: r.name === 'scenario' ? lastAxis === 'features' ? 'operators' : lastAxis : null };
  document.body.classList.toggle('home', r.name === 'home');
  detailEl.classList.remove('gone');
  if (r.name === 'home') viewHome();
  else if (r.name === 'operators') viewOperators(r.id);
  else if (r.name === 'usecases') viewUsecases(r.id);
  else if (r.name === 'features') viewFeatures(r.id);
  else if (r.name === 'scenario') viewScenario(r.id, r.mode);
  else if (r.name === 'sources') viewSources(r.id);
  if (r.name !== 'sources') detailEl.scrollTop = 0;
  // Move focus to the new content for keyboard and screen-reader users
  // (not on first load, which would steal focus from the page).
  if (booted && !tour.active) detailEl.focus({ preventScroll: true });
  booted = true;
}
let booted = false;
function go(hash, replace = false) {
  if (location.hash === hash) return render();
  if (replace) { history.replaceState(null, '', hash); render(); } else location.hash = hash;
}
addEventListener('hashchange', render);

// Delegated navigation for buttons/cards and the with/without switch.
document.addEventListener('click', (e) => {
  // A footnote jumps to this view's own source list, not away from the view.
  const cite = e.target.closest('sup.cite a');
  if (cite) {
    const id = cite.getAttribute('href').split('/').pop();
    const li = detailEl.querySelector(`.refs li[data-src="${id}"]`);
    if (li) {
      e.preventDefault();
      li.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
      li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash');
      return;
    }
  }
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go); return; }
  const m = e.target.closest('.switch [data-mode]');
  if (m) setMode(m.dataset.mode === 'with');
});

// Keyboard: arrows browse the current list, W flips with/without, Esc goes up.
addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || (e.target.closest && e.target.closest('input, textarea'))) return;
  if (tour.active) return;
  if (e.key === 'w' || e.key === 'W') { if (route.name === 'scenario') { setMode(!withMode); e.preventDefault(); } }
  else if (e.key === 't' || e.key === 'T') { tour.start(); e.preventDefault(); }
  else if (e.key === 'Escape') {
    if (route.name === 'scenario') go(`#/operators/${S(route.id).persona}`);
    else if (route.id) go(`#/${route.name}`);
    else go('#/');
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const d = e.key === 'ArrowRight' ? 1 : -1;
    const lists = { operators: personas, usecases: usecases, features: features, scenario: scenarios };
    const list = lists[route.name];
    if (!list) return;
    const i = Math.max(0, list.findIndex((x) => x.id === route.id));
    const n = list[(i + d + list.length) % list.length];
    go(route.name === 'scenario' ? `#/scenario/${n.id}` : `#/${route.name}/${n.id}`);
    e.preventDefault();
  }
});

// ------------------------------------------------------------------ boot
world = startWorld();
if (world && new URLSearchParams(location.search).has('debug')) window.__world = world;  // probe hook
const tour = createTour({ go, setMode: (v) => setMode(v), onChange: () => insets() });
$('#tour-btn').addEventListener('click', () => tour.start());
render();
if (REDUCED) document.body.classList.add('reduced');

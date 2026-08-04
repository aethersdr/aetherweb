/* The supporter panadapter.
 *
 * Everyone who has funded AetherSDR, drawn as a signal on the band. Height is
 * the log-scaled size of their contribution, spotted with their callsign the
 * way SpotHub flags a station.
 *
 * Progressive enhancement, in that order:
 *   1. supporters.html ships the roll of names as real markup, baked by
 *      scripts/gen-supporters.py. That is what a reader without JavaScript
 *      sees, and what stays on screen if everything below fails.
 *   2. This file reads that markup and draws it.
 *   3. It then asks Open Collective for the live ledger and redraws. If that
 *      request is slow, rate-limited (their limit is 10 per window) or refused,
 *      the baked roll simply stays — the page never empties.
 *
 * No dollar figures are ever rendered or stored. Contributions reach this file
 * as a strength between 0 and 1; the amounts stay on the public ledger.
 */
(function () {
  var scope = document.querySelector('[data-sup-scope]');
  var canvas = document.querySelector('[data-sup-canvas]');
  var listEl = document.querySelector('[data-sup-list]');
  if (!scope || !canvas || !listEl || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var tip = document.querySelector('[data-sup-tip]');
  var staleEl = document.querySelector('[data-sup-stale]');
  var countEl = document.querySelector('[data-sup-count]');

  var API = 'https://api.opencollective.com/graphql/v2';
  var CACHE_KEY = 'aetherSupporters';
  var TTL = 3600 * 1000;

  var BG = '#070d17', GRID = 'rgba(120,165,210,0.055)';
  var CYAN = '#5de3ff', DEEP = '#3aa7ff', AQUA = '#8ef7e6';
  var INK = '#eaf2fb', MUTED = '#8598b4', DIM = '#5f708a';
  var MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var people = [];
  var W = 0, H = 0, dpr = 1;
  var noise = [];
  var t0 = 0, raf = null, running = false;
  var hover = -1;

  // ---- data ---------------------------------------------------------------

  function fromDOM() {
    var out = [];
    var items = listEl.querySelectorAll('.sup-item');
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var nameEl = el.querySelector('.sup-name');
      out.push({
        label: el.getAttribute('data-label') || '',
        name: nameEl ? nameEl.textContent.trim() : '',
        strength: parseFloat(el.getAttribute('data-strength')) || 0,
        since: el.getAttribute('data-since') || '',
        anon: el.hasAttribute('data-anon')
      });
    }
    return out;
  }

  // Mirrors scripts/gen-supporters.py — see there for why the slug is not a
  // safe anonymity signal.
  var CALLSIGN = /\b(?:[A-Z]{1,2}|[0-9][A-Z])[0-9][A-Z]{1,4}\b/;

  function split(name) {
    var m = CALLSIGN.exec(name || '');
    if (!m) return { label: (name || '').trim(), name: '' };
    var rest = (name.slice(0, m.index) + ' ' + name.slice(m.index + m[0].length))
      .replace(/\s+/g, ' ').replace(/^[\s,\-–—/|·]+|[\s,\-–—/|·]+$/g, '');
    return { label: m[0], name: rest };
  }

  function normalise(nodes) {
    var bySlug = {};
    var order = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var cents = (n.totalDonations && n.totalDonations.valueInCents) || 0;
      if (cents <= 0) continue;
      var acct = n.account || {};
      var slug = acct.slug || ('anon-' + i);
      var since = n.since || '';
      if (bySlug[slug]) {
        // One account can appear as several membership rows.
        bySlug[slug].cents = Math.max(bySlug[slug].cents, cents);
        if (since && (!bySlug[slug].since || since < bySlug[slug].since)) {
          bySlug[slug].since = since;
        }
        continue;
      }
      bySlug[slug] = { cents: cents, acct: acct, since: since };
      order.push(slug);
    }

    var out = [];
    for (var j = 0; j < order.length; j++) {
      var row = bySlug[order[j]];
      var raw = (row.acct.name || '').trim();
      var anon = /^(guest|anonymous|incognito)?$/i.test(raw);
      var parts = anon ? { label: 'Anonymous', name: '' } : split(raw);
      if (!parts.label) continue;
      out.push({
        label: parts.label, name: parts.name, since: row.since,
        anon: anon, cents: row.cents
      });
    }
    if (!out.length) return out;

    var amounts = out.map(function (p) { return p.cents; });
    var lo = Math.min.apply(null, amounts), hi = Math.max.apply(null, amounts);
    var span = hi > lo ? Math.log(hi) - Math.log(lo) : 0;
    for (var k = 0; k < out.length; k++) {
      out[k].strength = span
        ? (Math.log(out[k].cents) - Math.log(lo)) / span
        : 0.6;
      delete out[k].cents;
    }
    out.sort(function (a, b) { return (a.since || '').localeCompare(b.since || ''); });
    return out;
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function sinceText(iso) {
    if (!iso || iso.length < 7) return '';
    var m = parseInt(iso.slice(5, 7), 10);
    return m >= 1 && m <= 12 ? MONTHS[m - 1] + ' ' + iso.slice(0, 4) : '';
  }

  function renderList(rows) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i];
      var li = document.createElement('li');
      li.className = 'sup-item';
      li.setAttribute('data-strength', p.strength.toFixed(3));
      li.setAttribute('data-label', p.label);
      li.setAttribute('data-since', p.since ? p.since.slice(0, 10) : '');
      if (p.anon) li.setAttribute('data-anon', '1');

      var mark = document.createElement('span');
      mark.className = 'sup-mark';
      mark.setAttribute('aria-hidden', 'true');
      li.appendChild(mark);

      var label = document.createElement('span');
      label.className = 'sup-label';
      label.textContent = p.label;
      li.appendChild(label);

      if (p.name && p.name !== p.label) {
        var nm = document.createElement('span');
        nm.className = 'sup-name';
        nm.textContent = p.name;
        li.appendChild(nm);
      }
      var when = sinceText(p.since);
      if (when) {
        var s = document.createElement('span');
        s.className = 'sup-since';
        s.textContent = when;
        li.appendChild(s);
      }
      frag.appendChild(li);
    }
    listEl.textContent = '';
    listEl.appendChild(frag);
  }

  function setCount(n) {
    if (countEl) {
      countEl.textContent = n + (n === 1 ? ' supporter' : ' supporters') + ' on the band';
    }
  }

  // ---- geometry -----------------------------------------------------------

  var PAD_L = 44, PAD_R = 16, PAD_T = 8, PAD_B = 6;
  var WF_FRAC = 0.30;          // share of the height given to the waterfall
  var LABEL_ROWS = 3;

  function specTop() { return PAD_T + 54; }               // room for spot flags
  function specBottom() { return H * (1 - WF_FRAC) - 10; }
  function wfTop() { return H * (1 - WF_FRAC); }

  // Display fraction for a 0..1 strength. Deliberately does not start at zero:
  // the smallest contribution should still read as a solid, copyable signal,
  // not a whisper at the noise floor.
  function frac(strength) { return 0.30 + 0.68 * strength; }

  function layout() {
    var band = W - PAD_L - PAD_R;
    var n = people.length;
    for (var i = 0; i < n; i++) {
      var p = people[i];
      // Evenly spaced with a deterministic wobble, so the band looks occupied
      // rather than ruled, and a given supporter keeps their frequency.
      var seed = 0;
      for (var c = 0; c < p.label.length; c++) seed = (seed * 31 + p.label.charCodeAt(c)) % 9973;
      var jitter = ((seed % 100) / 100 - 0.5) * (band / Math.max(n, 1)) * 0.45;
      p.x = PAD_L + band * ((i + 0.5) / Math.max(n, 1)) + jitter;
      p.x = Math.max(PAD_L + 12, Math.min(W - PAD_R - 12, p.x));
      p.row = i % LABEL_ROWS;
      // Narrow relative to the spacing. Wider peaks merge into a single ridge
      // and you lose the one thing the display is for — being able to see how
      // each signal stands against its neighbours.
      p.width = Math.max(4, Math.min(11, (band / Math.max(n, 1)) * 0.16));
      p.phase = (seed % 628) / 100;
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    W = Math.max(320, Math.round(rect.width));
    H = Math.max(240, Math.round(rect.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    noise = [];
    for (var i = 0; i < W + 2; i++) noise.push(Math.random());
    layout();
    buildWaterfall();
    primeWaterfall();
  }

  // ---- waterfall ----------------------------------------------------------

  var wf = null, wfCtx = null;

  function buildWaterfall() {
    var h = Math.max(24, Math.round(H * WF_FRAC));
    if (!wf) { wf = document.createElement('canvas'); wfCtx = wf.getContext('2d'); }
    wf.width = Math.max(1, W);
    wf.height = h;
    wfCtx.fillStyle = '#050a12';
    wfCtx.fillRect(0, 0, wf.width, wf.height);
  }

  function wfColour(v) {
    // Cold floor through cyan to a hot aqua peak — the app's own colormap.
    if (v < 0.30) return 'rgba(18,42,72,' + (0.25 + v) + ')';
    if (v < 0.55) return 'rgba(58,167,255,' + (0.30 + v * 0.5) + ')';
    if (v < 0.78) return 'rgba(93,227,255,' + (0.45 + v * 0.4) + ')';
    return 'rgba(142,247,230,' + Math.min(1, 0.6 + v * 0.5) + ')';
  }

  function pushWaterfallRow(values) {
    if (!wfCtx) return;
    wfCtx.globalCompositeOperation = 'copy';
    wfCtx.drawImage(wf, 0, 1);
    wfCtx.globalCompositeOperation = 'source-over';
    wfCtx.clearRect(0, 0, wf.width, 1);
    for (var x = 0; x < W; x++) {
      var v = values[x];
      if (v < 0.16) continue;
      wfCtx.fillStyle = wfColour(v);
      wfCtx.fillRect(x, 0, 1, 1);
    }
  }

  // ---- the trace ----------------------------------------------------------

  var scratch = [];

  /* Normalised 0..1 signal level per column: a moving noise floor plus one
   * Gaussian per supporter. */
  function computeTrace(time) {
    var top = specTop(), bottom = specBottom();
    var drift = Math.floor(time * 0.045) % Math.max(1, noise.length - 1);
    if (scratch.length !== W) scratch = new Array(W);

    for (var x = 0; x < W; x++) {
      var n1 = noise[(x + drift) % noise.length];
      var n2 = noise[(x * 3 + drift * 2) % noise.length];
      var floor = 0.06 + n1 * 0.05 + n2 * 0.03 +
        0.012 * Math.sin((x + time * 0.02) * 0.07);
      scratch[x] = floor;
    }

    for (var i = 0; i < people.length; i++) {
      var p = people[i];
      if (p.appear <= 0) continue;
      var breathe = 1 + 0.035 * Math.sin(time * 0.0016 + p.phase);
      var peak = frac(p.strength) * p.appear * breathe;
      if (i === hover) peak = Math.min(1.06, peak * 1.06);
      var lo = Math.max(0, Math.round(p.x - p.width * 3));
      var hi = Math.min(W - 1, Math.round(p.x + p.width * 3));
      for (var x2 = lo; x2 <= hi; x2++) {
        var d = (x2 - p.x) / p.width;
        scratch[x2] += peak * Math.exp(-d * d * 0.5);
      }
    }
    for (var x3 = 0; x3 < W; x3++) if (scratch[x3] > 1.15) scratch[x3] = 1.15;
    return { top: top, bottom: bottom };
  }

  // ---- drawing ------------------------------------------------------------

  var S_TICKS = [
    [0.10, 'S1'], [0.28, 'S3'], [0.46, 'S5'], [0.64, 'S7'],
    [0.82, 'S9'], [0.98, '+20']
  ];

  function drawAxis(top, bottom) {
    ctx.font = '10px ' + MONO;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < S_TICKS.length; i++) {
      var f = S_TICKS[i][0];
      var y = bottom - (bottom - top) * f;
      ctx.strokeStyle = 'rgba(120,165,210,0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_L, y + 0.5);
      ctx.lineTo(W - PAD_R, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.fillText(S_TICKS[i][1], PAD_L - 8, y);
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawSpots(top, bottom) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < people.length; i++) {
      var p = people[i];
      if (p.labelIn <= 0.01) continue;

      var peakY = bottom - (bottom - top) * frac(p.strength) * p.appear;
      var flagY = PAD_T + 10 + p.row * 15;
      var active = i === hover;
      var alpha = Math.min(1, p.labelIn);

      ctx.globalAlpha = alpha * (active ? 1 : 0.92);
      ctx.strokeStyle = active ? AQUA : 'rgba(93,227,255,0.35)';
      ctx.lineWidth = active ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x + 0.5, peakY - 4);
      ctx.lineTo(p.x + 0.5, flagY + 7);
      ctx.stroke();

      ctx.font = (active ? '600 ' : '') + '11px ' + MONO;
      var text = p.label;
      var tw = ctx.measureText(text).width;
      var bw = tw + 14, bh = 15;
      var bx = Math.max(2, Math.min(W - bw - 2, p.x - bw / 2));

      ctx.fillStyle = active ? 'rgba(14,32,52,0.98)' : 'rgba(10,20,34,0.88)';
      roundRect(bx, flagY - bh / 2, bw, bh, 4);
      ctx.fill();
      ctx.strokeStyle = active ? AQUA : 'rgba(93,227,255,0.28)';
      ctx.lineWidth = 1;
      roundRect(bx, flagY - bh / 2, bw, bh, 4);
      ctx.stroke();

      ctx.fillStyle = p.anon ? MUTED : (active ? AQUA : INK);
      ctx.fillText(text, bx + bw / 2, flagY + 0.5);
      ctx.globalAlpha = 1;
    }
  }

  function draw(time) {
    var geo = computeTrace(time);
    var top = geo.top, bottom = geo.bottom;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // vertical grid
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = PAD_L; gx < W - PAD_R; gx += 60) {
      ctx.moveTo(Math.round(gx) + 0.5, top);
      ctx.lineTo(Math.round(gx) + 0.5, bottom);
    }
    ctx.stroke();

    drawAxis(top, bottom);

    // filled trace
    ctx.beginPath();
    ctx.moveTo(PAD_L, bottom);
    for (var x = PAD_L; x < W - PAD_R; x++) {
      ctx.lineTo(x, bottom - (bottom - top) * scratch[x]);
    }
    ctx.lineTo(W - PAD_R, bottom);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, 'rgba(142,247,230,0.20)');
    grad.addColorStop(1, 'rgba(58,167,255,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (var x2 = PAD_L; x2 < W - PAD_R; x2++) {
      var y = bottom - (bottom - top) * scratch[x2];
      if (x2 === PAD_L) ctx.moveTo(x2, y); else ctx.lineTo(x2, y);
    }
    var line = ctx.createLinearGradient(PAD_L, 0, W - PAD_R, 0);
    line.addColorStop(0, DEEP);
    line.addColorStop(0.6, CYAN);
    line.addColorStop(1, AQUA);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.stroke();

    drawSpots(top, bottom);

    // waterfall
    if (wf) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(wf, 0, Math.round(wfTop()), W, Math.round(H * WF_FRAC));
      ctx.restore();
      ctx.strokeStyle = 'rgba(120,165,210,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(wfTop()) + 0.5);
      ctx.lineTo(W, Math.round(wfTop()) + 0.5);
      ctx.stroke();
    }
  }

  // ---- loop ---------------------------------------------------------------

  function step(now) {
    if (!t0) t0 = now;
    var time = now - t0;

    for (var i = 0; i < people.length; i++) {
      var p = people[i];
      var delay = i * 55;
      var a = Math.max(0, Math.min(1, (time - delay) / 620));
      p.appear = a < 1 ? 1 - Math.pow(1 - a, 3) : 1;   // ease-out cubic
      var la = Math.max(0, Math.min(1, (time - delay - 260) / 420));
      p.labelIn = la;
    }

    draw(time);
    if (wf && (Math.floor(time / 55) !== step.lastRow)) {
      step.lastRow = Math.floor(time / 55);
      pushWaterfallRow(scratch);
    }
    if (running) raf = window.requestAnimationFrame(step);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    raf = window.requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = null;
  }

  /* Fill the waterfall before it is first shown. It advances one row per frame
   * group, so an unprimed band spends its first several seconds as an empty
   * black rectangle — and under reduced motion it would simply stay that way.
   * Priming at full strength reads as history: the signals were already on the
   * air before you arrived. */
  function primeWaterfall() {
    if (!wf) return;
    var saved = [];
    for (var i = 0; i < people.length; i++) {
      saved.push(people[i].appear);
      people[i].appear = 1;
    }
    for (var r = 0; r < wf.height + 2; r++) {
      computeTrace(r * 37);
      pushWaterfallRow(scratch);
    }
    for (var j = 0; j < people.length; j++) people[j].appear = saved[j];
  }

  function renderStatic() {
    for (var i = 0; i < people.length; i++) {
      people[i].appear = 1;
      people[i].labelIn = 1;
    }
    draw(0);
  }

  // ---- interaction --------------------------------------------------------

  function pick(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var x = clientX - rect.left, y = clientY - rect.top;
    if (y > wfTop()) return -1;
    var best = -1, bestD = 26;
    for (var i = 0; i < people.length; i++) {
      var d = Math.abs(people[i].x - x);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function showTip(i, clientX) {
    if (!tip) return;
    if (i < 0) { tip.hidden = true; return; }
    var p = people[i];
    var when = sinceText(p.since);
    var name = p.name && p.name !== p.label ? p.name : '';
    tip.textContent = p.label + (name ? ' · ' + name : '') + (when ? ' · since ' + when : '');
    tip.hidden = false;
    var rect = canvas.getBoundingClientRect();
    var left = Math.max(6, Math.min(rect.width - tip.offsetWidth - 6,
      (clientX - rect.left) - tip.offsetWidth / 2));
    tip.style.left = left + 'px';
  }

  canvas.addEventListener('mousemove', function (e) {
    var i = pick(e.clientX, e.clientY);
    if (i !== hover) { hover = i; if (reduce) renderStatic(); }
    showTip(i, e.clientX);
  });
  canvas.addEventListener('mouseleave', function () {
    hover = -1;
    if (tip) tip.hidden = true;
    if (reduce) renderStatic();
  });
  canvas.addEventListener('touchstart', function (e) {
    if (!e.touches.length) return;
    var i = pick(e.touches[0].clientX, e.touches[0].clientY);
    hover = i;
    showTip(i, e.touches[0].clientX);
    if (reduce) renderStatic();
  }, { passive: true });

  // ---- live ledger --------------------------------------------------------

  var QUERY = 'query Supporters($slug: String!) {' +
    ' collective(slug: $slug) { members(role: BACKER, limit: 500) { nodes {' +
    ' since totalDonations { valueInCents } account { name slug } } } } }';

  function readCache() {
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY));
      return o && Date.now() - o.t < TTL ? o.r : null;
    } catch (e) { return null; }
  }
  function writeCache(r) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), r: r })); } catch (e) {}
  }

  function adopt(rows, live) {
    if (!rows || !rows.length) return;
    people = rows;
    for (var i = 0; i < people.length; i++) { people[i].appear = 0; people[i].labelIn = 0; }
    renderList(rows);
    setCount(rows.length);
    layout();
    buildWaterfall();
    primeWaterfall();
    if (staleEl) staleEl.hidden = !!live;
    t0 = 0;
    if (reduce) renderStatic();
  }

  function loadLive() {
    var cached = readCache();
    if (cached) { adopt(cached, true); return; }
    if (!window.fetch) return;

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { slug: 'aethersdr' } })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('open collective ' + res.status);
        return res.json();
      })
      .then(function (doc) {
        if (doc.errors) throw new Error('graphql error');
        var members = doc.data && doc.data.collective && doc.data.collective.members;
        var rows = normalise((members && members.nodes) || []);
        if (!rows.length) throw new Error('no backers returned');
        writeCache(rows);
        adopt(rows, true);
      })
      .catch(function () {
        // The baked roll is already on screen and already drawn. Say so quietly
        // rather than replacing a page of names with an error.
        if (staleEl) staleEl.hidden = false;
      });
  }

  // ---- go -----------------------------------------------------------------

  people = fromDOM();
  for (var i = 0; i < people.length; i++) { people[i].appear = 0; people[i].labelIn = 0; }
  setCount(people.length);

  resize();
  if (reduce) renderStatic(); else start();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduce) renderStatic();
    }, 150);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (!reduce) start();
  });

  // Do not animate a display nobody is looking at.
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) { if (!reduce) start(); }
        else stop();
      }
    }, { threshold: 0.02 }).observe(canvas);
  }

  loadLive();
})();

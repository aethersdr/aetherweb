// Splits a station's content across as many panels as it takes to fit the
// screen, so a tall section becomes several stops instead of a scroll.
//
// Content is cut between "units": the children of the layout containers in
// DESCEND, and for grids a whole row at a time, so no card is ever split.
// Units move off the end of an overflowing panel onto the front of the next
// one, inside shallow clones of their original containers (ids stripped), so
// the page CSS applies unchanged. Grid rows are then evened out between pages
// so no page is left holding one stray card. restore() puts everything back.

const DESCEND = 'section, .wrap, .hero-grid, .feature-grid, .partners-grid, .built-wrap';
const GRIDS = '.feature-grid, .partners-grid';
const MAX_PAGES = 6;
const MIN_ZOOM = 0.8;

const overflows = (panel) => panel.scrollHeight > panel.clientHeight + 1;
const srcOf = (el) => el.__src || el;

function unitsOf(panel) {
  const out = [];
  const walk = (el) => {
    if (el.matches('.stage-cont')) return;           // the page label stays put
    if (el.matches(DESCEND) && !el.closest('footer')) [...el.children].forEach(walk);
    else out.push(el);
  };
  [...panel.firstElementChild.children].forEach(walk);
  return out;
}

// The last unit, plus its whole row if it sits in a grid.
function tailGroup(units) {
  const last = units[units.length - 1];
  if (!last.parentElement.matches(GRIDS)) return [last];
  return units.filter((u) => u.parentElement === last.parentElement && u.offsetTop === last.offsetTop);
}

// Rows of grid cards on a page, keyed by the original grid they came from.
function gridRows(panel) {
  const rows = new Map();
  for (const u of unitsOf(panel)) {
    if (!u.parentElement.matches(GRIDS)) continue;
    const key = srcOf(u.parentElement);
    if (!rows.has(key)) rows.set(key, new Set());
    rows.get(key).add(u.offsetTop);
  }
  return rows;
}

// The element in `panel` standing in for `el`'s container chain, built from
// shallow clones on demand. `atFront` decides where a new clone goes.
function counterpart(el, fromPanel, panel, atFront) {
  if (el === fromPanel.firstElementChild) return panel.firstElementChild;
  const parent = counterpart(el.parentElement, fromPanel, panel, atFront);
  const key = srcOf(el);
  const found = [...parent.children].find((c) => srcOf(c) === key);
  if (found) return found;
  const clone = el.cloneNode(false);
  clone.removeAttribute('id');
  clone.__src = key;
  // "Front" is after the page label, if the page has one.
  const label = atFront && parent.firstElementChild && parent.firstElementChild.matches('.stage-cont') ? parent.firstElementChild : null;
  if (label) label.after(clone); else if (atFront) parent.prepend(clone); else parent.append(clone);
  return clone;
}

export function paginate(panel, makePanel) {
  const pages = [panel];
  const moved = new Set();
  const pushForward = (units, from, to) => {
    for (const u of [...units].reverse()) {
      if (!u.__home) u.__home = u.parentElement;
      moved.add(u);
      const dest = counterpart(u.parentElement, from, to, true);
      const label = dest.firstElementChild && dest.firstElementChild.matches('.stage-cont') ? dest.firstElementChild : null;
      if (label) label.after(u); else dest.prepend(u);
    }
  };
  const pullBack = (units, from, to) => {
    for (const u of units) counterpart(u.parentElement, from, to, false).append(u);
    // Drop clone shells the move left empty.
    for (const c of [...from.firstElementChild.querySelectorAll('*')].reverse()) if (c.__src && !c.children.length) c.remove();
  };

  let page = panel;
  while (pages.length < MAX_PAGES && overflows(page)) {
    const next = makePanel();
    let count = 0;
    while (overflows(page)) {
      const units = unitsOf(page);
      const group = tailGroup(units);
      if (group.length >= units.length) break;        // never empty a panel
      pushForward(group, page, next);
      count += group.length;
    }
    if (!count) { next.remove(); break; }
    pages.push(next);
    page = next;
  }

  // Even out grid rows between neighbouring pages: move a row forward while
  // the earlier page has at least two more, as long as the later page fits.
  for (let k = pages.length - 1; k > 0; k--) {
    const a = pages[k - 1], b = pages[k];
    for (let guard = 0; guard < 12; guard++) {
      const ra = gridRows(a), rb = gridRows(b);
      const grid = [...rb.keys()].find((g) => ra.has(g));
      if (!grid || ra.get(grid).size - rb.get(grid).size < 2) break;
      const units = unitsOf(a);
      const group = tailGroup(units);
      if (group.length >= units.length || srcOf(group[0].parentElement) !== grid) break;
      pushForward(group, a, b);
      if (overflows(b)) { pullBack(group, b, a); break; }
    }
  }

  // Anything still too tall is one unit that can't be split: shrink it a little.
  for (const p of pages) {
    const inner = p.firstElementChild;
    inner.style.zoom = '';
    if (overflows(p)) {
      const avail = p.clientHeight - parseFloat(getComputedStyle(p).paddingTop);
      inner.style.zoom = String(Math.max(MIN_ZOOM, avail / inner.scrollHeight));
    }
  }

  return {
    pages,
    restore() {
      // Moved units were always the trailing children of their homes, so
      // re-appending them in page order rebuilds the original order exactly.
      for (const p of pages.slice(1)) {
        for (const u of [...p.querySelectorAll('*')].filter((n) => moved.has(n))) u.__home.appendChild(u);
        p.remove();
      }
      for (const u of moved) delete u.__home;
      panel.firstElementChild.style.zoom = '';
    },
  };
}

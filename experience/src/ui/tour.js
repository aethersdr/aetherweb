// Guided tour: a curated path through the world with captions. Each stop is a
// route plus an optional with/without flip partway through, so the tour shows
// the tangle first and then the fold. Advances on its own; arrows step; Esc ends.

const STOPS = [
  { go: '#/', dwell: 6, say: 'This is the <b>AetherSDR</b> world: a live band at the centre, the real app on the wall behind it, and a ring of operators who use it.' },
  { go: '#/scenario/contest-so2r', dwell: 9, flip: 4.5, say: 'A <b>contester</b> running two bands at once. Watch the separate programs and virtual links fold into one AetherSDR window.' },
  { go: '#/scenario/dx-split', dwell: 9, flip: 4.5, say: 'A <b>DXer</b> chasing a split pileup — hearing the DX and the callers at the same time.' },
  { go: '#/scenario/ft8-multiband', dwell: 9, flip: 4.5, say: 'The <b>digital-mode</b> operator: FT8 on more than one band without a stack of decoder copies, ports, and virtual cables.' },
  { go: '#/scenario/pota-hunt', dwell: 8, flip: 4, say: 'A <b>park hunter</b> working activators straight from spots.' },
  { go: '#/scenario/remote-anywhere', dwell: 8, flip: 4, say: 'The <b>remote</b> operator: the home station from a laptop on any OS.' },
  { go: '#/features', dwell: 7, say: 'Everything that makes it possible, as an atlas — every <b>Aether</b> component, with sources.' },
  { go: '#/usecases/contesting', dwell: 7, say: 'Or come in through a use case, with the numbers behind it.' },
  { go: '#/', dwell: 5, say: 'Explore by operator, use case, or feature — every view links to the others. <b>Press T</b> to replay.' },
];

export function createTour({ go, setMode, onChange = () => {} }) {
  const bar = document.getElementById('tour-bar');
  const cap = document.getElementById('tour-caption');
  const stepEl = document.getElementById('tour-step');
  let i = -1, timer = 0, flipTimer = 0, active = false;

  function show(n) {
    clearTimeout(timer); clearTimeout(flipTimer);
    i = (n + STOPS.length) % STOPS.length;
    const s = STOPS[i];
    go(s.go);
    cap.innerHTML = s.say;
    stepEl.textContent = `${i + 1} / ${STOPS.length}`;
    if (s.flip) flipTimer = setTimeout(() => setMode(true), s.flip * 1000);
    timer = setTimeout(() => (i === STOPS.length - 1 ? stop() : show(i + 1)), s.dwell * 1000);
  }
  function start() {
    if (active) return;
    active = true;
    document.body.classList.add('touring');
    bar.hidden = false;
    onChange();
    show(0);
  }
  function stop() {
    clearTimeout(timer); clearTimeout(flipTimer);
    active = false;
    document.body.classList.remove('touring');
    bar.hidden = true;
    onChange();
  }
  document.getElementById('tour-next').addEventListener('click', () => show(i + 1));
  document.getElementById('tour-prev').addEventListener('click', () => show(i - 1));
  document.getElementById('tour-stop').addEventListener('click', stop);
  addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'Escape') { stop(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { show(i + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); }
  });
  return { start, stop, get active() { return active; } };
}

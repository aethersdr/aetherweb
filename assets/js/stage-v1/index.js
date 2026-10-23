// Entry point for the homepage's 3D layer. The page is complete without it:
// this only runs after `load`, and only with WebGL2, no reduced-motion
// preference, and no Save-Data. Roomy pointer screens get the full 3D stage;
// everything else gets the spectrum behind the hero and keeps scrolling.
//
// Site-wide switch: the script tag's data-mode. "stage" is the full 3D
// navigation, "hero" is only the spectrum behind the hero on the normal
// scrolling page. Removing the tag turns the 3D layer off entirely.

const KEY = 'aethersdr.view';
const hero = document.querySelector('.hero');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;
const tag = document.querySelector('script[src*="stage-v1/index.js"]');
const mode = (tag && tag.dataset.mode) || 'stage';
const roomy = matchMedia('(min-width: 1000px) and (min-height: 600px) and (pointer: fine)').matches;

const pref = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const setPref = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* private mode */ } };

if (hero && !reduce && !saveData && document.createElement('canvas').getContext('webgl2')) {
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}

async function start() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('./stage.css', import.meta.url).href;
  const cssReady = new Promise((ok) => { css.onload = css.onerror = ok; });
  document.head.appendChild(css);
  const [THREE] = await Promise.all([import('../vendor/three-r170.module.min.js'), cssReady]);

  if (mode === 'stage' && roomy && pref() !== 'scroll') {
    const { startStage } = await import('./stage.js');
    if (startStage(THREE, () => { setPref('scroll'); location.reload(); })) return;
  }
  const { startHero } = await import('./hero.js');
  startHero(THREE, hero);
  if (mode === 'stage' && roomy) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stage-enter';
    b.textContent = '3D view';
    b.addEventListener('click', () => { setPref(null); location.reload(); });
    document.body.appendChild(b);
  }
}

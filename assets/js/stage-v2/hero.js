// Scroll-page mode: the spectrum alone, behind the hero copy. Used wherever
// the full 3D stage is off — narrow screens, touch, or the visitor's choice.

import { createSpectrum, SPECTRUM_DEPTH } from './spectrum.js';

export function startHero(THREE, hero) {
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-3d';
  canvas.setAttribute('aria-hidden', 'true');
  hero.classList.add('has-3d');
  hero.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
  const spectrum = createSpectrum(THREE);
  scene.add(spectrum.group);

  // Camera: slow drift plus a little pointer parallax.
  const look = new THREE.Vector3(0, 0, -SPECTRUM_DEPTH * 0.5);
  let px = 0, py = 0, tx = 0, ty = 0, dist = 50;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Narrow screens see less band, so pull back rather than crop the signals.
    dist = 50 * Math.max(1, 1.25 / camera.aspect) ** 0.7;
    camera.updateProjectionMatrix();
    spectrum.setPixelScale(renderer.getPixelRatio() * h / 900);
  }
  new ResizeObserver(resize).observe(hero);
  resize();

  // Loop only while the hero is on screen and the tab is visible.
  let visible = true, raf = 0, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  function kick() {
    if (visible && !document.hidden && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const t = now / 1000;
    spectrum.update(t, dt);
    px += (tx - px) * (1 - Math.exp(-2 * dt));
    py += (ty - py) * (1 - Math.exp(-2 * dt));
    camera.position.set(Math.sin(t * 0.05) * 10 + px * 8, 42 - py * 4, dist);
    camera.lookAt(look);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  kick();
  requestAnimationFrame(() => canvas.classList.add('on'));
}

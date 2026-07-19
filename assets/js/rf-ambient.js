/* Subtle RF atmosphere for the overview hero.
 *
 * The canvas is decorative, clipped to the hero, and intentionally light on
 * resources: it throttles its frame rate, lowers pixel density on small
 * screens, pauses while off-screen or in a hidden tab, and becomes a static
 * composition when the visitor prefers reduced motion.
 */
(function () {
  'use strict';

  var hero = document.querySelector('[data-rf-hero]');
  var canvas = hero && hero.querySelector('.rf-ambient-canvas');
  if (!hero || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var smallScreen = window.matchMedia('(max-width: 700px)');
  // Safari can corrupt separately composited text above a continuously
  // repainting canvas. Keep the spectrum static there and let CSS animate the
  // sweep on its own layer; other browsers retain the richer live trace.
  var safariStatic = /Safari\//.test(navigator.userAgent)
    && !/(Chrome|Chromium|CriOS|Edg|OPR|FxiOS)\//.test(navigator.userAgent);
  if (safariStatic) hero.classList.add('rf-safari-static');
  var visible = true;
  var pageVisible = !document.hidden;
  var running = false;
  var frameRequest = 0;
  var lastFrame = 0;
  var width = 0;
  var height = 0;
  var MOTION_RATE = 1.2;

  var signals = [
    { x: 0.11, width: 0.010, level: 0.42, drift: 0.55, travel: 0.009, phase: 0.3 },
    { x: 0.24, width: 0.016, level: 0.25, drift: 0.42, travel: 0.012, phase: 1.7 },
    { x: 0.39, width: 0.009, level: 0.62, drift: 0.64, travel: 0.008, phase: 2.5 },
    { x: 0.55, width: 0.021, level: 0.34, drift: 0.48, travel: 0.014, phase: 4.2 },
    { x: 0.72, width: 0.012, level: 0.53, drift: 0.58, travel: 0.010, phase: 5.4 },
    { x: 0.88, width: 0.018, level: 0.29, drift: 0.38, travel: 0.013, phase: 3.1 }
  ];

  function gaussian(distance, spread) {
    return Math.exp(-(distance * distance) / (2 * spread * spread));
  }

  function spectrumAt(normalX, seconds) {
    var floor = 0.10
      + Math.sin(normalX * 91 + seconds * 0.75) * 0.018
      + Math.sin(normalX * 217 - seconds * 0.50) * 0.012
      + Math.sin(normalX * 509 + 1.4) * 0.007;

    for (var i = 0; i < signals.length; i++) {
      var signal = signals[i];
      var center = signal.x + Math.sin(seconds * signal.drift + signal.phase) * signal.travel;
      var pulse = 0.78 + Math.sin(seconds * 0.72 + signal.phase) * 0.22;
      floor += gaussian(normalX - center, signal.width) * signal.level * pulse;
    }
    return Math.min(0.88, floor);
  }

  function drawGrid(baseline) {
    var top = Math.max(76, height * 0.09);
    var bottom = Math.min(height * 0.79, baseline + 92);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(93, 227, 255, 0.055)';
    for (var i = 1; i < 16; i++) {
      var x = (width / 16) * i;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(123, 242, 220, 0.035)';
    for (var j = 0; j < 5; j++) {
      var y = top + ((bottom - top) / 5) * j;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function tracePath(seconds, baseline, amplitude, offset) {
    var points = smallScreen.matches ? 110 : 190;
    ctx.beginPath();
    for (var i = 0; i <= points; i++) {
      var nx = i / points;
      var x = nx * width;
      var y = baseline - spectrumAt(nx, seconds - offset * 0.06) * amplitude + offset;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }

  function drawSpectrum(seconds, baseline) {
    var breathe = 0.98 + Math.sin(seconds * 0.65) * 0.02;
    var amplitude = Math.min(118, Math.max(58, height * 0.13)) * breathe;

    // A few dim history traces suggest a stacked panadapter without pulling
    // focus from the headline and calls to action.
    for (var history = 3; history >= 1; history--) {
      tracePath(seconds, baseline, amplitude * (1 - history * 0.025), history * 10);
      ctx.strokeStyle = 'rgba(58, 167, 255, ' + (0.035 + history * 0.012) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    tracePath(seconds, baseline, amplitude, 0);
    var fill = ctx.createLinearGradient(0, baseline - amplitude, 0, baseline + 44);
    fill.addColorStop(0, 'rgba(93, 227, 255, 0.16)');
    fill.addColorStop(0.48, 'rgba(58, 167, 255, 0.07)');
    fill.addColorStop(1, 'rgba(58, 167, 255, 0)');
    ctx.lineTo(width, baseline + 52);
    ctx.lineTo(0, baseline + 52);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    tracePath(seconds, baseline, amplitude, 0);
    var stroke = ctx.createLinearGradient(0, 0, width, 0);
    stroke.addColorStop(0, 'rgba(58, 167, 255, 0.10)');
    stroke.addColorStop(0.22, 'rgba(93, 227, 255, 0.40)');
    stroke.addColorStop(0.52, 'rgba(142, 247, 230, 0.52)');
    stroke.addColorStop(0.82, 'rgba(93, 227, 255, 0.34)');
    stroke.addColorStop(1, 'rgba(58, 167, 255, 0.08)');
    ctx.strokeStyle = stroke;
    ctx.lineWidth = smallScreen.matches ? 1 : 1.25;
    ctx.shadowColor = 'rgba(93, 227, 255, 0.34)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawSweep(seconds, baseline) {
    var progress = (seconds / 16) % 1;
    var x = progress * width;
    var sweep = ctx.createLinearGradient(x - 90, 0, x + 18, 0);
    sweep.addColorStop(0, 'rgba(93, 227, 255, 0)');
    sweep.addColorStop(0.82, 'rgba(93, 227, 255, 0.04)');
    sweep.addColorStop(1, 'rgba(142, 247, 230, 0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(Math.max(0, x - 90), height * 0.08, 108, baseline + 88);
  }

  function draw(time) {
    if (!width || !height) return;
    var seconds = (time / 1000) * MOTION_RATE;
    var baseline = Math.min(height * 0.64, 560);

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    if (!safariStatic) ctx.globalCompositeOperation = 'screen';
    drawGrid(baseline);
    drawSweep(seconds, baseline);
    drawSpectrum(seconds, baseline);
    ctx.restore();
  }

  function resize() {
    var rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    var density = Math.min(window.devicePixelRatio || 1, smallScreen.matches ? 1.15 : 1.5);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(density, 0, 0, density, 0, 0);
    draw(performance.now());
  }

  function animate(time) {
    if (!running) return;
    var frameInterval = smallScreen.matches ? 1000 / 18 : 1000 / 24;
    if (time - lastFrame >= frameInterval) {
      lastFrame = time;
      draw(time);
    }
    frameRequest = window.requestAnimationFrame(animate);
  }

  function updatePlayback() {
    var shouldRun = visible && pageVisible && !reduceMotion.matches && !safariStatic;
    if (shouldRun && !running) {
      running = true;
      lastFrame = 0;
      frameRequest = window.requestAnimationFrame(animate);
    } else if (!shouldRun && running) {
      running = false;
      window.cancelAnimationFrame(frameRequest);
    }
    if (!shouldRun && !safariStatic) draw(0);
  }

  document.addEventListener('visibilitychange', function () {
    pageVisible = !document.hidden;
    updatePlayback();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updatePlayback();
    }, { rootMargin: '80px 0px' }).observe(hero);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener('resize', resize);
  }

  function preferenceChanged() {
    resize();
    updatePlayback();
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', preferenceChanged);
  else reduceMotion.addListener(preferenceChanged);
  if (smallScreen.addEventListener) smallScreen.addEventListener('change', preferenceChanged);
  else smallScreen.addListener(preferenceChanged);

  resize();
  updatePlayback();
})();

(() => {
  const q = new URLSearchParams(location.search);
  const og = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, o) { return og.call(this, t, Object.assign({}, o, { preserveDrawingBuffer: true })); };
  const errs = [];
  addEventListener('error', (e) => errs.push('ERR ' + e.message + ' @' + e.lineno));
  addEventListener('unhandledrejection', (e) => errs.push('REJ ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason)));
  const origWarn = console.warn; console.warn = (...a) => { errs.push('WARN ' + a.join(' ')); origWarn(...a); };
  const route = q.get('r') || '';
  const at = +(q.get('at') || 5000);
  const mode = q.get('m');
  addEventListener('DOMContentLoaded', () => {
    const img = document.createElement('img'); img.src = 'http://127.0.0.1:4322/' + ((at + 2500) / 1000); img.style.display = 'none'; document.body.appendChild(img);
    if (route) setTimeout(() => { location.hash = route; }, 600);
    if (q.get('key')) setTimeout(() => { dispatchEvent(new KeyboardEvent('keydown', { key: q.get('key'), bubbles: true })); }, 900);
    if (mode) setTimeout(() => { document.querySelector('.switch [data-mode="with"]')?.click(); }, 600 + +mode);
    setTimeout(() => {
      const cv = document.getElementById('gl');
      if (cv) { const im = new Image(); im.src = cv.toDataURL(); im.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh'; cv.replaceWith(im); }
      const info = `${route} hash=${location.hash} with=${!!document.querySelector('.switch.with')} touring=${document.body.classList.contains('touring')} ${innerWidth}x${innerHeight} ${errs.join(' | ') || 'no errors'}`;
      fetch('http://127.0.0.1:4322/log', { method: 'POST', body: info });
    }, at);
  });
})();

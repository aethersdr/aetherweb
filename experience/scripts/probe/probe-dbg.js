setTimeout(() => {
  const w = window.__world; if (!w) return fetch('http://127.0.0.1:4322/log', { method: 'POST', body: 'no world' });
  const i = w.engine.renderer.info;
  i.autoReset = false;
  requestAnimationFrame(() => { i.reset(); requestAnimationFrame(() => {
    let objs = 0; w.engine.scene.traverse(() => objs++);
    fetch('http://127.0.0.1:4322/log', { method: 'POST', body: `one frame: calls=${i.render.calls} tris=${i.render.triangles} lines=${i.render.lines} points=${i.render.points} objects=${objs}` });
  }); });
}, 6000);

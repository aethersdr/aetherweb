// contributors.aethersdr.com — a mirror of the AetherSDR contributor
// leaderboard. The cron handler copies the leaderboard page and its
// standings from the source dashboard into KV every 15 minutes; requests are
// served from KV only, so the mirror stays up with the last good copy when
// the source is unreachable. A failed sync never overwrites a good copy.

const PAGE = 'page.html';
const DATA = 'standings.json';
const META = 'meta.json';
const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

async function sync(env) {
  const started = new Date().toISOString();
  const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
  try {
    const [pageRes, dataRes] = await Promise.all([
      fetch(`${env.SOURCE}/leaderboard`, { cf: { cacheTtl: 0 } }),
      fetch(`${env.SOURCE}/api/leaderboard`, { cf: { cacheTtl: 0 } }),
    ]);
    if (!pageRes.ok || !dataRes.ok) throw new Error(`source returned ${pageRes.status}/${dataRes.status}`);
    let page = await pageRes.text();
    const data = await dataRes.text();
    // Validate before replacing the copy we serve.
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.windows) || !Array.isArray(parsed.all_time) || !parsed.rules)
      throw new Error('standings payload is missing windows/all_time/rules');
    if (!page.includes('Contributor Standings')) throw new Error('leaderboard page looks wrong');
    // On the public mirror, the back link goes to the project site, not the
    // agent dashboard.
    page = page.replace('<a href="/">&larr; Dashboard</a>', '<a href="https://www.aethersdr.com/">&larr; AetherSDR.com</a>');
    await env.SNAPSHOT.put(PAGE, page);
    await env.SNAPSHOT.put(DATA, data);
    await env.SNAPSHOT.put(META, JSON.stringify({
      synced_at: started, collected_at: parsed.collected_at || null, bytes: data.length, last_error: null,
      last_error_at: meta.last_error_at || null,
    }));
    return true;
  } catch (e) {
    await env.SNAPSHOT.put(META, JSON.stringify({ ...meta, last_error: String(e).slice(0, 300), last_error_at: started }));
    return false;
  }
}

function respond(body, type, extra = {}, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': type, ...HEADERS, ...extra } });
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(sync(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });

    // First request after deploy: populate the copy if it's empty.
    if (url.pathname === '/' || url.pathname === '/api/leaderboard') {
      if (!(await env.SNAPSHOT.get(META))) await sync(env);
    }

    if (url.pathname === '/' || url.pathname === '/leaderboard') {
      const page = await env.SNAPSHOT.get(PAGE);
      if (!page) return respond('The standings are syncing — try again in a minute.', 'text/plain; charset=utf-8', { 'Retry-After': '60' }, 503);
      return respond(page, 'text/html; charset=utf-8', { 'Cache-Control': 'public, max-age=60' });
    }
    if (url.pathname === '/api/leaderboard') {
      const data = await env.SNAPSHOT.get(DATA);
      if (!data) return respond('{"error":"standings unavailable"}', 'application/json', { 'Retry-After': '60' }, 503);
      const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
      return respond(data, 'application/json', {
        'Cache-Control': 'public, max-age=120',
        'Access-Control-Allow-Origin': '*',
        'X-Synced-At': meta.synced_at || '',
      });
    }
    if (url.pathname === '/healthz') {
      const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
      const age = meta.synced_at ? Math.round((Date.now() - Date.parse(meta.synced_at)) / 1000) : null;
      return respond(JSON.stringify({ ...meta, age_seconds: age, healthy: age !== null && age < 3600 }, null, 1),
                     'application/json', { 'Cache-Control': 'no-cache' });
    }
    if (url.pathname === '/robots.txt') return respond('User-agent: *\nAllow: /\n', 'text/plain');
    return respond('Not found', 'text/plain', {}, 404);
  },
};

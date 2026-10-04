// contributors.aethersdr.com — a mirror of the AetherSDR contributor
// leaderboard. The source dashboard asks for a sync whenever its standings
// change (POST /sync), and a cron every 15 minutes syncs regardless. Each
// sync copies the leaderboard page and its standings into KV after checking
// them; requests are served from KV only, so the mirror stays up with the
// last good copy when the source is unreachable. A failed sync never
// overwrites a good copy. /healthz reports what was copied (hashes,
// timestamps, warnings) and which Worker version is running, so the source
// can verify the two haven't drifted.

const PAGE = 'page.html';
const DATA = 'standings.json';
const META = 'meta.json';
const MIN_SYNC_GAP_MS = 30_000;   // /sync requests closer than this are skipped
const BACK_LINK = '<a href="/">&larr; Dashboard</a>';
const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function version(env) {
  const v = env.CF_VERSION_METADATA || {};
  return { id: v.id || null, tag: v.tag || null, timestamp: v.timestamp || null, git_commit: env.GIT_COMMIT || 'local' };
}

async function sync(env, trigger) {
  const started = new Date().toISOString();
  const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
  try {
    const [pageRes, dataRes] = await Promise.all([
      fetch(`${env.SOURCE}/leaderboard`, { cf: { cacheTtl: 0 } }),
      fetch(`${env.SOURCE}/api/leaderboard`, { cf: { cacheTtl: 0 } }),
    ]);
    if (!pageRes.ok || !dataRes.ok) throw new Error(`source returned ${pageRes.status}/${dataRes.status}`);
    const sourcePage = await pageRes.text();
    const data = await dataRes.text();
    // Check structure, not wording, so a cosmetic edit can't freeze the mirror.
    const parsed = JSON.parse(data);
    for (const key of ['windows', 'all_time', 'rules']) {
      if (!(key in parsed)) throw new Error(`standings payload is missing "${key}"`);
    }
    if (!Array.isArray(parsed.windows) || !Array.isArray(parsed.all_time)) throw new Error('standings payload is malformed');
    if (!/<html/i.test(sourcePage) || !sourcePage.includes('/api/leaderboard')) throw new Error('leaderboard page does not load its standings');
    const warnings = [];
    // On the public mirror, the back link goes to the project site.
    let page = sourcePage;
    if (page.includes(BACK_LINK)) {
      page = page.replace(BACK_LINK, '<a href="https://www.aethersdr.com/">&larr; AetherSDR.com</a>');
    } else {
      warnings.push('back link not found; the mirror links back to itself');
    }
    await env.SNAPSHOT.put(PAGE, page);
    await env.SNAPSHOT.put(DATA, data);
    await env.SNAPSHOT.put(META, JSON.stringify({
      synced_at: started, trigger,
      collected_at: parsed.collected_at || null,
      content_hash: parsed.content_hash || null,
      page_sha256: await sha256(sourcePage),
      bytes: data.length, warnings,
      last_error: null, last_error_at: meta.last_error_at || null,
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

function tokenMatches(given, expected) {
  if (!given || !expected) return false;
  const a = new TextEncoder().encode(given), b = new TextEncoder().encode(expected);
  return a.byteLength === b.byteLength && crypto.subtle.timingSafeEqual(a, b);
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(sync(env, 'cron'));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // The source asks for a sync when its standings change.
    if (url.pathname === '/sync') {
      if (request.method !== 'POST') return respond('Method not allowed', 'text/plain', {}, 405);
      if (!tokenMatches(request.headers.get('X-Sync-Token'), env.SYNC_TOKEN)) return respond('Forbidden', 'text/plain', {}, 403);
      const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
      if (meta.synced_at && Date.now() - Date.parse(meta.synced_at) < MIN_SYNC_GAP_MS) {
        return respond('{"status":"recent"}', 'application/json', {}, 202);
      }
      ctx.waitUntil(sync(env, 'push'));
      return respond('{"status":"syncing"}', 'application/json', {}, 202);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return respond('Method not allowed', 'text/plain', {}, 405);

    // First request after deploy: populate the copy if it's empty.
    if (url.pathname === '/' || url.pathname === '/api/leaderboard') {
      if (!(await env.SNAPSHOT.get(META))) await sync(env, 'first-request');
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
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
        'X-Synced-At': meta.synced_at || '',
      });
    }
    if (url.pathname === '/healthz') {
      const meta = (await env.SNAPSHOT.get(META, 'json')) || {};
      const age = meta.synced_at ? Math.round((Date.now() - Date.parse(meta.synced_at)) / 1000) : null;
      return respond(JSON.stringify({ ...meta, age_seconds: age, healthy: age !== null && age < 3600,
                                      version: version(env) }, null, 1),
                     'application/json', { 'Cache-Control': 'no-cache' });
    }
    if (url.pathname === '/robots.txt') return respond('User-agent: *\nAllow: /\n', 'text/plain');
    return respond('Not found', 'text/plain', {}, 404);
  },
};

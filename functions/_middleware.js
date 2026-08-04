/* Markdown for agents — content negotiation in front of the static site.
 *
 * A request for a page with `Accept: text/markdown` gets the markdown
 * rendering of that page instead of the HTML. Browsers never send that, so
 * HTML stays the default and nothing about the human site changes.
 *
 * The renderings are generated at build time by scripts/gen-agent-discovery.py
 * (into /index.md, /blog.md, /lineage.md) and listed in the generated md-map.js
 * with a token estimate, so this runs without parsing anything at the edge.
 *
 * Two things to know before editing:
 *   - Cloudflare does not apply `_headers` to responses a Function produced,
 *     so this file replays them from the generated site-headers.js. Without
 *     that, routing a page through here would quietly drop its CSP.
 *   - `_routes.json` (also generated) keeps this off every path that has no
 *     markdown rendering, so the rest of the site stays purely static.
 */

import { MD_MAP } from './md-map.js';
import { HEADER_RULES } from './site-headers.js';

/* `_headers` globbing, which is only ever `*` in this repo. */
function matches(pattern, path) {
  if (pattern.indexOf('*') === -1) return pattern === path;
  const [head, ...rest] = pattern.split('*');
  const tail = rest.join('');
  return path.length >= head.length + tail.length &&
    path.startsWith(head) && path.endsWith(tail);
}

function applySiteHeaders(headers, path) {
  for (const [pattern, values] of HEADER_RULES) {
    if (!matches(pattern, path)) continue;
    for (const name of Object.keys(values)) headers.set(name, values[name]);
  }
}

/* "/blog/", "/blog.html" and "/blog" are the same page as far as an agent is
 * concerned; Pages redirects the .html form, but a client that sent Accept
 * along with it should still get markdown rather than a redirect-then-HTML. */
function normalize(pathname) {
  let path = pathname;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if (path.endsWith('.html')) path = path.slice(0, -5);
  if (path === '/index' || path === '') path = '/';
  return path;
}

/* Enough of RFC 9110 §12.5.1 to be honest about q-values: markdown wins only
 * if the client actually asked for it and did not rank it below HTML. */
function prefersMarkdown(accept) {
  if (!accept) return false;
  let markdown = -1;
  let html = -1;
  for (const part of accept.split(',')) {
    const [rawType, ...params] = part.split(';');
    const type = rawType.trim().toLowerCase();
    let q = 1;
    for (const param of params) {
      const [k, v] = param.split('=');
      if (k && k.trim().toLowerCase() === 'q') q = parseFloat(v) || 0;
    }
    if (type === 'text/markdown' || type === 'text/x-markdown') {
      markdown = Math.max(markdown, q);
    } else if (type === 'text/html' || type === 'application/xhtml+xml') {
      html = Math.max(html, q);
    }
  }
  return markdown > 0 && markdown >= html;
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = normalize(url.pathname);
  const entry = MD_MAP[path];

  if (!entry || (request.method !== 'GET' && request.method !== 'HEAD')) {
    return next();
  }

  if (!prefersMarkdown(request.headers.get('Accept'))) {
    const upstream = await next();
    const response = new Response(upstream.body, upstream);
    applySiteHeaders(response.headers, url.pathname);
    // Same URL, two representations — caches need to know.
    response.headers.set('Vary', 'Accept');
    response.headers.append(
      'Link',
      `<${url.origin}${entry.asset}>; rel="alternate"; type="text/markdown"`
    );
    return response;
  }

  const asset = await env.ASSETS.fetch(new URL(entry.asset, url.origin));
  if (!asset.ok) return next();

  const headers = new Headers();
  applySiteHeaders(headers, url.pathname);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Vary', 'Accept');
  headers.set('x-markdown-tokens', String(entry.tokens));
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.append('Link', `<${url.origin}${path}>; rel="canonical"`);

  if (request.method === 'HEAD') return new Response(null, { headers });
  return new Response(asset.body, { status: 200, headers });
}

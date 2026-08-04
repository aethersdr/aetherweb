# aetherweb

Marketing / project website for **AetherSDR** — the cross-platform, open-source
client for FlexRadio Systems transceivers. Lives at
[www.aethersdr.com](https://www.aethersdr.com) (Cloudflare-hosted).

Design inspired by [armbian.com](https://www.armbian.com): dark, technical, and
feature-forward, using AetherSDR's own palette (deep navy + electric cyan→teal).

## Structure

```
index.html            The landing page (single page, no build step required)
blog.html             The blog — card index + every post, routed client-side
lineage.html          The 2003→now amateur-SDR timeline
styles.css            All styling (design tokens at the top)
assets/img/           Optimized screenshots, logo, and 3D-spectrum visuals
assets/js/blog.js     Blog card-index <-> post routing
assets/js/webmcp.js   WebMCP tools — the site's actions, exposed to agents
functions/            Cloudflare Pages Function: Accept: text/markdown handling
api/, .well-known/    Machine-readable surface (generated — see docs/)
serve.py              Tiny local static server (python3 serve.py → :4321)
scripts/build.py      Bundles everything into dist/index.html (self-contained)
scripts/gen-blog-art.py  Regenerates the generated SVG post art
scripts/gen-agent-discovery.py  Regenerates sitemap, /api, /.well-known, *.md
scripts/check-agent-discovery.sh  Smoke-tests that surface on a deployed site
```

Post art that isn't a screenshot is generated SVG — drawn in the site palette
and committed alongside the source that produces it:

```bash
python3 scripts/gen-blog-art.py   # rewrites assets/img/first-contribution-*.svg
```

It's deterministic (fixed seed), so re-running produces byte-identical files;
tweak the constants at the top rather than editing thousands of `<rect>`s by
hand. Each post needs two crops — a wide hero and a near-square for the card
column, which crops to roughly 1.1:1.

## Adding a blog post

Everything lives in `blog.html` — no build step, no separate post files. A post
is two blocks that share a slug:

1. **A card** in the `.blog-grid`, linking to `#your-slug`. The description is
   clamped to four lines, so write 3–4 lines and don't worry about matching
   neighbouring card heights. Cards are ordered newest-first by hand — insert
   yours **below the pinned card** and above the newest release post.
2. **An `<article class="blog-post" data-post="your-slug" ... hidden>`** further
   down, holding the hero image and full body. Keep the `hidden` attribute — it
   is what keeps the post off the index until it's routed to.

`assets/js/blog.js` matches the two by slug: clicking a card sets the hash, which
swaps the grid out for that post. Post URLs (`/blog.html#your-slug`) are
shareable, and Back/Forward work. Body copy goes inside `.blog-body`, which
styles headings, lists, links, quotes, and code blocks for you.

> Note: don't add a `display` value to `.blog-post` in CSS — a class rule
> out-specifies the browser's `[hidden] { display: none }` and every post would
> render on the index at once.

The first card carries `is-pinned` and a **Pinned** badge, holding it at the top
of the index whatever its date. To pin a different post, move the class, the
badge markup, and the `<!-- PINNED -->` comment to that card.

Editing `styles.css`? Bump the `?v=` on the three `<link rel="stylesheet">` tags
(`index.html`, `blog.html`, `404.html`). The file is served with `max-age=14400`,
so without a new URL a browser can pair a stale stylesheet with fresh markup for
up to four hours.

Cloudflare Pages serves the page extensionless at **`/blog`** and 308-redirects
`/blog.html` to it, so `canonical` and the `og:`/`twitter:` URLs point at `/blog`.
Internal links keep the `blog.html` form on purpose — it resolves under
`serve.py` locally and just costs one redirect hop in production.

## Machine-readable surface

The site publishes a sitemap, an RFC 9727 API catalog over a small read-only
content API, an Agent Skills index, RFC 8288 `Link` headers, markdown versions
of every page (`Accept: text/markdown`), and WebMCP tools. All of it is derived
from the pages themselves:

```bash
python3 scripts/gen-agent-discovery.py           # rewrite the generated files
python3 scripts/gen-agent-discovery.py --check   # report drift, write nothing
```

CI regenerates on every deploy, so publishing a page or a post cannot ship a
stale sitemap or post index. Adding a *page* means adding it to `PAGES` in that
script and to the `Stage site` step in the deploy workflow; adding a *post*
needs nothing — it's read out of `blog.html`.

After a deploy, `scripts/check-agent-discovery.sh [base-url]` smoke-tests the
whole surface (status codes, content types, negotiation, and that the security
headers survive the Pages Function). CI runs it against the fresh deployment.

One piece lives in DNS rather than in the deployment: the DNS-AID entrypoint
record. `scripts/apply-dns-aid.sh` plans it, applies it with a Cloudflare token,
and verifies it — CI can't, because it's a zone record, not a file. The zone
also still needs DNSSEC enabling, which matters more than the record itself.
Both are covered in [`docs/agent-readiness.md`](docs/agent-readiness.md).

**Read [`docs/agent-readiness.md`](docs/agent-readiness.md) before changing any
of it** — in particular, `_headers` is not applied to responses that a Pages
Function produces, so `functions/site-headers.js` is generated from it and must
be regenerated whenever `_headers` changes.

## Local preview

```bash
python3 serve.py           # http://127.0.0.1:4321
# or any static server:
# npx serve .
```

`serve.py` is a plain static server: no extensionless `/blog`, no `_headers`,
and no `Accept: text/markdown` negotiation. To exercise the Pages Function and
the headers the way production does:

```bash
npx wrangler pages dev .   # http://127.0.0.1:8788
curl -sI -H 'Accept: text/markdown' http://127.0.0.1:8788/
```

## Self-contained build (for review / Claude Desktop)

```bash
python3 scripts/build.py   # writes dist/index.html with CSS + images inlined
```

## Deploy — Cloudflare Pages

Deploys run from GitHub Actions via Wrangler (Direct Upload). Every push to
`main` stages the site files into `_site/` and publishes them to the Pages
project **`aetherweb`**. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### One-time setup

1. **Create a Cloudflare API token** — Cloudflare dashboard → *My Profile → API
   Tokens → Create Token → Custom token*. Permission: **Account → Cloudflare
   Pages → Edit**. Scope it to the AetherSDR account.
2. **Grab the Account ID** — *Workers & Pages* overview (right sidebar).
3. **Add two repo secrets** — GitHub → *Settings → Secrets and variables →
   Actions*:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. **Push to `main`** (or run the workflow manually). The first run creates the
   `aetherweb` Pages project and publishes it to `https://aetherweb.pages.dev`.

### Domain (`www.aethersdr.com`)

The zone is already on Cloudflare, so DNS and TLS are automatic:

1. Pages project → **Custom domains → Set up a custom domain →
   `www.aethersdr.com`**. Cloudflare auto-creates the proxied CNAME and
   provisions the TLS cert.
2. **Redirect the apex** — *Rules → Redirect Rules*: when hostname equals
   `aethersdr.com`, 301 to `https://www.aethersdr.com` (preserving path/query).
   This replaces the current apex → GitHub redirect. (If you still want a GitHub
   shortcut, point `code.aethersdr.com` at it instead.)

### Local manual deploy (optional)

```bash
npx wrangler pages deploy . --project-name=aetherweb --branch=main
```

---

*AetherSDR is an independent project and is not affiliated with or endorsed by
FlexRadio Systems. Content licensed alongside the AetherSDR project (GPL v3).*

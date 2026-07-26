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
styles.css            All styling (design tokens at the top)
assets/img/           Optimized screenshots, logo, and 3D-spectrum visuals
assets/js/blog.js     Blog card-index <-> post routing
serve.py              Tiny local static server (python3 serve.py → :4321)
scripts/build.py      Bundles everything into dist/index.html (self-contained)
scripts/gen-blog-art.py  Regenerates the generated SVG post art
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
   neighbouring card heights.
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

Cloudflare Pages serves the page extensionless at **`/blog`** and 308-redirects
`/blog.html` to it, so `canonical` and the `og:`/`twitter:` URLs point at `/blog`.
Internal links keep the `blog.html` form on purpose — it resolves under
`serve.py` locally and just costs one redirect hop in production.

## Local preview

```bash
python3 serve.py           # http://127.0.0.1:4321
# or any static server:
# npx serve .
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

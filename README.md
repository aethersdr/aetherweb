# aetherweb

Marketing / project website for **AetherSDR** — the cross-platform, open-source
client for FlexRadio Systems transceivers. Lives at
[www.aethersdr.com](https://www.aethersdr.com) (Cloudflare-hosted).

Design inspired by [armbian.com](https://www.armbian.com): dark, technical, and
feature-forward, using AetherSDR's own palette (deep navy + electric cyan→teal).

## Structure

```
index.html            The landing page (single page, no build step required)
styles.css            All styling (design tokens at the top)
assets/img/           Optimized screenshots, logo, and 3D-spectrum visuals
serve.py              Tiny local static server (python3 serve.py → :4321)
scripts/build.py      Bundles everything into dist/index.html (self-contained)
```

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

## Deploy

Cloudflare Pages pipeline — **to be added after design review.** The site is a
plain static directory, so it deploys with zero build config (or `dist/` for the
single-file variant).

---

*AetherSDR is an independent project and is not affiliated with or endorsed by
FlexRadio Systems. Content licensed alongside the AetherSDR project (GPL v3).*

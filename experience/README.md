# AetherSDR — The Station, Explored

An interactive 3D tour of AetherSDR for contesters, DXers and digital-mode
operators. Eight operators on a ring around a live band; 22 scenarios, each
shown **without** and **with** AetherSDR; 52 features (16 Aether components)
in an atlas. Navigate by operator, use case or feature. Every claim is cited;
modeled data is labelled.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # data check, then dist/index.html — one self-contained file
npm run build:site  # data check, then dist-site/ — the aethersdr.com/experience/ build
npm run check    # data integrity only: every [[citation]] and reference resolves
```

**Deliverable:** `dist/index.html` (~1.9 MB, ~0.9 MB gzipped). Everything —
three.js, styles, the four real screenshots — is inlined; it runs from
`file://` or any static host.

## Layout

```
src/main.js            router, views, with/without switch, keyboard
src/world/             three.js: engine (camera rig, bloom, picking), hub
                       (live band + screenshot wall), stations (operators),
                       workbench (the with/without fold), atlas, sky
src/data/              personas, usecases, features, scenarios, sources,
                       assumptions — all copy lives here
src/ui/tour.js         guided tour
scripts/check.mjs      data integrity check (run by `npm run build`)
DESIGN.md              the quality bar, ranked ideas, and the scorecard
research/              the three cited research briefs behind every claim
scripts/probe/         headless-Firefox render probes used to verify the build
```

Copy cites sources inline as `[[source-id]]`; ids live in
`src/data/sources.js`. Mark unsourced workflow steps "(common practice)".

`?debug` on the URL exposes the world as `window.__world` (used by the
headless render probes during development).

## Deploying to aethersdr.com

Live at <https://www.aethersdr.com/experience/> (`/tour` redirects there).
The deploy workflow runs `npm ci && npm run build:site` here and copies
`dist-site/` to `_site/experience/` — nothing under `experience/` other than
that build output is published.

The site build is ordinary files rather than the single file: the site's CSP
is `script-src 'self'`, which blocks the inline script the single file relies
on. Vite hashes the asset names, and `_headers` caches `/experience/assets/*`
for a year. To take the page down, remove the *Build the experience* step and
the `cp … experience/dist-site` line from `.github/workflows/deploy.yml` (and
the nav links and `/tour` redirect, if wanted).

Not affiliated with or endorsed by FlexRadio Systems, Icom Inc., Apache Labs
or the Hermes-Lite 2 project.

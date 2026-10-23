# AetherSDR Experience — design brief

An interactive 3D tour of AetherSDR for contesters, DXers, and digital-mode
operators. One self-contained HTML file built with Vite + three.js (npm).

## What "world class" means here — the bar

Every iteration is scored against these. Ship only when all ten pass.

| # | Criterion | Pass means |
|---|-----------|------------|
| 1 | **Truthful** | Every product claim traces to a cited source; every number that isn't measured is labelled *Modeled*; assumptions are listed in-app. No invented features. |
| 2 | **The real app** | Real AetherSDR screenshots are the hero objects in the 3D world, not mock UI. |
| 3 | **The operators** | Each persona is a visible operator at a station that matches how they actually operate (contest SO2R desk, DXer under a beam, FT8 shack, POTA picnic table, remote laptop…). |
| 4 | **Three ways in** | Persona, use case, and feature are first-class navigation axes over one shared scenario graph; every view links to the others; every view is deep-linkable. |
| 5 | **Benefit you can feel** | Each scenario shows *without* vs *with* AetherSDR as a physical change in the 3D scene (a tangle of separate programs and virtual cables collapsing into one workstation), plus side-by-side steps — not just two paragraphs. |
| 6 | **Every Aether feature** | All shipped Aether-branded components (and the major unbranded ones) have a node in the feature atlas with what/why/who/source, and appear in at least one scenario. Roadmap items are labelled as roadmap. |
| 7 | **Speaks ham** | Copy uses the operators' language (run/S&P, split, pileup, SO2R, FT8 sub-band, DAX, CAT) correctly; band activity in the 3D spectrum looks like the mode being discussed. |
| 8 | **Smooth** | 60 fps on a mid laptop at 1440p; < 3 s to first interactive frame from file://; DPR capped; renders only while visible. |
| 9 | **Accessible & robust** | All content is DOM text (selectable, screen-reader readable); full keyboard navigation; reduced-motion = cuts not flights; no-WebGL still shows every word. |
| 10 | **Crafted** | Consistent AetherSDR palette and type; no layout breaks from 1280×720 to 2560×1440 and down to phone width; one coherent visual language (glowing traces + holographic screens). |

## Ideas, ranked (impact × feasibility)

1. **With / Without workbench** — per scenario, floating windows of the separate
   programs an operator runs today, joined by virtual audio / serial / telnet
   "cables" with traffic pulses; flip the switch and they fly into the real
   AetherSDR screen while the cables retract. *The core of the brief.* ✔ build
2. **Three-axis navigator + scenario graph** — Persona / Use case / Feature
   tabs; scenarios cross-link all three; hash routes. ✔ build
3. **Operator stations ring** — six procedurally modelled stations around a
   central hub, each with an operator figure, radio, monitor showing the real
   app, and the antenna that persona uses. ✔ build
4. **Live band at the hub** — the stacked-trace panadapter, re-tuned per
   scenario (CW contest, FT8 sub-band, split pileup, RTTY, quiet POTA band). ✔ build
5. **Feature atlas** — Aether components as glowing nodes on category orbits;
   select → detail with source and the scenarios that use it. ✔ build
6. **Sources & assumptions drawer** — numbered citations used inline,
   modelled-data legend, assumptions list. ✔ build (required by #1)
7. **Guided tour** — autoplay through a curated path with captions. ✔ build if time
8. **Radio ecosystem lineup** — Flex native vs other radios via Aether-gate,
   honest about what is and isn't supported. ✔ as atlas content + hub ring
9. Audio (CW sidetone sonification) — ✘ cut: autoplay audio is hostile, low value.
10. Real-time multiplayer / live cluster feed — ✘ cut: single-file + offline requirement.

## Scorecard (2026-10-23, final iteration)

Evidence comes from headless Firefox render probes at 390×844, 1280×720,
1440×900 and 2560×1440 (WebGL frames captured from the canvas), and from
`npm run check`.

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Truthful | **Pass** | 139 sources; `npm run check` resolves every `[[cite]]`; uncited prices removed; support tiers quoted at README level; *Modeled* badge on every count; assumptions in-app. |
| 2 | The real app | **Pass** | Four real screenshots are the workbench "with" screen, the hub wall and the station monitors. |
| 3 | The operators | **Pass** | 8 stations (SO2R desk + stacked yagis, DX shack + beam, FT8 shack + hex, rag chewer’s podcast-style studio with a boom-mounted SM7B and desk speakers, picnic table + end-fed, café laptop, accessible shack, experimenter bench), each with a seated operator. |
| 4 | Three ways in | **Pass** | Operators / Use cases / Features tabs; every view cross-links; hash routes for every view, including `/with`. |
| 5 | Benefit you can feel | **Pass** | Windows + typed cables fold into the screenshot; metrics show "2 from 6"; side-by-side steps; flip with the switch or W. |
| 6 | Every Aether feature | **Pass** | All 16 Aether components are in the atlas and in at least one scenario (check output: none unused); roadmap item labelled. |
| 7 | Speaks ham | **Pass** | Run/S&P, SO2R, split "up 5", Assisted, FT8 cycles and DT; band re-tuned per scenario (CW contest, FT8 sub-band, split pileup, RTTY, 75 m round tables, quiet). |
| 8 | Smooth | **Partly measured** | Draw calls cut from 610 to 193 per frame at home (87 at a station); DPR ≤ 1.5; bloom at half resolution; paused when hidden; 0.9 MB gzipped. **fps not measured** (headless uses software GL) — check on a real laptop. |
| 9 | Accessible & robust | **Pass** | All text is DOM; keyboard (← → W Esc T); focus moves on navigation; `aria-current`/`aria-pressed`; reduced motion = cuts (probed); WebGL disabled shows all text + a note (probed); file:// works (probed); 31 probe runs with zero console errors. |
| 10 | Crafted | **Pass** | Probed at 390×844 (strip + sheet), 1280×720, 1440×900, 2560×1440; camera centres the scene between the panels. |

## Research

The cited research briefs are in `research/`: ham operating use cases,
the radio ecosystem (FlexRadio, Icom, Apache Labs, Hermes-Lite 2), and the
AetherSDR feature inventory.

## Assumptions

See `src/data/assumptions.js` (rendered in-app under *Sources*).

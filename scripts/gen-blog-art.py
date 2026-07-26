#!/usr/bin/env python3
"""Generate the hero + card art for the first-contribution post.

The contribution pipeline drawn as a signal chain, in the site's palette:
issue -> claim -> fix -> evidence -> merged, over a spectrum trace and
waterfall. Deterministic (fixed seed) so re-running produces byte-identical
output.
"""
import math
import random

BG, BG1, BG2 = "#060b13", "#0a121e", "#0e1a2a"
CYAN, CYAN_DEEP, TEAL, AQUA = "#5de3ff", "#3aa7ff", "#7bf2dc", "#8ef7e6"
INK, MUTED, DIM = "#eaf2fb", "#8598b4", "#5f708a"
MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace"


def defs(w, h, chain_x1=0, chain_x2=0):
    # The chain gradient must use userSpaceOnUse: a horizontal line has a
    # zero-height bounding box, and objectBoundingBox units collapse to nothing.
    return f"""  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="{BG1}"/>
      <stop offset="0.55" stop-color="{BG}"/>
      <stop offset="1" stop-color="#070d17"/>
    </linearGradient>
    <linearGradient id="chain" gradientUnits="userSpaceOnUse"
        x1="{chain_x1}" y1="0" x2="{chain_x2}" y2="0">
      <stop offset="0" stop-color="{CYAN_DEEP}" stop-opacity="0.30"/>
      <stop offset="0.5" stop-color="{CYAN}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="{AQUA}" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{CYAN_DEEP}"/>
      <stop offset="0.45" stop-color="{CYAN}"/>
      <stop offset="1" stop-color="{AQUA}"/>
    </linearGradient>
    <linearGradient id="trace" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{CYAN_DEEP}" stop-opacity="0.35"/>
      <stop offset="0.6" stop-color="{CYAN}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="{AQUA}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="wfmask">
      <rect x="0" y="0" width="{w}" height="{h}" fill="url(#fade)"/>
    </mask>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softglow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>"""


def grid(w, h, step=40):
    v = "".join(f'M{x} 0V{h}' for x in range(step, w, step))
    hz = "".join(f'M0 {y}H{w}' for y in range(step, h, step))
    return (f'  <path d="{v}{hz}" stroke="rgba(120,165,210,0.055)" '
            f'stroke-width="1" fill="none"/>')


def waterfall(rng, x0, y0, w, h, cols, rows):
    """Banded noise evoking a waterfall, brighter where the trace peaks."""
    cw, ch = w / cols, h / rows
    out = [f'  <g mask="url(#wfmask)" transform="translate({x0} {y0})">']
    for r in range(rows):
        for c in range(cols):
            n = rng.random()
            # Vertical streaks: carry some energy down each column.
            energy = 0.5 + 0.5 * math.sin(c * 0.21 + r * 0.05)
            v = n * energy
            if v < 0.42:
                continue
            if v > 0.93:
                fill, op = AQUA, 0.85
            elif v > 0.78:
                fill, op = CYAN, 0.6
            elif v > 0.6:
                fill, op = CYAN_DEEP, 0.45
            else:
                fill, op = "#1f4f86", 0.5
            out.append(
                f'<rect x="{c*cw:.1f}" y="{r*ch:.1f}" width="{cw:.2f}" '
                f'height="{ch:.2f}" fill="{fill}" opacity="{op:.2f}"/>')
    out.append("</g>")
    return "".join(out)


def spectrum(rng, x0, x1, base, amp, peaks):
    """A spectrum trace: noise floor plus a few deliberate signal peaks."""
    pts = []
    step = 4
    for x in range(x0, x1 + 1, step):
        t = (x - x0) / (x1 - x0)
        y = base - amp * 0.12 * (0.5 + 0.5 * math.sin(t * 21))
        y -= rng.random() * amp * 0.14
        for px, pw, ph in peaks:
            d = (t - px) / pw
            y -= amp * ph * math.exp(-d * d * 4)
        pts.append(f"{x},{y:.1f}")
    return pts


NODES = [
    ("issue", '<circle cx="0" cy="0" r="11" fill="none" stroke="currentColor" '
              'stroke-width="2.4"/><circle cx="0" cy="0" r="3.4" fill="currentColor"/>'),
    ("claim", '<path d="M-9-12h18v25l-9-7-9 7z" fill="none" stroke="currentColor" '
              'stroke-width="2.4" stroke-linejoin="round"/>'),
    ("fix",   '<path d="M-4-11-14 0-4 11M4-11 14 0 4 11" fill="none" '
              'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" '
              'stroke-linejoin="round"/>'),
    ("evidence", '<path d="M-14 4-8 4-4-7 2 9 6 1h8" fill="none" stroke="currentColor" '
                 'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
    ("merged", '<path d="M-12 1 -3 10 13-8" fill="none" stroke="currentColor" '
               'stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
]


def node(cx, cy, size, label, glyph, last, label_dy, fs):
    half = size / 2
    r = 22 if size > 80 else 18
    if last:
        box = (f'<rect x="{cx-half}" y="{cy-half}" width="{size}" height="{size}" '
               f'rx="{r}" fill="{BG2}" stroke="url(#accent)" stroke-width="2.5"/>')
        colour, op, fl = AQUA, "1", ' filter="url(#glow)"'
        lab = AQUA
    else:
        box = (f'<rect x="{cx-half}" y="{cy-half}" width="{size}" height="{size}" '
               f'rx="{r}" fill="{BG1}" stroke="rgba(120,190,230,0.30)" stroke-width="1.6"/>')
        colour, op, fl = CYAN, "0.82", ""
        lab = MUTED
    return (
        f'<g>{box}'
        f'<g transform="translate({cx} {cy})" color="{colour}" opacity="{op}"{fl}>{glyph}</g>'
        f'<text x="{cx}" y="{cy+label_dy}" font-family="{MONO}" font-size="{fs}" '
        f'letter-spacing="1.6" text-anchor="middle" fill="{lab}">{label}</text></g>')


def build_hero(path):
    W, H = 1200, 630
    rng = random.Random(20260726)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" '
         f'aria-label="The contribution pipeline drawn as a signal chain: issue, '
         f'claim, fix, evidence, merged, over an AetherSDR spectrum trace">']
    cy, size = 232, 96
    xs = [180, 410, 640, 870, 1100]
    p.append(defs(W, H, xs[0], xs[-1]))
    p.append(f'  <rect width="{W}" height="{H}" fill="url(#bg)"/>')
    p.append(grid(W, H))

    # Waterfall band along the bottom, fading upward.
    p.append(waterfall(rng, 0, 470, W, 160, 240, 34))

    # Spectrum trace above it.
    pts = spectrum(rng, 0, W, 452, 150, [(0.17, .07, .34), (0.38, .05, .52),
                                          (0.63, .06, .42), (0.86, .045, .72)])
    poly = " ".join(pts)
    p.append(f'  <polyline points="{poly}" fill="none" stroke="url(#trace)" '
             f'stroke-width="2.2" stroke-linejoin="round" filter="url(#glow)"/>')
    p.append(f'  <polygon points="0,{H} {poly} {W},{H}" fill="url(#trace)" opacity="0.07"/>')

    # The chain.
    p.append(f'  <line x1="{xs[0]}" y1="{cy}" x2="{xs[-1]}" y2="{cy}" '
             f'stroke="url(#chain)" stroke-width="2.4"/>')
    p.append(f'  <circle cx="{xs[-1]}" cy="{cy}" r="70" fill="{AQUA}" opacity="0.10" '
             f'filter="url(#softglow)"/>')
    for i, (label, glyph) in enumerate(NODES):
        p.append("  " + node(xs[i], cy, size, label, glyph,
                             last=(i == len(NODES) - 1), label_dy=size / 2 + 34, fs=17))

    p.append(f'  <text x="180" y="106" font-family="{MONO}" font-size="16" '
             f'letter-spacing="3.4" fill="{DIM}">AETHERSDR · CONTRIBUTING</text>')
    p.append(f'  <text x="180" y="150" font-family="{MONO}" font-size="15" '
             f'letter-spacing="1.2" fill="{MUTED}">one signal chain, end to end</text>')
    p.append("</svg>")
    open(path, "w", encoding="utf-8").write("\n".join(p) + "\n")
    return W, H


def build_card(path):
    """Near-square for the card column, which crops to roughly 1.1:1."""
    W, H = 640, 560
    rng = random.Random(731)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" '
         f'aria-label="A contribution signal chain resolving to a merged check mark">']
    cy, size = 196, 92
    xs = [110, 320, 530]
    p.append(defs(W, H, xs[0], xs[-1]))
    p.append(f'  <rect width="{W}" height="{H}" fill="url(#bg)"/>')
    p.append(grid(W, H, 34))
    p.append(waterfall(rng, 0, 400, W, 160, 128, 30))

    pts = spectrum(rng, 0, W, 392, 120, [(0.28, .07, .44), (0.72, .06, .74)])
    poly = " ".join(pts)
    p.append(f'  <polyline points="{poly}" fill="none" stroke="url(#trace)" '
             f'stroke-width="2.2" stroke-linejoin="round" filter="url(#glow)"/>')
    p.append(f'  <polygon points="0,{H} {poly} {W},{H}" fill="url(#trace)" opacity="0.07"/>')

    # Three stages only — legible at thumbnail size.
    trio = [NODES[0], NODES[2], NODES[4]]
    p.append(f'  <line x1="{xs[0]}" y1="{cy}" x2="{xs[-1]}" y2="{cy}" '
             f'stroke="url(#chain)" stroke-width="2.6"/>')
    p.append(f'  <circle cx="{xs[-1]}" cy="{cy}" r="66" fill="{AQUA}" opacity="0.12" '
             f'filter="url(#softglow)"/>')
    for i, (label, glyph) in enumerate(trio):
        p.append("  " + node(xs[i], cy, size, label, glyph,
                             last=(i == 2), label_dy=size / 2 + 32, fs=16))

    p.append(f'  <text x="{W/2}" y="86" font-family="{MONO}" font-size="15" '
             f'letter-spacing="3" text-anchor="middle" fill="{DIM}">FIRST CONTRIBUTION</text>')
    p.append("</svg>")
    open(path, "w", encoding="utf-8").write("\n".join(p) + "\n")
    return W, H


if __name__ == "__main__":
    import os
    root = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")
    print("hero", build_hero(os.path.join(root, "first-contribution-hero.svg")))
    print("card", build_card(os.path.join(root, "first-contribution-card.svg")))

#!/usr/bin/env python3
"""Generate the hero + card art for the first-contribution post.

The contribution pipeline drawn as a signal chain, in the site's palette:
issue -> claim -> fix -> evidence -> merged, over a spectrum trace and
waterfall. Deterministic (fixed seed) so re-running produces byte-identical
output.
"""
import math
import random
import zlib

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

# --------------------------------------------------------------------- the play
# Art for the multi-agent post, drawn the way a coach draws one: a formation, a
# line of scrimmage with a front on it, and everybody running a route at once.
# Everybody has an assignment and only the ball arrives: the routes fan out and
# end in their own arrowheads, two of them stopped at the line with a crossbar
# instead, and the dashed flight clears the defence into main. The stopped ones
# are the argument the post makes, so they are drawn as carefully as the rest.
#
# Routes are sampled to polylines and jittered rather than emitted as clean
# beziers: it should read as chalk, not as CAD.

def _bez(p0, p1, p2, p3, n=30):
    out = []
    for i in range(n + 1):
        t, mt = i / n, 1 - i / n
        out.append((mt**3 * p0[0] + 3 * mt * mt * t * p1[0]
                    + 3 * mt * t * t * p2[0] + t**3 * p3[0],
                    mt**3 * p0[1] + 3 * mt * mt * t * p1[1]
                    + 3 * mt * t * t * p2[1] + t**3 * p3[1]))
    return out


def _leg(pts, a, b, n=14):
    """A straight run, sampled so a broken route jitters like the curved bits."""
    return pts + [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)
                  for i in range(1, n + 1)]


def _chalk(rng, pts, j=1.5):
    return " ".join(f"{x + rng.uniform(-j, j):.1f},{y + rng.uniform(-j, j):.1f}"
                    for x, y in pts)


def _stroke(rng, pts, colour, w, dash="", op=1.0, j=1.5):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'  <polyline points="{_chalk(rng, pts, j)}" fill="none" stroke="{colour}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" '
            f'opacity="{op}"{d}/>')


def _tip(pts, colour, w, size=14, cross=False):
    """Arrowhead, or the crossbar that means this route was stopped."""
    (x0, y0), (x1, y1) = pts[-4], pts[-1]
    ang = math.atan2(y1 - y0, x1 - x0)
    if cross:
        a = ang + math.pi / 2
        dx, dy = size * math.cos(a), size * math.sin(a)
        return (f'  <path d="M{x1 - dx:.1f} {y1 - dy:.1f}L{x1 + dx:.1f} {y1 + dy:.1f}" '
                f'stroke="{colour}" stroke-width="{w}" stroke-linecap="round"/>')
    a1, a2 = ang + math.radians(148), ang - math.radians(148)
    return (f'  <path d="M{x1 + size * math.cos(a1):.1f} {y1 + size * math.sin(a1):.1f}'
            f'L{x1:.1f} {y1:.1f}'
            f'L{x1 + size * math.cos(a2):.1f} {y1 + size * math.sin(a2):.1f}" fill="none" '
            f'stroke="{colour}" stroke-width="{w}" stroke-linecap="round" '
            f'stroke-linejoin="round"/>')


def _o(cx, cy, r, colour, w, op=1.0):
    return (f'  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r}" fill="{BG}" fill-opacity="0.7" '
            f'stroke="{colour}" stroke-width="{w}" opacity="{op}"/>')


def _xx(rng, cx, cy, s, colour, w, op=1.0):
    j = lambda: rng.uniform(-1.4, 1.4)
    return (f'  <path d="M{cx-s+j():.1f} {cy-s+j():.1f}L{cx+s+j():.1f} {cy+s+j():.1f}'
            f'M{cx+s+j():.1f} {cy-s+j():.1f}L{cx-s+j():.1f} {cy+s+j():.1f}" fill="none" '
            f'stroke="{colour}" stroke-width="{w}" stroke-linecap="round" opacity="{op}"/>')


def _block(rng, cx, cy, r, dy, colour, w):
    """The short hook-and-bar every coach draws for a blocking assignment."""
    pts = _bez((cx, cy - r), (cx, cy - r - dy * 0.55),
               (cx + dy * 0.5, cy - r - dy), (cx + dy * 0.95, cy - r - dy))
    return [_stroke(rng, pts, colour, w, op=0.75, j=1.0),
            _tip(pts, colour, w, size=r * 0.8, cross=True)]


def _play(p, rng, los_y, los_x0, los_x1, line, backs, wides, front, mid, deep,
          routes, blocks, ball, r, w, label_fs, hash_y):
    # Field: one yard line above the front, ticked like a real one.
    for hy in hash_y:
        p.append(f'  <path d="M{los_x0} {hy}H{los_x1 + 40}" stroke="rgba(120,165,210,0.10)" '
                 f'stroke-width="1.4" stroke-dasharray="2 12" fill="none"/>')

    # Line of scrimmage.
    p.append(_stroke(rng, [(los_x0, los_y), (los_x1, los_y)], CYAN_DEEP, w, op=0.5, j=1.1))
    # Anchored at the start of the line, not before it — anchoring "end" ran the
    # label off the left edge at card size.
    p.append(f'  <text x="{los_x0 + 2}" y="{los_y - 14}" font-family="{MONO}" '
             f'font-size="{label_fs}" letter-spacing="3" text-anchor="start" '
             f'fill="{MUTED}">GATE</text>')

    # The front, then the second and third levels behind it.
    for cx, cy, op in ([(x, y, 0.9) for x, y in front]
                       + [(x, y, 0.7) for x, y in mid]
                       + [(x, y, 0.5) for x, y in deep]):
        p.append(_xx(rng, cx, cy, r * 0.98, MUTED, w, op))

    # Routes. Each is a list of legs; the last point is where the tip goes.
    for pts, through in routes:
        colour = "url(#chain)" if through else DIM
        p.append(_stroke(rng, pts, colour, w, op=1.0 if through else 0.8))
        p.append(_tip(pts, CYAN if through else MUTED, w + (0 if through else 0.6),
                      size=r * (1.0 if through else 1.25), cross=not through))

    # Blocking assignments off the interior line.
    for cx, cy, dy in blocks:
        p.extend(_block(rng, cx, cy, r, dy, DIM, w))

    # The ball: dashed the way every playbook draws it, and the only thing on
    # the board that actually arrives. Everything else just ran a route.
    p.append(_stroke(rng, ball, AQUA, w + 0.4, dash="11 9", op=0.95, j=1.0))
    p.append(_tip(ball, AQUA, w + 0.4, size=r * 1.15))

    # Personnel last, so the circles sit on top of their own routes.
    for cx, cy in line:
        p.append(_o(cx, cy, r, CYAN_DEEP, w, 0.85))
    for cx, cy in backs + wides:
        p.append(_o(cx, cy, r, CYAN, w))


def build_play_hero(path):
    W, H = 1200, 630
    rng = random.Random(20260806)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" '
         f'aria-label="A play drawn on a chalkboard: a full formation runs routes at one '
         f'line of scrimmage, two of them stopped there, while the dashed flight of the '
         f'ball clears the defence and arrives at a single point marked main">']
    LOS, r, w = 430, 14, 2.8
    out_cx, out_cy, size = 1046, 206, 92

    line = [(300 + i * 58, LOS + 20) for i in range(7)]
    backs = [(474, LOS + 66), (388, LOS + 92), (560, LOS + 92)]
    wides = [(168, LOS + 20), (752, LOS + 20)]
    front = [(330 + i * 64, LOS - 34) for i in range(6)]
    mid = [(392, LOS - 92), (534, LOS - 96), (676, LOS - 90)]
    deep = [(300, LOS - 168), (712, LOS - 176)]

    def route(legs, curve=None):
        pts = [legs[0]]
        for a, b in zip(legs, legs[1:]):
            pts = _leg(pts, a, b)
        if curve:
            pts += _bez(pts[-1], *curve)[1:]
        return pts

    routes = [
        # Left wide: releases upfield, breaks hard in on a post.
        (route([(168, LOS + 4), (168, LOS - 120)],
               curve=((168, LOS - 200), (330, LOS - 250), (452, LOS - 254))), True),
        # Right wide: deep, then breaks out to the boundary — kept under the
        # throw's arc so the two arrowheads don't collide near main.
        (route([(752, LOS + 4), (752, LOS - 150), (930, LOS - 164)]), True),
        # Back out of the backfield on a wheel up the boundary.
        (route([(560, LOS + 76), (648, LOS + 40)],
               curve=((760, LOS + 14), (830, LOS - 44), (836, LOS - 114))), True),
        # Slot dig: gets depth, then squares it off across the middle.
        (route([(646, LOS + 12), (646, LOS - 66), (782, LOS - 80)]), True),
        # Drag underneath, all the way across the formation.
        (route([(242, LOS + 10), (242, LOS - 40)],
               curve=((380, LOS - 66), (560, LOS - 62), (688, LOS - 54))), True),
        # Corner route out of the slot.
        (route([(358, LOS + 8), (358, LOS - 96)],
               curve=((358, LOS - 150), (240, LOS - 168), (176, LOS - 186))), True),
        # Checkdown the front eats before it starts.
        (route([(388, LOS + 78), (432, LOS + 22), (432, LOS - 16)]), False),
        # Curl that never gets off the line.
        (route([(300, LOS + 8), (300, LOS - 30)]), False),
    ]
    blocks = [(474, LOS + 20, 30), (532, LOS + 20, 30), (416, LOS + 20, 26)]
    # The throw: over the front, over the deep help, into main.
    ball = _bez((492, LOS + 52), (640, LOS - 210), (860, LOS - 290),
                (out_cx - 58, out_cy))

    p.append(defs(W, H, 168, out_cx))
    p.append(f'  <rect width="{W}" height="{H}" fill="url(#bg)"/>')
    p.append(grid(W, H))
    p.append(waterfall(rng, 0, 566, W, 64, 240, 14))
    pts = spectrum(rng, 0, W, 580, 46, [(0.24, .06, .3), (0.74, .05, .4)])
    poly = " ".join(pts)
    p.append(f'  <polyline points="{poly}" fill="none" stroke="url(#trace)" '
             f'stroke-width="2" stroke-linejoin="round" filter="url(#glow)"/>')
    p.append(f'  <polygon points="0,{H} {poly} {W},{H}" fill="url(#trace)" opacity="0.06"/>')

    p.append(f'  <circle cx="{out_cx}" cy="{out_cy}" r="70" fill="{AQUA}" opacity="0.10" '
             f'filter="url(#softglow)"/>')
    _play(p, rng, LOS, 132, 900, line, backs, wides, front, mid, deep, routes,
          blocks, ball, r, w, 15, hash_y=[LOS - 130, LOS - 214])
    p.append("  " + node(out_cx, out_cy, size, "main", NODES[4][1],
                         last=True, label_dy=size / 2 + 34, fs=17))

    p.append(f'  <text x="118" y="96" font-family="{MONO}" font-size="16" '
             f'letter-spacing="3.4" fill="{DIM}">AETHERSDR · MULTI-AGENT CONTRIBUTION</text>')
    p.append(f'  <text x="118" y="126" font-family="{MONO}" font-size="15" '
             f'letter-spacing="1.2" fill="{MUTED}">everybody runs a route, one ball gets through</text>')
    p.append("</svg>")
    open(path, "w", encoding="utf-8").write("\n".join(p) + "\n")
    return W, H


def build_play_card(path):
    """Near-square for the card column, which crops to roughly 1.1:1."""
    W, H = 640, 560
    rng = random.Random(806)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" '
         f'aria-label="A play drawn on a chalkboard: a formation runs routes at one line '
         f'of scrimmage while the dashed flight of the ball arrives at a point marked '
         f'main">']
    # Heavier and sparser than the hero: this crop renders about 240px wide in
    # the card column, where the hero's full roster turns into scribble.
    LOS, r, w = 386, 15, 3.4
    out_cx, out_cy, size = 516, 190, 86

    line = [(150 + i * 58, LOS + 20) for i in range(4)]
    backs = [(208, LOS + 68)]
    wides = [(72, LOS + 20), (384, LOS + 20)]
    front = [(178 + i * 74, LOS - 38) for i in range(3)]
    mid = [(214, LOS - 100), (330, LOS - 96)]
    deep = []

    def route(legs, curve=None):
        pts = [legs[0]]
        for a, b in zip(legs, legs[1:]):
            pts = _leg(pts, a, b)
        if curve:
            pts += _bez(pts[-1], *curve)[1:]
        return pts

    routes = [
        # Post from the left, breaking back to the middle of the field.
        (route([(72, LOS + 2), (72, LOS - 128)],
               curve=((72, LOS - 186), (150, LOS - 208), (218, LOS - 214))), True),
        # Corner up the right boundary, breaking off short of the throw.
        (route([(384, LOS + 2), (384, LOS - 140)],
               curve=((384, LOS - 190), (372, LOS - 206), (346, LOS - 216))), True),
        # Wheel out of the backfield, kept under the ball's arc.
        (route([(208, LOS + 50), (300, LOS + 22)],
               curve=((388, LOS - 2), (432, LOS - 52), (436, LOS - 104))), True),
        # Dig across the middle.
        (route([(150, LOS + 4), (150, LOS - 68), (296, LOS - 82)]), True),
        # And one the front simply eats.
        (route([(266, LOS + 4), (266, LOS - 30)]), False),
    ]
    blocks = [(208, LOS + 20, 30)]
    ball = _bez((228, LOS + 40), (330, LOS - 160), (430, LOS - 208),
                (out_cx - 54, out_cy))

    p.append(defs(W, H, 72, out_cx))
    p.append(f'  <rect width="{W}" height="{H}" fill="url(#bg)"/>')
    p.append(grid(W, H, 34))
    p.append(waterfall(rng, 0, 498, W, 62, 128, 14))
    pts = spectrum(rng, 0, W, 510, 40, [(0.36, .07, .32)])
    poly = " ".join(pts)
    p.append(f'  <polyline points="{poly}" fill="none" stroke="url(#trace)" '
             f'stroke-width="2" stroke-linejoin="round" filter="url(#glow)"/>')
    p.append(f'  <polygon points="0,{H} {poly} {W},{H}" fill="url(#trace)" opacity="0.06"/>')

    p.append(f'  <circle cx="{out_cx}" cy="{out_cy}" r="62" fill="{AQUA}" opacity="0.12" '
             f'filter="url(#softglow)"/>')
    _play(p, rng, LOS, 44, 460, line, backs, wides, front, mid, deep, routes,
          blocks, ball, r, w, 15, hash_y=[LOS - 116, LOS - 190])
    p.append("  " + node(out_cx, out_cy, size, "main", NODES[4][1],
                         last=True, label_dy=size / 2 + 30, fs=16))

    p.append(f'  <text x="{W/2}" y="70" font-family="{MONO}" font-size="15" '
             f'letter-spacing="3" text-anchor="middle" fill="{DIM}">ONE MAIN BRANCH</text>')
    p.append("</svg>")
    open(path, "w", encoding="utf-8").write("\n".join(p) + "\n")
    return W, H


# ---------------------------------------------------------------- release art
# One template per release post: version number, kicker, and a motif glyph over
# the same spectrum backdrop, so the posts read as a series without the cards
# becoming interchangeable. Glyphs are drawn around 0,0 in a ~200px box.

GLYPHS = {
    # Concentric rings closing on a point — a version that finally means something.
    "milestone": '<circle r="76" fill="none" stroke="currentColor" stroke-width="2" opacity=".28"/>'
                 '<circle r="54" fill="none" stroke="currentColor" stroke-width="2.4" opacity=".5"/>'
                 '<circle r="32" fill="none" stroke="currentColor" stroke-width="3"/>'
                 '<circle r="11" fill="currentColor"/>',
    # A framed bit stream.
    "packet": '<path d="M-92-46h184v92h-184z" fill="none" stroke="currentColor" stroke-width="2" '
              'opacity=".35" rx="8"/>'
              '<path d="M-74 16v-32h20v32h20v-32h20v32h20v-32h20v32h20v-32h14" fill="none" '
              'stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>',
    # Symmetric audio envelope, peaks tamed toward the middle.
    "audio": "".join(
        f'<rect x="{-88 + i*16}" y="{-h}" width="8" height="{2*h}" rx="4" fill="currentColor" '
        f'opacity="{0.45 + 0.05*(i % 4)}"/>'
        for i, h in enumerate([18, 34, 52, 68, 46, 74, 58, 36, 62, 44, 26, 16])),
    # A control knob with an indicator.
    "hid": '<circle r="58" fill="none" stroke="currentColor" stroke-width="3"/>'
           '<path d="M0-58V-30" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
           + "".join(
               f'<path d="M0-80V-70" stroke="currentColor" stroke-width="3" stroke-linecap="round" '
               f'opacity=".45" transform="rotate({a})"/>' for a in range(-140, 141, 40)),
    # Frames queueing through one transmitter.
    "tnc": "".join(
        f'<rect x="{-90 + i*30}" y="{-34 + i*8}" width="86" height="52" rx="9" fill="none" '
        f'stroke="currentColor" stroke-width="2.6" opacity="{0.35 + 0.3*i}"/>' for i in range(3)),
    # Orbit, spacecraft, ground station.
    "satellite": '<ellipse rx="88" ry="40" fill="none" stroke="currentColor" stroke-width="2.4" '
                 'opacity=".45" transform="rotate(-22)"/>'
                 '<circle cx="62" cy="-38" r="10" fill="currentColor"/>'
                 '<path d="M-18 44h44l-22-32z" fill="none" stroke="currentColor" stroke-width="3" '
                 'stroke-linejoin="round"/>'
                 '<path d="M40-58a34 34 0 0 1 22 26M30-42a20 20 0 0 1 14 16" fill="none" '
                 'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>',
    # A globe with a marker on it.
    "globe": '<circle r="66" fill="none" stroke="currentColor" stroke-width="2.8"/>'
             '<ellipse rx="26" ry="66" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/>'
             '<path d="M-66 0h132M-58-32h116M-58 32h116" stroke="currentColor" stroke-width="2" '
             'opacity=".45" fill="none"/>'
             '<path d="M34-46a15 15 0 1 1 30 0c0 12-15 26-15 26s-15-14-15-26z" fill="currentColor"/>',
    # Two traces converging into alignment.
    "sync": '<path d="M-92-30q23-34 46 0t46 0" fill="none" stroke="currentColor" stroke-width="3.4" '
            'stroke-linecap="round" opacity=".4"/>'
            '<path d="M-92 30q23-34 46 0t46 0" fill="none" stroke="currentColor" stroke-width="3.4" '
            'stroke-linecap="round" opacity=".4"/>'
            '<path d="M0 0q23-34 46 0t46 0" fill="none" stroke="currentColor" stroke-width="4.5" '
            'stroke-linecap="round"/>'
            '<path d="M-92-30 0 0M-92 30 0 0" stroke="currentColor" stroke-width="1.6" '
            'stroke-dasharray="4 6" opacity=".45"/>',
    # Receding ridges — the 3D spectrum, in miniature.
    "spectrum3d": "".join(
        f'<path d="M{-96 + i*9} {28 - i*22} l30 {-14 - i*5} l18 {20 + i*4} l24 {-30 - i*8} '
        f'l22 {26 + i*6} l26 {-12 - i*3}" fill="none" stroke="currentColor" stroke-width="3" '
        f'stroke-linejoin="round" opacity="{0.9 - 0.18*i}"/>' for i in range(4)),
    # Radiating transmission around a digital waveform.
    "dstar": '<circle r="34" fill="none" stroke="currentColor" stroke-width="3"/>'
             '<path d="M-18 0h8v-12h8v22h8v-14h8v4h6" fill="none" stroke="currentColor" '
             'stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'
             + "".join(
                 f'<path d="M{r} -{int(r*0.62)}a{r} {r} 0 0 1 0 {int(r*1.24)}" fill="none" '
                 f'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity="{o}"/>'
                 f'<path d="M-{r} -{int(r*0.62)}a{r} {r} 0 0 0 0 {int(r*1.24)}" fill="none" '
                 f'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" opacity="{o}"/>'
                 for r, o in ((52, ".62"), (74, ".34"))),
    # Speech in, transcript out; the faded last line is the low-confidence tail.
    "copyassist": "".join(
        f'<rect x="{-96 + i*15}" y="{-h}" width="7" height="{2*h}" rx="3.5" fill="currentColor" '
        f'opacity="{0.5 + 0.08*(i % 3)}"/>' for i, h in enumerate([16, 32, 50, 30, 44, 22]))
    + '<path d="M4 0h20m0 0-7-7m7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" '
      'stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>'
    + '<rect x="38" y="-30" width="62" height="7" rx="3.5" fill="currentColor" opacity=".85"/>'
      '<rect x="38" y="-11" width="48" height="7" rx="3.5" fill="currentColor" opacity=".85"/>'
      '<rect x="38" y="8" width="58" height="7" rx="3.5" fill="currentColor" opacity=".4"/>'
      '<rect x="38" y="27" width="30" height="7" rx="3.5" fill="currentColor" opacity=".2"/>',
    # Stacked platters, and the key that no longer lives among them.
    "store": "".join(
        f'<ellipse cy="{cy}" rx="60" ry="16" fill="none" stroke="currentColor" '
        f'stroke-width="2.8" opacity="{op}"/>'
        f'<path d="M-60 {cy}v24a60 16 0 0 0 120 0v-24" fill="none" stroke="currentColor" '
        f'stroke-width="2.8" opacity="{op}"/>'
        for cy, op in ((-62, ".42"), (-10, ".68"), (42, "1")))
    + '<circle cx="92" cy="-56" r="14" fill="none" stroke="currentColor" stroke-width="3"/>'
      '<path d="M92-42v40m0-24h11m-11 12h8" fill="none" stroke="currentColor" '
      'stroke-width="3" stroke-linecap="round"/>',
    # Cross-needle: the reading is where they intersect.
    "meter": '<path d="M-86 34a92 92 0 0 1 172 0" fill="none" stroke="currentColor" '
             'stroke-width="2.4" opacity=".45"/>'
             '<path d="M-78 44 38-30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'
             '<path d="M78 44-38-30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>'
             '<circle cx="-78" cy="44" r="6" fill="currentColor"/>'
             '<circle cx="78" cy="44" r="6" fill="currentColor"/>'
             '<circle cx="0" cy="7" r="7" fill="none" stroke="currentColor" stroke-width="3"/>',
}


def _release_svg(w, h, version, kicker, motif, wf, trace_peaks, layout):
    # crc32, not hash(): Python randomises string hashing per process, so this
    # seed used to change on every run and the "deterministic" claim only held
    # within a single invocation. The art committed before this fix was drawn
    # under the old seeding, which is why build_release leaves existing files
    # alone unless you ask for them back.
    rng = random.Random(zlib.crc32(version.encode("utf-8")))
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
         f'role="img" aria-label="AetherSDR {version} — {kicker}">']
    p.append(defs(w, h))
    p.append(f'  <rect width="{w}" height="{h}" fill="url(#bg)"/>')
    p.append(grid(w, h, 40 if w > 800 else 34))
    p.append(waterfall(rng, 0, h - 160, w, 160, *wf))
    pts = spectrum(rng, 0, w, h - 178, 130, trace_peaks)
    poly = " ".join(pts)
    p.append(f'  <polyline points="{poly}" fill="none" stroke="url(#trace)" stroke-width="2.2" '
             f'stroke-linejoin="round" filter="url(#glow)"/>')
    p.append(f'  <polygon points="0,{h} {poly} {w},{h}" fill="url(#trace)" opacity="0.07"/>')

    tx, ty, vsize, gx, gy, gscale, anchor = layout
    p.append(f'  <text x="{tx}" y="{ty}" font-family="{MONO}" font-size="15" letter-spacing="3.6" '
             f'text-anchor="{anchor}" fill="{DIM}">{kicker.upper()}</text>')
    p.append(f'  <text x="{tx}" y="{ty + vsize + 8}" font-family="{MONO}" font-size="{vsize}" '
             f'font-weight="700" letter-spacing="-1" text-anchor="{anchor}" '
             f'fill="url(#accent)">{version}</text>')
    p.append(f'  <circle cx="{gx}" cy="{gy}" r="{int(96*gscale)}" fill="{AQUA}" opacity="0.09" '
             f'filter="url(#softglow)"/>')
    p.append(f'  <g transform="translate({gx} {gy}) scale({gscale})" color="{CYAN}" '
             f'filter="url(#glow)">{GLYPHS[motif]}</g>')
    p.append("</svg>")
    return "\n".join(p) + "\n"


def build_release(root, slug, version, kicker, motif, force=False):
    import os
    paths = [os.path.join(root, f"{slug}-{crop}.svg") for crop in ("hero", "card")]
    if not force and all(os.path.exists(p) for p in paths):
        return False

    hero = _release_svg(1200, 630, version, kicker, motif,
                        wf=(150, 20), trace_peaks=[(0.24, .06, .40), (0.71, .05, .62)],
                        layout=(96, 214, 86, 916, 286, 1.05, "start"))
    card = _release_svg(640, 560, version, kicker, motif,
                        wf=(96, 16), trace_peaks=[(0.34, .07, .52)],
                        layout=(320, 108, 58, 320, 296, 0.92, "middle"))
    open(paths[0], "w", encoding="utf-8").write(hero)
    open(paths[1], "w", encoding="utf-8").write(card)
    return True


RELEASES = [
    ("release-26-8-1", "v26.8.1", "Settings that survive", "store"),
    ("release-26-7-4", "v26.7.4", "Speech to text", "copyassist"),
    ("release-26-7-3", "v26.7.3", "Meters you can trust", "meter"),
    ("release-26-7-2", "v26.7.2", "Digital voice", "dstar"),
    ("release-26-7-1", "v26.7.1", "The band, over time", "spectrum3d"),
    ("release-26-6-5", "v26.6.5", "Diversity across geography", "sync"),
    ("release-26-6-4", "v26.6.4", "Receivers worldwide", "globe"),
    ("release-26-6-3", "v26.6.3", "Satellite data", "satellite"),
    ("release-26-6-2", "v26.6.2", "A complete packet station", "tnc"),
    ("release-26-6-1", "v26.6.1", "Hands on the radio", "hid"),
    ("release-26-5-3", "v26.5.3", "Aetherial TX complete", "audio"),
    ("release-26-5-2-1", "v26.5.2.1", "AetherModem, Phase 0", "packet"),
    ("release-26-5-1", "v26.5.1", "The 1.0 release", "milestone"),
]


if __name__ == "__main__":
    import os
    import sys
    root = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")
    print("hero", build_hero(os.path.join(root, "first-contribution-hero.svg")))
    print("card", build_card(os.path.join(root, "first-contribution-card.svg")))
    print("hero", build_play_hero(os.path.join(root, "one-main-branch-hero.svg")))
    print("card", build_play_card(os.path.join(root, "one-main-branch-card.svg")))
    # Existing art predates the seeding fix above, so regenerating it would
    # redraw every post's noise for no reason. Only missing crops are drawn;
    # pass --force to redraw everything against the current seeding.
    force = "--force" in sys.argv[1:]
    drawn = [s for s, v, k, m in RELEASES if build_release(root, s, v, k, m, force)]
    if drawn:
        print(f"release art: drew {len(drawn)} x 2 crops -> {', '.join(drawn)}")
    else:
        print(f"release art: all {len(RELEASES)} posts already drawn (--force to redraw)")

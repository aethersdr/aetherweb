#!/usr/bin/env python3
"""Pre-render the lineage legend and event list into lineage.html.

LANES and EVENTS live at the top of assets/js/lineage.js — that stays the single
editing surface. This script reads them from there (via node, so the JS is
parsed rather than guessed at) and rewrites the two GENERATED blocks in
lineage.html, so the page carries its full content in the source for crawlers
and no-JS readers.

    python3 scripts/gen-lineage.py

Idempotent: running it without editing the data leaves the file byte-identical.
"""
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(ROOT, "assets", "js", "lineage.js")
PAGE = os.path.join(ROOT, "lineage.html")


def load_data():
    """Evaluate lineage.js in node and hand back LANES + EVENTS as JSON."""
    script = (
        "const m = require(%s);"
        "process.stdout.write(JSON.stringify({lanes: m.LANES, events: m.EVENTS}));"
        % json.dumps(JS)
    )
    try:
        out = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=True)
    except FileNotFoundError:
        sys.exit("node is required to read the data out of lineage.js")
    except subprocess.CalledProcessError as e:
        sys.exit(f"could not evaluate lineage.js:\n{e.stderr}")
    d = json.loads(out.stdout)
    return d["lanes"], d["events"]


def esc(s):
    return html.escape(s, quote=True)


def render_legend(lanes):
    rows = []
    for l in lanes:
        rows.append(
            '        <span class="legend-item">\n'
            f'          <span class="legend-swatch" style="background:{esc(l["hex"])}"></span>{esc(l["label"])}\n'
            '        </span>'
        )
    return "\n".join(rows)


def render_events(lanes, events):
    by_id = {l["id"]: l for l in lanes}
    out = []
    for i, e in enumerate(events):
        lane = by_id[e["lane"]]
        people = ""
        for p in e.get("people", []):
            if len(p) == 2:
                people += f'<span class="call"><b>{esc(p[0])}</b> &middot; {esc(p[1])}</span>'
            else:
                people += f'<span class="call">{esc(p[0])}</span>'
        month = f'<span class="mo">{esc(e["month"])}</span>' if e.get("month") else ""
        cls = "ev is-terminal" if e.get("terminal") else "ev"
        out.append(
            f'        <li class="{cls}" data-i="{i}" data-lane="{esc(e["lane"])}"'
            f' data-year="{esc(e["year"])}" data-era="{esc(e["era"])}">\n'
            '          <div class="ev-meta">\n'
            f'            <span class="ev-year">{esc(e["year"])}{month}</span>\n'
            f'            <span class="ev-branch" style="color:{esc(lane["hex"])}">{esc(lane["label"])}</span>\n'
            '          </div>\n'
            f'          <h2 class="ev-title">{esc(e["title"])}</h2>\n'
            f'          <p class="ev-body">{esc(e["body"])}</p>\n'
            + (f'          <div class="ev-people">{people}</div>\n' if people else "")
            + '        </li>'
        )
    return "\n".join(out)


def splice(page, name, body):
    # Matches whether or not the block already has content, and reuses the
    # opening marker's indent for the closing one.
    pat = re.compile(
        r"([ \t]*)<!-- GENERATED:%s -->.*?<!-- /GENERATED:%s -->" % (name, name),
        re.S,
    )
    m = pat.search(page)
    if not m:
        sys.exit(f"marker pair GENERATED:{name} not found in lineage.html")
    indent = m.group(1)
    replacement = (f"{indent}<!-- GENERATED:{name} -->\n"
                   f"{body}\n"
                   f"{indent}<!-- /GENERATED:{name} -->")
    return pat.sub(lambda _m: replacement, page, count=1)


def main():
    lanes, events = load_data()
    page = open(PAGE, encoding="utf-8").read()
    before = page
    page = splice(page, "legend", render_legend(lanes))
    page = splice(page, "events", render_events(lanes, events))
    open(PAGE, "w", encoding="utf-8").write(page)

    dead = [l["id"] for l in lanes if l.get("dead")]
    print(f"lineage.html: {len(lanes)} lanes, {len(events)} events pre-rendered")
    print(f"  dead lanes (decay into the floor): {', '.join(dead) or 'none'}")
    print("  unchanged" if page == before else "  updated")


if __name__ == "__main__":
    main()

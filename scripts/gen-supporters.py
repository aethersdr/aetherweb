#!/usr/bin/env python3
"""Bake the supporter roll from Open Collective into supporters.html.

    python3 scripts/gen-supporters.py [--check]

The page fetches Open Collective live on load, so this is not the primary
source — it is the copy that ships in the HTML. That copy does three jobs the
live fetch cannot:

  * it is what a reader with no JavaScript sees,
  * it is what stays on screen when the API is slow, rate-limited or down
    (their limit is 10 requests per window, and a thank-you page that renders
    "could not load" is worse than one that is a few days stale), and
  * it is what search engines and agents read.

Run it after a new supporter appears, or on a schedule. It only touches the
block between the SUPPORTERS markers in supporters.html.

Amounts are deliberately not written into the page. Each supporter gets a
`data-strength` between 0 and 1 — the log-scaled position between the smallest
and largest contribution — which is everything the display needs and nothing
more. The figures live on the public ledger, where people chose to put them.
"""

import argparse
import html
import json
import math
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "supporters.html"
API = "https://api.opencollective.com/graphql/v2"
SLUG = "aethersdr"

BEGIN = "      <!-- SUPPORTERS:BEGIN -->"
END = "      <!-- SUPPORTERS:END -->"

QUERY = """
query Supporters($slug: String!) {
  collective(slug: $slug) {
    members(role: BACKER, limit: 500) {
      totalCount
      nodes {
        since
        totalDonations { valueInCents currency }
        account { name slug type }
      }
    }
  }
}
"""

# 1–2 letter prefix (or digit+letter, as in 9A1AA), a digit, then 1–4 letters.
CALLSIGN = re.compile(r"\b(?:[A-Z]{1,2}|[0-9][A-Z])[0-9][A-Z]{1,4}\b")

MONTHS = ("January February March April May June July "
          "August September October November December").split()


def fetch():
    body = json.dumps({"query": QUERY, "variables": {"slug": SLUG}}).encode()
    req = urllib.request.Request(
        API, data=body,
        headers={"Content-Type": "application/json",
                 "User-Agent": "aetherweb-supporters/1.0 (+https://www.aethersdr.com)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        doc = json.loads(r.read())
    if doc.get("errors"):
        raise SystemExit("Open Collective returned errors: " +
                         "; ".join(e.get("message", "?") for e in doc["errors"]))
    members = ((doc.get("data") or {}).get("collective") or {}).get("members") or {}
    return members.get("nodes") or []


def is_anonymous(account):
    """Only the *name* says anything about anonymity.

    Do not be tempted by the slug. A `guest-*` slug means the contribution came
    through guest checkout without an Open Collective account, which is true of
    most of this collective — including people who gave their full name and
    callsign. Keying on it credits 15 real supporters as "Anonymous".

    isIncognito is no help either: it comes back False on these accounts.
    """
    name = (account.get("name") or "").strip().lower()
    return name in ("guest", "anonymous", "incognito", "")


def label_for(name):
    """A callsign if there is one in the name — it is both the shortest and the
    most apt thing to put on a spot — otherwise the name itself.

    The remainder comes back as the human name with the callsign taken out, so
    "Mark Skowronski, K9MQ" reads as K9MQ / Mark Skowronski rather than
    repeating the callsign twice. Returns None when nothing is left.
    """
    name = (name or "").strip()
    call = CALLSIGN.search(name)
    if not call:
        return name, None
    rest = (name[:call.start()] + " " + name[call.end():])
    rest = re.sub(r"\s+", " ", rest).strip(" ,-–—/|·").strip()
    return call.group(0), rest or None


def since_text(iso):
    if not iso or len(iso) < 7:
        return ""
    try:
        year, month = int(iso[0:4]), int(iso[5:7])
        return f"{MONTHS[month - 1]} {year}"
    except (ValueError, IndexError):
        return ""


def build(nodes):
    # One account can come back as more than one membership row (W1WRA does),
    # which would otherwise draw the same person as two signals. totalDonations
    # is already the account's total, so take it once and keep the earliest
    # join date. Guest-checkout slugs are unique per contribution, so distinct
    # anonymous givers stay distinct.
    by_slug = {}
    for n in nodes:
        cents = ((n.get("totalDonations") or {}).get("valueInCents")) or 0
        if cents <= 0:
            continue
        account = n.get("account") or {}
        slug = account.get("slug") or f"anon-{len(by_slug)}"
        since = n.get("since") or ""
        prev = by_slug.get(slug)
        if prev:
            prev["cents"] = max(prev["cents"], cents)
            if since and (not prev["since"] or since < prev["since"]):
                prev["since"] = since
            continue
        by_slug[slug] = {"cents": cents, "account": account, "since": since}

    people = []
    for row in by_slug.values():
        account = row["account"]
        anon = is_anonymous(account)
        name = "" if anon else (account.get("name") or "").strip()
        label, full = ("Anonymous", None) if anon else label_for(name)
        if not label:
            continue
        people.append({"cents": row["cents"], "label": label, "name": full,
                       "since": row["since"], "anon": anon})

    # Oldest first — the page says "ordered by when they first chipped in".
    people.sort(key=lambda p: (p["since"], p["label"].lower()))

    lo = min(p["cents"] for p in people)
    hi = max(p["cents"] for p in people)
    span = math.log(hi) - math.log(lo) if hi > lo else 0.0
    for p in people:
        # Log scale, because the range between the smallest and largest gift is
        # wide enough that a linear one would render the smallest invisible —
        # the same reason a receiver shows you S-units instead of microvolts.
        p["strength"] = round((math.log(p["cents"]) - math.log(lo)) / span, 3) if span else 0.6
    return people


def render(people):
    out = [BEGIN, '      <ol class="sup-list" data-sup-list>']
    for p in people:
        attrs = (f'data-strength="{p["strength"]}" '
                 f'data-label="{html.escape(p["label"], quote=True)}" '
                 f'data-since="{html.escape(p["since"][:10], quote=True)}"')
        if p["anon"]:
            attrs += ' data-anon="1"'
        out.append(f'        <li class="sup-item" {attrs}>')
        out.append('          <span class="sup-mark" aria-hidden="true"></span>')
        out.append(f'          <span class="sup-label">{html.escape(p["label"])}</span>')
        if p["name"] and p["name"] != p["label"]:
            out.append(f'          <span class="sup-name">{html.escape(p["name"])}</span>')
        when = since_text(p["since"])
        if when:
            out.append(f'          <span class="sup-since">{html.escape(when)}</span>')
        out.append('        </li>')
    out.append('      </ol>')
    out.append(END)
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true",
                    help="report whether the baked roll is stale; write nothing")
    args = ap.parse_args()

    try:
        nodes = fetch()
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        print(f"Could not reach Open Collective: {e}", file=sys.stderr)
        print("The page keeps its existing baked roll — nothing written.", file=sys.stderr)
        return 2

    people = build(nodes)
    if not people:
        print("No supporters returned; refusing to blank the roll.", file=sys.stderr)
        return 2

    page = PAGE.read_text(encoding="utf-8")
    start, end = page.index(BEGIN), page.index(END) + len(END)
    updated = page[:start] + render(people) + page[end:]

    if updated == page:
        print(f"Up to date — {len(people)} supporters.")
        return 0
    if args.check:
        print(f"Stale — run scripts/gen-supporters.py ({len(people)} supporters upstream).")
        return 1

    PAGE.write_text(updated, encoding="utf-8")
    named = sum(1 for p in people if not p["anon"])
    print(f"Wrote {len(people)} supporters ({named} named, "
          f"{len(people) - named} anonymous) into supporters.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

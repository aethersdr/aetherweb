#!/usr/bin/env python3
"""Bundle index.html + styles.css + assets into a single self-contained
dist/index.html with CSS inlined and images embedded as data URIs.

Useful for review in Claude Desktop / as a portable one-file preview.
The multi-file version in the repo root remains the source of truth.
"""
import base64
import mimetypes
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def data_uri(path):
    full = os.path.join(ROOT, path)
    mime, _ = mimetypes.guess_type(full)
    with open(full, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def main():
    with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(ROOT, "styles.css"), encoding="utf-8") as f:
        css = f.read()

    # Inline the stylesheet.
    html = html.replace(
        '<link rel="stylesheet" href="styles.css" />',
        f"<style>\n{css}\n</style>",
    )

    # Inline JS as a real <script> before the asset pass — data-URI-ing a
    # script src would break execution in the single-file bundle.
    with open(os.path.join(ROOT, "assets/js/downloads.js"), encoding="utf-8") as f:
        js = f.read()
    # Function replacement: a plain-string repl would interpret backslashes
    # in the JS (e.g. regex \d) as re escape sequences and crash.
    html = re.sub(
        r'<script src="assets/js/downloads\.js[^"]*"[^>]*></script>',
        lambda _m: f"<script>\n{js}\n</script>",
        html,
    )

    # Embed every referenced asset (src="assets/..." and content="assets/...").
    def repl(match):
        attr, path = match.group(1), match.group(2)
        return f'{attr}="{data_uri(path)}"'

    html = re.sub(r'(src|href|content)="(assets/[^"]+)"', repl, html)

    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    out = os.path.join(ROOT, "dist", "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    size = os.path.getsize(out) / 1024
    print(f"wrote {out} ({size:.0f} KB)")


if __name__ == "__main__":
    main()

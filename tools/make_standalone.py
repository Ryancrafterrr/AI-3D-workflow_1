#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_standalone.py — build the single-file demo, demo-standalone.html

Inlines SOME of the media from index.html as data URIs, so that a single HTML file
(for example when sending it to someone, or in a preview sandbox that only serves one
file) still shows real GIFs and posters. Everything else keeps its relative assets/ path
and degrades to a placeholder when missing.

Usage:
    python build.py                # produce index.html first
    python tools/make_standalone.py
"""
from pathlib import Path
import base64
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "demo-standalone.html"

# Inline a curated set — enough to show one real figure per stage, while keeping
# the file portable in size (the figures are ~50–180 KB each before base64).
INLINE = [
    # real figures cut from the source documents (see README §8)
    "assets/images/step1-sketch-sheet.jpg",
    "assets/images/step1-concept-banana2.jpg",
    "assets/images/step2-reference-plane-ue.jpg",
    "assets/images/step3-style-transfer-result.jpg",
    "assets/images/step3-component-breakdown.jpg",
    "assets/images/step3-tripo-four-angles.jpg",
    "assets/images/step3-ue-inspection.jpg",
    "assets/images/step4-components-assembly.jpg",
    # the remaining media slots are still placeholders — keep one representative GIF
    "assets/gifs/step5-material-unify.gif",
    "assets/video/step1-full-walkthrough.jpg",
]

MIME = {".gif": "image/gif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4"}


def main() -> None:
    if not SRC.exists():
        sys.exit("[standalone] run `python build.py` first")
    html = SRC.read_text(encoding="utf-8")
    total = 0
    for rel in INLINE:
        f = ROOT / rel
        if not f.exists():
            print(f"[standalone] skipping (not found): {rel}")
            continue
        mime = MIME.get(f.suffix.lower(), "application/octet-stream")
        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        uri = f"data:{mime};base64,{b64}"
        # media paths live in the content-layer JS data as  src: "assets/xx.gif"
        # only rewrite the fields actually used for loading; file: "…" stays human-readable
        n = 0
        for field in ("src", "poster"):
            n += html.count(f'{field}: "{rel}"')
            html = html.replace(f'{field}: "{rel}"', f'{field}: "{uri}"')
        total += len(b64)
        print(f"[standalone] inlined {rel:46s} x{n:<2d}  {len(b64)/1024:7.1f} KB(base64)")

    OUT.write_text(html, encoding="utf-8")
    print(f"[standalone] wrote {OUT.name}  {(OUT.stat().st_size/1024/1024):.2f} MB  "
          f"(inlined data {total/1024/1024:.2f} MB)")


if __name__ == "__main__":
    main()

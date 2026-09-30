#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — merge src/ into a single distributable index.html

Usage:
    python build.py

Inputs:
    src/styles.css            design system
    src/content/*.js          content layer (concatenated in filename order — add a file to add a step)
    src/app.js                rendering and interaction logic
    src/index.template.html   page skeleton

Output:
    index.html                single-file build (styles and scripts inlined, ready to host or open)
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"


def read(p: Path) -> str:
    if not p.exists():
        sys.exit(f"[build] missing file: {p}")
    return p.read_text(encoding="utf-8")


def guard(js: str, name: str) -> str:
    """When inlining into <script>, stop a literal </script> from closing the tag early."""
    n = js.count("</script")
    if n:
        print(f"[build] {name}: escaped {n} occurrence(s) of </script")
    return js.replace("</script", "<\\/script")


def main() -> None:
    css = read(SRC / "styles.css")
    app = guard(read(SRC / "app.js"), "app.js")

    content_files = sorted((SRC / "content").glob("*.js"))
    if not content_files:
        sys.exit("[build] no content files in src/content/")
    parts = []
    for f in content_files:
        parts.append(f"/* ---------- {f.name} ---------- */\n" + guard(read(f), f.name))
    content = "\n".join(parts)
    print(f"[build] {len(content_files)} content files: " + ", ".join(f.name for f in content_files))

    tpl = read(SRC / "index.template.html")

    # meta is read out of 00-core.js so the title is only maintained in one place
    title = re.search(r'title:\s*"([^"]+)"', content)
    title_en = re.search(r'titleEn:\s*"([^"]+)"', content)
    version = re.search(r'version:\s*"([^"]+)"', content)
    updated = re.search(r'updated:\s*"([^"]+)"', content)

    out = (tpl
           .replace("{{CSS}}", css)
           .replace("{{CONTENT}}", content)
           .replace("{{APP}}", app)
           .replace("{{TITLE_EN}}", title_en.group(1) if title_en else "")
           .replace("{{TITLE}}", title.group(1) if title else "Wiki")
           .replace("{{DESC}}", "AI-assisted environment art workflow · single-page documentation"
                    + (" · " + version.group(1) if version else ""))
           )

    dest = ROOT / "index.html"
    dest.write_text(out, encoding="utf-8")
    kb = len(out.encode("utf-8")) / 1024
    print(f"[build] wrote {dest.name}  ({kb:.1f} KB)  version={version.group(1) if version else '?'}  updated={updated.group(1) if updated else '?'}")


if __name__ == "__main__":
    main()

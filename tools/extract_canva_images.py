"""Crop the illustration regions out of the exported Canva pages and write them
into assets/images/ ready for the wiki.

Coordinates are given in an 880px-wide preview space and scaled to the real page
size per source. After cropping, near-background pixels are trimmed so that small
coordinate errors do not leave beige margins behind.

This deliberately uses explicit per-figure rectangles rather than trying to
detect figures automatically. Two attempts at detection were tried and both
misbehaved on these documents:

  * "dark row" detection truncates the light figures (hand-drawn sketches, UE
    screenshots) while accepting caption lines, which are dark.
  * "mostly non-background row" detection requires the figure to span most of its
    window, so it collapses on any figure narrower than the window — and it still
    cannot separate a figure from a caption, because caption text clears the same
    threshold. An automatic truncation audit built on it flagged 23 of 28 crops,
    which is the same as flagging none.

So: verify by eye. Run with --sheet and look at the contact sheet — that is how
the one genuinely truncated figure (a figure cropped at y=344 on a page where it
runs to y=406) was found. 28 tiles is a few seconds of work.

    python tools/extract_canva_images.py            # write crops
    python tools/extract_canva_images.py --sheet    # + tools/_crop_sheet.jpg

Dependencies: Pillow.
"""

import os
import sys
from PIL import Image, ImageChops, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "_canva_src")
OUT = os.path.join(ROOT, "assets", "images")
REF_W = 880.0                      # coordinates below are in this preview space
BG = (247, 245, 242)               # the documents' page colour
TOL = 24                           # "differs from the page" threshold, 0-255

# (source, page, x1, y1, x2, y2, output name)
CROPS = [
    # ---- 01 concept development (Process Book) -----------------------------
    ("pb", 3, 46, 178, 842, 360, "step1-sketch-sheet"),
    ("pb", 5, 418, 124, 842, 360, "step1-concept-banana2"),
    ("pb", 4, 46, 126, 842, 380, "step1-runninghub-batch"),
    # ---- 01 concept development (POC evidence pass) ------------------------
    # window bottom raised to 412: the figure runs to y≈406 and the original
    # y2=344 clipped its bottom row of reference thumbnails
    ("poc", 7, 180, 60, 596, 412, "step1-concept-evidence"),
    # window top set to 456, inside the measured gap: the prose line
    # "The step is manual, so there are no iterations and no generation cost."
    # occupies y 439-453 and the Procreate frame starts at y 471, so any window
    # top above ~454 drags that sentence into the top of the crop
    ("poc", 14, 166, 456, 598, 690, "step1-sketch-evidence"),
    # ---- 02 blockout -------------------------------------------------------
    ("pb", 6, 110, 130, 564, 388, "step2-reference-plane-ue"),
    ("pb", 6, 566, 128, 792, 324, "step2-refplane-material"),
    ("pb", 7, 334, 142, 842, 414, "step2-blockout-pass"),
    # ---- 03 asset generation ----------------------------------------------
    ("pb", 8, 458, 120, 694, 372, "step3-style-variants"),
    ("pb", 9, 540, 124, 842, 358, "step3-style-description"),
    ("pb", 10, 466, 144, 842, 347, "step3-style-transfer-result"),
    ("pb", 11, 44, 102, 842, 400, "step3-decomposition-sheet"),
    ("pb", 12, 386, 106, 708, 352, "step3-component-extract"),
    ("pb", 13, 44, 126, 482, 374, "step3-tripo-window"),
    ("pb", 13, 490, 130, 840, 344, "step3-tripo-multiview"),
    ("pb", 14, 158, 110, 708, 347, "step3-tripo-components"),
    ("poc", 8, 62, 56, 710, 270, "step3-style-before-after"),
    ("poc", 9, 208, 266, 644, 528, "step3-building-separation"),
    ("poc", 10, 128, 330, 644, 588, "step3-component-breakdown"),
    ("poc", 11, 206, 382, 646, 607, "step3-trimmed-components"),
    ("poc", 11, 126, 663, 650, 1002, "step3-reference-grouping"),
    ("poc", 12, 58, 610, 710, 914, "step3-tripo-four-angles"),
    ("poc", 13, 362, 281, 518, 389, "step3-topology-stats"),
    ("poc", 13, 90, 418, 690, 760, "step3-ue-inspection"),
    ("poc", 20, 106, 44, 654, 208, "step3-wall-sheets"),
    ("poc", 21, 56, 626, 710, 929, "step3-tripo-banner"),
    # ---- 04 assembly -------------------------------------------------------
    ("pb", 15, 226, 120, 662, 347, "step4-building-blockout"),
    ("pb", 16, 44, 116, 842, 322, "step4-components-assembly"),
]


def autocrop(im, tol=TOL, pad=8):
    """Trim to the bounding box of pixels that differ from the page colour."""
    ref = Image.new("RGB", im.size, BG)
    diff = ImageChops.difference(im.convert("RGB"), ref).convert("L")
    box = diff.point(lambda p: 255 if p > tol else 0).getbbox()
    if not box:
        return im
    return im.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                    min(im.width, box[2] + pad), min(im.height, box[3] + pad)))


def run():
    os.makedirs(OUT, exist_ok=True)
    made = []
    for src, page, x1, y1, x2, y2, name in CROPS:
        im = Image.open(os.path.join(SRC, src, "%s%02d.png" % (src, page))).convert("RGB")
        s = im.width / REF_W
        crop = autocrop(im.crop((int(x1 * s), int(y1 * s), int(x2 * s), int(y2 * s))))
        out = os.path.join(OUT, name + ".jpg")
        crop.save(out, "JPEG", quality=88, optimize=True)
        made.append((name, crop.size, os.path.getsize(out)))
    for n, sz, b in made:
        print("%-34s %-13s %7.1f KB" % (n, "%dx%d" % sz, b / 1024.0))
    return made


def sheet(names=None, cols=5, cell=330):
    names = names or [c[6] for c in CROPS]
    tiles = []
    for name in names:
        im = Image.open(os.path.join(OUT, name + ".jpg")).convert("RGB")
        w, h = im.size
        im = im.resize((cell - 12, max(1, int(h * (cell - 12) / w))), Image.LANCZOS)
        tiles.append((name, im))
    rows = (len(tiles) + cols - 1) // cols
    rh = max(t[1].height for t in tiles) + 26
    canvas = Image.new("RGB", (cols * cell, rows * rh), (24, 26, 30))
    d = ImageDraw.Draw(canvas)
    for i, (name, im) in enumerate(tiles):
        cx = (i % cols) * cell + 6
        cy = (i // cols) * rh + 6
        canvas.paste(im, (cx, cy))
        d.text((cx + 2, cy + im.height + 6), "%d %s" % (i + 1, name), fill=(214, 218, 224))
    out = os.path.join(ROOT, "tools", "_crop_sheet.jpg")
    canvas.save(out, "JPEG", quality=80)
    print("sheet -> %s  %s" % (out, canvas.size))


if __name__ == "__main__":
    run()
    if "--sheet" in sys.argv:
        sheet()

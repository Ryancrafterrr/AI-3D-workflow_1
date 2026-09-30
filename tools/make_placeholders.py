#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_placeholders.py — generate placeholder media (animated GIFs / stills / video posters)

Usage:
    python tools/make_placeholders.py

Writes into assets/:
    gifs/   13 animated GIFs (short technical loops)
    images/ 7 stills at 1920×1080
    video/  7 video posters at 1920×1080

To use real media, overwrite the same filename — or change the src path in src/content/*.js.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "assets"
for sub in ("gifs", "images", "video"):
    (A / sub).mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------------ palette
BG = (10, 14, 20)
BG2 = (16, 21, 29)
PANEL = (24, 32, 43)
PANEL2 = (32, 42, 56)
LINE = (34, 44, 58)
LINE2 = (46, 59, 76)
TXT = (165, 177, 194)
TXT2 = (113, 127, 146)
TXT3 = (77, 88, 103)
WHITE = (233, 238, 246)
CYAN = (76, 201, 240)
CYAN_D = (24, 54, 70)
VIOLET = (167, 139, 250)
VIOLET_D = (48, 42, 82)
GREEN = (61, 220, 151)
GREEN_D = (20, 56, 44)
AMBER = (255, 180, 84)
RED = (255, 107, 107)
MUTE = (120, 130, 145)
FLOOR = (28, 36, 48)
WALL = (38, 48, 62)

# ------------------------------------------------------------------ fonts
FONTS = ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/segoeuib.ttf"]
MONO = ["C:/Windows/Fonts/consola.ttf", "C:/Windows/Fonts/consolab.ttf"]


def font(paths, size, index=0):
    for p in paths:
        try:
            return ImageFont.truetype(p, size, index=index)
        except Exception:
            continue
    return ImageFont.load_default()


def F(size, bold=False):
    return font([FONTS[1] if bold else FONTS[0]], size)


def M(size, bold=False):
    return font([MONO[1] if bold else MONO[0]], size)


W, H = 800, 450
SHOTS = 22


def base(label, note=None, colour=AMBER):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(14, 19, 26))
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(14, 19, 26))
    d.rectangle([0, 0, W - 1, 33], fill=(8, 11, 16))
    d.line([(0, 33), (W, 33)], fill=LINE)
    d.text((14, 10), label, font=M(12), fill=TXT2)
    d.text((W - 14, 10), "PLACEHOLDER", font=F(12), fill=colour, anchor="ra")
    if note:
        d.text((14, H - 26), note, font=F(12), fill=TXT3)
    return img, d


def rr(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def tab(d, i, n, total=SHOTS):
    """bottom-right progress dots, to give the loop a pulse"""
    for k in range(total):
        x = W - 18 - (total - 1 - k) * 7
        d.ellipse([x, H - 12, x + 3, H - 9], fill=CYAN if k == i else LINE2)


def save_gif(frames, name, duration=70):
    out = A / "gifs" / name
    pal = [f.convert("P", palette=Image.ADAPTIVE, colors=96) for f in frames]
    pal[0].save(out, save_all=True, append_images=pal[1:], duration=duration,
                loop=0, optimize=True, disposal=2)
    print(f"  gifs/{name:42s} {out.stat().st_size/1024:7.1f} KB  {len(frames)}f")


# =============================================================== shared scene drawing
def mock_scene(d, x0, y0, x1, y1, tint=None, dress=False, light=0.5):
    """an abstract scene: floor + back wall + masses, used by the comparison GIFs"""
    tint = tint or CYAN
    w = x1 - x0
    h = y1 - y0
    d.rectangle([x0, y0, x1, y1], fill=(13, 18, 25))
    d.rectangle([x0, y0 + h * 0.62, x1, y1], fill=FLOOR)
    d.rectangle([x0, y0, x1, y0 + h * 0.62], fill=WALL)
    # light source
    lx = x0 + w * (0.15 + 0.7 * light)
    d.polygon([(lx, y0), (lx + 40, y0), (lx + 120, y0 + h * 0.62), (lx + 20, y0 + h * 0.62)],
              fill=(24, 32, 43))
    d.line([(x0, y0 + h * 0.62), (x1, y0 + h * 0.62)], fill=LINE)
    # main masses
    boxes = [(0.16, 0.30, 0.30, 0.62), (0.33, 0.22, 0.44, 0.62), (0.58, 0.34, 0.74, 0.62)]
    for (a, b, c, e) in boxes:
        col = PANEL2 if tint is None else (max(20, tint[0] // 4), max(24, tint[1] // 3), max(30, tint[2] // 3))
        d.rectangle([x0 + w * a, y0 + h * b, x0 + w * c, y0 + h * e], fill=col, outline=LINE2)
        d.line([(x0 + w * a, y0 + h * b), (x0 + w * a, y0 + h * e)], fill=LINE2)
    if dress:
        for i in range(26):
            fx = x0 + w * (0.08 + 0.86 * ((i * 37 % 100) / 100))
            fy = y0 + h * (0.66 + 0.28 * ((i * 53 % 100) / 100))
            s = 4 + (i % 3) * 3
            d.rectangle([fx, fy - s, fx + s * 1.4, fy], fill=(64, 78, 96), outline=LINE2)
    d.rectangle([x0, y0, x1, y1], outline=LINE2)


# =============================================================== GIF generators
def gif_refboard(i, n):
    img, d = base("step1-refboard-layout.gif", "PureRef board layout · five columns · 8s loop")
    cols = ["Motif", "Architecture", "Material", "Light", "Props"]
    cw = (W - 40) / 5
    for c in range(5):
        cx = 20 + c * cw
        rr(d, [cx + 3, 52, cx + cw - 5, 400], 8, fill=(13, 18, 25), outline=LINE)
        d.text((cx + 12, 40), cols[c], font=F(12), fill=TXT3)
        for r in range(3):
            p = ease((i / n) * 2.4 - c * 0.16 - r * 0.1)
            tx, ty = cx + 8, 60 + r * 76
            sx, sy = tx + (1 - p) * (140 if c % 2 else -140), ty - (1 - p) * 90
            box = [sx, sy, sx + cw - 22, sy + 66]
            rr(d, box, 5, fill=PANEL, outline=LINE2)
            d.rectangle([box[0] + 6, box[1] + 6, box[0] + 26, box[1] + 26], fill=(46, 58, 74))
            d.line([(box[0] + 6, box[1] + 40), (box[2] - 6, box[1] + 40)], fill=LINE)
            d.line([(box[0] + 6, box[1] + 50), (box[2] - 24, box[1] + 50)], fill=LINE)
    tab(d, i, n)
    return img


def gif_overlay(i, n):
    img, d = base("step1-overlay-check.gif", "Sketch vs AI output · massing and perspective check · 6s loop")
    mock_scene(d, 30, 44, 770, 400, tint=None)
    # sketch line layer
    x = 30 + 740 * (0.5 + 0.5 * math.sin(i / n * 2 * math.pi))
    d.line([(x, 44), (x, 400)], fill=CYAN, width=2)
    d.polygon([(x, 44), (x - 10, 56), (x + 10, 56)], fill=CYAN)
    for k in range(3):
        bx = 30 + 740 * (0.16 + k * 0.19)
        d.rectangle([bx, 44 + 340 * 0.30, bx + 110, 400 * 0.98], outline=VIOLET, width=2)
    d.text((44, 52), "SKETCH / DESIGN INTENT", font=F(12), fill=VIOLET)
    d.text((W - 44, 52), "AI OUTPUT · has the massing changed?", font=F(12), fill=CYAN, anchor="ra")
    tab(d, i, n)
    return img


def gif_blockout_vs_concept(i, n):
    img, d = base("step2-blockout-vs-concept.gif", "Concept vs blockout · same camera · dissolve · 5s loop")
    mock_scene(d, 30, 44, 770, 400, tint=AMBER)
    x = 30 + 740 * (0.5 + 0.5 * math.sin(i / n * 2 * math.pi))
    d.rectangle([30, 44, x, 400], fill=(22, 29, 39))
    d.rectangle([30, 44, x, 400], outline=CYAN, width=2)
    d.text((44, 52), "CONCEPT", font=M(12, True), fill=AMBER)
    d.text((W - 44, 52), "BLOCKOUT", font=M(12, True), fill=CYAN, anchor="ra")
    d.line([(x, 44), (x, 400)], fill=WHITE, width=2)
    tab(d, i, n)
    return img


def gif_grid_snap(i, n):
    img, d = base("step2-grid-snap.gif", "Module alignment to the 100 grid · pivot rule · 6s loop")
    gx = 60
    for k in range(14):
        xx = gx + k * 50
        d.line([(xx, 60), (xx, 390)], fill=(20, 26, 35))
    d.line([(gx + 3 * 50, 44), (gx + 3 * 50, 400)], fill=CYAN_D, width=2)
    p = (i / n) * 2 % 1
    drift = 46 * math.sin(p * math.pi)
    snapx = gx + 3 * 50
    bx = snapx + (1 - ease(p)) * drift - 40
    snapped = p > 0.6
    bx = snapx - 40 if snapped else bx
    rr(d, [bx, 190, bx + 80, 270], 4, fill=PANEL2, outline=GREEN if snapped else LINE2, width=2)
    d.line([(bx, 270), (bx + 80, 270)], fill=GREEN, width=3)
    d.ellipse([bx - 4, 266, bx + 4, 274], fill=GREEN)
    d.text((44, 52), "Pivot = base centre", font=F(13), fill=TXT2)
    d.text((44, 72), f"Grid 100 · offset {abs(bx - (snapx - 40)):.0f} cm", font=M(12),
           fill=GREEN if snapped else AMBER)
    tab(d, i, n)
    return img


def gif_breakdown(i, n):
    img, d = base("step3-asset-breakdown.gif", "Building to components (column / wall / window / eave) · 6s loop")
    cx, cy = 250, 230
    p = ease((i / n) * 2 % 1)
    parts = [(-1, -0.2), (1, -0.2), (-1, 0.6), (1, 0.6), (0, -1), (0, 1)]
    names = ["Column", "Column", "Plinth", "Plinth", "Roof", "Paving"]
    for k, (dx, dy) in enumerate(parts):
        tx = cx + dx * 40 - 30
        ty = cy + dy * 30 - 30
        fx = cx + dx * (40 + 150 * p) - 30
        fy = cy + dy * (30 + 110 * p) - 30
        px = tx + (fx - tx) * 1
        py = ty + (fy - ty) * 1
        rr(d, [px, py, px + 60, py + 60], 4, fill=PANEL2, outline=LINE2)
    d.text((30, 350), "assembled", font=M(12), fill=TXT3)
    d.line([(30, 366), (200, 366)], fill=LINE)
    d.text((W - 30, 350), "component sheet", font=M(12), fill=TXT3, anchor="ra")
    d.line([(W - 200, 366), (W - 30, 366)], fill=LINE)
    # exploded example on the right
    for k in range(4):
        bx = 500 + k * 68
        off = (1 - p) * -20
        rr(d, [bx, 110 + off, bx + 50, 200 + off], 4, fill=PANEL, outline=CYAN_D)
        d.text((bx + 12, 210), f"P{k+1:02d}", font=M(11), fill=TXT3)
    tab(d, i, n)
    return img


def gif_threeview(i, n):
    img, d = base("step3-threeview-good-bad.gif", "Three-view spec: orthographic (usable) vs perspective (mesh will skew) · 4s loop")
    good = (i / n) < 0.5
    # left: orthographic
    rr(d, [24, 46, 388, 400], 8, fill=(13, 18, 25), outline=GREEN if good else LINE)
    d.text((40, 58), "CORRECT · orthographic", font=F(13, True), fill=GREEN if good else TXT2)
    for k, (ox, w) in enumerate([(40, 70), (150, 40), (240, 90)]):
        rr(d, [ox, 100, ox + w, 260], 3, fill=PANEL2, outline=LINE2)
    d.line([(40, 300), (360, 300)], fill=GREEN, width=2)
    d.text((40, 310), "Shared baseline · same scale · no vanishing point", font=F(12), fill=GREEN)
    # right: with perspective
    rr(d, [412, 46, 776, 400], 8, fill=(13, 18, 25), outline=RED if not good else LINE)
    d.text((428, 58), "WRONG · perspective", font=F(13, True), fill=RED if not good else TXT2)
    for k, off in enumerate([0, 26, 52]):
        d.polygon([(440 + off, 110 + off * 0.3), (520 + off, 96 + off * 0.3),
                   (516 + off, 250 + off * 0.3), (436 + off, 264 + off * 0.3)],
                  fill=PANEL2, outline=LINE2)
    d.line([(440, 300), (740, 276)], fill=RED, width=2)
    d.text((440, 310), "Converging lines → the mesh will be distorted", font=F(12), fill=RED)
    d.rectangle([412, 46, 776, 400], outline=RED if not good else LINE, width=2)
    tab(d, i, n)
    return img


def gif_uv(i, n):
    img, d = base("step3-uv-texeldensity.gif", "UV packing and texel density (1024 px / 100 cm) · 7s loop")
    off = (i / n) * 32
    d.rectangle([24, 46, 420, 400], fill=(13, 18, 25), outline=LINE)
    for k in range(14):
        for j in range(12):
            c = (46, 58, 74) if (k + j) % 2 == 0 else (30, 38, 50)
            d.rectangle([24 + k * 28 + off % 28 - 28, 46 + j * 30, 24 + k * 28 + 28 + off % 28 - 28, 46 + j * 30 + 30], fill=c)
    d.rectangle([24, 46, 420, 400], outline=LINE2)
    d.text((438, 58), "Same material · different density", font=F(13, True), fill=TXT)
    for k, (bx, s) in enumerate([(438, 120), (578, 78)]):
        d.rectangle([bx, 90, bx + s, 90 + s], fill=(40, 52, 68), outline=LINE2)
        for a in range(int(s / 14) + 1):
            d.line([(bx + a * 14, 90), (bx + a * 14, 90 + s)], fill=(56, 70, 88))
            d.line([(bx, 90 + a * 14), (bx + s, 90 + a * 14)], fill=(56, 70, 88))
        d.text((bx, 220), f"{'1024' if k == 0 else '512'} px / 100cm", font=M(12),
               fill=GREEN if k == 0 else RED)
        d.text((bx, 240), "Uniform OK" if k == 0 else "Blurry BAD", font=F(12), fill=GREEN if k == 0 else RED)
    tab(d, i, n)
    return img


def gif_dressing(i, n):
    img, d = base("step4-before-after-dressing.gif", "Before / after dressing (same camera) · 6s loop")
    mock_scene(d, 30, 44, 770, 400, tint=None, dress=True)
    x = 30 + 740 * (0.5 + 0.5 * math.sin(i / n * 2 * math.pi))
    d.rectangle([x, 44, 770, 400], fill=(11, 15, 21))
    mock_scene(d, 30, 44, 770, 400, tint=None, dress=False)
    d.rectangle([30, 44, x, 400], fill=(11, 15, 21))
    mock_scene(d, 30, 44, 770, 400, tint=None, dress=True)
    d.rectangle([x, 44, 770, 400], fill=(11, 15, 21))
    mock_scene(d, 30, 44, 770, 400, tint=None, dress=False)
    d.line([(x, 44), (x, 400)], fill=WHITE, width=2)
    d.text((44, 52), "DRESSED", font=M(12, True), fill=GREEN)
    d.text((W - 44, 52), "EMPTY", font=M(12, True), fill=TXT3, anchor="ra")
    tab(d, i, n)
    return img


def gif_density(i, n):
    img, d = base("step4-density-rhythm.gif", "Density rhythm along the main route: squeeze → release → squeeze · 5s loop")
    d.rectangle([24, 46, 776, 240], fill=(13, 18, 25), outline=LINE)
    pts = []
    for k in range(81):
        t = k / 80
        v = 0.5 + 0.42 * math.sin(t * math.pi * 3.1) * math.cos(t * 1.2)
        pts.append((24 + t * 752, 240 - (0.12 + v * 0.62) * 194))
    d.line(pts, fill=CYAN, width=3, joint="curve")
    for k, (x, y) in enumerate(pts):
        if k % 4 == 0:
            d.line([(x, 240), (x, 240 - (y > 0 and 0 or 0))], fill=LINE)
    ph = (i / n)
    px = 24 + ph * 752
    py = 240 - (0.12 + (0.5 + 0.42 * math.sin(ph * math.pi * 3.1) * math.cos(ph * 1.2)) * 0.62) * 194
    d.ellipse([px - 5, py - 5, px + 5, py + 5], fill=WHITE)
    d.line([(px, 46), (px, 400)], fill=(40, 52, 68))
    d.text((40, 258), "squeeze", font=M(11), fill=TXT3)
    d.text((330, 258), "release", font=M(11), fill=TXT3)
    d.text((660, 258), "squeeze", font=M(11), fill=TXT3)
    d.rectangle([24, 300, 776, 340], fill=(16, 21, 29), outline=LINE)
    for k in range(48):
        hgt = 6 + 26 * abs(math.sin(k * 0.6 + ph * 6))
        d.rectangle([32 + k * 15, 338 - hgt, 40 + k * 15, 338], fill=(46, 58, 74))
    d.text((24, 350), "Prop density along the main route", font=F(12), fill=TXT3)
    tab(d, i, n)
    return img


def gif_unify(i, n):
    img, d = base("step5-material-unify.gif", "Material hue / saturation convergence · 6s loop")
    p = ease((i / n) * 2 % 1)
    wild = [(210, 70, 40), (30, 85, 60), (140, 60, 55), (300, 75, 45),
            (0, 80, 50), (60, 90, 65), (180, 55, 40), (250, 70, 58)]
    target = [(206, 34, 46), (200, 30, 52), (212, 38, 44), (198, 28, 48),
              (208, 32, 50), (202, 36, 42), (214, 30, 46), (204, 34, 54)]
    for k in range(8):
        h1, s1, v1 = wild[k]
        h2, s2, v2 = target[k]
        # quick HSV to RGB
        import colorsys
        r, g, b = colorsys.hsv_to_rgb((h1 + (h2 - h1) * p) / 360, (s1 + (s2 - s1) * p) / 100,
                                       (v1 + (v2 - v1) * p) / 100)
        col = (int(r * 255), int(g * 255), int(b * 255))
        bx = 30 + (k % 4) * 120
        by = 70 + (k // 4) * 120
        rr(d, [bx, by, bx + 100, by + 96], 6, fill=col, outline=LINE2)
        d.text((bx + 4, by + 100), f"{h1 + (h2-h1)*p:.0f}°", font=M(11), fill=TXT3)
    d.rectangle([512, 70, 770, 286], fill=(13, 18, 25), outline=LINE)
    d.text((530, 84), "Target range", font=F(13, True), fill=CYAN)
    d.text((530, 110), "Hue 190–230°", font=M(12), fill=TXT)
    d.text((530, 132), "Saturation ≤ 45%", font=M(12), fill=TXT)
    d.text((530, 154), "Value 20–70%", font=M(12), fill=TXT)
    d.text((530, 176), "Roughness 0.55–0.85", font=M(12), fill=TXT)
    d.rectangle([530, 200, 752, 216], fill=(22, 29, 39), outline=LINE2)
    d.rectangle([530, 200, 530 + int(222 * (0.15 + 0.85 * (1 - p))), 216], fill=CYAN)
    d.text((530, 224), f"Convergence {int(p*100)}%", font=M(11), fill=GREEN)
    d.text((30, 330), "After convergence: variation comes from roughness and form, not hue jumps", font=F(12), fill=TXT3)
    tab(d, i, n)
    return img


def gif_lut(i, n):
    img, d = base("step5-lut-toggle.gif", "Post-process grade on / off (LUT) · 4s loop")
    graded = (i / n) < 0.5
    mock_scene(d, 30, 44, 770, 400, tint=None)
    if graded:
        d.rectangle([30, 44, 770, 400], fill=(12, 28, 36))
        mock_scene(d, 30, 44, 770, 400, tint=CYAN)
        d.rectangle([30, 44, 770, 400], outline=(90, 200, 240))
    d.text((44, 52), "GRADED ✔" if graded else "UNGRADED", font=M(13, True),
           fill=CYAN if graded else TXT3)
    d.rectangle([30, 44, 770, 400], outline=LINE2, width=2)
    tab(d, i, n)
    return img


def gif_lightsweep(i, n):
    img, d = base("step5-light-sweep.gif", "Key azimuth sweep: 180° → 45° · 6s loop")
    ang = 180 - (i / n) * 135
    mock_scene(d, 30, 44, 770, 400, tint=None, light=ang / 180)
    # light cone indicator
    rad = math.radians(180 - ang)
    ox, oy = 400, 60
    d.line([(ox, oy), (ox + 300 * math.cos(rad), oy + 170 * math.sin(rad) * 0 + 170)], fill=CYAN, width=2)
    d.polygon([(ox, oy), (ox + 240 * math.cos(rad + 0.5), oy + 320), (ox + 240 * math.cos(rad - 0.5), oy + 320)],
              fill=(20, 30, 40))
    rr(d, [560, 330, 770, 390], 8, fill=(12, 17, 24), outline=LINE2)
    d.text((576, 342), "AZIMUTH", font=M(11), fill=TXT3)
    d.text((576, 360), f"{ang:.0f}°", font=M(20, True), fill=CYAN)
    tab(d, i, n)
    return img


def gif_storyboard(i, n):
    img, d = base("step6-storyboard-timing.gif", "8-shot storyboard and timing (75s film) · 6s loop")
    durs = [10, 8, 9, 12, 7, 11, 10, 8]
    total = sum(durs)
    x = 30
    ph = (i / n) * 752 + 30
    for k, du in enumerate(durs):
        w = 752 * du / total
        active = x <= ph < x + w
        rr(d, [x, 70, x + w - 6, 130], 5, fill=CYAN_D if active else PANEL, outline=CYAN if active else LINE2)
        d.text((x + 8, 78), f"{k+1:02d}", font=M(12, True), fill=CYAN if active else TXT3)
        d.line([(x, 150), (x, 150 - 30 * du / 12)], fill=LINE2)
        d.text((x, 154), f"{du}s", font=M(10), fill=TXT3)
        x += w
    d.line([(30, 190), (782, 190)], fill=LINE2)
    d.rectangle([30, 186, ph, 194], fill=CYAN_D)
    d.ellipse([ph - 6, 184, ph + 6, 196], fill=WHITE)
    labels = ["Establish", "Guide", "Push in", "Detail", "Turn", "Interior", "Climax", "Hold"]
    for k, lb in enumerate(labels):
        d.text((36 + k * 94, 210 + (k % 2) * 22), lb, font=F(12), fill=TXT2)
    d.text((30, 290), "≥2s of readable info per shot · final hold ≥3s works as a thumbnail", font=F(13), fill=TXT)
    tab(d, i, n)
    return img


# ================================================================== build GIFs
GIFS = [
    ("step1-refboard-layout.gif", gif_refboard),
    ("step1-overlay-check.gif", gif_overlay),
    ("step2-blockout-vs-concept.gif", gif_blockout_vs_concept),
    ("step2-grid-snap.gif", gif_grid_snap),
    ("step3-asset-breakdown.gif", gif_breakdown),
    ("step3-threeview-good-bad.gif", gif_threeview),
    ("step3-uv-texeldensity.gif", gif_uv),
    ("step4-before-after-dressing.gif", gif_dressing),
    ("step4-density-rhythm.gif", gif_density),
    ("step5-material-unify.gif", gif_unify),
    ("step5-lut-toggle.gif", gif_lut),
    ("step5-light-sweep.gif", gif_lightsweep),
    ("step6-storyboard-timing.gif", gif_storyboard),
]

print("[media] building GIFs ...")
for name, fn in GIFS:
    frames = [fn(i, SHOTS) for i in range(SHOTS)]
    save_gif(frames, name)


# ================================================================== build stills
def draw_frame_base(title, sub, kind="IMAGE"):
    img = Image.new("RGB", (1920, 1080), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, 1920, 80):
        d.line([(x, 0), (x, 1080)], fill=(14, 19, 26))
    for y in range(0, 1080, 80):
        d.line([(0, y), (1920, y)], fill=(14, 19, 26))
    d.rectangle([0, 0, 1920, 64], fill=(8, 11, 16))
    d.line([(0, 64), (1920, 64)], fill=LINE)
    d.text((26, 20), f"PLACEHOLDER · {kind}", font=M(18), fill=AMBER)
    d.text((1894, 22), "1920 × 1080", font=M(16), fill=TXT3, anchor="ra")
    return img, d


def save_jpg(img, path, q=88):
    img.save(path, quality=q, optimize=True, progressive=True)
    print(f"  {path.relative_to(ROOT).as_posix():52s} {path.stat().st_size/1024:7.1f} KB")


print("[media] building still placeholders ...")
IMAGES = [
    ("step1-shot-selection.jpg", "Concept selection sheet", "Four candidates side by side + notes: keep / must fix", "IMAGE"),
    ("step2-greybox-keyshot.jpg", "Greybox key shot", "The comparison baseline for every later step · UI hidden · exposure locked", "IMAGE"),
    ("step3-proxy-vs-final.jpg", "Proxy / retopo / textured", "The AI proxy is not a deliverable — it is a shape draft", "IMAGE"),
    ("step4-layer-grouping.jpg", "UE5 actor layers and naming", "Four groups: structure / function / narrative / vegetation", "IMAGE"),
    ("step5-atmosphere-variants.jpg", "Three atmosphere variants", "Dawn fog / flat noon / warm dusk · same camera", "IMAGE"),
    ("step6-doc-structure.jpg", "Document information architecture", "The structure of this page · six steps + appendix", "IMAGE"),
    ("step6-hero-shot.jpg", "Final hero shot", "Portfolio cover image · hero atmosphere, locked", "IMAGE"),
]
for name, title, sub, kind in IMAGES:
    img, d = draw_frame_base(title, sub, kind)
    # main panel: abstract layout
    rr(d, [120, 200, 1180, 866], 14, fill=(13, 18, 25), outline=LINE2, width=2)
    mock_scene(d, 140, 220, 1160, 700, tint=CYAN)
    d.text((140, 730), sub, font=F(26), fill=TXT2)
    d.text((140, 780), "Drop the real asset at the same path and this image is replaced automatically", font=F(22), fill=TXT3)
    rr(d, [1220, 200, 1800, 866], 14, fill=(16, 21, 29), outline=LINE)
    d.text((1252, 232), "File path", font=F(22, True), fill=CYAN)
    d.text((1252, 276), f"assets/images/{name}", font=M(20), fill=TXT)
    d.line([(1252, 320), (1768, 320)], fill=LINE)
    d.text((1252, 344), "Recommended spec", font=F(22, True), fill=CYAN)
    for k, t in enumerate(["2560 × 1440 · 16:9", "JPEG quality 85–90", "UI hidden / exposure locked", "Keep the original in the archive"]):
        d.text((1252, 386 + k * 40), "· " + t, font=F(22), fill=TXT2)
    d.text((1252, 620), "Title", font=F(20, True), fill=VIOLET)
    d.text((1252, 656), title, font=F(28, True), fill=WHITE)
    tab(d, 0, 1)
    save_jpg(img, ROOT / "assets" / "images" / name)


# ============================================================ video poster placeholders
print("[media] building video posters ...")
POSTERS = [
    ("step1-full-walkthrough.jpg", "Step 01 - concept development (to be recorded)", "--:--"),
    ("step2-blockout-timelapse.jpg", "Step 02 - UE5 blockout (to be recorded)", "--:--"),
    ("step3-decompose-workflow.jpg", "Step 03 - asset pipeline (to be recorded)", "--:--"),
    ("step3-retopo-maya.jpg", "Step 03 - manual retopo (to be recorded)", "--:--"),
    ("step4-dressing-walkthrough.jpg", "Step 04 - dressing and assembly (to be recorded)", "--:--"),
    ("step5-lookdev.jpg", "Step 05 - look dev (to be recorded)", "--:--"),
    ("step6-final-cinematic.jpg", "Step 06 - final film (to be recorded)", "--:--"),
]
for name, title, dur in POSTERS:
    img = Image.new("RGB", (1920, 1080), BG)
    d = ImageDraw.Draw(img)
    mock_scene(d, 0, 0, 1920, 1080, tint=CYAN)
    # vignette + bottom info bar
    d.rectangle([0, 880, 1920, 1080], fill=(8, 11, 16))
    d.line([(0, 880), (1920, 880)], fill=LINE)
    # play button
    cx, cy = 960, 440
    d.ellipse([cx - 86, cy - 86, cx + 86, cy + 86], fill=(16, 21, 29), outline=CYAN, width=3)
    d.polygon([(cx - 24, cy - 38), (cx - 24, cy + 38), (cx + 44, cy)], fill=CYAN)
    d.text((60, 918), title, font=F(46, True), fill=WHITE)
    d.text((60, 986), f"assets/video/{name.replace('.jpg', '.mp4')}", font=M(24), fill=TXT2)
    d.text((1860, 918), "Video slot · plays once a same-named .mp4 is added", font=F(26), fill=AMBER, anchor="ra")
    rr(d, [1700, 976, 1860, 1024], 8, fill=(16, 21, 29), outline=LINE2)
    d.text((1780, 1000), dur, font=M(24, True), fill=WHITE, anchor="mm")
    save_jpg(img, ROOT / "assets" / "video" / name)

print("[media] done.")

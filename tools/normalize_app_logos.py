"""Normalise the Apps & Games logos into one consistent set.

Reads each game's current icon from D:\\persional\\Entity\\Games\\<folder>\\assets\\,
crops away any baked-in corner colour / outer rim, optionally inpaints a
watermark, scales to SIZE px, applies ONE identical rounded-corner alpha mask
and writes assets/images/apps/<slug>.webp (WebP with alpha, < MAX_KB).

Re-run whenever a game's logo changes:
    python tools/normalize_app_logos.py [--games-root D:/persional/Entity/Games] [--sheet out.png]

Requires Pillow and numpy.
"""
import argparse
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

SIZE = 512            # output edge length (px)
RADIUS = 0.22         # corner radius as a fraction of SIZE - identical for every logo
MAX_KB = 80           # per-file budget
SUPERSAMPLE = 4       # mask anti-aliasing

# box: (x0, y0, x1, y1) crop as fractions of the source, dropping baked corners + rim.
#   Since 2026-11-18 all seven icon.png files come from the shared Entity template
#   (Branding/logomaker/entity_brand/build_brand.py): full-bleed square art with no
#   rim or baked corners -> FULL for every game. INNER_TILE is kept for reference
#   (it cropped the old rimmed Arrows/Sudoku tiles).
# watermark: list of (x0, y0, x1, y1) boxes, as fractions of the SOURCE image,
#   that are inpainted from their surroundings before cropping (e.g. a Gemini
#   sparkle). Sudoku's sparkle sits in the black corner outside the tile, so the
#   INNER_TILE crop already removes it; add a box here if a future logo has one inside.
INNER_TILE = (0.092, 0.085, 0.908, 0.912)
FULL = (0.0, 0.0, 1.0, 1.0)

LOGOS = {
    "entity-arrows":              {"folder": "Entity-Arrows_game",              "file": "icon.png", "box": FULL},
    "entity-sudoku":              {"folder": "Entity-Sudoku_game",              "file": "icon.png", "box": FULL},
    "entity-tubes-game":          {"folder": "Entity-Tubes_game",               "file": "icon.png", "box": FULL},
    "entity-wordpuzzlematching":  {"folder": "Entity-WordPuzzleMatching_game",  "file": "icon.png", "box": FULL},
    "entity-wordpuzzleselecting": {"folder": "Entity-WordPuzzleSelecting_game", "file": "icon.png", "box": FULL},
    "entity-bricksbreaker":       {"folder": "Entity-BricksBreaker_game",       "file": "icon.png", "box": FULL},
    "entity-bubbleshooter":       {"folder": "Entity-BubbleShooter_game",       "file": "icon.png", "box": FULL},
}

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "assets" / "images" / "apps"


def inpaint(img: Image.Image, box_frac, iters: int = 400) -> Image.Image:
    """Fill a box by harmonic diffusion from its border (good for small marks on smooth backgrounds)."""
    w, h = img.size
    x0, y0, x1, y1 = (int(round(v * s)) for v, s in zip(box_frac, (w, h, w, h)))
    a = np.asarray(img.convert("RGBA"), dtype=np.float32).copy()
    # work on the box plus a 1px frame that stays fixed
    sub = a[y0 - 1:y1 + 1, x0 - 1:x1 + 1]
    inner = sub[1:-1, 1:-1]
    inner[:] = sub.mean(axis=(0, 1))
    for _ in range(iters):
        inner[:] = 0.25 * (sub[:-2, 1:-1] + sub[2:, 1:-1] + sub[1:-1, :-2] + sub[1:-1, 2:])
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
    return out


def rounded_mask(size: int, radius_frac: float) -> Image.Image:
    big = size * SUPERSAMPLE
    m = Image.new("L", (big, big), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, big - 1, big - 1), radius=int(radius_frac * big), fill=255)
    return m.resize((size, size), Image.LANCZOS)


def encode_webp(img: Image.Image) -> bytes:
    for q in (88, 84, 80, 76, 72, 68, 64, 60):
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=q, alpha_quality=100, method=6)
        if buf.tell() <= MAX_KB * 1024:
            return buf.getvalue()
    return buf.getvalue()


def build(slug: str, cfg: dict, games_root: Path) -> Image.Image:
    src = Image.open(games_root / cfg["folder"] / "assets" / cfg["file"]).convert("RGBA")
    for box in cfg.get("watermark", []):
        src = inpaint(src, box)
    w, h = src.size
    x0, y0, x1, y1 = cfg["box"]
    art = src.crop((round(w * x0), round(h * y0), round(w * x1), round(h * y1)))
    art = art.resize((SIZE, SIZE), Image.LANCZOS)
    rgb = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    # flatten any residual source alpha onto the art itself, then apply the shared mask
    rgb.alpha_composite(art)
    alpha = rounded_mask(SIZE, RADIUS)
    rgb.putalpha(Image.fromarray(np.minimum(np.asarray(alpha), np.asarray(rgb.getchannel("A")))))
    return rgb


def contact_sheet(images: dict, path: Path) -> None:
    pad, cell = 24, 256
    n = len(images)
    bgs = [(14, 18, 30), (245, 246, 250)]  # dark site bg + light, to expose any corner artefacts
    sheet = Image.new("RGB", (pad + n * (cell + pad), 2 * (cell + pad) + pad))
    for r, bg in enumerate(bgs):
        sheet.paste(bg, (0, r * (cell + pad), sheet.width, (r + 1) * (cell + pad) + pad))
        for c, im in enumerate(images.values()):
            t = im.resize((cell, cell), Image.LANCZOS)
            sheet.paste(t, (pad + c * (cell + pad), pad + r * (cell + pad)), t)
    sheet.save(path)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--games-root", default=str(REPO.parent / "Games"))
    ap.add_argument("--sheet", help="optional contact-sheet PNG path (put it outside the repo)")
    args = ap.parse_args()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    built = {}
    for slug, cfg in LOGOS.items():
        img = build(slug, cfg, Path(args.games_root))
        data = encode_webp(img)
        (OUT_DIR / f"{slug}.webp").write_bytes(data)
        built[slug] = img
        print(f"{slug:30s} {len(data) / 1024:6.1f} KB")
    if args.sheet:
        contact_sheet(built, Path(args.sheet))
        print("sheet:", args.sheet)


if __name__ == "__main__":
    main()

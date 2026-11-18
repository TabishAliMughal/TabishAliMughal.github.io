"""Sync store screenshots and YouTube videos into the Entity game pages.

For every game page entity/games/<slug>/index.html this script:

1. Reads the store screenshots from <shots-root>/<slug>/screenshots/*.png (sorted by file name;
   1080x1920 portrait PNGs) and writes web copies to entity/games/<slug>/screenshots/ as WebP:
   <name>-540.webp and <name>-1080.webp (srcset pair, quality ~80, shrunk until < MAX_KB if
   possible). Stale .webp files that no longer have a source PNG are deleted.
2. Regenerates the gallery between <!-- screenshots:start --> and <!-- screenshots:end -->:
   a sideways-scrolling, snap-scrolling row of phone frames (no JS). If the game has no
   screenshots, the block stays as a hidden, empty card.
3. Regenerates the video slot between <!-- video:start --> and <!-- video:end --> from
   tools/game_videos.json ("<slug>": "<YouTube id or URL>"). Empty value -> nothing is rendered;
   otherwise a lazy, 16:9 youtube-nocookie.com embed.

Pages that still have the old "<!-- SCREENSHOTS: ..." placeholder are migrated to the markers.
Safe to re-run any time (unchanged WebPs are not re-encoded unless --force).

    python tools/sync_screenshots.py [--shots-root D:/persional/Entity/docs/games] [--force]

Requires Pillow.
"""
import argparse
import html
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GAMES_DIR = ROOT / "entity" / "games"
VIDEOS_FILE = Path(__file__).resolve().parent / "game_videos.json"
DEFAULT_SHOTS_ROOT = Path(r"D:\persional\Entity\docs\games")

WIDTHS = (540, 1080)   # srcset widths (px)
QUALITY = 80           # starting WebP quality
MIN_QUALITY = 55       # never go below this when shrinking towards MAX_KB
MAX_KB = 120           # per-file budget (best effort)

SHOTS_START, SHOTS_END = "<!-- screenshots:start -->", "<!-- screenshots:end -->"
VIDEO_START, VIDEO_END = "<!-- video:start -->", "<!-- video:end -->"

# The placeholder the pages shipped with (comment + hidden empty card).
LEGACY_RE = re.compile(
    r"<!-- SCREENSHOTS:.*?-->\s*<div class=\"card\" id=\"screenshots\" hidden>\s*<h2>Screenshots</h2>\s*</div>",
    re.S,
)
YOUTUBE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def game_name(page_html, slug):
    """'Entity Bubble Shooter' -> 'Bubble Shooter' (from the page's <h1>)."""
    m = re.search(r"<h1>(.*?)</h1>", page_html, re.S)
    name = html.unescape(m.group(1)).strip() if m else slug
    return re.sub(r"^Entity\s+", "", name)


def shot_label(stem):
    """'03-gameplay' -> 'gameplay', '07-home-dark' -> 'home (dark theme)'."""
    label = re.sub(r"^\d+[-_ ]*", "", stem)
    dark = re.search(r"[-_ ]dark$", label)
    if dark:
        label = label[: dark.start()]
    label = re.sub(r"[-_]+", " ", label).strip() or "screenshot"
    return label + (" (dark theme)" if dark else "")


def encode_webp(img, max_kb):
    """WebP bytes at QUALITY, lowered step by step until <= max_kb (or MIN_QUALITY)."""
    q = QUALITY
    while True:
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=q, method=6)
        data = buf.getvalue()
        if len(data) <= max_kb * 1024 or q <= MIN_QUALITY:
            return data, q
        q -= 5


def sync_images(slug, shots_root, force):
    """Write WebP pairs; return [(stem, width, height_at_540)] in name order."""
    src_dir = shots_root / slug / "screenshots"
    out_dir = GAMES_DIR / slug / "screenshots"
    pngs = sorted(src_dir.glob("*.png"), key=lambda p: p.name.lower()) if src_dir.is_dir() else []
    expected, shots = set(), []
    for png in pngs:
        stem = re.sub(r"[^A-Za-z0-9_-]+", "-", png.stem).strip("-").lower()
        with Image.open(png) as im:
            src = im.convert("RGB")  # store shots are opaque; drop the alpha channel
        h540 = round(src.height * WIDTHS[0] / src.width)
        for w in WIDTHS:
            out = out_dir / f"{stem}-{w}.webp"
            expected.add(out.name)
            if not force and out.exists() and out.stat().st_mtime >= png.stat().st_mtime:
                continue
            h = round(src.height * w / src.width)
            img = src if (w, h) == src.size else src.resize((w, h), Image.LANCZOS)
            data, q = encode_webp(img, MAX_KB)
            out_dir.mkdir(parents=True, exist_ok=True)
            out.write_bytes(data)
            note = "" if len(data) <= MAX_KB * 1024 else f"  (over {MAX_KB} KB budget)"
            print(f"  {out.relative_to(ROOT).as_posix()}  {w}x{h}  q{q}  {len(data) // 1024} KB{note}")
        shots.append((stem, WIDTHS[0], h540))
    if out_dir.is_dir():
        for stale in out_dir.glob("*.webp"):
            if stale.name not in expected:
                stale.unlink()
                print(f"  removed stale {stale.relative_to(ROOT).as_posix()}")
        if not any(out_dir.iterdir()):
            out_dir.rmdir()
    return shots


def gallery_html(slug, name, shots):
    if not shots:
        return '<div class="card" id="screenshots" hidden>\n<h2>Screenshots</h2>\n</div>'
    base = f"/entity/games/{slug}/screenshots"
    items = []
    for stem, w, h in shots:
        alt = html.escape(f"{name} \u2013 {shot_label(stem)}")
        small, large = f"{base}/{stem}-{WIDTHS[0]}.webp", f"{base}/{stem}-{WIDTHS[1]}.webp"
        items.append(
            f'<li><a class="shot" href="{large}">'
            f'<img src="{small}" srcset="{small} {WIDTHS[0]}w, {large} {WIDTHS[1]}w" '
            f'sizes="(max-width: 480px) 42vw, 220px" width="{w}" height="{h}" '
            f'loading="lazy" decoding="async" alt="{alt}"></a></li>'
        )
    label = html.escape(f"{name} screenshots ({len(shots)}), scroll sideways")
    return (
        '<section class="card" id="screenshots" aria-labelledby="screenshots-title">\n'
        '<h2 id="screenshots-title">Screenshots</h2>\n'
        f'<div class="shots" tabindex="0" role="region" aria-label="{label}">\n<ul>\n'
        + "\n".join(items)
        + "\n</ul>\n</div>\n"
        '<p class="muted shots-hint">Swipe or scroll sideways; select a screenshot to open it full size.</p>\n'
        "</section>"
    )


def youtube_id(value):
    value = (value or "").strip()
    if not value:
        return ""
    if YOUTUBE_ID_RE.match(value):
        return value
    m = re.search(r"(?:v=|youtu\.be/|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{11})", value)
    if not m:
        raise ValueError(f"not a YouTube id or URL: {value!r}")
    return m.group(1)


def video_html(name, vid):
    if not vid:
        return ""
    title = html.escape(f"{name} \u2013 gameplay video")
    return (
        '<section class="card" id="video" aria-labelledby="video-title">\n'
        '<h2 id="video-title">Video</h2>\n'
        '<div class="video-frame">'
        f'<iframe src="https://www.youtube-nocookie.com/embed/{vid}" title="{title}" loading="lazy" '
        'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" '
        'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
        "</div>\n</section>"
    )


def replace_block(page, start, end, body):
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pattern.search(page):
        raise ValueError(f"markers {start} ... {end} not found")
    inner = f"\n{body}\n" if body else "\n"
    return pattern.sub(lambda _: start + inner + end, page, count=1)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--shots-root", type=Path, default=DEFAULT_SHOTS_ROOT,
                    help="folder with <slug>/screenshots/*.png (default: %(default)s)")
    ap.add_argument("--force", action="store_true", help="re-encode every WebP")
    args = ap.parse_args()

    videos = json.loads(VIDEOS_FILE.read_text(encoding="utf-8")) if VIDEOS_FILE.exists() else {}
    try:  # validate every entry before touching any page
        video_ids = {slug: youtube_id(value) for slug, value in videos.items()}
    except ValueError as e:
        sys.exit(f"{VIDEOS_FILE.name}: {e}")
    pages = sorted(p for p in GAMES_DIR.glob("*/index.html"))
    if not pages:
        sys.exit(f"no game pages under {GAMES_DIR}")

    for page_path in pages:
        slug = page_path.parent.name
        raw = page_path.read_bytes()
        eol = "\r\n" if b"\r\n" in raw else "\n"  # keep the file's own line endings
        page = raw.decode("utf-8").replace("\r\n", "\n")
        original = page
        if SHOTS_START not in page:
            if not LEGACY_RE.search(page):
                print(f"{slug}: SKIPPED - no screenshot markers or legacy placeholder")
                continue
            page = LEGACY_RE.sub(
                lambda _: f"{SHOTS_START}\n{SHOTS_END}\n\n{VIDEO_START}\n{VIDEO_END}", page, count=1)
        if VIDEO_START not in page:
            page = page.replace(SHOTS_END, f"{SHOTS_END}\n\n{VIDEO_START}\n{VIDEO_END}", 1)

        name = game_name(page, slug)
        shots = sync_images(slug, args.shots_root, args.force)
        vid = video_ids.get(slug, "")
        page = replace_block(page, SHOTS_START, SHOTS_END, gallery_html(slug, name, shots))
        page = replace_block(page, VIDEO_START, VIDEO_END, video_html(name, vid))

        new_raw = page.replace("\n", eol).encode("utf-8")
        if new_raw != raw:
            page_path.write_bytes(new_raw)
        state = "updated" if new_raw != raw else "unchanged"
        print(f"{slug}: {len(shots)} screenshot(s), video {'yes' if vid else 'no'} - page {state}")


if __name__ == "__main__":
    main()

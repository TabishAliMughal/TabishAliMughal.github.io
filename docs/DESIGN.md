# Design system and game pages

Copied from the Entity workspace doc `docs/developer-website.md` (2026-11-17).

## Design system (dark, one set of tokens for every page)

Redesigned 2026-11-17 (TaskList 47). Dark only. The look echoes the Entity game logos: deep navy, a
faint circuit-board grid, and the ENTITY wordmark's blue -> amber gradient.

| File | Used by | Contents |
|---|---|---|
| `assets/css/tokens.css` | every page (index, resume, game, privacy, /privacy/) | colour/type/space tokens, base, focus ring, buttons, Play badge, reduced motion |
| `assets/css/style.css` | `index.html` | home page layout |
| `assets/css/entity.css` | `/entity/games/<slug>/`, `.../privacy/`, `/privacy/` | top bar, cards, game hero, chips, `.modes`, policy text |
| `resume.html` inline `<style>` | resume + cover letters | dark on screen; `@media print` swaps the tokens to a plain light A4 |
| `privacy/<slug>/index.html` | redirect stubs | one-line inline style with the same hex values |

Tokens (all text pairs measured >= 4.5:1; lowest is the form placeholder at 5.4:1):

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0A1528` | page background (with a 32 px grid of `--line-soft`) |
| `--surface` / `--surface-2` | `#101F3A` / `#162A4D` | cards, panels / inputs, chips |
| `--line` | `#24406B` | borders, timeline and circuit traces |
| `--text` | `#E7EEF9` | body text (15.6:1 on `--bg`) |
| `--muted` | `#A6B6D1` | secondary text (8.9:1 on `--bg`, 6.9:1 on `--surface-2`) |
| `--blue` | `#5BB8FF` | links, primary button, bullets (8.5:1) |
| `--amber` | `#FFB648` | "current" markers, focus ring, hover (10.5:1) |
| `--grad` | blue -> `#9CC3E8` -> amber | display text and frames only, never body text |

Type: **Unbounded** (wide geometric, like the wordmark) for display headings only; **IBM Plex Sans**
for everything else (Google Fonts). Focus: 2 px amber outline on `:focus-visible`. Motion: the only
non-interactive animation is the hero's circuit traces drawing in once; `prefers-reduced-motion`
turns it (and smooth scrolling) off. Icons: Font Awesome 6 (CDN). Favicon: `assets/images/favicon.svg`.

Home page order: hero, About, Experience (timeline; roles that are still current get an amber node),
Skills, AI-Enhanced Development, Projects, Apps & Games (`#apps`), Contact. All old anchors still work.

### Adding a game page

1. Copy `entity/games/entity-arrows/` to `entity/games/<slug>/` (both `index.html` and
   `privacy/index.html`) and replace the name, slug, package, tagline and texts. Use only facts from
   that game's README/docs. Keep the `data-app="<slug>"` on the hero card and the
   `.app-store-badge` inside it: that is what `assets/js/apps.js` turns into the Play link.
2. Head: keep the shared block (`theme-color`, favicon, fonts, Font Awesome on game pages,
   `/assets/css/tokens.css?v=2`, `/assets/css/entity.css?v=2`). Do not add inline styles; add
   classes to `entity.css`. Bump `?v=` on every page if you change the CSS a lot (cache busting).
3. Logo: `assets/images/apps/<slug>.webp`, 256 px, made from the game's `assets/icon.png`.
4. Home page: add an `<article class="app-card" id="app-<slug>" data-app="<slug>">` to `#apps` in
   `index.html` (copy an existing one), add `"<slug>": ""` to `assets/js/apps-data.js`, add the policy
   to `privacy/index.html`, and a redirect stub `privacy/<slug>/index.html` only if an old link exists.
5. Check at 360 px and 1280 px (ClaudeTester, see below): no horizontal scroll, no broken images.

Useful page blocks in `entity.css`: `.card`, `.hero`, `.tagline`, `.actions`, `.chips`,
`.modes` > `.mode` (two-up blocks; `.mode.is-new` + `<span class="tag-new">New</span>` for a new
feature), `.muted`; policy pages add `class="card policy"`.

### Local preview and visual check

```
cd D:\persional\Entity\Portfolio ; python -m http.server 8765 --bind 127.0.0.1
node E:\ClaudeTester\run.js set_project '{"project":"portfolio"}'
node E:\ClaudeTester\run.js navigate '{"url":"http://127.0.0.1:8765/"}'
```
Root-relative links (`/entity/...`, `/assets/...`) need the server root to be the repo folder.
Screenshots land in `E:\ClaudeTester\docs\portfolio\screenshots\`.

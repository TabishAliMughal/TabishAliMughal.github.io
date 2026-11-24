# Design system and game pages

Copied from the Entity workspace doc `docs/developer-website.md` (2026-11-17).

## Design system (dark, one set of tokens for every page)

Redesigned 2026-11-17 (TaskList 47). Dark only. The look echoes the Entity game logos: deep navy, a
faint circuit-board grid, and the ENTITY wordmark's blue -> amber gradient.

| File | Used by | Contents |
|---|---|---|
| `assets/css/tokens.css` | every page (index, resume, game, privacy, /privacy/) | colour/type/space tokens, base, focus ring, buttons, Play badge, reduced motion |
| `assets/css/style.css` | `index.html` | home page layout |
| `assets/css/entity.css` | `/entity/games/<slug>/`, `.../privacy/`, `/privacy/`, `/cost-calculator/` | top bar, cards, game hero, chips, `.modes`, policy text |
| `assets/css/calculator.css` | `/cost-calculator/` | wide layout, currency pills, service rows, summary, phone total bar |
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
Skills, AI-Enhanced Development, Projects, Apps & Games (`#apps`), VS Code Extensions (`#extensions`), Contact.
All old anchors still work.

Entity Corporation (2026-11-19): the parent-brand logo is `assets/images/entity/entity-corporation-256.webp`
(copied from `Branding\logomaker\entity_brand\out\entity-corporation\`, never edited here; shown with
`--icon-radius` + `--icon-shadow` like the app logos). Home: `.entity-brand` (`style.css`) right under the
`#apps` header - `--surface` card, amber left border, 64 px logo (48 px under 520 px) + one sentence.
Résumé: `#entity-corporation` section after Featured Projects - `.entity-head` (72 px `.entity-logo`, 56 px on
phones and in print, + `.entity-role`: a "Founder" `.experience-title`, an "Entity Corporation"
`.experience-company` and the `.entity-tagline` sentence), the existing `.projects-grid` / `.project-item` /
`.tech-tag` cards, and an `.entity-more` line. Only facts from the Entity README/docs. The role is Founder with
no start date (user's choice, 2026-11-20). Describe the work as apps built through AI-assisted development (vibe
coding) and published under Entity Corporation; do not call it "open source".

Nav: one row of links (`white-space: nowrap`, 8 px side padding) from 1161 px up; at 1160 px and below the
hamburger menu (the full row, incl. the "Entity" link added 2026-11-21, measures ~1075 px + gutters, so keep
link labels short - e.g. "Pricing" for the cost calculator). Re-measure if you add a link.

Skills: five `.skill-category` cards (Backend, Frontend, Database & Tools, Mobile & Others, Cloud & Hosting),
each item = Font Awesome icon + name + `.skill-level` bar (`data-level` 0-100, drawn by `script.js`).

### Entity Corporation page (`/entity/`, 2026-11-21)

All Entity / Entity Corporation wording (tagline, ~160-character meta/OG description, hero paragraph, one line per branch) comes from [entity-copy.md](./entity-copy.md). Reuse it word for word; don't write new descriptions of Entity on other pages.

`entity/index.html` is the app studio page (https://tabishalimughal.github.io/entity/). It uses the game-page shell
(`.site-bar`, `.crumbs`, `.card`, `footer`, tokens.css + entity.css) plus `assets/css/company.css`, which widens the page
to 1080 px (`body.company`) and adds the following blocks:
- `.company-hero`: 160 px logo (96 px under 640 px) + amber `.eyebrow` + gradient `h1` + tagline + three buttons (games, all Entity apps, Play developer page).
- `#ecosystem`: see "Entity ecosystem section" below. Its Games block `#games` holds the `.games-grid`: 7 `.game-card` items (auto-fill, min 220 px; 2 columns under 520 px, 1 under 360 px). Each has
  `data-app="<slug>"`, so `apps.js` applies `playUrl` (the "Coming soon" badge goes live) and `testingUrl` (the beta button) from
  `apps-data.js`. The testing URLs are also hard-coded as the no-JS fallback. The icon link goes to the game page.
- `#approach`: `.section-lead` + `.approach` icon list: privacy first and offline-first (all apps), then kid-safe games, child-safe ads in games, step-by-step difficulty (game-only items say so).
- `#contact`: `.contact-list` with only the contact details already on the site (email, GitHub, Play developer page, `/privacy/`).
- Title, description, canonical and OG/Twitter tags (image = the 256 px logo).
Linked from the home nav ("Entity"), the `.entity-brand` strip, an `#apps` "Entity Corporation page" button, the home
footer, and the résumé `#entity-corporation` section (company name + a "Company page" line, absolute URL for print).
When a game is added, add a card here too.

### Entity Games logo (`assets/images/entity/entity-games/`, 2026-11-24)

"Entity Games" is the umbrella mark for the 7 games (Entity Corporation stays an app studio). Hand-built SVG, no fonts:
the icon is a navy tile with a blue-to-amber gradient `E` (the Entity logo gradient), node dots, a block and an orbit ring;
the wordmark is monoline paths (stroke 18, round caps) with "Games" in `--grad` colours.
- `entity-games-icon.svg` (512 viewBox, works on any background), `entity-games-logo.svg` (lockup for dark backgrounds),
  `entity-games-logo-light.svg` (navy text, for light backgrounds; since 2026-11-24 "Games" uses a 5-stop OKLCH
  blue-violet-pink-amber gradient, because the old two-stop `#1C74C9`→`#C77700` went grey-brown in the middle).
- Master copies and the generator for every Entity branch logo now live in the Entity repo:
  `D:\persional\Entity\Branding\logos\games\` (built by `Branding\logomaker\brands\build_logos.py`).
- PNG exports (headless Chromium via ClaudeTester's Playwright): `entity-games-icon-512.png` (full-bleed, opaque 32-bit,
  Play Games Services icon), `entity-games-feature-1024x500.png` (24-bit, no alpha, PGS feature graphic),
  `entity-games-og-1200x630.png`. The 512 and 1024x500 are also in `D:\persional\Entity\docs\games\brand\` for Play Console.
- Used on `/entity/` as the `.branch-brand` heading of the Games block (`#games`) inside `#ecosystem`.

### Entity ecosystem section (`/entity/#ecosystem`, 2026-11-24)

`#ecosystem` (in `entity/index.html`, styles in `company.css`) shows every Entity branch and app from
`D:\persional\Entity\ecosystem.json`. Structure: `.eco-intro` (Entity Corporation lockup, h2, lead, `.eco-jump` pill
links), then one `.eco-branch` per branch in this order: Games (`#games`), Finance (`#finance`), LMS (`#lms`),
Music (`#music`), Notification (`#notification`), Extensions (`#extensions`), AI Tools (`#aitools`).
- Each block: `h3.branch-brand` holding the branch `logo.svg` (alt = branch name, height `clamp(34px, 8.5vw, 52px)`),
  a one-line `.branch-lead`, then cards. Each block sets `style="--accent:<Accent A>"` (Branding/README.md palette),
  used as the 3 px top border of its `.eco-card`s.
- Games keeps the 7 `.game-card`s (headings are now `h4`) plus a "More games in the works" `.eco-grid` (Drop Sort, Loop Sort).
- `.eco-grid` / `.eco-card`: auto-fill min 240 px, 1 column under 520 px. Card = `h4` name, user-facing one-liner, badge.
- `.eco-badge` states (all >= 4.5:1 on `--surface`): `a.is-live` (`--ok` fill, navy text, links to the live app),
  `.is-soon` (amber text, amber tint, "Coming soon"), `.is-internal` (muted, dashed, "Internal tool").
- Branch logos are copies of `Branding\logos\<branch>\logo.svg` at `assets/images/entity/<branch>/logo.svg`
  (corporation, finance, lms, music, notification, extensions, aitools); Games still uses `entity-games/entity-games-logo.svg`.
- Rules: never link private GitHub repos; when an app is released, swap its `.is-soon` span for an `a.eco-badge.is-live`.

### Cost calculator (`/cost-calculator/`)

Same shell as the game pages (`.site-bar`, `.crumbs`, `.card`, `footer`, tokens.css + entity.css), plus
`assets/css/calculator.css`. `body.page-wide` widens main/bar/footer to 1160 px. `.calc-layout`: form cards
and, from 980 px, a sticky 380 px `.calc-summary`. Form (2026-11-19): `.calc-currency` (slim bar: "Show
prices in" + `.seg` pills + USD note), then `.calc-sec` section cards, each with a numbered `h2 .step`, a
`.sec-head` that may hold a `.sec-sub` pill (live "N selected - subtotal"), and a one-line `.sec-desc`:
1 Project type (`.sec-type`), 2 Core features (`.sec-core`, `#svc-core`), 3 Add-ons and extras
(`.sec-addon`, `#svc-addon`), 4 Delivery options (`.sec-options`, `.opt-list`: documentation, AI, deadline),
5 Support (`.sec-support`), and the summary is step 6. Each section sets `--accent` (3 px top rule, step
circle, checkbox colour): type `--line`, core `--blue`, add-ons `--amber`, options `--ok`, support `--muted`.
The summary repeats them as 9 px square dots (`.is-core` / `.is-addon` / `.is-options` / `.is-support`
set `--dot`) on the `.sum-group` headings and the `.is-sub` subtotal rows; `.is-part` rows (documentation,
AI, rush) are indented under Delivery options. Core vs add-on comes only from `services[].category`.
`.sum-lines` never scrolls on its own (every selected line is always rendered). From 980 px `.calc-aside`
stretches to the column height so `.calc-summary` can stick, and `fitSummary()` in `calculator.js` sets its
`top` to `min(16px, window height - summary height - 16px)`: a summary taller than the window sticks by its
bottom edge, so the total and buttons stay on screen and the top lines are reached by scrolling the page. Under 980 px a fixed `.calc-dock` shows the live total + "View estimate" and hides
itself (IntersectionObserver) while the summary is on screen. Blocks: `.seg` (currency radios as pills),
`.calc-note` (amber left border; the USD time-zone note), `.svc` rows (checkbox + name, qty + unit, cost;
stacks under 600 px), `.support-list`, `.sum-lines`, `.sum-table` (`.is-total` row in the display font),
`.sum-actions` (primary mailto, secondary Copy, `.btn-link` Start over). All DOM is built with
`textContent` in `calculator.js`; prices come only from the generated `pricing-data.js` (see README).

Home links: nav "Pricing", footer "Cost Calculator", and `.calc-cta` in `#contact` (`style.css`: surface
card with an amber left border, calculator icon, text, primary button; button goes full-width under 760 px).

### Google Play developer page links (2026-11-20)

`https://play.google.com/store/apps/dev?id=8198153788316941090` (canonical, no `&pli=1`), stored as `window.ENTITY_PLAY_DEVELOPER_URL` in
`assets/js/apps-data.js`; every link carries class `.play-dev-link` and the same URL as its fallback `href`.
Placement: hero `.social-link` (Font Awesome `fab fa-google-play`), end of the `.entity-brand` sentence (icon +
"Google Play developer page", `nowrap`), `#apps` `.apps-more` (flex row: `.btn.btn-secondary` "View all on
Google Play" - same pattern as the extensions' "View all on VS Code Marketplace" - plus the privacy-policies
link; the button goes full-width under 520 px), a "Google Play" `.contact-item`, the home footer, the résumé
`#entity-corporation` (an `.entity-more` line with the URL as text, `.entity-play` wraps anywhere; prints
readable), and each game page `<footer>` ("More from Entity on Google Play"). All open in a new tab with
`rel="noopener"`.

### Closed-testing (beta) links (2026-11-20)

Data: `testingUrl` per slug in `window.ENTITY_APPS` (`assets/js/apps-data.js`, next to `playUrl`), format
`https://play.google.com/apps/testing/<package>`; also written into the HTML as the no-JS fallback.
`assets/js/apps.js` sets the href of every `.app-test-link` inside a `[data-app]` element, or, when
`testingUrl` is empty, removes `.app-test-link` / `.app-test-help` and any `.beta-item` row (and sets
`hidden` on `#beta-test` when no row is left). The Production badge selector is
`.app-store-badge:not(.app-test-link)`, so both can coexist.

- Button: `a.app-store-badge.is-live.app-test-link` (the existing live Play badge look, `fab fa-android`
  icon, "Join the beta (Android)"), placed after the "Coming soon" badge in each `.app-actions` card and
  each game-page hero `.actions`; aria-label "Join the beta (Android): <Game> on Google Play (opens in a
  new tab)". Game pages add `a.app-test-help` "How to join the beta" -> `/#beta-test`.
- Help block (`style.css`): `aside.beta-help#beta-test` between `.apps-grid` and `.apps-more` - `--surface`,
  `--line` border, 3 px amber left border, `--radius-m` (same as `.entity-brand`); `h3` in the display
  font with an amber Android icon; intro + `.beta-steps` (`ol`, blue markers) + `.beta-note` (invitation:
  email the Play Gmail to the site's existing `mailto:` address) + `.beta-links` (grid, min 220 px, one
  column under 520 px) of `li.beta-item[data-app]` > `.btn.btn-secondary.btn-sm.app-test-link`.
- Print: `.beta-help` avoids page breaks, `.beta-links` is two columns and each button prints its URL
  (`::after { content: attr(href) }`).

### VS Code Extensions section (`#extensions`)

Data-driven: `assets/js/extensions-data.js` holds `window.VSCODE_EXTENSIONS` (one object per extension:
`id`, `name`, `description`, `features` (3-5), `icon`, `marketplace`, `source`) and `window.VSCODE_PUBLISHER_URL`
(the section's "View all on VS Code Marketplace" button). `assets/js/extensions.js` renders one `.ext-card` per
entry into `#extensions-grid` with DOM APIs (`textContent`, no HTML strings); never hand-write cards in
`index.html`. Leave `source` empty while a repo is private - a Source button that 404s for visitors is worse
than none. All buttons open in a new tab with `rel="noopener"` and an aria-label ending "(opens in a new tab)".

Card blocks (`style.css`): `.ext-grid` (auto-fill, min 440 px, one column on phones), `.ext-card` (`--surface`,
`--line` border, `--radius-l`, blue border on hover - same as `.app-card`), `.ext-head` > `.ext-icon` (72 px,
56 px under 520 px; `--icon-radius` + `--icon-shadow`) + `.ext-titles` > `.ext-tag` ("VS Code extension",
styled like `.tech-tag`) + `.ext-title`, `.ext-description` (`--muted`), `.ext-features` (blue square
bullets), `.ext-actions` (`.btn.btn-primary.btn-sm` Install + `.btn.btn-secondary.btn-sm` Source; full-width
stacked under 520 px). Icons live in `assets/images/extensions/` (square SVG, or 256 px WebP); prefer the
extension's own icon. Entity SVNWorkflow has no Marketplace icon, so its SVG is a `--surface-2` tile with
the extension's `media/svn.svg` branch glyph stroked in the `--grad` colours.

### Adding a game page

1. Copy `entity/games/entity-arrows/` to `entity/games/<slug>/` (both `index.html` and
   `privacy/index.html`) and replace the name, slug, package, tagline and texts. Use only facts from
   that game's README/docs. Keep the `data-app="<slug>"` on the hero card and the
   `.app-store-badge` inside it: that is what `assets/js/apps.js` turns into the Play link.
2. Head: keep the shared block (`theme-color`, favicon, fonts, Font Awesome on game pages,
   `/assets/css/tokens.css?v=3`, `/assets/css/entity.css?v=4`). Do not add inline styles; add
   classes to `entity.css`. Bump `?v=` on every page if you change the CSS a lot (cache busting).
3. Logo: `assets/images/apps/<slug>.webp`, generated only by `python tools/normalize_app_logos.py`
   (add the game to its `LOGOS` table: source file, crop `box` - `FULL` for full-bleed art,
   `INNER_TILE` for a tile inside a rim - and optional `watermark` boxes to inpaint). Every logo is
   512 px with the same 22% transparent rounded corners; CSS shows it with `--icon-radius` (22%)
   and `--icon-shadow` from `tokens.css`, never a background tile or border.
4. Home page: add an `<article class="app-card" id="app-<slug>" data-app="<slug>">` to `#apps` in
   `index.html` (copy an existing one), add `"<slug>": { playUrl: "", testingUrl: "" }` to `assets/js/apps-data.js` (plus, while it is in
   closed testing, the `.app-test-link` button and a `#beta-test` row - copy an existing game's), add the policy
   to `privacy/index.html`, and a redirect stub `privacy/<slug>/index.html` only if an old link exists.
5. Keep the empty `<!-- screenshots:start -->...<!-- screenshots:end -->` and
   `<!-- video:start -->...<!-- video:end -->` markers (after "About the game"), add
   `"<slug>": ""` to `tools/game_videos.json`, then run `python tools/sync_screenshots.py`.
6. Keep the footer's `.play-dev-link` ("More from Entity on Google Play") that comes with the copied page.
7. Check at 360 px and 1280 px (ClaudeTester, see below): no horizontal scroll, no broken images.

Useful page blocks in `entity.css`: `.card`, `.hero`, `.tagline`, `.actions`, `.chips`,
`.modes` > `.mode` (two-up blocks; `.mode.is-new` + `<span class="tag-new">New</span>` for a new
feature), `.muted`; policy pages add `class="card policy"`. Generated only (never hand-written):
`.shots` > `ul` > `li` > `a.shot` > `img` (gallery) and `.video-frame` > `iframe` (video).

### Screenshot gallery and video slot

Both are produced by `python tools/sync_screenshots.py` between the markers above; re-run it any time.

- **Gallery** (`#screenshots`): a focusable (`tabindex="0"`, `role="region"`, labelled) row that scrolls
  sideways with `scroll-snap-type: x mandatory` - swipe, trackpad, or Tab into it and use the arrow keys.
  No JS. Each shot is a phone frame: `--radius-l` corners, 5 px `--bg` bezel, 1 px `--line` border
  (`--blue` on hover), `--icon-shadow`; width `clamp(150px, 42vw, 220px)`, 9:16. Images are
  `loading="lazy"`, `width`/`height` set, `srcset` 540w/1080w; each links to its 1080 px WebP (open
  full size). Alt text = game name + label from the file name (`04-pop-combo.png` -> "Bubble Shooter –
  pop combo"). Sources: `D:\persional\Entity\docs\games\<slug>\screenshots\*.png`, name order. No
  PNGs -> a hidden empty card.
- **Video** (`#video`): renders only when `tools/game_videos.json` has an ID/URL for the slug -
  one line per game, e.g. `"entity-sudoku": "https://youtu.be/VIDEO_ID",` then re-run the script.
  Output: `youtube-nocookie.com/embed/<id>` iframe, `loading="lazy"`, `title` = "<Game> – gameplay
  video", inside `.video-frame` (16:9 via `aspect-ratio`, `--radius-m`, `--line` border).

### Local preview and visual check

```
cd D:\persional\Entity\Portfolio ; python -m http.server 8765 --bind 127.0.0.1
node E:\ClaudeTester\run.js set_project '{"project":"portfolio"}'
node E:\ClaudeTester\run.js navigate '{"url":"http://127.0.0.1:8765/"}'
```
Root-relative links (`/entity/...`, `/assets/...`) need the server root to be the repo folder.
Screenshots land in `E:\ClaudeTester\docs\portfolio\screenshots\`.

# Tabish Ali Mughal - Portfolio & Entity Developer Website

Tabish Ali Mughal's personal portfolio (home page + resume), which is also the **developer website
for the Entity apps & games** on Google Play: one page and one privacy policy per game, the AdMob
`app-ads.txt`, and the force-update manifest the games read.

**Live:** https://tabishalimughal.github.io

Static HTML/CSS/JS, no build step. Repo: `TabishAliMughal/TabishAliMughal.github.io`, branch `main`.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Home page: hero, About, Experience, Skills, AI-Enhanced Development, Projects, Apps & Games (`#apps`), Contact |
| `resume.html` | Resume + cover letters (dark on screen, plain light A4 when printed) |
| `assets/css/tokens.css` | Design tokens and shared base used by every page |
| `assets/css/style.css` | Home page layout |
| `assets/css/entity.css` | Game pages, privacy pages and `/privacy/` |
| `assets/js/apps-data.js` | Google Play URLs per game - the only place they are stored |
| `assets/js/apps.js` | Turns the "Coming soon" badge into a live Play link when a URL is set |
| `assets/js/script.js` | Home page behaviour, incl. the contact form (opens the visitor's email app; nothing is sent to a server) |
| `assets/images/apps/<slug>.webp` | Game logos (256 px) |
| `entity/games/<slug>/` | One page per game |
| `entity/games/<slug>/privacy/` | One privacy policy per game |
| `entity/games/manifest.json` | Force-update manifest (see below) |
| `privacy/` | Index of all policies; `privacy/<slug>/` are redirect stubs to the new policy locations, so old links keep working |
| `app-ads.txt` | AdMob authorisation (see below) |
| `.github/workflows/pages.yml` | GitHub Pages deploy |

Games (slugs): `entity-arrows`, `entity-sudoku`, `entity-tubes-game`, `entity-wordpuzzlematching`,
`entity-wordpuzzleselecting`, `entity-bricksbreaker`, `entity-bubbleshooter`.

## Important rules

- **`app-ads.txt` must stay at the repo root** and contain exactly:
  ```
  google.com, pub-9644064778878685, DIRECT, f08c47fec0942fa0
  ```
  AdMob looks for it at `<website>/app-ads.txt`; the Play listing "Website" field must be exactly
  `https://tabishalimughal.github.io`.
- **Do not move `entity/games/manifest.json`.** Every game's force-update check (`useForceUpdate`)
  reads `https://tabishalimughal.github.io/entity/games/manifest.json`. It is the only copy.
  Format, keyed by Android package:
  ```json
  { "com.entity.sudoku": { "latestVersionCode": 1, "minSupportedVersionCode": 1 } }
  ```
  After publishing a release: set that package's `latestVersionCode` to the new versionCode, set
  `minSupportedVersionCode = latestVersionCode - 2` (minimum 1) or higher to force an immediate
  update, then commit and push. Games cache the result for 6 hours but re-check on cold start.
- **Do not rename the repo.** `<user>.github.io` is what makes the site serve at the root URL; the
  app-ads.txt, manifest and Play Console privacy policy URLs all depend on it.
- Do not delete the `privacy/<slug>/` redirect stubs.

## Local preview

```
python -m http.server 8765 --bind 127.0.0.1
```

Run it from the repo root and open http://127.0.0.1:8765/. Links are root-relative (`/assets/...`,
`/entity/...`), so the server root must be the repo folder.

## Adding a Play Store link (one line)

When a game is live, paste its listing URL for that slug in `assets/js/apps-data.js`:

```js
"entity-sudoku": "https://play.google.com/store/apps/details?id=com.entity.sudoku",
```

Commit and push. The badge becomes "Get it on Google Play" on both the home card and the game page.

## Adding a game page

1. Copy `entity/games/entity-arrows/` (both `index.html` and `privacy/index.html`) to
   `entity/games/<slug>/` and replace name, slug, package, tagline and texts (facts only from that
   game's README/docs). Keep `data-app="<slug>"` and the `.app-store-badge` in the hero card.
2. Keep the shared head block (`/assets/css/tokens.css`, `/assets/css/entity.css`); no inline styles.
3. Add the logo `assets/images/apps/<slug>.webp` (256 px, from the game's `assets/icon.png`).
4. Add an `<article class="app-card" id="app-<slug>" data-app="<slug>">` to `#apps` in `index.html`,
   `"<slug>": ""` to `assets/js/apps-data.js`, the policy to `privacy/index.html`, and the package to
   `entity/games/manifest.json`.
5. Check at 360 px and 1280 px: no horizontal scroll, no broken images.

## Deployment

Push to `main`. `.github/workflows/pages.yml` copies the repo root (minus `.git`, `.github` and
`assets/scripts`) into `_site` and deploys it with GitHub Actions Pages (Settings > Pages > Source =
GitHub Actions). Live in about a minute.

## Design system

Dark only, one set of tokens for every page, echoing the Entity game logos: deep navy `#0A1528`, a
faint circuit-board grid, and a blue (`#5BB8FF`) -> amber (`#FFB648`) gradient for display text.
Fonts: Unbounded (display headings) and IBM Plex Sans (everything else). All text pairs >= 4.5:1
contrast; amber focus ring; `prefers-reduced-motion` respected. Full token table, page blocks and
the detailed game-page steps: [docs/DESIGN.md](./docs/DESIGN.md).

## Tasks Completed

2026-11-17:
- Dark redesign with one shared design system (`tokens.css`, `style.css`, `entity.css`).
- Apps & Games section on the home page, with Play links driven by `apps-data.js`.
- Per-game pages at `/entity/games/<slug>/`.
- Privacy policies moved to `/entity/games/<slug>/privacy/`; `/privacy/<slug>/` kept as redirects.
- Contact details linked (social links; contact form now opens the visitor's email app).
- Force-update manifest moved to `/entity/games/manifest.json`.
- Experience updated: Connect Communications roles dated, Team Lead from Oct 2026.

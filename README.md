# Homestyle Recipe Book

A data-driven static recipe site — 30 recipes, real licensed photography,
client-side search, a warm light/dark design system, and full SEO/structured
data. No framework, no npm dependencies, no build step for visitors: GitHub
Pages serves committed HTML/CSS/JS directly.

---

## What this is

| | |
|---|---|
| **Content** | 30 recipes across 6 categories (breakfast, appetizers, mains, vegetarian, desserts, drinks), each with ingredients, numbered steps, timers, nutrition estimates, and a servings scaler |
| **Photos** | Real, freely-licensed images (CC0 / CC BY / CC BY-SA), hand-picked from a visually-reviewed contact sheet — never auto-selected — with full attribution on [`credits.html`](credits.html) |
| **Search** | Client-side filter by name/ingredient, category, and dietary tag, plus sort — all as progressive enhancement over server-rendered HTML that works with JS off |
| **Design** | Cream/terracotta light theme, charcoal/ember dark theme, explicit toggle honoring `prefers-color-scheme`, WCAG-checked contrast in both |
| **SEO** | Per-recipe `schema.org/Recipe` + `BreadcrumbList` JSON-LD, sitemap, canonical URLs, Open Graph images |
| **Generator** | `data/recipes.json` is the single source of truth; `tools/build.js` renders every HTML page, the sitemap, and the search index from it |

## Prerequisites

- Node.js (no npm packages — standard library only)
- Python 3 (for the local dev server)
- ImageMagick `convert` (only needed to rebuild images from source photos)

## Quick start

```bash
git clone git@github.com:samiulAsumel/recipe-vault.git
cd recipe-vault
python3 -m http.server 7800
# open http://localhost:7800/
```

Nothing needs building to view the site — every HTML file is committed.
The commands below are only for editing content.

## Editing a recipe

Edit `data/recipes.json`, then rebuild:

```bash
node tools/build.js       # regenerates every HTML page, sitemap, and search index
node tools/verify.js      # the gate: links, structure, a11y, JSON-LD, contrast
```

Adding a new recipe also needs a photo:

```bash
node tools/fetch-images.js search <slug>     # writes a labeled contact sheet to review
node tools/fetch-images.js pick <slug> <n>   # downloads the chosen candidate, writes attribution
node tools/make-images.js                    # crops to 3:2, generates WebP/JPEG at 400/800/1200px
node tools/build.js
```

Image selection is human-in-the-loop by design — title-matched search results
include plenty of product packaging and supermarket shelves, so every photo
is chosen by looking at the sheet, not automatically.

## Project structure

```
data/
  site.json          nav, category/diet enums, baseUrl/basePath
  recipes.json        every recipe -- the single source of truth
tools/
  build.js            orchestrator: validate -> render -> write -> prune -> manifest
  fetch-images.js      Openverse/Commons search + license filter + attribution
  make-images.js       local-only: crop/resize/WebP, no network
  verify.js            the verification gate
  lib/
    html.js, paths.js, duration.js, format.js   escaping, URLs, ISO durations, quantities
    jsonld.js, searchindex.js, license.js, imagesearch.js
    shell.js, partials.js, raw.js               shared page chrome
    pages/            one render function per page type
    verify/            link/structure/JSON-LD/contrast checks
assets/
  css/site.css         design tokens, reset, layout, both themes
  css/print.css        recipe-page print styles
  js/                  theme.js, nav.js, search.js, recipe.js
  images/recipes/      generated WebP + JPEG derivatives (committed)
  images/og/           generated Open Graph cards (committed)
recipes/*.html          generated, one per recipe
categories/*.html       generated, one per category
index.html, about.html, credits.html, submit-recipe.html, 404.html   generated
```

Everything under `tools/`, `assets/css/`, `assets/js/*.js` (except
`recipes-index.js`), and `favicon.svg` is hand-written. Everything else is
generated from `data/*.json` — a banner comment on the second line of each
generated file says so, and `tools/build.js` overwrites hand edits on the
next run.

## Author

Samiul A. Sumel

## License

Site code (HTML generator, CSS, JS) is original work. Recipe photos are
freely-licensed third-party images; see [`credits.html`](credits.html) for
the license and attribution of each one.

# Homestyle Recipe Book — Project Notes

Static recipe site. No framework, no npm dependencies, no build step for
visitors — GitHub Pages serves committed HTML/CSS/JS directly. The only
build step is a dev-time Node generator that turns `data/recipes.json`
into the committed `recipes/*.html`, `categories/*.html`, `index.html`,
`sitemap.xml`, and `assets/js/recipes-index.js`.

## Source of truth

- `data/recipes.json` — every recipe. Edit here, never edit a generated
  page by hand (its second line says so; `tools/build.js` overwrites it).
- `data/site.json` — nav, category/diet enums, `baseUrl`/`basePath`.
- Anything under `assets/css/`, `assets/js/*.js` (except
  `recipes-index.js`), `favicon.svg`, and `tools/` is hand-written and
  the build never touches it.

## Workflow

```
node tools/build.js            # regenerate HTML from data/*.json
node tools/fetch-images.js     # --dry-run first: license report before any download
node tools/make-images.js      # local-only: crop/resize/webp, no network
node tools/verify.js           # the gate — links, structure, a11y, JSON-LD, contrast
python3 -m http.server 7800    # serve locally; this is the fixed dev port
```

`make build && make build && git diff --stat` must be empty — the
generator is idempotent by construction. If it isn't, something in
`tools/build.js` depends on wall-clock time, `Math.random()`, or
unsorted iteration order; those are bugs, not acceptable variance.

## Constraints that aren't obvious from the code

- This is a GitHub Pages **project** site (served under
  `/homestyle-recipe-book/`), so every internal link must be
  depth-relative via `tools/lib/paths.js`. `404.html` is the one
  exception — its own depth is unknowable, so it uses
  `basePath`-absolute URLs.
- No HTML validator (`tidy`/`vnu`/`lighthouse`) is installed on this
  machine. `tools/verify.js` is the only gate there is — treat it as
  load-bearing, not optional.
- Scroll-reveal must default to visible in CSS; JS only adds a
  pre-reveal class immediately before observing. Headless Chrome does
  not reliably fire `IntersectionObserver`, so the CSS default is what
  keeps automated screenshots from coming back blank.
- Nutrition values are estimates, not lab-tested — never remove the
  `nutrition.basis` disclaimer. Never fabricate ratings, review counts,
  or named human authors/quote sources.
- Images are real, freely-licensed photos (CC0/CC BY/CC BY-SA) with
  attribution recorded in `data/recipes.json` and surfaced on
  `credits.html`. Recipe selection was driven by which dishes had a
  genuinely good, professionally-lit free photo — title-matched search
  results include plenty of packaging and supermarket-shelf photos that
  a contact-sheet visual review rejects.

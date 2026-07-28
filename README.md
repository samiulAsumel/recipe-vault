# World Kitchen Atlas

A global culinary encyclopedia organized by continent → country → dish, with history, occasion, and traditional drink pairings for every entry.

Build spec: [`docs/RECIPE_SITE_REBUILD_INSTRUCTION.md`](docs/RECIPE_SITE_REBUILD_INSTRUCTION.md).

## Stack

- Next.js App Router, `output: 'export'` — pure static HTML/CSS/JS, no server runtime
- Deployed to Cloudflare Pages as a static site
- Recipe data lives in the private repo `samiulAsumel/world-kitchen-atlas-data`
  (`recipes/{country-slug}.json`, one JSON array of dish entries per country — see Section 4 of
  the build spec), read through the `world-kitchen-atlas-proxy` Cloudflare Worker (`worker/index.ts`)
  so the GitHub token never leaves the Worker. The Next.js build fetches from the Worker at build
  time (`lib/data/source.ts`), never from the browser — see "Data layer" below.
- Other dynamic bits (admin login, visit counters — later phases) will live in the same Worker,
  called via `fetch()` from the frontend
- Tailwind CSS v4, design tokens as CSS custom properties (`app/globals.css`)

## Getting started

```bash
npm install
cp .env.example .env.local   # set DATA_API_URL to the deployed Worker URL
npm run dev    # http://localhost:3000
npm run build  # static export to out/
npm run lint
```

This repo lives on an exFAT-mounted drive, which doesn't support symlinks. `.npmrc` sets `bin-links=false` so `npm install` doesn't fail on `node_modules/.bin` symlinks — the `scripts` in `package.json` invoke the Next.js/ESLint/Wrangler binaries directly via `node node_modules/...` instead of relying on those links.

## Data layer

`world-kitchen-atlas-proxy` (`worker/index.ts`, deployed via `wrangler`) is a read-only proxy in
front of the GitHub Contents API for the private `world-kitchen-atlas-data` repo:

| Route | Returns |
|---|---|
| `GET /` | `{ countries: CountrySummary[] }` |
| `GET /dishes` | every dish entry across every country, merged |
| `GET /countries/{slug}` | one country's entries (`X-Data-Sha` header), 404 if unknown |

```bash
# local development — put the PAT in .dev.vars (gitignored), never commit it
echo 'GITHUB_TOKEN=...' > .dev.vars
npm run worker:dev

# deploy
node node_modules/wrangler/bin/wrangler.js secret put GITHUB_TOKEN
npm run worker:deploy
```

`DATA_API_URL` (Next.js side, build-time only, not `NEXT_PUBLIC_`-prefixed) points at the deployed
Worker. `lib/data/source.ts` fetches `/dishes` once per build (memoised) and `lib/data/filters.ts`
implements Section 6's combinable filters as pure functions reused later by the client-side search
page.

**Known gap:** because the site is a static export, a recipe committed to the data repo does not
appear on the live site until Cloudflare Pages rebuilds. Wiring a data-repo → Pages deploy hook is
deferred to Phase 7/8 (once the admin panel can write data).

**Hard requirement discovered while building this phase:** under `output: 'export'`, Next.js fails
the *entire* `next build` — not just the affected route — if any dynamic segment's
`generateStaticParams()` returns zero entries (confirmed against Next.js 16.2.12: `/[continent]/[country]`
and `/[continent]/[country]/[dish]` both throw `"is missing generateStaticParams()"` on an empty
array, even though the function is present and correctly returns `[]`). Practically: **`npm run
build` cannot succeed again until `world-kitchen-atlas-data` has at least one country file with at
least one dish**, i.e. Phase 8 (seed data) is no longer optional-until-later — it's a build
blocker, and must land before this site can be deployed. Verified locally by pointing
`DATA_API_URL` at a throwaway stub server: with one seeded dish the build produced
`/asia/bangladesh` and `/asia/bangladesh/test-dish` correctly and the old `sample-country` /
`sample-dish` paths were gone.

## Status

Phase 2 (data layer + Worker read endpoint) complete: recipe schema (`lib/types/recipe.ts`), the
Worker above, and the build-time loader are wired into `generateStaticParams` for the continent/
country/dish routes — verified end-to-end against a stub API returning one seeded dish (see above).
The real data repo has no content yet, so **`npm run build` will currently fail** until at least
one recipe is added; see the hard requirement noted above. Real UI wiring is Phase 3+. See Section
9 of the build spec for the remaining phases.

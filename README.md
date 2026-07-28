# World Kitchen Atlas

A global culinary encyclopedia organized by continent → country → dish, with history, occasion, and traditional drink pairings for every entry.

Build spec: [`docs/RECIPE_SITE_REBUILD_INSTRUCTION.md`](docs/RECIPE_SITE_REBUILD_INSTRUCTION.md).

## Stack

- Next.js App Router, `output: 'export'` — pure static HTML/CSS/JS, no server runtime
- Deployed to Cloudflare Pages as a static site
- Dynamic bits (admin login, visit counters) live in a separate Cloudflare Worker, called via `fetch()` from the frontend
- Tailwind CSS v4, design tokens as CSS custom properties (`app/globals.css`)

## Getting started

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static export to out/
npm run lint
```

This repo lives on an exFAT-mounted drive, which doesn't support symlinks. `.npmrc` sets `bin-links=false` so `npm install` doesn't fail on `node_modules/.bin` symlinks — the `scripts` in `package.json` invoke the Next.js/ESLint binaries directly via `node node_modules/...` instead of relying on those links.

## Status

Phase 1 (scaffold) complete: folder structure, empty routes, design tokens wired up. See Section 9 of the build spec for the remaining phases.

# Seed data (Phase 11 / Section 13 test)

Five full recipes, one per continent, researched and written following the Section 13
content-addition workflow: Kacchi Biryani (Bangladesh/Asia), Osso Buco alla Milanese
(Italy/Europe), Pastilla (Morocco/Africa), Cochinita Pibil (Mexico/Americas), Hangi (New
Zealand/Oceania). All five are picked from `World_Kitchen_Atlas_FINAL_Recipe_List.md`, not
invented, and each file is already validated against `types/recipe.ts`'s `FullRecipe` shape.

**These files are not read by the app.** The private data repo (`recipes/{country-slug}.json`)
didn't have real credentials configured when this phase ran, so these live here as staging
copies, one file per country, in the exact shape the real repo expects.

## To deploy for real

Once `.dev.vars` (or the production Worker secrets) has real `GITHUB_OWNER` / `GITHUB_REPO` /
`GITHUB_TOKEN`, copy each file's array into the matching `recipes/{country-slug}.json` in that
repo (merging with whatever's already there rather than overwriting, if the country file
already exists) - or ask Claude Code to do it directly via the same `upsertDish` path the admin
panel's Manage Recipes tab uses.

## Image sourcing (Section 13 step 3, not done here)

Every `heroImage` path below points to `/images/{country}/{slug}-1.jpg`, following the site's
naming convention, but no actual image file exists yet - sourcing one (Unsplash/Pexels/Pixabay
API, or AI-generated as a fallback) needs API credentials that weren't available in this phase.

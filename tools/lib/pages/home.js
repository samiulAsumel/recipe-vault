'use strict';

const { esc, attr } = require('../html');
const { rel } = require('../paths');
const shell = require('../shell');
const { recipeCard, filterBar } = require('../partials');

const DEPTH = 0;

function categoryTile(key, cat, count) {
  return `<a class="category-tile" href=${attr(rel(DEPTH, `categories/${key}.html`))}>
    <h3>${esc(cat.label)}</h3>
    <p>${esc(cat.description)}</p>
    <span class="category-count">${count} recipe${count === 1 ? '' : 's'}</span>
  </a>`;
}

// All 30 cards ship as real HTML here -- assets/js/search.js only hides/shows
// and reorders what's already in the DOM, so a JS-off visitor still sees
// every recipe and every category link, just without the filter bar.
function renderHome(recipes, site) {
  const featured = recipes.filter((r) => r.featured);
  const byCategory = {};
  for (const r of recipes) byCategory[r.category] = (byCategory[r.category] || 0) + 1;

  const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'en'));

  const html = shell.head(site, {
    depth: DEPTH,
    path: 'index.html',
    title: `${site.siteName} -- ${site.tagline}`,
    description: site.description,
  }) + `
  <!-- Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'index.html' })}
  <main id="main-content">
    <section class="hero">
      <h1>${esc(site.siteName)}</h1>
      <p>${esc(site.description)}</p>
      <a class="button" href="#all">Browse all recipes</a>
    </section>

    <section class="featured" aria-labelledby="featured-heading">
      <h2 id="featured-heading">Featured Recipes</h2>
      <div class="card-grid">
        ${featured.map((r) => recipeCard(r, site, DEPTH)).join('\n        ')}
      </div>
    </section>

    <section class="categories" aria-labelledby="categories-heading">
      <h2 id="categories-heading">Browse by Category</h2>
      <div class="category-grid">
        ${Object.entries(site.categories)
          .map(([key, cat]) => categoryTile(key, cat, byCategory[key] || 0))
          .join('\n        ')}
      </div>
    </section>

    <section class="all-recipes" id="all" aria-labelledby="all-heading">
      <h2 id="all-heading">All Recipes</h2>
      ${filterBar(site)}
      <div class="card-grid" id="recipe-grid">
        ${sorted.map((r) => recipeCard(r, site, DEPTH)).join('\n        ')}
      </div>
    </section>

    <aside class="kitchen-wisdom" aria-labelledby="tip-heading">
      <h2 id="tip-heading">Kitchen Wisdom</h2>
      <blockquote>
        <p>Salt in stages, taste as you go -- a dish seasoned only once is a dish seasoned by guesswork.</p>
      </blockquote>
      <p>-- House Kitchen Notes</p>
    </aside>
  </main>
  ` + shell.footer(site, { depth: DEPTH, extraScripts: ['assets/js/recipes-index.js', 'assets/js/search.js'] });

  return html;
}

module.exports = { renderHome, DEPTH };

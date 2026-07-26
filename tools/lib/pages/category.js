'use strict';

const { esc, attr } = require('../html');
const { rel } = require('../paths');
const shell = require('../shell');
const { recipeCard } = require('../partials');
const { breadcrumbLD } = require('../jsonld');

const DEPTH = 1; // categories/<key>.html

// A real, linkable, crawlable slice of the catalogue -- distinct from the
// home page's search grid so a category link is a genuine navigation
// target, not just a pre-filled filter state.
function renderCategory(key, cat, recipes, site) {
  const path = `categories/${key}.html`;
  const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'en'));

  const html = shell.head(site, {
    depth: DEPTH,
    path,
    title: `${cat.label} Recipes -- ${site.siteName}`,
    description: cat.description,
    ldBlocks: [
      breadcrumbLD([{ name: 'Home', href: 'index.html' }, { name: cat.label, href: path }], site),
    ],
  }) + `
  <!-- Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'index.html#all' })}
  <main id="main-content">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href=${attr(rel(DEPTH, 'index.html'))}>Home</a></li>
        <li aria-current="page">${esc(cat.label)}</li>
      </ol>
    </nav>
    <section class="category-page" aria-labelledby="category-heading">
      <h1 id="category-heading">${esc(cat.label)}</h1>
      <p>${esc(cat.description)}</p>
      <p class="category-search-link"><a href=${attr(rel(DEPTH, `index.html?category=${key}`))}>Search within ${esc(cat.label)}</a></p>
      <div class="card-grid">
        ${sorted.map((r) => recipeCard(r, site, DEPTH)).join('\n        ')}
      </div>
    </section>
  </main>
  ` + shell.footer(site, { depth: DEPTH });

  return html;
}

module.exports = { renderCategory, DEPTH };

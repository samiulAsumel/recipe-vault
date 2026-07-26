'use strict';

const { esc, attr } = require('./html');
const { rel } = require('./paths');
const { humanTime } = require('./duration');
const raw = require('./raw');

function pictureSources(depth, slug, alt, sizesAttr) {
  const base = rel(depth, `assets/images/recipes/${slug}`);
  return `<picture>
    <source type="image/webp" srcset="${base}-400.webp 400w, ${base}-800.webp 800w, ${base}-1200.webp 1200w" sizes=${attr(sizesAttr)} />
    <img src=${attr(base + '-800.jpg')} srcset="${base}-400.jpg 400w, ${base}-800.jpg 800w, ${base}-1200.jpg 1200w"
      sizes=${attr(sizesAttr)} alt=${attr(alt)} width="1200" height="800" loading="lazy" decoding="async" />
  </picture>`;
}

// Every attribute a card carries doubles as the client-side filter's data
// source -- assets/js/search.js reads these directly rather than fetching
// or re-deriving them, so the DOM stays the single source of truth.
function recipeCard(recipe, site, depth) {
  const total = recipe.times.prepMinutes + recipe.times.cookMinutes + (recipe.times.restMinutes || 0);
  const href = rel(depth, `recipes/${recipe.slug}.html`);
  const dietary = (recipe.dietary || []).join(' ');
  return `<article class="card" data-slug=${attr(recipe.slug)} data-category=${attr(recipe.category)}
    data-dietary=${attr(dietary)} data-difficulty=${attr(recipe.difficulty)} data-total=${attr(String(total))}
    data-published=${attr(recipe.published)} data-title=${attr(recipe.title.toLowerCase())}>
    <a class="card-media" href=${attr(href)} tabindex="-1" aria-hidden="true">
      ${pictureSources(depth, recipe.slug, recipe.image.alt, '(min-width: 1000px) 340px, (min-width: 640px) 45vw, 92vw')}
    </a>
    <div class="card-body">
      <p class="card-category">${esc(site.categories[recipe.category].label)}</p>
      <h3 class="card-title"><a href=${attr(href)}>${esc(recipe.title)}</a></h3>
      <p class="card-tagline">${esc(recipe.tagline)}</p>
      <div class="card-meta">
        <span>${raw.ICON_CLOCK} ${esc(humanTime(total) || '-')}</span>
        <span>${raw.ICON_DIFFICULTY} ${esc(site.difficulty[recipe.difficulty])}</span>
      </div>
    </div>
  </article>`;
}

function nutritionTable(nutrition) {
  const rows = [
    ['Calories', `${nutrition.calories} kcal`],
    ['Total Fat', `${nutrition.fatG} g`],
    ['Saturated Fat', `${nutrition.saturatedFatG} g`],
    ['Carbohydrates', `${nutrition.carbsG} g`],
    ['Fiber', `${nutrition.fiberG} g`],
    ['Sugar', `${nutrition.sugarG} g`],
    ['Protein', `${nutrition.proteinG} g`],
    ['Sodium', `${nutrition.sodiumMg} mg`],
    ['Cholesterol', `${nutrition.cholesterolMg} mg`],
  ];
  const body = rows
    .map(([label, value]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`)
    .join('\n          ');
  return `<table>
        <caption>Per serving (${esc(nutrition.servingSize)}) -- estimated, not lab-tested.</caption>
        <colgroup><col /><col /></colgroup>
        <thead><tr><th scope="col">Nutrient</th><th scope="col">Amount</th></tr></thead>
        <tbody>
          ${body}
        </tbody>
        <tfoot>
          <tr><td colspan="2">Values are estimates based on standard ingredient data, not laboratory analysis.</td></tr>
        </tfoot>
      </table>`;
}

function attributionLine(image) {
  if (!image.source) return '';
  const s = image.source;
  return `<p class="attribution">Photo: <a href=${attr(s.descriptionUrl)}>${esc(s.artist || 'Unknown')}</a>,
    <a href=${attr(s.license.url)}>${esc(s.license.name)}</a>. ${esc(s.modifications || '')}</p>`;
}

function filterBar(site) {
  const categoryOptions = Object.entries(site.categories)
    .map(([key, cat]) => `<option value=${attr(key)}>${esc(cat.label)}</option>`)
    .join('\n          ');
  const dietChips = Object.entries(site.dietary)
    .map(([key, label]) => `<button type="button" class="chip" data-diet=${attr(key)} aria-pressed="false">${esc(label)}</button>`)
    .join('\n        ');

  return `<div class="filter-bar js-only" id="filter-bar">
      <div class="filter-row">
        <label class="visually-hidden" for="recipe-search">Search recipes</label>
        <div class="search-input">
          ${raw.ICON_SEARCH}
          <input type="search" id="recipe-search" placeholder="Search by name or ingredient..." autocomplete="off" />
        </div>
        <label class="visually-hidden" for="category-select">Filter by category</label>
        <select id="category-select">
          <option value="all">All categories</option>
          ${categoryOptions}
        </select>
        <label class="visually-hidden" for="sort-select">Sort recipes</label>
        <select id="sort-select">
          <option value="az">A-Z</option>
          <option value="quick">Quickest first</option>
          <option value="new">Newest</option>
        </select>
      </div>
      <div class="filter-row filter-chips" role="group" aria-label="Filter by dietary tag">
        ${dietChips}
      </div>
      <p id="filter-status" role="status" aria-live="polite"></p>
      <div id="empty-state" hidden>
        <p>No recipes match those filters.</p>
        <button type="button" id="clear-filters">Clear filters</button>
      </div>
    </div>`;
}

module.exports = { pictureSources, recipeCard, nutritionTable, attributionLine, filterBar };

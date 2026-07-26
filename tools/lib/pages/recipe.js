'use strict';

const { esc, attr } = require('../html');
const { rel } = require('../paths');
const { humanTime } = require('../duration');
const { formatIngredientLine } = require('../format');
const { recipeLD, breadcrumbLD } = require('../jsonld');
const shell = require('../shell');
const { pictureSources, nutritionTable, attributionLine, recipeCard } = require('../partials');
const raw = require('../raw');

const DEPTH = 1; // recipes/<slug>.html

function ingredientGroup(group) {
  const items = group.items
    .map((item) => {
      // data-rest is the item+note text exactly as formatIngredientLine
      // renders it, server-side -- the scaler reads it directly rather
      // than reverse-parsing quantity tokens out of the rendered string,
      // which breaks the moment a scaled quantity spans two words (e.g.
      // a mixed number like "1 1/2").
      const rest = item.item + (item.note ? ', ' + item.note : '');
      const scaleAttrs = item.scalable
        ? ` data-qty=${attr(String(item.quantity))} data-unit=${attr(item.unit || '')} data-rest=${attr(rest)}`
        : '';
      return `<li${scaleAttrs}><span class="ingredient-text">${esc(formatIngredientLine(item))}</span></li>`;
    })
    .join('\n          ');
  const heading = group.heading ? `<h4>${esc(group.heading)}</h4>` : '';
  return `<div class="ingredient-group">
        ${heading}
        <ul class="ingredient-list">
          ${items}
        </ul>
      </div>`;
}

function stepItem(step, index) {
  const timer = step.timerMinutes
    ? `<span class="step-timer" data-minutes=${attr(String(step.timerMinutes))}>${raw.ICON_CLOCK} ${step.timerMinutes} min</span>`
    : '';
  const tip = step.tip ? `<p class="step-tip">${esc(step.tip)}</p>` : '';
  return `<li>
        <label class="step-row">
          <input type="checkbox" class="step-check" data-step=${attr(String(index))} />
          <span class="step-text">${esc(step.text)}</span>
        </label>
        ${timer}
        ${tip}
      </li>`;
}

function relatedCards(recipe, allRecipes, site) {
  const related = (recipe.related || [])
    .map((slug) => allRecipes.find((r) => r.slug === slug))
    .filter(Boolean);
  if (!related.length) return '';
  return `<nav class="related-recipes" aria-label="Related recipes">
      <h2>More Recipes</h2>
      <div class="card-grid">
        ${related.map((r) => recipeCard(r, site, DEPTH)).join('\n        ')}
      </div>
    </nav>`;
}

function renderRecipe(recipe, allRecipes, site) {
  const total = recipe.times.prepMinutes + recipe.times.cookMinutes + (recipe.times.restMinutes || 0);
  const path = `recipes/${recipe.slug}.html`;
  const categoryLabel = site.categories[recipe.category].label;
  const dietChips = (recipe.dietary || [])
    .map((d) => `<span class="tag">${esc(site.dietary[d])}</span>`)
    .join('\n            ');
  const notes = (recipe.notes || [])
    .map((note) => `<li>${esc(note)}</li>`)
    .join('\n          ');

  const html = shell.head(site, {
    depth: DEPTH,
    path,
    title: `${recipe.title} -- ${site.siteName}`,
    description: recipe.description,
    ogType: 'article',
    ogImage: `assets/images/og/${recipe.slug}-og.jpg`,
    ldBlocks: [
      recipeLD(recipe, site),
      breadcrumbLD(
        [
          { name: 'Home', href: 'index.html' },
          { name: categoryLabel, href: `categories/${recipe.category}.html` },
          { name: recipe.title, href: path },
        ],
        site,
      ),
    ],
  }) + `
  <!-- Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'index.html#all' })}
  <main id="main-content">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href=${attr(rel(DEPTH, 'index.html'))}>Home</a></li>
        <li><a href=${attr(rel(DEPTH, `categories/${recipe.category}.html`))}>${esc(categoryLabel)}</a></li>
        <li aria-current="page">${esc(recipe.title)}</li>
      </ol>
    </nav>
    <article class="recipe">
      <header class="recipe-header">
        <p class="card-category">${esc(categoryLabel)}</p>
        <h1>${esc(recipe.title)}</h1>
        <p class="recipe-tagline">${esc(recipe.tagline)}</p>
        <div class="tag-row">
          ${dietChips}
        </div>
      </header>

      <figure class="recipe-hero">
        ${pictureSources(DEPTH, recipe.slug, recipe.image.alt, '(min-width: 900px) 720px, 100vw')}
        <figcaption>${esc(recipe.image.caption || '')}</figcaption>
      </figure>

      <div class="recipe-meta">
        <div class="meta-item"><span class="meta-label">${raw.ICON_CLOCK} Prep</span><span>${esc(humanTime(recipe.times.prepMinutes) || '--')}</span></div>
        <div class="meta-item"><span class="meta-label">${raw.ICON_CLOCK} Cook</span><span>${esc(humanTime(recipe.times.cookMinutes) || '--')}</span></div>
        <div class="meta-item"><span class="meta-label">${raw.ICON_CLOCK} Total</span><span>${esc(humanTime(total) || '--')}</span></div>
        <div class="meta-item"><span class="meta-label">${raw.ICON_SERVINGS} Servings</span>
          <span class="servings-control">
            <button type="button" class="js-only" id="servings-minus" aria-label="Decrease servings">-</button>
            <span id="servings-count" data-base=${attr(String(recipe.servings))}>${recipe.servings}</span>
            <button type="button" class="js-only" id="servings-plus" aria-label="Increase servings">+</button>
            <span> ${esc(recipe.servingUnit)}</span>
          </span>
        </div>
        <div class="meta-item"><span class="meta-label">${raw.ICON_DIFFICULTY} Difficulty</span><span>${esc(site.difficulty[recipe.difficulty])}</span></div>
      </div>

      <p class="recipe-description">${esc(recipe.description)}</p>

      <div class="recipe-body">
        <section class="ingredients" aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading">Ingredients</h2>
          ${recipe.ingredientGroups.map(ingredientGroup).join('\n        ')}
        </section>

        <section class="instructions" aria-labelledby="steps-heading">
          <h2 id="steps-heading">Instructions</h2>
          <ol class="step-list">
            ${recipe.steps.map(stepItem).join('\n          ')}
          </ol>
        </section>
      </div>

      ${notes ? `<section class="recipe-notes" aria-labelledby="notes-heading">
        <h2 id="notes-heading">Notes</h2>
        <ul>
          ${notes}
        </ul>
      </section>` : ''}

      <section class="nutrition" aria-labelledby="nutrition-heading">
        <h2 id="nutrition-heading">Nutrition Facts</h2>
        ${nutritionTable(recipe.nutrition)}
      </section>

      ${attributionLine(recipe.image)}
    </article>

    ${relatedCards(recipe, allRecipes, site)}
  </main>
  ` + shell.footer(site, { depth: DEPTH, extraScripts: ['assets/js/recipe.js'] });

  return html;
}

module.exports = { renderRecipe, DEPTH };

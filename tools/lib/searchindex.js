'use strict';

const { jsLiteral } = require('./html');

function foldDiacritics(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function haystackFor(recipe) {
  const words = [
    recipe.title, recipe.tagline, recipe.category, recipe.cuisine,
    ...(recipe.keywords || []),
    ...recipe.ingredientGroups.flatMap((g) => g.items.map((item) => item.item)),
  ];
  const tokens = foldDiacritics(words.join(' ').toLowerCase())
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return [...new Set(tokens)].join(' ');
}

// A bare top-level const, never `window.RECIPES_INDEX` -- consumers guard
// with a typeof check so a blocked or stale script degrades to DOM-only
// title matching instead of throwing.
function renderSearchIndex(recipes) {
  const entries = [...recipes]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((r) => ({ slug: r.slug, haystack: haystackFor(r) }));
  return `'use strict';\n/* Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. */\nconst RECIPES_INDEX = ${jsLiteral(entries)};\n`;
}

module.exports = { renderSearchIndex, haystackFor };

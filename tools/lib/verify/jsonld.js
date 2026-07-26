'use strict';

const DURATION_RE = /^PT(\d+H)?(\d+M)?$/;
const REQUIRED_RECIPE_FIELDS = ['name', 'description', 'image', 'recipeIngredient', 'recipeInstructions', 'nutrition'];

function checkJsonLd(html, file, errors) {
  const blocks = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g));
  for (const [, raw] of blocks) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      errors.push(`${file}: invalid JSON-LD (${e.message})`);
      continue;
    }
    if (data['@type'] === 'Recipe') {
      for (const field of REQUIRED_RECIPE_FIELDS) {
        if (!(field in data)) errors.push(`${file}: Recipe JSON-LD missing "${field}"`);
      }
      for (const key of ['prepTime', 'cookTime', 'totalTime']) {
        if (data[key] && !DURATION_RE.test(data[key])) {
          errors.push(`${file}: Recipe JSON-LD ${key}="${data[key]}" does not match ISO 8601 PT#H#M`);
        }
      }
      if ('aggregateRating' in data || 'review' in data) {
        errors.push(`${file}: Recipe JSON-LD has a fabricated aggregateRating/review field`);
      }
    } else if (data['@type'] === 'BreadcrumbList') {
      if (!Array.isArray(data.itemListElement) || !data.itemListElement.length) {
        errors.push(`${file}: BreadcrumbList JSON-LD has no itemListElement`);
      }
    } else if (data['@type']) {
      errors.push(`${file}: unrecognized JSON-LD @type "${data['@type']}"`);
    }
  }
}

module.exports = { checkJsonLd };

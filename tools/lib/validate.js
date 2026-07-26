'use strict';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Runs before any HTML is rendered -- every check here exists because a bad
// value would otherwise surface as a broken page or bad structured data
// three steps downstream, far from its actual cause.
function validateRecipes(data, site) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  if (!data || !Array.isArray(data.recipes)) {
    return ['data/recipes.json must be an object with a "recipes" array'];
  }

  const slugs = new Set();
  const categoryKeys = new Set(Object.keys(site.categories));
  const dietKeys = new Set(Object.keys(site.dietary));

  for (const r of data.recipes) {
    const tag = `recipe "${r && r.slug ? r.slug : '(missing slug)'}"`;

    if (!r.slug || !SLUG_RE.test(r.slug)) {
      err(`${tag}: slug must be lowercase-kebab-case`);
    } else if (slugs.has(r.slug)) {
      err(`${tag}: duplicate slug`);
    } else {
      slugs.add(r.slug);
    }

    if (!r.title || r.title.length > 60) err(`${tag}: title required, <= 60 chars`);
    if (!r.tagline || r.tagline.length > 110) err(`${tag}: tagline required, <= 110 chars`);
    if (!r.description) err(`${tag}: description required`);
    if (!categoryKeys.has(r.category)) err(`${tag}: unknown category "${r.category}"`);
    if (!r.cuisine) err(`${tag}: cuisine required`);

    const t = r.times || {};
    for (const key of ['prepMinutes', 'cookMinutes']) {
      if (!Number.isInteger(t[key]) || t[key] < 0) err(`${tag}: times.${key} must be a non-negative integer`);
    }
    if (t.restMinutes !== undefined && (!Number.isInteger(t.restMinutes) || t.restMinutes < 0)) {
      err(`${tag}: times.restMinutes must be a non-negative integer when present`);
    }

    if (!Number.isInteger(r.servings) || r.servings < 1) err(`${tag}: servings must be a positive integer`);
    if (!r.servingUnit) err(`${tag}: servingUnit required`);
    if (!DIFFICULTIES.includes(r.difficulty)) err(`${tag}: difficulty must be one of ${DIFFICULTIES.join(', ')}`);

    if (!Array.isArray(r.dietary)) {
      err(`${tag}: dietary must be an array`);
    } else {
      for (const d of r.dietary) if (!dietKeys.has(d)) err(`${tag}: unknown dietary tag "${d}"`);
    }

    if (!Array.isArray(r.keywords) || r.keywords.length === 0) err(`${tag}: keywords must be a non-empty array`);

    if (!Array.isArray(r.ingredientGroups) || r.ingredientGroups.length === 0) {
      err(`${tag}: ingredientGroups must be a non-empty array`);
    } else {
      for (const group of r.ingredientGroups) {
        if (!Array.isArray(group.items) || group.items.length === 0) {
          err(`${tag}: ingredient group "${group.heading || '(main)'}" needs items`);
          continue;
        }
        for (const item of group.items) {
          if (!item.item) err(`${tag}: an ingredient item is missing its "item" text`);
          if (item.quantity !== null && typeof item.quantity !== 'number') {
            err(`${tag}: ingredient "${item.item}" quantity must be a number or null`);
          }
          if (typeof item.scalable !== 'boolean') {
            err(`${tag}: ingredient "${item.item}" must set scalable true/false`);
          }
        }
      }
    }

    if (!Array.isArray(r.steps) || r.steps.length === 0) {
      err(`${tag}: steps must be a non-empty array`);
    } else {
      for (const step of r.steps) {
        if (!step.text) err(`${tag}: a step is missing its "text"`);
        if (step.timerMinutes !== null && step.timerMinutes !== undefined && !Number.isInteger(step.timerMinutes)) {
          err(`${tag}: step timerMinutes must be an integer or null`);
        }
      }
    }

    const n = r.nutrition || {};
    for (const key of [
      'calories', 'proteinG', 'carbsG', 'fatG', 'saturatedFatG',
      'fiberG', 'sugarG', 'sodiumMg', 'cholesterolMg',
    ]) {
      if (typeof n[key] !== 'number' || !Number.isFinite(n[key]) || n[key] < 0) {
        err(`${tag}: nutrition.${key} must be a non-negative finite number`);
      }
    }
    if (!n.servingSize) err(`${tag}: nutrition.servingSize required`);

    const img = r.image || {};
    if (!img.alt) err(`${tag}: image.alt required`);
    if (!Array.isArray(img.searchTerms) || img.searchTerms.length === 0) {
      err(`${tag}: image.searchTerms must be a non-empty array`);
    }

    if (!Array.isArray(r.related)) {
      err(`${tag}: related must be an array (can be empty)`);
    } else if (r.related.includes(r.slug)) {
      err(`${tag}: related cannot include its own slug`);
    }

    if (typeof r.featured !== 'boolean') err(`${tag}: featured must be true or false`);
    if (!DATE_RE.test(r.published || '')) err(`${tag}: published must be YYYY-MM-DD`);
    if (!DATE_RE.test(r.updated || '')) err(`${tag}: updated must be YYYY-MM-DD`);
    if (!r.author) err(`${tag}: author required`);
  }

  // Referential integrity needs the full slug set, so it runs as a second pass.
  for (const r of data.recipes) {
    for (const relSlug of r.related || []) {
      if (!slugs.has(relSlug)) err(`recipe "${r.slug}": related slug "${relSlug}" does not exist`);
    }
  }

  return errors;
}

module.exports = { validateRecipes };

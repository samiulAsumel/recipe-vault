'use strict';

const { absUrl } = require('./paths');
const { minutesToISO } = require('./duration');
const { formatIngredientLine } = require('./format');

const NUTRITION_UNITS = {
  proteinG: 'g', carbsG: 'g', fatG: 'g', saturatedFatG: 'g', fiberG: 'g', sugarG: 'g',
  sodiumMg: 'mg', cholesterolMg: 'mg',
};
const NUTRITION_PROPS = {
  calories: 'calories', proteinG: 'proteinContent', carbsG: 'carbohydrateContent',
  fatG: 'fatContent', saturatedFatG: 'saturatedFatContent', fiberG: 'fiberContent',
  sugarG: 'sugarContent', sodiumMg: 'sodiumContent', cholesterolMg: 'cholesterolContent',
};

function nutritionLD(nutrition) {
  const out = { '@type': 'NutritionInformation', servingSize: nutrition.servingSize };
  for (const [field, prop] of Object.entries(NUTRITION_PROPS)) {
    const value = nutrition[field];
    if (value === undefined) continue;
    const unit = NUTRITION_UNITS[field];
    out[prop] = unit ? `${value} ${unit}` : `${value} calories`;
  }
  return out;
}

// Deliberately excludes aggregateRating and any named human author -- both
// would be fabricated data, which structured-data guidelines treat as spam.
function recipeLD(recipe, site) {
  const total = recipe.times.prepMinutes + recipe.times.cookMinutes + (recipe.times.restMinutes || 0);
  const ingredients = recipe.ingredientGroups.flatMap((g) => g.items.map(formatIngredientLine));
  const diet = (recipe.dietary || [])
    .map((d) => site.schemaDiet[d])
    .filter(Boolean);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: [400, 800, 1200].map((w) => absUrl(site, `assets/images/recipes/${recipe.slug}-${w}.jpg`)),
    author: { '@type': 'Organization', name: recipe.author },
    datePublished: recipe.published,
    recipeCategory: site.schemaRecipeCategory[recipe.category] || recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.keywords.join(', '),
    recipeYield: recipe.yieldText || `${recipe.servings} ${recipe.servingUnit}`,
    recipeIngredient: ingredients,
    recipeInstructions: recipe.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step.text,
    })),
    nutrition: nutritionLD(recipe.nutrition),
    mainEntityOfPage: absUrl(site, `recipes/${recipe.slug}.html`),
  };

  const prepISO = minutesToISO(recipe.times.prepMinutes);
  const cookISO = minutesToISO(recipe.times.cookMinutes);
  const totalISO = minutesToISO(total);
  if (prepISO) ld.prepTime = prepISO;
  if (cookISO) ld.cookTime = cookISO;
  if (totalISO) ld.totalTime = totalISO;
  if (diet.length) ld.suitableForDiet = diet;

  return ld;
}

function breadcrumbLD(items, site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absUrl(site, item.href),
    })),
  };
}

module.exports = { recipeLD, breadcrumbLD };

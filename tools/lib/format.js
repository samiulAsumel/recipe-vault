'use strict';

// Cooking quantities cluster around a handful of fractions; rendering those
// as "1/2" instead of "0.5" is what makes a generated ingredient list read
// like a recipe instead of a spreadsheet. Anything else falls back to a
// plain decimal (trimmed of a trailing ".0").
const KNOWN_FRACTIONS = [
  [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.34, '1/3'],
  [0.5, '1/2'], [0.66, '2/3'], [0.667, '2/3'], [0.75, '3/4'],
];

function formatQuantity(quantity) {
  if (quantity === null || quantity === undefined) return '';
  const whole = Math.floor(quantity);
  const frac = Math.round((quantity - whole) * 1000) / 1000;
  if (frac === 0) return String(whole);
  const known = KNOWN_FRACTIONS.find(([value]) => Math.abs(value - frac) < 0.02);
  if (known) return (whole ? whole + ' ' : '') + known[1];
  return String(Math.round(quantity * 100) / 100);
}

function pluralizeUnit(unit, quantity) {
  if (!unit) return unit;
  const noPlural = new Set(['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'oz', 'lb']);
  if (noPlural.has(unit)) return unit;
  if (quantity !== null && quantity !== undefined && quantity !== 1 && !unit.endsWith('s')) {
    return unit + 's';
  }
  return unit;
}

// The single formatter both the HTML ingredient list and the JSON-LD
// recipeIngredient array use, so the two surfaces can never disagree.
function formatIngredientLine(item) {
  if (item.display) return item.display;
  const parts = [];
  if (item.quantity !== null && item.quantity !== undefined) {
    parts.push(formatQuantity(item.quantity));
  }
  if (item.unit) parts.push(pluralizeUnit(item.unit, item.quantity));
  parts.push(item.item);
  let line = parts.join(' ');
  if (item.note) line += ', ' + item.note;
  return line;
}

module.exports = { formatQuantity, pluralizeUnit, formatIngredientLine };

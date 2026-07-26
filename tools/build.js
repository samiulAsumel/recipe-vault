#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

const { validateRecipes } = require('./lib/validate');
const { writeIfChanged, sha256, prune } = require('./lib/fsx');
const { renderHome } = require('./lib/pages/home');
const { renderRecipe } = require('./lib/pages/recipe');
const { renderCategory } = require('./lib/pages/category');
const { renderSitemap, renderRobots } = require('./lib/pages/feeds');
const { renderSearchIndex } = require('./lib/searchindex');

const MANIFEST_PATH = path.join(ROOT, 'build-manifest.json');
const PRUNE_PREFIXES = ['recipes/', 'categories/', 'assets/js/recipes-index.js'];

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function main() {
  const args = process.argv.slice(2);
  const requireImages = args.includes('--require-images');

  const site = loadJSON('data/site.json');
  const data = loadJSON('data/recipes.json');

  const errors = validateRecipes(data, site);
  if (requireImages) {
    for (const r of data.recipes) {
      if (!r.image || !r.image.source) errors.push(`recipe "${r.slug}": missing image.source (run tools/fetch-images.js)`);
    }
  }
  if (errors.length) {
    console.error(`build failed: ${errors.length} validation error(s)`);
    for (const e of errors) console.error(' - ' + e);
    process.exit(1);
  }

  const recipes = data.recipes;
  const written = { write: 0, same: 0 };
  const generatedPaths = [];

  function emit(relPath, content) {
    const abs = path.join(ROOT, relPath);
    const result = writeIfChanged(abs, content);
    written[result] += 1;
    generatedPaths.push(relPath);
  }

  emit('index.html', renderHome(recipes, site));

  for (const [key, cat] of Object.entries(site.categories)) {
    const inCategory = recipes.filter((r) => r.category === key);
    emit(`categories/${key}.html`, renderCategory(key, cat, inCategory, site));
  }

  for (const recipe of recipes) {
    emit(`recipes/${recipe.slug}.html`, renderRecipe(recipe, recipes, site));
  }

  emit('sitemap.xml', renderSitemap(recipes, site));
  emit('robots.txt', renderRobots(site));
  emit('assets/js/recipes-index.js', renderSearchIndex(recipes));

  let oldManifest = { files: {} };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      oldManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {
      oldManifest = { files: {} };
    }
  }
  const removed = prune(ROOT, oldManifest, generatedPaths, PRUNE_PREFIXES);

  const files = {};
  for (const relPath of generatedPaths.sort()) {
    files[relPath] = sha256(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  }
  const manifest = { generator: 'tools/build.js', files };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(
    `built ${generatedPaths.length} files: ${written.write} written, ${written.same} unchanged, ${removed.length} pruned`,
  );
  if (removed.length) console.log('  pruned:', removed.join(', '));
}

main();

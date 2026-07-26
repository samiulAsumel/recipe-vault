#!/usr/bin/env node
'use strict';

// The verification gate. No HTML validator (tidy/vnu/lighthouse) is
// installed on this machine, so this hand-rolled sweep is the only thing
// standing between a generator bug and a broken published page -- treat it
// as load-bearing, not optional.

const fs = require('fs');
const path = require('path');
const { sha256 } = require('./lib/fsx');
const {
  checkTagBalance, checkSingletons, checkIds, checkImages,
  checkInteractiveText, checkBannedPatterns, resolveLinksAndFragments,
} = require('./lib/verify/html');
const { checkJsonLd } = require('./lib/verify/jsonld');
const { checkContrast } = require('./lib/verify/contrast');

const ROOT = path.join(__dirname, '..');

function walkHtmlFiles(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.cache') continue;
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, rel, out);
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function checkImageAssets(errors) {
  for (const sub of ['assets/images/recipes', 'assets/images/og']) {
    const dir = path.join(ROOT, sub);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith('.')) continue;
      const full = path.join(dir, name);
      const size = fs.statSync(full).size;
      if (size < 1024) errors.push(`${sub}/${name}: file is only ${size} bytes -- looks truncated`);
    }
  }
}

function checkCredits(recipes, errors) {
  const creditsHtml = fs.readFileSync(path.join(ROOT, 'credits.html'), 'utf8');
  for (const r of recipes) {
    const source = r.image && r.image.source;
    if (source && source.license && source.license.attributionRequired) {
      if (!creditsHtml.includes(r.title)) {
        errors.push(`credits.html: missing an entry for "${r.slug}", whose license requires attribution`);
      }
    }
  }
}

function checkSearchIndexFreshness(recipes, errors) {
  const indexJs = fs.readFileSync(path.join(ROOT, 'assets/js/recipes-index.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const domSlugs = new Set(Array.from(indexHtml.matchAll(/data-slug="([^"]+)"/g)).map((m) => m[1]));
  for (const r of recipes) {
    if (!domSlugs.has(r.slug)) errors.push(`index.html: recipe "${r.slug}" has no matching card`);
    if (!indexJs.includes(`"slug":"${r.slug}"`)) errors.push(`assets/js/recipes-index.js: missing entry for "${r.slug}" -- run tools/build.js`);
  }
}

function checkManifestDrift(errors) {
  const manifestPath = path.join(ROOT, 'build-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('build-manifest.json is missing -- run tools/build.js');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const [relPath, expectedHash] of Object.entries(manifest.files || {})) {
    const full = path.join(ROOT, relPath);
    if (!fs.existsSync(full)) {
      errors.push(`${relPath}: listed in build-manifest.json but missing on disk`);
      continue;
    }
    const actualHash = sha256(fs.readFileSync(full, 'utf8'));
    if (actualHash !== expectedHash) {
      errors.push(`${relPath}: hand-edited since the last build.js run (or build.js was not re-run after a data change)`);
    }
  }
}

function main() {
  const errors = [];
  const files = walkHtmlFiles(ROOT, '', []).sort();

  const htmlByFile = {};
  const idsByFile = {};
  for (const file of files) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    htmlByFile[file] = html;
    idsByFile[file] = checkIds(html, file, errors);
  }

  for (const file of files) {
    const html = htmlByFile[file];
    checkTagBalance(html, file, errors);
    checkSingletons(html, file, errors);
    checkImages(html, file, errors);
    checkInteractiveText(html, file, errors);
    checkBannedPatterns(html, file, errors);
    checkJsonLd(html, file, errors);
    resolveLinksAndFragments(html, file, ROOT, idsByFile, errors);
  }

  checkImageAssets(errors);

  const cssPath = path.join(ROOT, 'assets/css/site.css');
  if (fs.existsSync(cssPath)) {
    for (const e of checkContrast(fs.readFileSync(cssPath, 'utf8'))) errors.push(e);
  }

  const recipesPath = path.join(ROOT, 'data/recipes.json');
  if (fs.existsSync(recipesPath)) {
    const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8')).recipes;
    checkCredits(recipes, errors);
    checkSearchIndexFreshness(recipes, errors);
  }

  checkManifestDrift(errors);

  if (errors.length) {
    console.error(`verify failed: ${errors.length} issue(s)`);
    for (const e of errors) console.error(' - ' + e);
    process.exit(1);
  }
  console.log(`verify passed: ${files.length} HTML files checked, 0 issues`);
}

main();

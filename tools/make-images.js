#!/usr/bin/env node
'use strict';

// Pure local transform: crop, resize, re-encode. No network calls -- that's
// tools/fetch-images.js's job, kept separate so re-encoding never risks
// re-hitting an API. -strip on every convert call is what makes output
// byte-reproducible for the same input, which is what the idempotence
// check depends on.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

const RAW_DIR = path.join(ROOT, '.cache', 'images');
const OUT_RECIPES = path.join(ROOT, 'assets', 'images', 'recipes');
const OUT_OG = path.join(ROOT, 'assets', 'images', 'og');
const MANIFEST_PATH = path.join(OUT_RECIPES, '.manifest.json');
const WIDTHS = [400, 800, 1200];
const GRAVITY = { center: 'center', top: 'North', bottom: 'South' };

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}
function loadRecipes() {
  return loadJSON('data/recipes.json');
}
function saveRecipes(data) {
  fs.writeFileSync(path.join(ROOT, 'data', 'recipes.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
}
function run(args) {
  const result = spawnSync('convert', args);
  if (result.status !== 0) {
    throw new Error(`convert failed: ${result.stderr.toString().slice(0, 400)}`);
  }
}

function buildMaster(rawPath, gravity, masterJpg) {
  run([
    rawPath, '-auto-orient', '-strip', '-colorspace', 'sRGB',
    '-resize', '1200x800^', '-gravity', gravity, '-extent', '1200x800',
    '-quality', '82', '-interlace', 'Plane', '-sampling-factor', '4:2:0',
    masterJpg,
  ]);
}
function buildWebp(srcJpg, destWebp, quality) {
  run([srcJpg, '-strip', '-define', 'webp:method=6', '-quality', String(quality), destWebp]);
}
function buildWidth(masterJpg, width, destJpg, destWebp) {
  run([masterJpg, '-resize', `${width}x`, '-strip', '-quality', '82', '-interlace', 'Plane', destJpg]);
  buildWebp(destJpg, destWebp, 78);
}
function buildOg(rawPath, gravity, destJpg) {
  run([
    rawPath, '-auto-orient', '-strip', '-colorspace', 'sRGB',
    '-resize', '1200x630^', '-gravity', gravity, '-extent', '1200x630',
    '-quality', '85', '-interlace', 'Plane', destJpg,
  ]);
}

// A generated brand card, not a photo -- used only where a page has no
// recipe image of its own (home, about, credits, 404). Regenerating it is
// deterministic, so it's safe to rebuild unconditionally on every run.
function buildSiteOg(site, destJpg) {
  run([
    '-size', '1200x630', `xc:${site.themeColor.light}`,
    '-gravity', 'center', '-fill', '#A8452B', '-font', 'DejaVu-Serif-Bold',
    '-pointsize', '72', '-annotate', '+0-40', site.siteName,
    '-fill', '#6B5D54', '-font', 'DejaVu-Sans', '-pointsize', '30',
    '-annotate', '+0+60', site.tagline,
    '-strip', '-quality', '85', destJpg,
  ]);
}

function main() {
  const args = process.argv.slice(2);
  const onlySlug = (args.find((a) => a.startsWith('--slug=')) || '').split('=')[1];

  const site = loadJSON('data/site.json');
  const data = loadRecipes();
  const manifest = loadManifest();
  fs.mkdirSync(OUT_RECIPES, { recursive: true });
  fs.mkdirSync(OUT_OG, { recursive: true });

  buildSiteOg(site, path.join(OUT_OG, 'site-og.jpg'));

  let built = 0;
  let skipped = 0;

  for (const recipe of data.recipes) {
    if (onlySlug && recipe.slug !== onlySlug) continue;
    const source = recipe.image && recipe.image.source;
    if (!source) {
      console.log(`skip ${recipe.slug}: no image.source yet (run tools/fetch-images.js)`);
      continue;
    }

    const key = `${recipe.slug}:${source.sha256}`;
    if (manifest[key]) {
      skipped += 1;
      continue;
    }

    const rawPath = path.join(RAW_DIR, `${source.sha256}.${source.ext}`);
    if (!fs.existsSync(rawPath)) {
      console.log(`skip ${recipe.slug}: raw file missing at ${rawPath}`);
      continue;
    }

    const gravity = GRAVITY[recipe.image.focal] || 'center';
    const masterJpg = path.join(OUT_RECIPES, `${recipe.slug}-1200.jpg`);

    buildMaster(rawPath, gravity, masterJpg);
    buildWebp(masterJpg, path.join(OUT_RECIPES, `${recipe.slug}-1200.webp`), 78);
    for (const width of [800, 400]) {
      buildWidth(
        masterJpg, width,
        path.join(OUT_RECIPES, `${recipe.slug}-${width}.jpg`),
        path.join(OUT_RECIPES, `${recipe.slug}-${width}.webp`),
      );
    }
    buildOg(rawPath, gravity, path.join(OUT_OG, `${recipe.slug}-og.jpg`));

    recipe.image.width = 1200;
    recipe.image.height = 800;
    manifest[key] = { sha256: source.sha256, widths: WIDTHS, builtAt: recipe.updated };
    built += 1;
    console.log(`built ${recipe.slug}`);
  }

  saveRecipes(data);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`${built} recipe(s) built, ${skipped} unchanged`);
}

main();

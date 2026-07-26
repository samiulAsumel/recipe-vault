#!/usr/bin/env node
'use strict';

// Two-step, human-in-the-loop image sourcing:
//   node tools/fetch-images.js search <slug>       -- writes candidates + a contact sheet to review
//   node tools/fetch-images.js pick <slug> <index>  -- downloads the chosen candidate, writes attribution
// Automatic selection was deliberately rejected: title-matched search
// results include supermarket shelves, product packaging, and toothpaste
// (a real "pasta" hit) often enough that a human has to look at the sheet.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

const { searchCandidates, get, USER_AGENT } = require('./lib/imagesearch');

const REVIEW_DIR = path.join(ROOT, '.cache', 'images', 'review');
const RAW_DIR = path.join(ROOT, '.cache', 'images');

function loadRecipes() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'recipes.json'), 'utf8'));
}
function saveRecipes(data) {
  fs.writeFileSync(path.join(ROOT, 'data', 'recipes.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
}
function findRecipe(data, slug) {
  const r = data.recipes.find((x) => x.slug === slug);
  if (!r) throw new Error(`no recipe with slug "${slug}"`);
  return r;
}

async function cmdSearch(slug) {
  const data = loadRecipes();
  const recipe = findRecipe(data, slug);
  fs.mkdirSync(path.join(REVIEW_DIR, slug), { recursive: true });

  console.log(`searching for: ${recipe.image.searchTerms.join(', ')}`);
  const candidates = await searchCandidates(recipe.image.searchTerms);
  if (!candidates.length) {
    console.log('no license-eligible candidates found -- broaden searchTerms and retry');
    return;
  }

  // (index, path) pairs, not a parallel array -- a failed download must not
  // shift every later candidate's label out of alignment with its image.
  const downloaded = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    const ext = c.thumbUrl.match(/\.(jpe?g|png|webp)(?:$|\?)/i);
    const thumbPath = path.join(REVIEW_DIR, slug, `${i}${ext ? '.' + ext[1] : '.jpg'}`);
    try {
      let buf;
      try {
        buf = await get(c.thumbUrl);
      } catch (e) {
        buf = await get(c.fullUrl); // Openverse's thumbnail proxy 424s intermittently
      }
      fs.writeFileSync(thumbPath, buf);
      downloaded.push({ index: i, path: thumbPath });
    } catch (e) {
      console.log(`  [${i}] download failed: ${e.message}`);
    }
  }

  const manifestPath = path.join(REVIEW_DIR, `${slug}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(candidates, null, 2) + '\n', 'utf8');

  const sheetPath = path.join(REVIEW_DIR, `${slug}-sheet.jpg`);
  const labeled = downloaded.map(({ index, path: p }) => {
    const c = candidates[index];
    return `-label\n${index}: ${c.license.id}${c.preferred ? ' *' : ''}\n${p}`.split('\n');
  }).flat();
  const cols = Math.min(4, downloaded.length);
  const montage = spawnSync('montage', [
    ...labeled, '-tile', `${cols}x`, '-geometry', '400x300+8+8',
    '-background', '#222', '-fill', 'white', sheetPath,
  ]);
  if (montage.status !== 0) {
    console.error(montage.stderr.toString());
    throw new Error('montage failed -- is ImageMagick installed?');
  }

  console.log(`${downloaded.length}/${candidates.length} candidates -> ${sheetPath}`);
  console.log(`review the sheet, then run: node tools/fetch-images.js pick ${slug} <index>`);
}

async function cmdPick(slug, indexArg) {
  const index = Number(indexArg);
  const data = loadRecipes();
  const recipe = findRecipe(data, slug);
  const manifestPath = path.join(REVIEW_DIR, `${slug}.json`);
  const candidates = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const chosen = candidates[index];
  if (!chosen) throw new Error(`no candidate at index ${index} (0..${candidates.length - 1})`);

  for (const other of data.recipes) {
    if (other.slug === slug) continue;
    const src = other.image && other.image.source;
    if (src && (src.pageTitle === chosen.title || src.originalUrl === chosen.fullUrl)) {
      throw new Error(`candidate already used by recipe "${other.slug}" -- pick a different one`);
    }
  }

  console.log(`downloading full-resolution image for ${slug}...`);
  const buffer = await get(chosen.fullUrl);
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const extMatch = chosen.fullUrl.match(/\.(jpe?g|png|webp)(?:$|\?)/i);
  const ext = extMatch ? extMatch[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.writeFileSync(path.join(RAW_DIR, `${sha256}.${ext}`), buffer);

  recipe.image.source = {
    provider: chosen.provider,
    pageTitle: chosen.title,
    descriptionUrl: chosen.descriptionUrl,
    originalUrl: chosen.fullUrl,
    artist: chosen.artist,
    credit: chosen.credit,
    license: chosen.license,
    modifications: 'Cropped to 3:2 and re-encoded as WebP/JPEG for web delivery.',
    sha256, ext,
    fetchedAt: recipe.published,
  };
  saveRecipes(data);
  console.log(`saved: ${chosen.title} (${chosen.license.id}) -> data/recipes.json`);
  console.log('next: node tools/make-images.js');
}

async function main() {
  const [cmd, slug, indexArg] = process.argv.slice(2);
  if (cmd === 'search' && slug) return cmdSearch(slug);
  if (cmd === 'pick' && slug && indexArg !== undefined) return cmdPick(slug, indexArg);
  console.log('usage:');
  console.log('  node tools/fetch-images.js search <slug>');
  console.log('  node tools/fetch-images.js pick <slug> <index>');
  process.exit(1);
}

main().catch((e) => {
  console.error('error:', e.message);
  process.exit(1);
});

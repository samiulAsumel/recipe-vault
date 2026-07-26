'use strict';

const { esc, attr } = require('../html');
const { rel } = require('../paths');
const shell = require('../shell');
const { breadcrumbLD } = require('../jsonld');

const DEPTH = 0;

function creditRow(recipe) {
  const s = recipe.image.source;
  return `<li class="credit-row">
        <a href=${attr(rel(DEPTH, `recipes/${recipe.slug}.html`))}>${esc(recipe.title)}</a> --
        photo <a href=${attr(s.descriptionUrl)}>${esc(s.pageTitle)}</a> by ${esc(s.artist)},
        <a href=${attr(s.license.url)}>${esc(s.license.name)}</a>.
        ${esc(s.modifications)}
      </li>`;
}

// Required for every attributionRequired image (CC BY / CC BY-SA) -- CC0 and
// public-domain images have no legal obligation to appear here, but are
// listed too for a complete, honest record of where every photo came from.
function renderCredits(recipes, site) {
  const withImages = recipes.filter((r) => r.image && r.image.source);
  const byLicense = new Map();
  for (const r of withImages) {
    const name = r.image.source.license.name;
    if (!byLicense.has(name)) byLicense.set(name, []);
    byLicense.get(name).push(r);
  }
  const groups = [...byLicense.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([license, group]) => `<section>
        <h2>${esc(license)}</h2>
        <ul class="credit-list">
          ${group.map(creditRow).join('\n          ')}
        </ul>
      </section>`)
    .join('\n      ');

  const html = shell.head(site, {
    depth: DEPTH,
    path: 'credits.html',
    title: `Photo Credits -- ${site.siteName}`,
    description: 'Attribution for every recipe photo on this site, grouped by license.',
    ldBlocks: [breadcrumbLD([{ name: 'Home', href: 'index.html' }, { name: 'Photo Credits', href: 'credits.html' }], site)],
  }) + `
  <!-- Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'credits.html' })}
  <main id="main-content">
    <section class="category-page" aria-labelledby="credits-heading">
      <h1 id="credits-heading">Photo Credits</h1>
      <p>Every recipe photo on this site is a real, freely-licensed image, credited here by license.</p>
      ${groups}
    </section>
  </main>
  ` + shell.footer(site, { depth: DEPTH });

  return html;
}

module.exports = { renderCredits, DEPTH };

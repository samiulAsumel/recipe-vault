'use strict';

const shell = require('../shell');

const DEPTH = 0;

function renderAbout(site) {
  const html = shell.head(site, {
    depth: DEPTH,
    path: 'about.html',
    title: `About -- ${site.siteName}`,
    description: 'How recipes are tested on this site, and a note on the nutrition estimates.',
  }) + `
  <!-- Generated from data/site.json by tools/build.js -- hand edits here are overwritten on the next build. -->
  ${shell.header(site, { depth: DEPTH, currentHref: 'about.html' })}
  <main id="main-content">
    <section class="category-page">
      <h1>About This Site</h1>
      <p>${site.siteName} is a small, growing collection of recipes that have actually been cooked at home -- nothing that needs a trip to a specialty store, and nothing served without being tried first.</p>

      <h2>How recipes are tested</h2>
      <p>Each recipe is written the way it was actually cooked: real quantities, real timing, and notes on the steps that are easy to get wrong. Where a step has a specific reason behind it -- why the water needs salting before it boils, why cold rice fries better than warm -- that reasoning is included as a tip rather than left out.</p>

      <h2>A note on nutrition</h2>
      <p>The nutrition figures on every recipe page are estimates, not laboratory results. They're calculated from standard ingredient data and will vary depending on the specific brands and quantities used. If you're tracking nutrition for medical reasons, treat these numbers as a starting point, not a guarantee.</p>

      <h2>Photos</h2>
      <p>Every recipe photo is a real, freely-licensed image, chosen by hand rather than automatically -- see the <a href="credits.html">photo credits page</a> for the source and license of each one.</p>
    </section>
  </main>
  ` + shell.footer(site, { depth: DEPTH });

  return html;
}

module.exports = { renderAbout, DEPTH };

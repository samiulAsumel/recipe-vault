'use strict';

const { absUrl } = require('../paths');

// <lastmod> always comes from recipe data, never from the clock -- a
// generator that stamps today's date on every run is not idempotent, and
// a stale sitemap is far less harmful than a sitemap that changes on every
// build for no content reason.
function maxUpdated(recipes) {
  if (!recipes.length) return null;
  return recipes.reduce((max, r) => (r.updated > max ? r.updated : max), recipes[0].updated);
}

function urlEntry(loc, lastmod, priority) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <priority>${priority}</priority>\n  </url>`;
}

function renderSitemap(recipes, site) {
  const entries = [urlEntry(absUrl(site, 'index.html'), maxUpdated(recipes), '1.0')];

  for (const key of Object.keys(site.categories)) {
    const inCategory = recipes.filter((r) => r.category === key);
    entries.push(urlEntry(absUrl(site, `categories/${key}.html`), maxUpdated(inCategory), '0.6'));
  }

  for (const r of [...recipes].sort((a, b) => a.slug.localeCompare(b.slug))) {
    entries.push(urlEntry(absUrl(site, `recipes/${r.slug}.html`), r.updated, '0.8'));
  }

  for (const path of ['about.html', 'credits.html', 'submit-recipe.html']) {
    entries.push(urlEntry(absUrl(site, path), null, '0.3'));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated from data/recipes.json by tools/build.js -- hand edits here are overwritten on the next build. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

function renderRobots(site) {
  return `# Generated from data/site.json by tools/build.js -- hand edits here are overwritten on the next build.\nUser-agent: *\nAllow: /\nSitemap: ${absUrl(site, 'sitemap.xml')}\n`;
}

module.exports = { renderSitemap, renderRobots };

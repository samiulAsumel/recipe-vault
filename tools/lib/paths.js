'use strict';

// GitHub Pages serves this as a *project* site under site.basePath, so an
// absolute "/assets/..." path 404s. Every internal link is depth-relative
// instead -- depth is how many directories the current page sits below root
// (index.html = 0, recipes/<slug>.html = 1, categories/<slug>.html = 1).
function rel(depth, target) {
  if (depth <= 0) return target;
  return '../'.repeat(depth) + target;
}

// Absolute URLs are only for canonical links, og:image, JSON-LD, and the
// sitemap -- surfaces that leave the page itself and need a stable full URL.
function absUrl(site, target) {
  const base = site.baseUrl.replace(/\/$/, '') + site.basePath.replace(/\/$/, '');
  return base + '/' + target.replace(/^\//, '');
}

module.exports = { rel, absUrl };

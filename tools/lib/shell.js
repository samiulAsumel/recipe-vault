'use strict';

const { esc, attr, ldjson } = require('./html');
const { rel, absUrl } = require('./paths');
const raw = require('./raw');

// opts: { depth, path, title, description, ogType, robots, ogImage, ldBlocks, bodyClass }
function head(site, opts) {
  const canonical = absUrl(site, opts.path);
  const ogImage = opts.ogImage ? absUrl(site, opts.ogImage) : absUrl(site, 'assets/images/og/site-og.jpg');
  const ld = (opts.ldBlocks || []).map(ldjson).join('\n    ');
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
  ${raw.THEME_SCRIPT}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>${esc(opts.title)}</title>
  <meta name="description" content=${attr(opts.description)} />
  <link rel="canonical" href=${attr(canonical)} />
  <link rel="icon" type="image/svg+xml" href=${attr(rel(opts.depth, 'favicon.svg'))} />
  <meta name="theme-color" id="theme-color" content=${attr(site.themeColor.light)} />
  <meta name="robots" content=${attr(opts.robots || 'index, follow')} />
  <meta property="og:type" content=${attr(opts.ogType || 'website')} />
  <meta property="og:title" content=${attr(opts.title)} />
  <meta property="og:description" content=${attr(opts.description)} />
  <meta property="og:image" content=${attr(ogImage)} />
  <meta property="og:url" content=${attr(canonical)} />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href=${attr(rel(opts.depth, 'assets/css/site.css'))} />
  <link rel="stylesheet" href=${attr(rel(opts.depth, 'assets/css/print.css'))} media="print" />
  ${ld}
</head>
<body class=${attr(opts.bodyClass || '')}>
  <a class="skip-link" href="#main-content">Skip to main content</a>`;
}

function header(site, opts) {
  const depth = opts.depth;
  const navLinks = site.nav
    .map((item) => {
      const href = rel(depth, item.href);
      const current = opts.currentHref === item.href ? ' aria-current="page"' : '';
      return `<li><a class="nav-link" href=${attr(href)}${current}>${esc(item.label)}</a></li>`;
    })
    .join('\n        ');

  return `<header id="site-header">
    <div class="header-inner">
      <a class="header-brand" href=${attr(rel(depth, 'index.html'))}>
        ${raw.ICON_BRAND}
        <span class="brand-text">${esc(site.siteName)}</span>
      </a>
      <nav class="header-nav" id="header-nav" aria-label="Primary">
        <ul>
          ${navLinks}
        </ul>
      </nav>
      <div class="header-right">
        <div class="header-clock js-only" aria-hidden="true">
          <span class="header-clock-time js-clock-time">--:--:--</span>
          <span class="header-clock-date js-clock-date-short">--</span>
        </div>
        <button id="theme-toggle" class="icon-btn js-only" type="button"
          aria-label="Switch to dark theme" title="Switch to dark theme">
          ${raw.ICON_SUN}
          ${raw.ICON_MOON}
        </button>
        <button class="hamburger" id="hamburger" type="button" aria-label="Toggle navigation"
          aria-expanded="false" aria-controls="mobile-nav-overlay">
          ${raw.ICON_HAMBURGER}
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav-overlay" id="mobile-nav-overlay" aria-hidden="true" aria-label="Mobile navigation">
    <nav aria-label="Mobile primary">
      <ul>
        ${site.nav
          .map((item) => `<li><a class="mnav-link" href=${attr(rel(depth, item.href))}>${esc(item.label)}</a></li>`)
          .join('\n        ')}
      </ul>
    </nav>
  </div>`;
}

function footer(site, opts) {
  const depth = opts.depth;
  const categoryLinks = Object.entries(site.categories)
    .map(([key, cat]) => `<li><a href=${attr(rel(depth, `categories/${key}.html`))}>${esc(cat.label)}</a></li>`)
    .join('\n          ');

  return `<footer>
    <div class="footer-inner">
      <div class="footer-col">
        <p class="footer-brand">${esc(site.siteName)}</p>
        <p class="footer-tagline">${esc(site.tagline)}</p>
      </div>
      <div class="footer-col">
        <h3>Categories</h3>
        <ul>
          ${categoryLinks}
        </ul>
      </div>
      <div class="footer-col">
        <h3>Site</h3>
        <ul>
          <li><a href=${attr(rel(depth, 'about.html'))}>About &amp; Nutrition Notes</a></li>
          <li><a href=${attr(rel(depth, 'credits.html'))}>Photo Credits</a></li>
          <li><a href=${attr(rel(depth, 'submit-recipe.html'))}>Submit a Recipe</a></li>
        </ul>
      </div>
      <div class="footer-col footer-col-clock">
        <h3>Local Time</h3>
        <p class="site-clock-time js-clock-time" aria-hidden="true">--:--:--</p>
        <p class="site-clock-date js-clock-date" aria-hidden="true">-- --, ----</p>
      </div>
    </div>
    <p class="footer-legal">&copy; <span id="copyright-year">2026</span> ${esc(site.siteName)}. Recipes are tested at home; nutrition values are estimates.</p>
  </footer>
  <script src=${attr(rel(depth, 'assets/js/nav.js'))}></script>
  <script src=${attr(rel(depth, 'assets/js/theme.js'))}></script>
  <script src=${attr(rel(depth, 'assets/js/clock.js'))}></script>
  ${opts.extraScripts ? opts.extraScripts.map((s) => `<script src=${attr(rel(depth, s))}></script>`).join('\n  ') : ''}
</body>
</html>`;
}

module.exports = { head, header, footer };

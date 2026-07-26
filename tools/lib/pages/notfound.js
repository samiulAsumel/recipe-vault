'use strict';

const { esc, attr } = require('../html');
const { absUrl } = require('../paths');
const raw = require('../raw');

// GitHub Pages serves this file for ANY unmatched path (/a/b/c/), so its
// depth below root is unknowable -- every asset reference here must be
// absolute. This is the one page in the whole site where that's true.
function renderNotFound(site) {
  const home = absUrl(site, 'index.html');
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
  ${raw.THEME_SCRIPT}
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Page Not Found -- ${esc(site.siteName)}</title>
  <meta name="robots" content="noindex, follow" />
  <link rel="icon" type="image/svg+xml" href=${attr(absUrl(site, 'favicon.svg'))} />
  <link rel="stylesheet" href=${attr(absUrl(site, 'assets/css/site.css'))} />
</head>
<body>
  <main class="not-found">
    <h1>404</h1>
    <p>That page doesn't exist -- it may have been moved or the link may be out of date.</p>
    <a class="button" href=${attr(home)}>Back to ${esc(site.siteName)}</a>
  </main>
  <script src=${attr(absUrl(site, 'assets/js/theme.js'))}></script>
</body>
</html>`;
}

module.exports = { renderNotFound };

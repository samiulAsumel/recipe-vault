'use strict';

const fs = require('fs');
const path = require('path');

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const BANNED_COMMENT_RE = /Sub-?part\s*\d|Step\s+\d+\s+of|Part\s+[A-Z]\b|\bLesson\b|Chapter\s*\d|Module\s*\d/i;

function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// A minimal, dependency-free tag-tokenizer -- not a full HTML parser, but
// enough to catch the class of bug that matters here: an unclosed element
// like the original site's <aside> that silently swallowed the rest of the
// page into its subtree.
function tokenizeTags(html) {
  const tags = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html))) {
    tags.push({ closing: !!m[1], name: m[2].toLowerCase(), attrs: m[3], selfClosed: !!m[4], index: m.index });
  }
  return tags;
}

function checkTagBalance(html, file, errors) {
  const stack = [];
  for (const tag of tokenizeTags(stripComments(html))) {
    if (VOID_TAGS.has(tag.name) || tag.selfClosed) continue;
    if (tag.closing) {
      if (!stack.length || stack[stack.length - 1] !== tag.name) {
        errors.push(`${file}: </${tag.name}> does not match ${stack.length ? '<' + stack[stack.length - 1] + '>' : '(nothing open)'}`);
        return;
      }
      stack.pop();
    } else {
      stack.push(tag.name);
    }
  }
  if (stack.length) errors.push(`${file}: unclosed tag(s): ${stack.join(', ')}`);
}

function checkSingletons(html, file, errors) {
  // HTML5 permits multiple <header>/<footer> elements (one per sectioning
  // root, e.g. an <article>'s own <header> alongside the page banner) --
  // only the page-level banner landmark and content root need to be unique.
  for (const tag of ['h1', 'main']) {
    const count = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    if (count !== 1) errors.push(`${file}: expected exactly one <${tag}>, found ${count}`);
  }
  if (file === '404.html') return; // deliberately has no site header/footer chrome
  const bannerCount = (html.match(/<header id="site-header"/g) || []).length;
  if (bannerCount !== 1) errors.push(`${file}: expected exactly one page-banner <header>, found ${bannerCount}`);
  const footerCount = (html.match(/<footer[\s>]/g) || []).length;
  if (footerCount !== 1) errors.push(`${file}: expected exactly one <footer>, found ${footerCount}`);
}

function checkIds(html, file, errors) {
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g)).map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${file}: duplicate id "${id}"`);
    seen.add(id);
  }
  return seen;
}

function checkImages(html, file, errors) {
  const imgs = Array.from(html.matchAll(/<img\b([^>]*)>/g));
  for (const [, attrs] of imgs) {
    if (!/\balt="[^"]+"/.test(attrs)) errors.push(`${file}: <img> missing non-empty alt`);
    if (!/\bwidth="\d+"/.test(attrs)) errors.push(`${file}: <img> missing width`);
    if (!/\bheight="\d+"/.test(attrs)) errors.push(`${file}: <img> missing height`);
  }
}

function checkInteractiveText(html, file, errors) {
  const links = Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g));
  for (const [, attrs, inner] of links) {
    // aria-hidden="true" (paired with tabindex="-1" on every such link in
    // this codebase) removes the element from the accessibility tree and
    // the tab order entirely -- it's the card thumbnail overlay next to a
    // real, textual title link, not an undiscoverable control.
    if (/\baria-hidden="true"/.test(attrs)) continue;
    const hasText = inner.replace(/<[^>]*>/g, '').trim().length > 0;
    const hasLabel = /\baria-label="[^"]+"/.test(attrs);
    if (!hasText && !hasLabel) errors.push(`${file}: <a> with no text content and no aria-label`);
  }
}

function checkBannedPatterns(html, file, errors) {
  if (html.includes('example.com')) errors.push(`${file}: contains a placeholder example.com URL`);
  for (const m of html.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (BANNED_COMMENT_RE.test(m[1])) errors.push(`${file}: comment matches a banned lesson/tutorial pattern: "${m[1].trim().slice(0, 60)}"`);
  }
  if (file !== '404.html') {
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      errors.push(`${file}: root-absolute path "${m[1]}" -- must be depth-relative (404.html is the only exception)`);
    }
  }
}

function resolveLinksAndFragments(html, file, root, idsByFile, errors) {
  const baseDir = path.dirname(file);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:)/.test(url)) continue;
    const [pathPart, fragment] = url.split('#');
    if (pathPart) {
      const target = path.normalize(path.join(baseDir, pathPart.split('?')[0]));
      if (!fs.existsSync(path.join(root, target))) {
        errors.push(`${file}: broken link to "${url}" (resolves to ${target})`);
        continue;
      }
      if (fragment && idsByFile[target] && !idsByFile[target].has(fragment)) {
        errors.push(`${file}: "${url}" has no matching id="${fragment}" in ${target}`);
      }
    } else if (fragment) {
      if (idsByFile[file] && !idsByFile[file].has(fragment)) {
        errors.push(`${file}: in-page link "#${fragment}" has no matching id on this page`);
      }
    }
  }
}

module.exports = {
  checkTagBalance, checkSingletons, checkIds, checkImages,
  checkInteractiveText, checkBannedPatterns, resolveLinksAndFragments,
};

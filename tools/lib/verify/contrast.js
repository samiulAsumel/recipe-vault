'use strict';

// Pairs a hand-picked palette is expected to satisfy, in both themes.
// Decorative-only tokens (plain --terracotta, used at >=24px or non-text)
// are deliberately excluded -- they're allowed to fail the normal-text
// threshold because nothing normal-sized is ever set in that color.
const REQUIRED_PAIRS = [
  ['--text-primary', '--bg-page', 4.5],
  ['--text-muted', '--bg-page', 4.5],
  ['--text-muted', '--bg-card', 4.5],
  ['--accent', '--bg-page', 4.5],
  ['--accent-on', '--accent', 4.5],
];

function linearize(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hexA, hexB) {
  const lA = luminance(hexA);
  const lB = luminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

// Resolves a token through one level of var(--other) indirection, which is
// as deep as this palette's chains go (e.g. --accent: var(--terracotta-deep)).
function resolveToken(tokens, name) {
  let value = tokens[name];
  if (value && value.startsWith('var(')) {
    const inner = value.slice(4, -1).trim();
    value = tokens[inner];
  }
  return value;
}

// css is the full stylesheet text; blockSelector picks which :root-family
// rule's declarations to read (light vs dark mapping).
function extractTokens(css, blockSelector) {
  const blockStart = css.indexOf(blockSelector);
  if (blockStart === -1) return {};
  const braceStart = css.indexOf('{', blockStart);
  const braceEnd = css.indexOf('}', braceStart);
  const block = css.slice(braceStart + 1, braceEnd);
  const tokens = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block))) {
    tokens['--' + m[1]] = m[2].trim();
  }
  return tokens;
}

function checkTheme(css, blockSelector, themeName) {
  const tokens = extractTokens(css, blockSelector);
  const errors = [];
  for (const [fg, bg, minRatio] of REQUIRED_PAIRS) {
    const fgHex = resolveToken(tokens, fg);
    const bgHex = resolveToken(tokens, bg);
    if (!fgHex || !bgHex || !fgHex.startsWith('#') || !bgHex.startsWith('#')) continue;
    const ratio = contrastRatio(fgHex, bgHex);
    if (ratio < minRatio) {
      errors.push(`${themeName}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${minRatio}:1`);
    }
  }
  return errors;
}

function checkContrast(css) {
  return [
    ...checkTheme(css, ':root {', 'light'),
    ...checkTheme(css, ":root[data-theme='dark']", 'dark'),
  ];
}

module.exports = { checkContrast, contrastRatio };

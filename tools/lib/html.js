'use strict';

// The only functions allowed to put recipes.json data into generated HTML.
// Anything that bypasses these is an injection-by-data bug waiting to happen --
// Commons "Artist" fields really do contain literal markup such as an anchor tag.

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function attr(value) {
  return '"' + esc(value) + '"';
}

// Built from char codes rather than typed as literal escape sequences, since
// backslash-u escapes are indistinguishable from real editors mangling this file.
function jsUnicodeEscape(codePoint) {
  var hex = codePoint.toString(16);
  while (hex.length < 4) hex = '0' + hex;
  return String.fromCharCode(92) + 'u' + hex; // 92 = backslash
}

var JSON_ESCAPES = {};
[60, 62, 38, 8232, 8233].forEach(function (codePoint) {
  JSON_ESCAPES[String.fromCharCode(codePoint)] = jsUnicodeEscape(codePoint);
});
var JSON_UNSAFE_RE = new RegExp('[' + Object.keys(JSON_ESCAPES).join('') + ']', 'g');

// JSON.stringify's output is only valid inside a <script> element after this
// rewrite: a raw closing-script-tag substring in the data would otherwise end
// the element early, and the line/paragraph separator code points are legal
// JSON but illegal inside an unescaped JS string literal.
function jsonSafe(obj) {
  return JSON.stringify(obj).replace(JSON_UNSAFE_RE, function (ch) {
    return JSON_ESCAPES[ch];
  });
}

function ldjson(obj) {
  return '<script type="application/ld+json">' + jsonSafe(obj) + '</script>';
}

function jsLiteral(value) {
  return jsonSafe(value);
}

module.exports = { esc: esc, attr: attr, ldjson: ldjson, jsLiteral: jsLiteral };

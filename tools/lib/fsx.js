'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(bufferOrString) {
  return crypto.createHash('sha256').update(bufferOrString).digest('hex');
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

// Skipping identical writes keeps mtimes and git status stable across
// re-runs -- the idempotence check depends on this being a real no-op.
function writeIfChanged(filePath, content) {
  ensureDir(filePath);
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing === content) return 'same';
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return 'write';
}

// Deletes only files the previous manifest recorded as generator output and
// that are no longer in the new set -- restricted to an allowlist so a bug
// here can never reach outside the generator's own territory.
function prune(rootDir, oldManifest, newPaths, allowedPrefixes) {
  const removed = [];
  const keep = new Set(newPaths);
  for (const relPath of Object.keys(oldManifest.files || {})) {
    if (keep.has(relPath)) continue;
    const underAllowed = allowedPrefixes.some((prefix) => relPath.startsWith(prefix));
    if (!underAllowed) continue;
    const abs = path.join(rootDir, relPath);
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
      removed.push(relPath);
    }
  }
  return removed;
}

module.exports = { sha256, ensureDir, writeIfChanged, prune };

'use strict';

// Fail-closed allowlist: an unrecognized license string is rejected, not
// accepted-by-default. CC BY-SA is accepted (with its share-alike obligation
// surfaced on credits.html) because excluding it would leave many dishes
// with no usable photo at all -- see CLAUDE.md for the full reasoning.
const BY_VERSIONS = ['2.0', '2.5', '3.0', '4.0'];
const BY_SA_VERSIONS = ['2.0', '3.0', '4.0'];

function ccUrl(kind, version) {
  return `https://creativecommons.org/licenses/${kind}/${version}/`;
}

// id: normalized license slug ('cc0' | 'pdm' | 'by' | 'by-sa' | anything else)
// version: version string like '4.0', or null/undefined for versionless marks
function classifyLicense(id, version) {
  const norm = (id || '').toLowerCase().trim();

  if (norm === 'cc0') {
    return {
      id: 'CC0-1.0', name: 'CC0 1.0',
      url: 'https://creativecommons.org/publicdomain/zero/1.0/',
      attributionRequired: false, shareAlike: false,
    };
  }
  if (norm === 'pdm' || norm === 'pd' || norm.includes('publicdomain')) {
    return {
      id: 'PDM', name: 'Public Domain',
      url: 'https://creativecommons.org/publicdomain/mark/1.0/',
      attributionRequired: false, shareAlike: false,
    };
  }

  // Reject NonCommercial / NoDerivatives / GFDL-only / fair-use outright --
  // this check runs before the by/by-sa checks so "by-nc-sa" never sneaks
  // through as a plain "by-sa" match.
  if (/nc|nd/.test(norm) || norm.includes('gfdl') || norm.includes('fair')) return null;

  if (norm === 'by') {
    if (!BY_VERSIONS.includes(version)) return null;
    return {
      id: `CC-BY-${version}`, name: `CC BY ${version}`, url: ccUrl('by', version),
      attributionRequired: true, shareAlike: false,
    };
  }
  if (norm === 'by-sa') {
    if (!BY_SA_VERSIONS.includes(version)) return null;
    return {
      id: `CC-BY-SA-${version}`, name: `CC BY-SA ${version}`, url: ccUrl('by-sa', version),
      attributionRequired: true, shareAlike: true,
    };
  }

  return null;
}

// Wikimedia's LicenseShortName arrives as free text like "CC BY-SA 4.0",
// "CC0", "Public domain" -- this pulls out the (id, version) pair
// classifyLicense expects.
function parseWikimediaLicense(shortName) {
  const text = (shortName || '').trim();
  if (/^cc0/i.test(text)) return { id: 'cc0', version: null };
  if (/public\s*domain/i.test(text)) return { id: 'pdm', version: null };
  let m = text.match(/cc\s*by-sa\s*([\d.]+)/i);
  if (m) return { id: 'by-sa', version: m[1] };
  m = text.match(/cc\s*by\s*([\d.]+)/i);
  if (m) return { id: 'by', version: m[1] };
  return { id: text, version: null };
}

module.exports = { classifyLicense, parseWikimediaLicense };

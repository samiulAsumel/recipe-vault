'use strict';

const https = require('https');
const { classifyLicense, parseWikimediaLicense } = require('./license');

const USER_AGENT = 'homestyle-recipe-book/1.0 (https://github.com/samiulAsumel/homestyle-recipe-book; sa.sumel91@gmail.com)';
const MIN_WIDTH = 1200;
// rawpixel/wordpress/stocksnap consistently return styled, professionally
// lit food photography; the general Openverse pool is dominated by
// re-indexed Wikimedia snapshots (supermarket shelves, packaging, blur).
const PREFERRED_SOURCES = new Set(['rawpixel', 'wordpress', 'stocksnap', 'flickr']);

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode >= 400) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function getJSON(url) {
  return JSON.parse((await get(url)).toString('utf8'));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchOpenverse(term) {
  const url = 'https://api.openverse.org/v1/images/?' + new URLSearchParams({
    q: term, license_type: 'commercial,modification', size: 'large', page_size: '20',
  });
  let data;
  try {
    data = await getJSON(url);
  } catch (e) {
    return [];
  }
  const out = [];
  for (const r of data.results || []) {
    const license = classifyLicense(r.license, r.license_version);
    if (!license) continue;
    if (r.width && r.width < MIN_WIDTH) continue;
    out.push({
      provider: 'openverse', preferred: PREFERRED_SOURCES.has(r.source),
      title: r.title || term, descriptionUrl: r.foreign_landing_url || r.url,
      thumbUrl: r.thumbnail || r.url, fullUrl: r.url,
      artist: r.creator || 'Unknown', credit: r.source || 'Openverse',
      width: r.width || null, height: r.height || null, license,
    });
  }
  return out;
}

async function searchCommons(term) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo', generator: 'search',
    gsrsearch: `intitle:${term} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '8',
    iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1600',
  });
  let data;
  try {
    data = await getJSON(url);
  } catch (e) {
    return [];
  }
  const pages = (data.query && data.query.pages) || {};
  const out = [];
  for (const page of Object.values(pages)) {
    const info = page.imageinfo && page.imageinfo[0];
    if (!info) continue;
    const meta = info.extmetadata || {};
    const shortName = meta.LicenseShortName && meta.LicenseShortName.value;
    const { id, version } = parseWikimediaLicense(shortName);
    const license = classifyLicense(id, version);
    if (!license) continue;
    if (info.width && info.width < MIN_WIDTH) continue;
    const artist = stripHtml(meta.Artist && meta.Artist.value);
    out.push({
      provider: 'wikimedia-commons', preferred: false,
      title: page.title, descriptionUrl: info.descriptionurl,
      thumbUrl: info.thumburl, fullUrl: info.url,
      artist: artist || 'Unknown', credit: stripHtml(meta.Credit && meta.Credit.value) || 'Wikimedia Commons',
      width: info.width || null, height: info.height || null, license,
    });
  }
  return out;
}

// Commons extmetadata text fields legitimately contain markup (a linked
// username is the common case) -- this is the one place that markup gets
// stripped before it can reach recipes.json or a generated <figcaption>.
function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (m) => (
    { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }[m]
  )).replace(/\s+/g, ' ').trim();
}

// Tries the professional-stock tier first; only falls back to Commons (or
// the rest of Openverse) if that tier comes up empty for this term.
async function searchTerm(term) {
  const openverse = await searchOpenverse(term);
  await sleep(250);
  const preferred = openverse.filter((c) => c.preferred);
  if (preferred.length) return preferred;

  const commons = await searchCommons(term);
  await sleep(250);
  return [...openverse, ...commons];
}

async function searchCandidates(searchTerms) {
  const seenUrls = new Set();
  const all = [];
  for (const term of searchTerms) {
    for (const candidate of await searchTerm(term)) {
      if (seenUrls.has(candidate.fullUrl)) continue;
      seenUrls.add(candidate.fullUrl);
      all.push(candidate);
    }
  }
  return all.slice(0, 8);
}

module.exports = { searchCandidates, get, USER_AGENT };

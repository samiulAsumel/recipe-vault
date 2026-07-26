'use strict';

// Hand-authored, generator-owned literals that intentionally bypass esc() --
// collected here so an audit of "what raw markup ships" is a single file.

// Runs before the stylesheet loads so the stored theme choice is already on
// <html> when the browser computes initial styles -- an external script
// cannot do this without a round trip during which the wrong palette paints.
// It must try/catch: Safari private mode throws on localStorage access, and
// without the catch the no-js class would never clear.
const THEME_SCRIPT = `<script>(function(){var d=document.documentElement;d.classList.remove('no-js');try{var s=localStorage.getItem('hrb-theme');if(s==='light'||s==='dark'){d.dataset.theme=s;return;}}catch(e){}d.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';})();</script>`;

const ICON_SUN = `<svg class="icon icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`;
const ICON_MOON = `<svg class="icon icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>`;
const ICON_HAMBURGER = `<span></span><span></span><span></span>`;
const ICON_SEARCH = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`;
const ICON_CLOCK = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;
const ICON_SERVINGS = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v7a3 3 0 003 3v8M6 3v7M9 3v7M17 3c-2 0-3 2-3 4s1 3 3 3v11"/></svg>`;
const ICON_DIFFICULTY = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V10M12 21V4M20 21v-7"/></svg>`;
const ICON_BRAND = `<svg class="brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11h18a1 1 0 011 1 9 9 0 01-9 9H11a9 9 0 01-9-9 1 1 0 011-1z"/><path d="M7 11c0-3 1-6 1-8M12 11c0-4 1-6.5 1-9M17 11c0-3-1-5-1-7" fill="none"/></svg>`;
const ICON_CLOSE = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>`;
const ICON_CHECK = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>`;

module.exports = {
  THEME_SCRIPT, ICON_SUN, ICON_MOON, ICON_HAMBURGER, ICON_SEARCH, ICON_CLOCK,
  ICON_SERVINGS, ICON_DIFFICULTY, ICON_BRAND, ICON_CLOSE, ICON_CHECK,
};

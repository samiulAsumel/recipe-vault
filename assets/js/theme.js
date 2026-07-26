/* theme.js -- toggle wiring only. The theme itself is already set on <html>
   by the inline script in <head> before this file ever loads, which is what
   avoids a flash of the wrong theme. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const themeColorMeta = document.getElementById('theme-color');
  const THEME_COLORS = { light: '#FDF8F1', dark: '#1A1512' };

  // Deferred one frame so the stored theme's first paint never animates in.
  requestAnimationFrame(function () {
    root.classList.add('theme-ready');
  });

  function applyLabel(theme) {
    if (!toggle) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    const label = 'Switch to ' + next + ' theme';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  applyLabel(root.dataset.theme || 'light');

  if (!toggle) return;

  toggle.addEventListener('click', function () {
    const current = root.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    if (themeColorMeta) themeColorMeta.setAttribute('content', THEME_COLORS[next]);
    applyLabel(next);
    try {
      localStorage.setItem('hrb-theme', next);
    } catch (e) {
      /* Safari private mode throws on write -- the choice just won't persist. */
    }
  });
});

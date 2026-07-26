/* nav.js -- hamburger + mobile nav overlay. Vanilla, no build step. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!hamburger || !overlay) return;

  function closeNav() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-overlay-open');
  }

  function openNav() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-overlay-open');
  }

  hamburger.addEventListener('click', function () {
    if (hamburger.classList.contains('open')) closeNav();
    else openNav();
  });

  // Esc closes and returns focus to the control that opened it, so keyboard
  // users never land back at the top of the page after dismissing the menu.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && hamburger.classList.contains('open')) {
      closeNav();
      hamburger.focus();
    }
  });

  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });
});

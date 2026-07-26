/* nav.js -- hamburger + mobile nav overlay. Vanilla, no build step. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  initActiveNav();

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

// index.html is one page serving two nav targets -- "Home" (the hero) and
// "Recipes" (the #all section further down) -- so which one is "current"
// depends on the hash at runtime, not just the filename. The server-side
// aria-current (set from the page being rendered) is correct everywhere
// else and is left alone; this only runs where that ambiguity exists.
function initActiveNav() {
  const allSection = document.getElementById('all');
  if (!allSection) return;

  const homeLink = document.querySelector('.nav-link[href="index.html"]');
  const recipesLink = document.querySelector('.nav-link[href="index.html#all"]');
  if (!homeLink || !recipesLink) return;

  function update() {
    const onRecipes = location.hash === '#all';
    if (onRecipes) {
      recipesLink.setAttribute('aria-current', 'page');
      homeLink.removeAttribute('aria-current');
    } else {
      homeLink.setAttribute('aria-current', 'page');
      recipesLink.removeAttribute('aria-current');
    }
  }

  update();
  window.addEventListener('hashchange', update);
}

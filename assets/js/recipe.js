/* recipe.js -- servings scaler, step check-off, and scroll reveal for a
   single recipe page. Everything here is optional enhancement: the base
   ingredient list and steps are already correct and readable without it. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  initServingsScaler();
  initStepCheckoff();
  initReveal();
});

function initServingsScaler() {
  const countEl = document.getElementById('servings-count');
  const minusBtn = document.getElementById('servings-minus');
  const plusBtn = document.getElementById('servings-plus');
  if (!countEl || !minusBtn || !plusBtn) return;

  const base = Number(countEl.dataset.base);
  let current = base;
  const items = Array.from(document.querySelectorAll('.ingredient-list li[data-qty]'));

  function render() {
    countEl.textContent = String(current);
    const factor = current / base;
    for (const item of items) {
      const baseQty = Number(item.dataset.qty);
      const unit = item.dataset.unit;
      const textEl = item.querySelector('.ingredient-text');
      if (!textEl) continue;
      const scaled = baseQty * factor;
      textEl.textContent = formatScaled(scaled, unit, item.dataset.rest);
    }
  }

  const NO_PLURAL_UNITS = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'oz', 'lb'];

  // Mirrors tools/lib/format.js's formatQuantity + pluralizeUnit so the
  // scaled amount reads identically whether it came from the server or the
  // scaler -- "4 cloves" must not turn into "6 clove" after scaling up.
  function formatScaled(qty, unit, rest) {
    const rounded = Math.round(qty * 100) / 100;
    const whole = Math.floor(rounded);
    const frac = Math.round((rounded - whole) * 1000) / 1000;
    const knownFractions = [[0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'], [0.333, '1/3'], [0.667, '2/3']];
    let qtyText;
    if (frac === 0) {
      qtyText = String(whole);
    } else {
      const known = knownFractions.find(([v]) => Math.abs(v - frac) < 0.03);
      qtyText = known ? (whole ? whole + ' ' + known[1] : known[1]) : String(rounded);
    }
    let unitText = unit;
    if (unit && !NO_PLURAL_UNITS.includes(unit) && rounded !== 1 && !unit.endsWith('s')) {
      unitText = unit + 's';
    }
    return unitText ? `${qtyText} ${unitText} ${rest}` : `${qtyText} ${rest}`;
  }

  minusBtn.addEventListener('click', function () {
    if (current > 1) {
      current -= 1;
      render();
    }
  });
  plusBtn.addEventListener('click', function () {
    current += 1;
    render();
  });
}

function initStepCheckoff() {
  const checks = document.querySelectorAll('.step-check');
  for (const check of checks) {
    const key = 'hrb-step-' + location.pathname + '-' + check.dataset.step;
    try {
      if (localStorage.getItem(key) === '1') check.checked = true;
    } catch (e) {
      /* Safari private mode -- check-off state just won't persist. */
    }
    check.addEventListener('change', function () {
      try {
        if (check.checked) localStorage.setItem(key, '1');
        else localStorage.removeItem(key);
      } catch (e) {
        /* ignore */
      }
    });
  }
}

// Headless Chrome does not reliably fire IntersectionObserver, so CSS
// defaults every .reveal target to visible; this only adds the pre-reveal
// class immediately before observing, never before.
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.recipe-body, .nutrition, .related-recipes');
  if (!('IntersectionObserver' in window) || !targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal--pre');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });

  for (const target of targets) {
    target.classList.add('reveal');
    target.classList.add('reveal--pre');
    observer.observe(target);
  }
}

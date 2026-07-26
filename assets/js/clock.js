/* clock.js -- live clock/date in the header and footer, plus the
   auto-updating copyright year. Clock elements are marked aria-hidden in
   the markup: a value that changes every second has no business being
   announced to assistive tech on a timer, and the current time isn't
   essential content a screen reader user is missing. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('copyright-year');
  const timeEls = document.querySelectorAll('.js-clock-time');
  const dateEls = document.querySelectorAll('.js-clock-date');
  const shortDateEls = document.querySelectorAll('.js-clock-date-short');
  if (!timeEls.length && !dateEls.length && !shortDateEls.length && !yearEl) return;

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  // The header has 64px of height and shares a row with the nav -- a full
  // "Monday, July 27, 2026" won't fit there, so it gets a compact form.
  const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  // A plain setInterval(tick, 1000) drifts -- each callback is scheduled
  // 1000ms after the previous one FIRED, not after a real second boundary,
  // so error accumulates. Re-arming against the actual distance to the
  // next second boundary keeps the display aligned to the wall clock.
  function tick() {
    const now = new Date();
    const time = timeFormatter.format(now);
    const date = dateFormatter.format(now);
    const shortDate = shortDateFormatter.format(now);
    timeEls.forEach(function (el) { el.textContent = time; });
    dateEls.forEach(function (el) { el.textContent = date; });
    shortDateEls.forEach(function (el) { el.textContent = shortDate; });
    if (yearEl) yearEl.textContent = String(now.getFullYear());
    setTimeout(tick, 1000 - (now.getMilliseconds() || 0));
  }

  tick();
});

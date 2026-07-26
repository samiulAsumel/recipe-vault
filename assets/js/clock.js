/* clock.js -- footer live clock/date and the auto-updating copyright year.
   Marked aria-hidden in the markup: a value that changes every second has
   no business being announced to assistive tech on a timer, and the
   current time isn't essential content a screen reader user is missing. */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('copyright-year');
  const timeEl = document.getElementById('site-clock-time');
  const dateEl = document.getElementById('site-clock-date');
  if (!timeEl && !dateEl && !yearEl) return;

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // A plain setInterval(tick, 1000) drifts -- each callback is scheduled
  // 1000ms after the previous one FIRED, not after a real second boundary,
  // so error accumulates. Re-arming against the actual distance to the
  // next second boundary keeps the display aligned to the wall clock.
  function tick() {
    const now = new Date();
    if (timeEl) timeEl.textContent = timeFormatter.format(now);
    if (dateEl) dateEl.textContent = dateFormatter.format(now);
    if (yearEl) yearEl.textContent = String(now.getFullYear());
    setTimeout(tick, 1000 - (now.getMilliseconds() || 0));
  }

  tick();
});

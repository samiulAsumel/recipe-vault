'use strict';

// Google's Recipe rich-result parser rejects a duration carrying a zero
// component (e.g. "PT0H30M"), so empty parts are dropped entirely rather
// than zero-filled.
function minutesToISO(totalMinutes) {
  if (!Number.isInteger(totalMinutes) || totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return 'PT' + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '');
}

function humanTime(totalMinutes) {
  if (!Number.isInteger(totalMinutes) || totalMinutes <= 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts = [];
  if (hours) parts.push(hours + ' hr');
  if (minutes) parts.push(minutes + ' min');
  return parts.join(' ');
}

module.exports = { minutesToISO, humanTime };

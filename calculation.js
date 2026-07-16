(function exposeCalculation(root, factory) {
  const calculation = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = calculation;
  } else {
    root.PWR_CALC = calculation;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

  const minutesAllowed = [0, 15, 30, 45];

  const toDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(Number.NaN);
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return new Date(Number.NaN);
    }

    return date;
  };

  const cloneDate = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const fmtTime = totalMinutes => {
    const minuteOfDay = ((totalMinutes % 1440) + 1440) % 1440;
    return `${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`;
  };

  function dateAtOffset(startDate, absMinute) {
    const date = cloneDate(startDate);
    date.setDate(date.getDate() + Math.floor(absMinute / 1440));
    return date;
  }

  function isNightMinute(minuteOfDay) {
    return minuteOfDay < 360 || minuteOfDay >= 1200;
  }

  function startsWeekendContinuation(input) {
    const startDow = input.date.getDay();
    // Samstag: Sonntagsarbeit beginnt ab 17:00 und kann bis Montag 06:00 laufen.
    // Sonntag: bei Arbeitsbeginn am Sonntag läuft Sonntagsarbeit bis Montag 06:00 weiter.
    return startDow === 6 || startDow === 0;
  }

  function isWeekendPremium(absMinute, input) {
    if (input.holiday) return true;

    const date = dateAtOffset(input.date, absMinute);
    const dow = date.getDay();
    const minuteOfDay = absMinute % 1440;
    const startDow = input.date.getDay();

    // Sonntag selbst ist immer Sonn-/Feiertagsarbeit.
    if (dow === 0) return true;

    // Samstag ab 17:00 gilt als Sonntagsarbeit.
    if (dow === 6 && minuteOfDay >= 1020) return true;

    // Montag 00:00-06:00 bleibt nur dann Sonntagsarbeit,
    // wenn dieselbe Rapportzeile am Samstag oder Sonntag begonnen hat.
    if (dow === 1 && minuteOfDay < 360 && startsWeekendContinuation(input)) return true;

    // Beginnt die Rapportzeile am Montag, gilt ab 00:00 Wochentag Nacht.
    if (startDow === 1) return false;

    return false;
  }

  function classify(absMinute, input) {
    const date = dateAtOffset(input.date, absMinute);
    const dow = date.getDay();
    const minuteOfDay = absMinute % 1440;
    const night = isNightMinute(minuteOfDay);
    const premium = isWeekendPremium(absMinute, input);

    const category = premium
      ? (night ? 'sfNight' : 'sfDay')
      : (night ? 'wtNight' : 'wtDay');

    let reason;
    if (input.holiday) {
      reason = 'Beginn-Tag manuell als Feiertag markiert; gesamte Rapportzeile gilt als Sonn-/Feiertag';
    } else if (dow === 6 && minuteOfDay >= 1020) {
      reason = 'Samstag ab 17:00 Uhr gilt als Sonntagsarbeit';
    } else if (dow === 0) {
      reason = 'Sonntag';
    } else if (dow === 1 && minuteOfDay < 360 && startsWeekendContinuation(input)) {
      reason = 'Arbeitsbeginn am Samstag/Sonntag; Sonntagsarbeit läuft bis Montag 06:00 Uhr weiter';
    } else if (dow === 1 && minuteOfDay < 360) {
      reason = 'Arbeitsbeginn am Montag; ab Montag 00:00 Uhr gilt Wochentag Nacht';
    } else {
      reason = 'Normaler Wochentag';
    }
    reason += night ? ' · Nachtzeit 20:00–06:00' : ' · Tagzeit 06:00–20:00';
    return { category, reason };
  }

  function nextBoundary(absMinute, endAbs, input) {
    const day = Math.floor(absMinute / 1440);
    const minute = absMinute % 1440;
    const date = dateAtOffset(input.date, absMinute);
    const dow = date.getDay();
    const candidates = [360, 1200, 1440];
    if (dow === 6) candidates.push(1020); // Samstag 17:00
    const future = candidates
      .filter(value => value > minute)
      .map(value => day * 1440 + value);
    return Math.min(endAbs, ...(future.length ? future : [endAbs]));
  }

  function calculate(input) {
    if (!input || typeof input !== 'object') {
      return { valid: false, error: 'Die Eingabe fehlt oder ist ungültig.' };
    }
    if (!(input.date instanceof Date) || Number.isNaN(input.date.getTime())) {
      return { valid: false, error: 'Das Datum fehlt oder ist kein reales Kalenderdatum.' };
    }
    if (!Number.isInteger(input.startHour) || input.startHour < 0 || input.startHour > 23 ||
        !Number.isInteger(input.endHour) || input.endHour < 0 || input.endHour > 23) {
      return { valid: false, error: 'Stunden müssen ganzzahlig zwischen 0 und 23 liegen.' };
    }
    if (!Number.isInteger(input.startMinute) || !Number.isInteger(input.endMinute) ||
        !minutesAllowed.includes(input.startMinute) || !minutesAllowed.includes(input.endMinute)) {
      return { valid: false, error: 'Es sind nur die Minuten 00, 15, 30 oder 45 zulässig.' };
    }
    if (typeof input.holiday !== 'boolean') {
      return { valid: false, error: 'Die Feiertagsangabe muss ein Wahrheitswert sein.' };
    }

    const start = input.startHour * 60 + input.startMinute;
    let end = input.endHour * 60 + input.endMinute;

    if (start === end) {
      return { valid: false, error: 'Beginn und Ende dürfen nicht identisch sein.' };
    }

    const overnight = end < start;
    if (overnight) end += 1440;

    const result = {
      valid: true,
      overnight,
      totals: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 0 },
      segments: []
    };

    let cursor = start;
    while (cursor < end) {
      const boundary = nextBoundary(cursor, end, input);
      if (!Number.isFinite(boundary) || boundary <= cursor) {
        return { valid: false, error: 'Die Berechnung konnte nicht sicher segmentiert werden.' };
      }
      const classification = classify(cursor, input);
      const duration = boundary - cursor;
      result.totals[classification.category] += duration;
      result.segments.push({
        from: fmtTime(cursor),
        to: boundary % 1440 === 0 ? '24:00' : fmtTime(boundary),
        duration,
        category: classification.category,
        reason: classification.reason
      });
      cursor = boundary;
    }

    result.total = Object.values(result.totals).reduce((sum, value) => sum + value, 0);
    return result;
  }

  return { calculate, minutesAllowed, toDate };
});

(function exposeTestCases(root, factory) {
  const definition = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = definition;
  } else {
    root.PWR_TEST_CASES = definition;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';

const defaultInput = {
  date: '2026-07-13',
  holiday: false,
  startHour: 6,
  startMinute: 0,
  endHour: 14,
  endMinute: 0
};

const invalidResults = {
  hour: {
    valid: false,
    error: 'Stunden müssen ganzzahlig zwischen 0 und 23 liegen.',
    segments: undefined
  },
  date: {
    valid: false,
    error: 'Das Datum fehlt oder ist kein reales Kalenderdatum.',
    segments: undefined
  },
  minute: {
    valid: false,
    error: 'Es sind nur die Minuten 00, 15, 30 oder 45 zulässig.',
    segments: undefined
  },
  identical: {
    valid: false,
    error: 'Beginn und Ende dürfen nicht identisch sein.',
    segments: undefined
  }
};

const testCases = [
  {
    id: 'MT-001',
    group: 'Modul- und Robustheitstests',
    title: 'Negative Stunden werden abgelehnt',
    description: 'Startstunde -1',
    expected: invalidResults.hour,
    kind: 'invalid-input',
    scenarios: [{ startHour: -1 }]
  },
  {
    id: 'MT-002',
    group: 'Modul- und Robustheitstests',
    title: 'Stunde 24 wird abgelehnt',
    description: 'Endstunde 24',
    expected: invalidResults.hour,
    kind: 'invalid-input',
    scenarios: [{ endHour: 24 }]
  },
  {
    id: 'MT-003',
    group: 'Modul- und Robustheitstests',
    title: 'Gebrochene und nichtnumerische Stunden werden abgelehnt',
    description: 'Startstunde 6.5 bzw. "6"; Endstunde NaN',
    expected: invalidResults.hour,
    kind: 'invalid-input',
    scenarios: [{ startHour: 6.5 }, { startHour: '6' }, { endHour: Number.NaN }]
  },
  {
    id: 'MT-004',
    group: 'Modul- und Robustheitstests',
    title: 'Fehlendes und ungültiges Datum werden abgelehnt',
    description: 'Datum fehlt bzw. ist Invalid Date',
    expected: invalidResults.date,
    kind: 'invalid-input',
    scenarios: [{ date: undefined }, { date: new Date(Number.NaN) }]
  },
  {
    id: 'MT-005',
    group: 'Modul- und Robustheitstests',
    title: 'Nicht existierendes Kalenderdatum wird abgelehnt',
    description: '30.02.2026',
    expected: { dateIsInvalid: true, ...invalidResults.date },
    kind: 'invalid-calendar-date',
    date: '2026-02-30'
  },
  {
    id: 'MT-006',
    group: 'Modul- und Robustheitstests',
    title: 'Ungültige, gebrochene und nichtnumerische Minuten werden abgelehnt',
    description: 'Startminute 5, 15.5 bzw. "15"',
    expected: invalidResults.minute,
    kind: 'invalid-input',
    scenarios: [{ startMinute: 5 }, { startMinute: 15.5 }, { startMinute: '15' }]
  },
  {
    id: 'MT-007',
    group: 'Modul- und Robustheitstests',
    title: 'Beginn gleich Ende wird abgelehnt',
    description: 'Beginn und Ende 06:00',
    expected: invalidResults.identical,
    kind: 'invalid-input',
    scenarios: [{ endHour: 6 }]
  },
  {
    id: 'MT-008',
    group: 'Modul- und Robustheitstests',
    title: 'Ungültige Eingaben terminieren garantiert',
    description: 'Berechnung mit negativer Startstunde in separatem Node-Prozess',
    expected: {
      valid: false,
      error: 'Stunden müssen ganzzahlig zwischen 0 und 23 liegen.',
      exitCode: 0,
      completesWithinMs: 1000
    },
    kind: 'termination',
    input: {
      date: '2026-07-13',
      holiday: false,
      startHour: -1,
      startMinute: 0,
      endHour: 1,
      endMinute: 0
    }
  },
  {
    id: 'TC-001', group: 'Fachtests', title: 'Montag 06:00–14:00',
    description: 'Montag 06:00–14:00', kind: 'calculation',
    date: '2026-07-13', start: '06:00', end: '14:00', holiday: false,
    expected: {
      valid: true,
      overnight: false,
      totals: { wtDay: 480, wtNight: 0, sfDay: 0, sfNight: 0 },
      total: 480,
      segments: [{
        from: '06:00',
        to: '14:00',
        duration: 480,
        category: 'wtDay',
        reason: 'Normaler Wochentag · Tagzeit 06:00–20:00'
      }]
    }
  },
  {
    id: 'TC-002', group: 'Fachtests', title: 'Montag 18:00–22:00',
    description: 'Montag 18:00–22:00', kind: 'calculation',
    date: '2026-07-13', start: '18:00', end: '22:00', holiday: false,
    expected: {
      valid: true, overnight: false,
      totals: { wtDay: 120, wtNight: 120, sfDay: 0, sfNight: 0 }, total: 240
    }
  },
  {
    id: 'TC-003', group: 'Fachtests', title: 'Samstag 14:00–22:00',
    description: 'Samstag 14:00–22:00', kind: 'calculation',
    date: '2026-07-18', start: '14:00', end: '22:00', holiday: false,
    expected: {
      valid: true, overnight: false,
      totals: { wtDay: 180, wtNight: 0, sfDay: 180, sfNight: 120 }, total: 480
    }
  },
  {
    id: 'TC-004', group: 'Fachtests', title: 'Samstag 22:00–Sonntag 06:00',
    description: 'Samstag 22:00–Sonntag 06:00', kind: 'calculation',
    date: '2026-07-18', start: '22:00', end: '06:00', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 480 }, total: 480
    }
  },
  {
    id: 'TC-005', group: 'Fachtests', title: 'Sonntag 08:00–16:00',
    description: 'Sonntag 08:00–16:00', kind: 'calculation',
    date: '2026-07-19', start: '08:00', end: '16:00', holiday: false,
    expected: {
      valid: true, overnight: false,
      totals: { wtDay: 0, wtNight: 0, sfDay: 480, sfNight: 0 }, total: 480
    }
  },
  {
    id: 'TC-006', group: 'Fachtests', title: 'Sonntag 20:00–Montag 07:00',
    description: 'Sonntag 20:00–Montag 07:00', kind: 'calculation',
    date: '2026-07-19', start: '20:00', end: '07:00', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 60, wtNight: 0, sfDay: 0, sfNight: 600 }, total: 660
    }
  },
  {
    id: 'TC-007', group: 'Fachtests', title: 'Sonntag 23:45–Montag 06:00',
    description: 'Sonntag 23:45–Montag 06:00', kind: 'calculation',
    date: '2026-07-19', start: '23:45', end: '06:00', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 375 }, total: 375
    }
  },
  {
    id: 'TC-008', group: 'Fachtests', title: 'Montag 00:00–07:00',
    description: 'Montag 00:00–07:00', kind: 'calculation',
    date: '2026-07-20', start: '00:00', end: '07:00', holiday: false,
    expected: {
      valid: true, overnight: false,
      totals: { wtDay: 60, wtNight: 360, sfDay: 0, sfNight: 0 }, total: 420
    }
  },
  {
    id: 'TC-009', group: 'Fachtests', title: 'Samstag 16:00–Sonntag 07:00',
    description: 'Samstag 16:00–Sonntag 07:00', kind: 'calculation',
    date: '2026-07-18', start: '16:00', end: '07:00', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 60, wtNight: 0, sfDay: 240, sfNight: 600 }, total: 900
    }
  },
  {
    id: 'TC-010', group: 'Fachtests', title: 'Freitag 22:00–Samstag 06:00',
    description: 'Freitag 22:00–Samstag 06:00', kind: 'calculation',
    date: '2026-07-17', start: '22:00', end: '06:00', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 0, wtNight: 480, sfDay: 0, sfNight: 0 }, total: 480
    }
  },
  {
    id: 'TC-011', group: 'Fachtests', title: 'Feiertag 18:00–07:00',
    description: 'Feiertag 18:00–07:00', kind: 'calculation',
    date: '2026-07-14', start: '18:00', end: '07:00', holiday: true,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 0, wtNight: 0, sfDay: 180, sfNight: 600 }, total: 780
    }
  },
  {
    id: 'TC-012', group: 'Fachtests', title: 'Dienstag 18:30–Mittwoch 07:15',
    description: 'Dienstag 18:30–Mittwoch 07:15', kind: 'calculation',
    date: '2026-07-14', start: '18:30', end: '07:15', holiday: false,
    expected: {
      valid: true, overnight: true,
      totals: { wtDay: 165, wtNight: 600, sfDay: 0, sfNight: 0 }, total: 765
    }
  },
  {
    id: 'TC-013',
    group: 'Fachtests',
    title: 'Identische Zeiten werden abgelehnt',
    description: '06:00–06:00',
    expected: invalidResults.identical,
    kind: 'invalid-input',
    scenarios: [{ startHour: 6, endHour: 6 }]
  }
];

return { defaultInput, testCases };
});

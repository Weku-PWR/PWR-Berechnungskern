'use strict';

const invalidResult = 'Eingabe ungültig; keine Segmente';

const testCases = [
  {
    id: 'MT-001',
    group: 'Modul- und Robustheitstests',
    title: 'Negative Stunden werden abgelehnt',
    description: 'Startstunde -1',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ startHour: -1 }]
  },
  {
    id: 'MT-002',
    group: 'Modul- und Robustheitstests',
    title: 'Stunde 24 wird abgelehnt',
    description: 'Endstunde 24',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ endHour: 24 }]
  },
  {
    id: 'MT-003',
    group: 'Modul- und Robustheitstests',
    title: 'Gebrochene und nichtnumerische Stunden werden abgelehnt',
    description: 'Startstunde 6.5 bzw. "6"; Endstunde NaN',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ startHour: 6.5 }, { startHour: '6' }, { endHour: Number.NaN }]
  },
  {
    id: 'MT-004',
    group: 'Modul- und Robustheitstests',
    title: 'Fehlendes und ungültiges Datum werden abgelehnt',
    description: 'Datum fehlt bzw. ist Invalid Date',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ date: undefined }, { date: new Date(Number.NaN) }]
  },
  {
    id: 'MT-005',
    group: 'Modul- und Robustheitstests',
    title: 'Nicht existierendes Kalenderdatum wird abgelehnt',
    description: '30.02.2026',
    expectation: 'Datumsumwandlung liefert Invalid Date; Berechnung ist ungültig',
    kind: 'invalid-calendar-date',
    date: '2026-02-30'
  },
  {
    id: 'MT-006',
    group: 'Modul- und Robustheitstests',
    title: 'Ungültige, gebrochene und nichtnumerische Minuten werden abgelehnt',
    description: 'Startminute 5, 15.5 bzw. "15"',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ startMinute: 5 }, { startMinute: 15.5 }, { startMinute: '15' }]
  },
  {
    id: 'MT-007',
    group: 'Modul- und Robustheitstests',
    title: 'Beginn gleich Ende wird abgelehnt',
    description: 'Beginn und Ende 06:00',
    expectation: invalidResult,
    kind: 'invalid-input',
    scenarios: [{ endHour: 6 }]
  },
  {
    id: 'MT-008',
    group: 'Modul- und Robustheitstests',
    title: 'Ungültige Eingaben terminieren garantiert',
    description: 'Berechnung mit negativer Startstunde in separatem Node-Prozess',
    expectation: 'Prozess terminiert innerhalb 1 s und bestätigt die ungültige Eingabe',
    kind: 'termination',
    timeout: 1000,
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
    description: 'Montag 06:00–14:00', expectation: '8.00 WT Tag', kind: 'calculation',
    date: '2026-07-13', start: '06:00', end: '14:00', holiday: false,
    expected: { wtDay: 480, wtNight: 0, sfDay: 0, sfNight: 0 }
  },
  {
    id: 'TC-002', group: 'Fachtests', title: 'Montag 18:00–22:00',
    description: 'Montag 18:00–22:00', expectation: '2.00 WT Tag + 2.00 WT Nacht', kind: 'calculation',
    date: '2026-07-13', start: '18:00', end: '22:00', holiday: false,
    expected: { wtDay: 120, wtNight: 120, sfDay: 0, sfNight: 0 }
  },
  {
    id: 'TC-003', group: 'Fachtests', title: 'Samstag 14:00–22:00',
    description: 'Samstag 14:00–22:00', expectation: '3.00 WT Tag + 3.00 So/FT Tag + 2.00 So/FT Nacht', kind: 'calculation',
    date: '2026-07-18', start: '14:00', end: '22:00', holiday: false,
    expected: { wtDay: 180, wtNight: 0, sfDay: 180, sfNight: 120 }
  },
  {
    id: 'TC-004', group: 'Fachtests', title: 'Samstag 22:00–Sonntag 06:00',
    description: 'Samstag 22:00–Sonntag 06:00', expectation: '8.00 So/FT Nacht', kind: 'calculation',
    date: '2026-07-18', start: '22:00', end: '06:00', holiday: false,
    expected: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 480 }
  },
  {
    id: 'TC-005', group: 'Fachtests', title: 'Sonntag 08:00–16:00',
    description: 'Sonntag 08:00–16:00', expectation: '8.00 So/FT Tag', kind: 'calculation',
    date: '2026-07-19', start: '08:00', end: '16:00', holiday: false,
    expected: { wtDay: 0, wtNight: 0, sfDay: 480, sfNight: 0 }
  },
  {
    id: 'TC-006', group: 'Fachtests', title: 'Sonntag 20:00–Montag 07:00',
    description: 'Sonntag 20:00–Montag 07:00', expectation: '10.00 So/FT Nacht + 1.00 WT Tag', kind: 'calculation',
    date: '2026-07-19', start: '20:00', end: '07:00', holiday: false,
    expected: { wtDay: 60, wtNight: 0, sfDay: 0, sfNight: 600 }
  },
  {
    id: 'TC-007', group: 'Fachtests', title: 'Sonntag 23:45–Montag 06:00',
    description: 'Sonntag 23:45–Montag 06:00', expectation: '6.25 So/FT Nacht', kind: 'calculation',
    date: '2026-07-19', start: '23:45', end: '06:00', holiday: false,
    expected: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 375 }
  },
  {
    id: 'TC-008', group: 'Fachtests', title: 'Montag 00:00–07:00',
    description: 'Montag 00:00–07:00', expectation: '6.00 WT Nacht + 1.00 WT Tag', kind: 'calculation',
    date: '2026-07-20', start: '00:00', end: '07:00', holiday: false,
    expected: { wtDay: 60, wtNight: 360, sfDay: 0, sfNight: 0 }
  },
  {
    id: 'TC-009', group: 'Fachtests', title: 'Samstag 16:00–Sonntag 07:00',
    description: 'Samstag 16:00–Sonntag 07:00', expectation: '1.00 WT Tag + 4.00 So/FT Tag + 10.00 So/FT Nacht', kind: 'calculation',
    date: '2026-07-18', start: '16:00', end: '07:00', holiday: false,
    expected: { wtDay: 60, wtNight: 0, sfDay: 240, sfNight: 600 }
  },
  {
    id: 'TC-010', group: 'Fachtests', title: 'Freitag 22:00–Samstag 06:00',
    description: 'Freitag 22:00–Samstag 06:00', expectation: '8.00 WT Nacht', kind: 'calculation',
    date: '2026-07-17', start: '22:00', end: '06:00', holiday: false,
    expected: { wtDay: 0, wtNight: 480, sfDay: 0, sfNight: 0 }
  },
  {
    id: 'TC-011', group: 'Fachtests', title: 'Feiertag 18:00–07:00',
    description: 'Feiertag 18:00–07:00', expectation: '3.00 So/FT Tag + 10.00 So/FT Nacht', kind: 'calculation',
    date: '2026-07-14', start: '18:00', end: '07:00', holiday: true,
    expected: { wtDay: 0, wtNight: 0, sfDay: 180, sfNight: 600 }
  },
  {
    id: 'TC-012', group: 'Fachtests', title: 'Dienstag 18:30–Mittwoch 07:15',
    description: 'Dienstag 18:30–Mittwoch 07:15', expectation: '2.75 WT Tag + 10.00 WT Nacht', kind: 'calculation',
    date: '2026-07-14', start: '18:30', end: '07:15', holiday: false,
    expected: { wtDay: 165, wtNight: 600, sfDay: 0, sfNight: 0 }
  },
  {
    id: 'TC-013',
    group: 'Fachtests',
    title: 'Identische Zeiten werden abgelehnt',
    description: '06:00–06:00',
    expectation: 'ungültig',
    kind: 'invalid-input',
    scenarios: [{ startHour: 6, endHour: 6 }]
  }
];

module.exports = { testCases };

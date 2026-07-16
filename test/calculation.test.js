'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');
const test = require('node:test');

const { calculate, toDate } = require('../calculation.js');
const execFileAsync = promisify(execFile);

function input(overrides = {}) {
  return {
    date: toDate('2026-07-13'),
    holiday: false,
    startHour: 6,
    startMinute: 0,
    endHour: 14,
    endMinute: 0,
    ...overrides
  };
}

function assertInvalid(overrides) {
  const result = calculate(input(overrides));
  assert.equal(result.valid, false);
  assert.equal(result.segments, undefined);
}

test('negative Stunden werden abgelehnt', () => {
  assertInvalid({ startHour: -1 });
});

test('Stunde 24 wird abgelehnt', () => {
  assertInvalid({ endHour: 24 });
});

test('gebrochene und nichtnumerische Stunden werden abgelehnt', () => {
  assertInvalid({ startHour: 6.5 });
  assertInvalid({ startHour: '6' });
  assertInvalid({ endHour: Number.NaN });
});

test('fehlendes und ungültiges Datum werden abgelehnt', () => {
  assertInvalid({ date: undefined });
  assertInvalid({ date: new Date(Number.NaN) });
});

test('nicht existierendes Kalenderdatum wird abgelehnt', () => {
  const date = toDate('2026-02-30');
  assert.equal(Number.isNaN(date.getTime()), true);
  assertInvalid({ date });
});

test('ungültige, gebrochene und nichtnumerische Minuten werden abgelehnt', () => {
  assertInvalid({ startMinute: 5 });
  assertInvalid({ startMinute: 15.5 });
  assertInvalid({ startMinute: '15' });
});

test('Beginn gleich Ende wird abgelehnt', () => {
  assertInvalid({ endHour: 6 });
});

test('ungültige Eingaben terminieren garantiert', async () => {
  const calculationPath = path.resolve(__dirname, '..', 'calculation.js');
  const script = `
    const { calculate, toDate } = require(${JSON.stringify(calculationPath)});
    const result = calculate({
      date: toDate('2026-07-13'), holiday: false,
      startHour: -1, startMinute: 0, endHour: 1, endMinute: 0
    });
    if (result.valid !== false) process.exit(1);
  `;

  await execFileAsync(process.execPath, ['-e', script], { timeout: 1000 });
});

const fachtests = [
  ['TC-001', '2026-07-13', '06:00', '14:00', false, { wtDay: 480, wtNight: 0, sfDay: 0, sfNight: 0 }],
  ['TC-002', '2026-07-13', '18:00', '22:00', false, { wtDay: 120, wtNight: 120, sfDay: 0, sfNight: 0 }],
  ['TC-003', '2026-07-18', '14:00', '22:00', false, { wtDay: 180, wtNight: 0, sfDay: 180, sfNight: 120 }],
  ['TC-004', '2026-07-18', '22:00', '06:00', false, { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 480 }],
  ['TC-005', '2026-07-19', '08:00', '16:00', false, { wtDay: 0, wtNight: 0, sfDay: 480, sfNight: 0 }],
  ['TC-006', '2026-07-19', '20:00', '07:00', false, { wtDay: 60, wtNight: 0, sfDay: 0, sfNight: 600 }],
  ['TC-007', '2026-07-19', '23:45', '06:00', false, { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 375 }],
  ['TC-008', '2026-07-20', '00:00', '07:00', false, { wtDay: 60, wtNight: 360, sfDay: 0, sfNight: 0 }],
  ['TC-009', '2026-07-18', '16:00', '07:00', false, { wtDay: 60, wtNight: 0, sfDay: 240, sfNight: 600 }],
  ['TC-010', '2026-07-17', '22:00', '06:00', false, { wtDay: 0, wtNight: 480, sfDay: 0, sfNight: 0 }],
  ['TC-011', '2026-07-14', '18:00', '07:00', true, { wtDay: 0, wtNight: 0, sfDay: 180, sfNight: 600 }],
  ['TC-012', '2026-07-14', '18:30', '07:15', false, { wtDay: 165, wtNight: 600, sfDay: 0, sfNight: 0 }]
];

for (const [id, date, start, end, holiday, expected] of fachtests) {
  test(`${id} erfüllt das Fachregelwerk`, () => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const result = calculate({
      date: toDate(date), holiday, startHour, startMinute, endHour, endMinute
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.totals, expected);
  });
}

test('TC-013 lehnt identische Zeiten ab', () => {
  assertInvalid({ startHour: 6, endHour: 6 });
});

'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');
const test = require('node:test');

const { calculate, toDate } = require('../calculation.js');
const { testCases } = require('./test-cases.js');

const execFileAsync = promisify(execFile);

function defaultInput(overrides = {}) {
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

function assertExpectedResult(result, expected) {
  assert.equal(result.valid, expected.valid);
  if (Object.hasOwn(expected, 'segments')) assert.equal(result.segments, expected.segments);
  if (Object.hasOwn(expected, 'totals')) assert.deepEqual(result.totals, expected.totals);
}

function assertInvalid(overrides, expected) {
  const result = calculate(defaultInput(overrides));
  assertExpectedResult(result, expected);
}

function timeParts(value) {
  return value.split(':').map(Number);
}

async function runTestCase(testCase) {
  switch (testCase.kind) {
    case 'invalid-input':
      for (const scenario of testCase.scenarios) assertInvalid(scenario, testCase.expected);
      return;

    case 'invalid-calendar-date': {
      const date = toDate(testCase.date);
      assert.equal(Number.isNaN(date.getTime()), testCase.expected.dateIsInvalid);
      assertInvalid({ date }, testCase.expected);
      return;
    }

    case 'termination': {
      const calculationPath = path.resolve(__dirname, '..', 'calculation.js');
      const input = { ...testCase.input, date: null };
      const script = `
        const { calculate, toDate } = require(${JSON.stringify(calculationPath)});
        const input = ${JSON.stringify(input)};
        input.date = toDate(${JSON.stringify(testCase.input.date)});
        if (calculate(input).valid !== ${JSON.stringify(testCase.expected.valid)}) process.exit(1);
      `;

      let exitCode = 0;
      let signal;
      try {
        await execFileAsync(process.execPath, ['-e', script], {
          timeout: testCase.expected.completesWithinMs
        });
      } catch (error) {
        exitCode = error.code;
        signal = error.signal;
      }
      assert.equal(signal, undefined);
      assert.equal(exitCode, testCase.expected.exitCode);
      return;
    }

    case 'calculation': {
      const [startHour, startMinute] = timeParts(testCase.start);
      const [endHour, endMinute] = timeParts(testCase.end);
      const result = calculate({
        date: toDate(testCase.date),
        holiday: testCase.holiday,
        startHour,
        startMinute,
        endHour,
        endMinute
      });

      assertExpectedResult(result, testCase.expected);
      return;
    }

    default:
      throw new Error(`Unbekannte Testfallart: ${testCase.kind}`);
  }
}

for (const testCase of testCases) {
  test(`${testCase.id} ${testCase.title}`, () => runTestCase(testCase));
}

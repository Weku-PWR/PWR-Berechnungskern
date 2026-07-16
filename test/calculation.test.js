'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');
const test = require('node:test');

const { calculate, toDate } = require('../calculation.js');
const { defaultInput, testCases } = require('./test-cases.js');

const execFileAsync = promisify(execFile);

function materializeInput(input) {
  return {
    ...input,
    date: typeof input.date === 'string' ? toDate(input.date) : input.date
  };
}

function assertExpectedResult(result, expected) {
  assert.equal(result.valid, expected.valid);
  if (Object.hasOwn(expected, 'error')) assert.equal(result.error, expected.error);
  if (Object.hasOwn(expected, 'overnight')) assert.equal(result.overnight, expected.overnight);
  if (Object.hasOwn(expected, 'totals')) assert.deepEqual(result.totals, expected.totals);
  if (Object.hasOwn(expected, 'total')) assert.equal(result.total, expected.total);
  if (Object.hasOwn(expected, 'segments')) assert.deepEqual(result.segments, expected.segments);
}

function assertInvalid(overrides, expected) {
  const result = calculate(materializeInput({ ...defaultInput, ...overrides }));
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
        const result = calculate(input);
        if (result.valid !== ${JSON.stringify(testCase.expected.valid)}) process.exit(1);
        if (result.error !== ${JSON.stringify(testCase.expected.error)}) process.exit(2);
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

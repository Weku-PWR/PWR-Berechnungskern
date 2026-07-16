'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { defaultInput, testCases } = require('../test/test-cases.js');

const projectRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(projectRoot, 'TESTKATALOG.md');

function normalizeLineEndings(value) {
  return value.replaceAll('\r\n', '\n');
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function canonicalize(value) {
  if (value === undefined) return { $type: 'undefined' };
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { $type: 'number', value: String(value) };
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? { $type: 'date', value: 'Invalid Date' }
      : { $type: 'date', value: value.toISOString() };
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function canonicalJson(value, spacing = 0) {
  return JSON.stringify(canonicalize(value), null, spacing);
}

function executableInputs(testCase) {
  switch (testCase.kind) {
    case 'calculation':
      return {
        date: testCase.date,
        holiday: testCase.holiday,
        start: testCase.start,
        end: testCase.end
      };
    case 'invalid-input':
      return { defaultInput, scenarios: testCase.scenarios };
    case 'invalid-calendar-date':
      return { defaultInput, date: testCase.date };
    case 'termination':
      return testCase.input;
    default:
      throw new Error(`Unbekannte Testfallart: ${testCase.kind}`);
  }
}

function renderCatalog() {
  const lines = [
    '# PWR Testkatalog 2.1.1',
    '',
    '<!-- Generiert aus test/test-cases.js; nicht manuell bearbeiten. -->',
    '',
    `Die ausführbare Testsuite umfasst ${testCases.length} Testfälle.`,
    ''
  ];

  const groups = [...new Set(testCases.map(testCase => testCase.group))];
  for (const group of groups) {
    lines.push(`## ${group}`, '', '| ID | Fall | Eingaben (verlustfrei) | Erwartung (verlustfrei) |', '|---|---|---|---|');
    for (const testCase of testCases.filter(item => item.group === group)) {
      lines.push(`| ${escapeCell(testCase.id)} | ${escapeCell(testCase.description)} | `
        + `${escapeCell(canonicalJson(executableInputs(testCase)))} | `
        + `${escapeCell(canonicalJson(testCase.expected))} |`);
    }
    lines.push('');
  }

  lines.push(
    '## Maschinenlesbare kanonische Definition',
    '',
    'Die folgende Darstellung enthält die vollständigen ausführbaren Eingaben und Sollwerte. '
      + 'Sonderwerte wie `undefined`, `NaN` und ungültige Datumswerte sind typmarkiert.',
    '',
    '```json',
    canonicalJson({ defaultInput, testCases }, 2),
    '```',
    ''
  );

  return lines.join('\n');
}

const expectedCatalog = renderCatalog();
if (process.argv.includes('--check')) {
  const currentCatalog = fs.existsSync(catalogPath) ? fs.readFileSync(catalogPath, 'utf8') : '';
  const normalizedCatalog = normalizeLineEndings(currentCatalog);
  if (normalizedCatalog !== expectedCatalog) {
    const currentLines = normalizedCatalog.split('\n');
    const expectedLines = expectedCatalog.split('\n');
    const firstDifference = expectedLines.findIndex((line, index) => line !== currentLines[index]);
    console.error('TESTKATALOG.md ist nicht mit test/test-cases.js synchron.');
    console.error(`Erste Abweichung in Zeile ${firstDifference + 1}.`);
    console.error(`Ist: ${JSON.stringify(currentLines[firstDifference])}`);
    console.error(`Soll: ${JSON.stringify(expectedLines[firstDifference])}`);
    console.error('Mit "npm run test:catalog" neu erzeugen.');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(catalogPath, expectedCatalog, 'utf8');
  console.log(`TESTKATALOG.md mit ${testCases.length} Testfällen aktualisiert.`);
}

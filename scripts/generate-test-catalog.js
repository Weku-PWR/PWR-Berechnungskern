'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { testCases } = require('../test/test-cases.js');

const projectRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(projectRoot, 'TESTKATALOG.md');

function normalizeLineEndings(value) {
  return value.replaceAll('\r\n', '\n');
}

function escapeCell(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

const totalLabels = {
  wtDay: 'WT Tag',
  wtNight: 'WT Nacht',
  sfDay: 'So/FT Tag',
  sfNight: 'So/FT Nacht'
};

function formatExpectation(testCase) {
  const { expected } = testCase;

  switch (testCase.kind) {
    case 'calculation':
      return Object.entries(expected.totals)
        .filter(([, minutes]) => minutes !== 0)
        .map(([category, minutes]) => `${(minutes / 60).toFixed(2)} ${totalLabels[category]}`)
        .join(' + ');

    case 'invalid-calendar-date':
      return `Datumsumwandlung liefert ${expected.dateIsInvalid ? 'Invalid Date' : 'ein gültiges Datum'}; `
        + `Berechnung ist ${expected.valid ? 'gültig' : 'ungültig'}`;

    case 'termination':
      return `Prozess terminiert innerhalb ${expected.completesWithinMs / 1000} s und bestätigt die `
        + `${expected.valid ? 'gültige' : 'ungültige'} Eingabe`;

    case 'invalid-input':
      return testCase.group === 'Fachtests'
        ? (expected.valid ? 'gültig' : 'ungültig')
        : `Eingabe ${expected.valid ? 'gültig' : 'ungültig'}; `
          + `${expected.segments === undefined ? 'keine Segmente' : 'Segmente vorhanden'}`;

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
    lines.push(`## ${group}`, '', '| ID | Fall | Erwartung |', '|---|---|---|');
    for (const testCase of testCases.filter(item => item.group === group)) {
      const expectation = formatExpectation(testCase);
      lines.push(`| ${escapeCell(testCase.id)} | ${escapeCell(testCase.description)} | ${escapeCell(expectation)} |`);
    }
    lines.push('');
  }

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

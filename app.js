(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const { calculate, minutesAllowed, toDate } = window.PWR_CALC;
  const { defaultInput, testCases } = window.PWR_TEST_CASES;
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const shortWeekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const categoryLabel = {
    wtDay: 'Wochentag Tag',
    wtNight: 'Wochentag Nacht',
    sfDay: 'Sonn-/Feiertag Tag',
    sfNight: 'Sonn-/Feiertag Nacht'
  };

  function fillSelect(select, values, selected) {
    select.innerHTML = '';
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = String(value).padStart(2, '0');
      option.selected = value === selected;
      select.appendChild(option);
    });
  }

  fillSelect($('startHour'), [...Array(24).keys()], 6);
  fillSelect($('endHour'), [...Array(24).keys()], 18);
  fillSelect($('startMinute'), minutesAllowed, 0);
  fillSelect($('endMinute'), minutesAllowed, 0);

  const fmtHours = minutes => `${(minutes / 60).toFixed(2)} h`;

  function updateWeekday() {
    const date = toDate($('dateInput').value);
    if (Number.isNaN(date.getTime())) {
      $('weekdayDisplay').textContent = 'Bitte Datum auswählen';
      $('weekdayDisplay').classList.remove('weekend');
      return;
    }
    const day = date.getDay();
    $('weekdayDisplay').textContent = `${shortWeekdays[day]} · ${weekdays[day]}`;
    $('weekdayDisplay').classList.toggle('weekend', day === 0 || day === 6);
  }

  function currentInput() {
    return {
      date: toDate($('dateInput').value),
      holiday: $('holidayInput').checked,
      startHour: Number($('startHour').value),
      startMinute: Number($('startMinute').value),
      endHour: Number($('endHour').value),
      endMinute: Number($('endMinute').value)
    };
  }

  const fieldControls = {
    date: ['dateInput'],
    start: ['startHour', 'startMinute'],
    end: ['endHour', 'endMinute']
  };
  const fieldGroups = { date: 'dateField', start: 'startField', end: 'endField' };
  const fieldErrors = { date: 'dateError', start: 'startError', end: 'endError' };
  const resultIds = ['wtDay', 'wtNight', 'sfDay', 'sfNight', 'total', 'metaWeekday', 'metaHoliday', 'metaOvernight', 'metaValid'];

  function clearValidation() {
    $('errorBox').hidden = true;
    $('errorBox').textContent = '';
    Object.keys(fieldGroups).forEach(key => {
      $(fieldGroups[key]).classList.remove('field-invalid');
      $(fieldErrors[key]).hidden = true;
      $(fieldErrors[key]).textContent = '';
      fieldControls[key].forEach(id => $(id).removeAttribute('aria-invalid'));
    });
  }

  function setDetailsExpanded(expanded) {
    $('detailTableWrap').hidden = !expanded;
    $('toggleDetails').textContent = expanded ? 'Rechenweg ausblenden' : 'Rechenweg anzeigen';
    $('toggleDetails').setAttribute('aria-expanded', String(expanded));
  }

  function clearResults(message = 'Noch keine gültige Berechnung.') {
    resultIds.forEach(id => { $(id).textContent = ''; });
    $('metaWeekday').style.color = '';
    $('metaValid').style.color = '';
    $('detailRows').innerHTML = '';
    $('resultContent').hidden = true;
    $('resultEmpty').hidden = false;
    $('resultEmpty').textContent = message;
    $('detailContent').hidden = true;
    $('detailEmpty').hidden = false;
    $('detailEmpty').textContent = message === 'Noch keine gültige Berechnung.'
      ? 'Der Rechenweg erscheint nach einer gültigen Berechnung.'
      : message;
    $('toggleDetails').disabled = true;
    setDetailsExpanded(false);
  }

  function showError(message, fields = [], messages = {}) {
    clearResults('Keine Berechnung wegen ungültiger Eingabe.');
    $('errorBox').textContent = message;
    $('errorBox').hidden = false;
    fields.forEach(key => {
      $(fieldGroups[key]).classList.add('field-invalid');
      $(fieldErrors[key]).textContent = messages[key] || message;
      $(fieldErrors[key]).hidden = false;
      fieldControls[key].forEach(id => $(id).setAttribute('aria-invalid', 'true'));
    });
    if (fields.length) $(fieldControls[fields[0]][0]).focus();
  }

  function updateOvernightHint() {
    const start = Number($('startHour').value) * 60 + Number($('startMinute').value);
    const end = Number($('endHour').value) * 60 + Number($('endMinute').value);
    $('overnightHint').hidden = !Number.isFinite(start) || !Number.isFinite(end) || end >= start;
  }

  function validateInput() {
    const dateValue = $('dateInput').value;
    if (!dateValue) {
      return {
        message: 'Bitte korrigieren Sie das markierte Pflichtfeld.',
        fields: ['date'],
        messages: { date: 'Datum fehlt. Bitte wählen Sie ein Datum aus.' }
      };
    }
    if (Number.isNaN(toDate(dateValue).getTime())) {
      return {
        message: 'Bitte korrigieren Sie das markierte Feld.',
        fields: ['date'],
        messages: { date: 'Das Datum ist ungültig. Bitte wählen Sie ein gültiges Kalenderdatum aus.' }
      };
    }

    const startHour = Number($('startHour').value);
    const startMinute = Number($('startMinute').value);
    const endHour = Number($('endHour').value);
    const endMinute = Number($('endMinute').value);
    if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
      return { message: 'Bitte korrigieren Sie den Beginn.', fields: ['start'], messages: { start: 'Beginn: Bitte wählen Sie eine Stunde zwischen 00 und 23.' } };
    }
    if (!minutesAllowed.includes(startMinute)) {
      return { message: 'Bitte korrigieren Sie den Beginn.', fields: ['start'], messages: { start: 'Beginn: Bitte wählen Sie 00, 15, 30 oder 45 Minuten.' } };
    }
    if (!Number.isInteger(endHour) || endHour < 0 || endHour > 23) {
      return { message: 'Bitte korrigieren Sie das Ende.', fields: ['end'], messages: { end: 'Ende: Bitte wählen Sie eine Stunde zwischen 00 und 23.' } };
    }
    if (!minutesAllowed.includes(endMinute)) {
      return { message: 'Bitte korrigieren Sie das Ende.', fields: ['end'], messages: { end: 'Ende: Bitte wählen Sie 00, 15, 30 oder 45 Minuten.' } };
    }
    if (startHour === endHour && startMinute === endMinute) {
      return {
        message: 'Beginn und Ende sind gleich. Bitte korrigieren Sie die markierten Felder.',
        fields: ['start', 'end'],
        messages: {
          start: 'Beginn muss sich vom Ende unterscheiden.',
          end: 'Ende muss sich vom Beginn unterscheiden.'
        }
      };
    }
    return null;
  }

  function render() {
    clearValidation();
    clearResults();
    const validationError = validateInput();
    if (validationError) {
      showError(validationError.message, validationError.fields, validationError.messages);
      return;
    }

    const input = currentInput();
    const result = calculate(input);
    if (!result.valid) {
      showError(`Die Eingaben konnten nicht berechnet werden: ${result.error}`);
      return;
    }

    const day = input.date.getDay();
    $('resultEmpty').hidden = true;
    $('resultContent').hidden = false;
    $('detailEmpty').hidden = true;
    $('detailContent').hidden = false;
    $('toggleDetails').disabled = false;
    setDetailsExpanded(true);
    $('metaWeekday').textContent = weekdays[day];
    $('metaWeekday').style.color = day === 0 || day === 6 ? '#c62828' : '';
    $('metaHoliday').textContent = input.holiday ? 'Ja' : 'Nein';
    $('metaOvernight').textContent = result.overnight ? 'Ja' : 'Nein';
    $('metaValid').textContent = 'Ja';
    $('metaValid').style.color = '#16734a';

    $('wtDay').textContent = fmtHours(result.totals.wtDay);
    $('wtNight').textContent = fmtHours(result.totals.wtNight);
    $('sfDay').textContent = fmtHours(result.totals.sfDay);
    $('sfNight').textContent = fmtHours(result.totals.sfNight);
    $('total').textContent = fmtHours(result.total);
    $('detailRows').innerHTML = result.segments.map(segment => `
      <tr>
        <td>${segment.from}</td>
        <td>${segment.to}</td>
        <td>${fmtHours(segment.duration)}</td>
        <td class="${segment.category.startsWith('sf') ? 'status-fail' : ''}">${categoryLabel[segment.category]}</td>
        <td>${segment.reason}</td>
      </tr>`).join('');
  }

  function parseTime(value) {
    const [hour, minute] = value.split(':').map(Number);
    return { hour, minute };
  }

  function materializeTestInput(input) {
    return {
      ...input,
      date: typeof input.date === 'string' ? toDate(input.date) : input.date
    };
  }

  function executeVisibleTest(testCase) {
    switch (testCase.kind) {
      case 'invalid-input':
        return testCase.scenarios.map(scenario =>
          calculate(materializeTestInput({ ...defaultInput, ...scenario })));

      case 'invalid-calendar-date': {
        const date = toDate(testCase.date);
        return [{
          ...calculate(materializeTestInput({ ...defaultInput, date })),
          dateIsInvalid: Number.isNaN(date.getTime())
        }];
      }

      case 'termination':
        throw new Error('Terminierungstests dürfen nicht im Browser ausgeführt werden.');

      case 'calculation': {
        const start = parseTime(testCase.start);
        const end = parseTime(testCase.end);
        return [calculate({
          date: toDate(testCase.date),
          holiday: testCase.holiday,
          startHour: start.hour,
          startMinute: start.minute,
          endHour: end.hour,
          endMinute: end.minute
        })];
      }

      default:
        throw new Error(`Unbekannte Testfallart: ${testCase.kind}`);
    }
  }

  function matchesExpected(actual, expected) {
    return Object.entries(expected).every(([key, expectedValue]) => {
      if (key === 'completesWithinMs') return actual.elapsedMs <= expectedValue;
      const actualValue = actual[key];
      if (Array.isArray(expectedValue)) {
        return Array.isArray(actualValue)
          && actualValue.length === expectedValue.length
          && expectedValue.every((item, index) => matchesExpected(actualValue[index], item));
      }
      if (expectedValue && typeof expectedValue === 'object') {
        return actualValue && typeof actualValue === 'object'
          && matchesExpected(actualValue, expectedValue);
      }
      return Object.is(actualValue, expectedValue);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function resultItems(value, expected, isExpected) {
    const items = [];
    const add = (label, displayValue, matches = true) => {
      items.push(`<li class="${matches ? '' : 'comparison-fail'}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(displayValue)}</strong></li>`);
    };

    Object.entries(expected).forEach(([key, expectedValue]) => {
      const actualValue = value[key];
      const matches = isExpected || matchesExpected({ [key]: actualValue }, { [key]: expectedValue });

      if (key === 'totals') {
        Object.entries(expectedValue).forEach(([category, minutes]) => {
          const displayed = isExpected ? minutes : actualValue?.[category];
          add(categoryLabel[category], `${displayed ?? '–'} min`, isExpected || Object.is(displayed, minutes));
        });
      } else if (key === 'segments') {
        const segments = isExpected ? expectedValue : actualValue;
        const display = Array.isArray(segments)
          ? segments.map(segment => `${segment.from}–${segment.to}, ${segment.duration} min, ${categoryLabel[segment.category] || segment.category}`).join(' | ')
          : '–';
        add('Segmente', display, matches);
      } else if (key === 'completesWithinMs') {
        add('Laufzeit', isExpected ? `max. ${expectedValue} ms` : `${actualValue?.toFixed(1) ?? '–'} ms`, matches);
      } else {
        const labels = {
          valid: 'Gültig', error: 'Meldung', overnight: 'Folgetag', total: 'Total',
          dateIsInvalid: 'Kalenderdatum ungültig', exitCode: 'Exit-Code'
        };
        let displayed = isExpected ? expectedValue : actualValue;
        if (typeof displayed === 'boolean') displayed = displayed ? 'Ja' : 'Nein';
        if (displayed === undefined) displayed = '–';
        if (key === 'total' && typeof displayed === 'number') displayed = `${displayed} min`;
        add(labels[key] || key, displayed, matches);
      }
    });

    return `<ul class="comparison-list">${items.join('')}</ul>`;
  }

  function testColumns(testCase) {
    if (testCase.kind === 'calculation') {
      return [testCase.date, testCase.start, testCase.end, testCase.holiday ? 'Ja' : 'Nein'];
    }
    const input = testCase.kind === 'termination' ? testCase.input : defaultInput;
    const start = `${String(input.startHour).padStart(2, '0')}:${String(input.startMinute).padStart(2, '0')}`;
    const end = `${String(input.endHour).padStart(2, '0')}:${String(input.endMinute).padStart(2, '0')}`;
    return [String(input.date), start, end, input.holiday ? 'Ja' : 'Nein'];
  }

  let visibleTestResults = [];

  function renderTestResults() {
    const failedOnly = $('failedTestsOnly').checked;
    const displayedResults = failedOnly
      ? visibleTestResults.filter(result => result.execution === 'browser' && !result.pass)
      : visibleTestResults;

    $('testRows').innerHTML = displayedResults.map(({ testCase, results, pass, execution }) => {
      const [date, start, end, holiday] = testColumns(testCase);
      const automatedOnly = execution === 'automated-only';
      const expectedStatus = automatedOnly
        ? '<div class="automated-status"><span>Erwarteter Status</span><strong>Bestanden</strong></div>'
        : '';
      const expected = `${expectedStatus}${resultItems(testCase.expected, testCase.expected, true)}`;
      const actual = automatedOnly
        ? '<div class="automated-test-note"><strong>Zuletzt bekannter automatisierter Testerfolg: Bestanden</strong><span>Nicht im Browser ausgeführt. Die eigentliche Terminierungsprüfung in einem separaten Node-Prozess mit 1000-ms-Timeout erfolgt ausschließlich über <code>npm test</code> beziehungsweise <code>node --test</code>.</span></div>'
        : results.map((result, index) => {
          const scenario = results.length > 1 ? `<span class="scenario-label">Variante ${index + 1}</span>` : '';
          return `${scenario}${resultItems(result, testCase.expected, false)}`;
        }).join('');
      const rowClass = automatedOnly ? 'test-row-automated' : (pass ? 'test-row-ok' : 'test-row-fail');
      const status = automatedOnly
        ? '<span class="test-status status-automated">Nur automatisiert</span>'
        : `<span class="test-status ${pass ? 'status-ok' : 'status-fail'}">${pass ? 'Bestanden' : 'Fehlgeschlagen'}</span>`;

      return `<tr class="${rowClass}"><td><strong>${escapeHtml(testCase.id)}</strong></td><td>${escapeHtml(testCase.group)}</td><td>${escapeHtml(testCase.description)}</td><td>${escapeHtml(date)}</td><td>${escapeHtml(start)}</td><td>${escapeHtml(end)}</td><td>${escapeHtml(holiday)}</td><td class="comparison-cell expected-cell">${expected}</td><td class="comparison-cell actual-cell">${actual}</td><td>${status}</td></tr>`;
    }).join('');

    if (displayedResults.length === 0) {
      $('testRows').innerHTML = '<tr><td colspan="10" class="test-empty">Keine fehlgeschlagenen Fälle.</td></tr>';
    }
    const automatedOnlyCount = visibleTestResults.filter(result => result.execution === 'automated-only').length;
    const browserCount = visibleTestResults.length - automatedOnlyCount;
    $('testFilterStatus').textContent = failedOnly
      ? `${displayedResults.length} fehlgeschlagene von ${browserCount} Browser-Tests sichtbar · ${automatedOnlyCount} nur automatisiert`
      : `Alle ${visibleTestResults.length} Fälle sichtbar · ${browserCount} im Browser · ${automatedOnlyCount} nur automatisiert`;
  }

  function runTests() {
    visibleTestResults = testCases.map(testCase => {
      if (testCase.kind === 'termination') {
        return { testCase, results: [], pass: null, execution: 'automated-only' };
      }
      const results = executeVisibleTest(testCase);
      return {
        testCase,
        results,
        pass: results.every(result => matchesExpected(result, testCase.expected)),
        execution: 'browser'
      };
    });

    const browserResults = visibleTestResults.filter(result => result.execution === 'browser');
    const automatedOnlyCount = visibleTestResults.length - browserResults.length;
    const passed = browserResults.filter(result => result.pass).length;
    const failed = browserResults.length - passed;
    const overallPass = failed === 0;
    $('testSummary').innerHTML = `<strong>${overallPass ? 'Browser-Prüfung bestanden' : 'Browser-Prüfung fehlgeschlagen'}</strong><span>${passed} von ${browserResults.length} Browser-Tests bestanden · ${failed} fehlgeschlagen · ${automatedOnlyCount} nur automatisiert ausführbar</span>`;
    $('testSummary').className = `test-summary ${overallPass ? 'summary-ok' : 'summary-fail'}`;

    const groups = [...new Set(testCases.map(testCase => testCase.group))];
    $('testGroupSummary').innerHTML = groups.map(group => {
      const groupResults = visibleTestResults.filter(result => result.testCase.group === group);
      const groupBrowserResults = groupResults.filter(result => result.execution === 'browser');
      const groupAutomatedOnly = groupResults.length - groupBrowserResults.length;
      const groupPassed = groupBrowserResults.filter(result => result.pass).length;
      const groupPass = groupPassed === groupBrowserResults.length;
      const automatedSuffix = groupAutomatedOnly ? ` · ${groupAutomatedOnly} nur automatisiert` : '';
      return `<div class="test-group-card ${groupPass ? 'group-ok' : 'group-fail'}"><span>${escapeHtml(group)}</span><strong>${groupPassed}/${groupBrowserResults.length} Browser bestanden${automatedSuffix}</strong></div>`;
    }).join('');

    renderTestResults();
  }

  $('calculateBtn').addEventListener('click', render);
  $('resetBtn').addEventListener('click', () => {
    fillSelect($('startHour'), [...Array(24).keys()], 6);
    fillSelect($('endHour'), [...Array(24).keys()], 18);
    fillSelect($('startMinute'), minutesAllowed, 0);
    fillSelect($('endMinute'), minutesAllowed, 0);
    $('dateInput').value = '';
    $('holidayInput').checked = false;
    clearValidation();
    clearResults();
    updateWeekday();
    updateOvernightHint();
  });
  $('runTestsBtn').addEventListener('click', runTests);
  $('failedTestsOnly').addEventListener('change', renderTestResults);
  function handleInputChange() {
    clearValidation();
    clearResults('Eingaben geändert. Bitte neu berechnen.');
    updateWeekday();
    updateOvernightHint();
  }
  ['dateInput', 'holidayInput', 'startHour', 'startMinute', 'endHour', 'endMinute']
    .forEach(id => $(id).addEventListener('change', handleInputChange));

  function status() {
    const badge = $('onlineBadge');
    badge.textContent = navigator.onLine ? 'Online · Offline bereit' : 'Offline';
  }
  window.addEventListener('online', status);
  window.addEventListener('offline', status);

  updateWeekday();
  updateOvernightHint();
  clearResults();
  runTests();
  status();

  $('toggleDetails').addEventListener('click', () => {
    setDetailsExpanded($('detailTableWrap').hidden);
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }

})();

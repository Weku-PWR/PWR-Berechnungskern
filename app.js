(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const { calculate, minutesAllowed, toDate } = window.PWR_CALC;
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
  const resultIds = ['wtDay', 'wtNight', 'sfDay', 'sfNight', 'total', 'metaWeekday', 'metaHoliday', 'metaOvernight', 'metaValid'];

  function clearValidation() {
    $('errorBox').hidden = true;
    $('errorBox').textContent = '';
    Object.keys(fieldGroups).forEach(key => {
      $(fieldGroups[key]).classList.remove('field-invalid');
      fieldControls[key].forEach(id => $(id).removeAttribute('aria-invalid'));
    });
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
    $('detailTableWrap').hidden = false;
    $('toggleDetails').textContent = 'Rechenweg ausblenden';
    $('toggleDetails').setAttribute('aria-expanded', 'true');
  }

  function showError(message, fields = []) {
    clearResults('Keine Berechnung wegen ungültiger Eingabe.');
    $('errorBox').textContent = message;
    $('errorBox').hidden = false;
    fields.forEach(key => {
      $(fieldGroups[key]).classList.add('field-invalid');
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
    if (!dateValue) return { message: 'Bitte wählen Sie ein Datum aus.', fields: ['date'] };
    if (Number.isNaN(toDate(dateValue).getTime())) {
      return { message: 'Bitte geben Sie ein gültiges Kalenderdatum ein.', fields: ['date'] };
    }

    const startHour = Number($('startHour').value);
    const startMinute = Number($('startMinute').value);
    const endHour = Number($('endHour').value);
    const endMinute = Number($('endMinute').value);
    if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
      return { message: 'Bitte wählen Sie für den Beginn eine Stunde zwischen 00 und 23.', fields: ['start'] };
    }
    if (!minutesAllowed.includes(startMinute)) {
      return { message: 'Bitte wählen Sie für den Beginn 00, 15, 30 oder 45 Minuten.', fields: ['start'] };
    }
    if (!Number.isInteger(endHour) || endHour < 0 || endHour > 23) {
      return { message: 'Bitte wählen Sie für das Ende eine Stunde zwischen 00 und 23.', fields: ['end'] };
    }
    if (!minutesAllowed.includes(endMinute)) {
      return { message: 'Bitte wählen Sie für das Ende 00, 15, 30 oder 45 Minuten.', fields: ['end'] };
    }
    if (startHour === endHour && startMinute === endMinute) {
      return { message: 'Beginn und Ende sind gleich. Bitte wählen Sie unterschiedliche Uhrzeiten.', fields: ['start', 'end'] };
    }
    return null;
  }

  function render() {
    clearValidation();
    clearResults();
    const validationError = validateInput();
    if (validationError) {
      showError(validationError.message, validationError.fields);
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

  const tests = [
    { id: 'TC-001', desc: 'Montag normale Tagarbeit', date: '2026-07-13', start: '06:00', end: '14:00', holiday: false, expect: { wtDay: 480, wtNight: 0, sfDay: 0, sfNight: 0 } },
    { id: 'TC-002', desc: 'Montag Tag zu Nacht', date: '2026-07-13', start: '18:00', end: '22:00', holiday: false, expect: { wtDay: 120, wtNight: 120, sfDay: 0, sfNight: 0 } },
    { id: 'TC-003', desc: 'Samstag vor und nach 17 Uhr', date: '2026-07-18', start: '14:00', end: '22:00', holiday: false, expect: { wtDay: 180, wtNight: 0, sfDay: 180, sfNight: 120 } },
    { id: 'TC-004', desc: 'Samstag 22 bis Sonntag 06', date: '2026-07-18', start: '22:00', end: '06:00', holiday: false, expect: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 480 } },
    { id: 'TC-005', desc: 'Sonntag Tagarbeit', date: '2026-07-19', start: '08:00', end: '16:00', holiday: false, expect: { wtDay: 0, wtNight: 0, sfDay: 480, sfNight: 0 } },
    { id: 'TC-006', desc: 'Sonntag 20 bis Montag 07', date: '2026-07-19', start: '20:00', end: '07:00', holiday: false, expect: { wtDay: 60, wtNight: 0, sfDay: 0, sfNight: 600 } },
    { id: 'TC-007', desc: 'Sonntag 23:45 bis Montag 06', date: '2026-07-19', start: '23:45', end: '06:00', holiday: false, expect: { wtDay: 0, wtNight: 0, sfDay: 0, sfNight: 375 } },
    { id: 'TC-008', desc: 'Montag 00 bis 07', date: '2026-07-20', start: '00:00', end: '07:00', holiday: false, expect: { wtDay: 60, wtNight: 360, sfDay: 0, sfNight: 0 } },
    { id: 'TC-009', desc: 'Samstag 16 bis Sonntag 07', date: '2026-07-18', start: '16:00', end: '07:00', holiday: false, expect: { wtDay: 60, wtNight: 0, sfDay: 240, sfNight: 600 } },
    { id: 'TC-010', desc: 'Freitag 22 bis Samstag 06', date: '2026-07-17', start: '22:00', end: '06:00', holiday: false, expect: { wtDay: 0, wtNight: 480, sfDay: 0, sfNight: 0 } },
    { id: 'TC-011', desc: 'Feiertag über Mitternacht', date: '2026-07-14', start: '18:00', end: '07:00', holiday: true, expect: { wtDay: 0, wtNight: 0, sfDay: 180, sfNight: 600 } },
    { id: 'TC-012', desc: 'Wochentag über Mitternacht', date: '2026-07-14', start: '18:30', end: '07:15', holiday: false, expect: { wtDay: 165, wtNight: 600, sfDay: 0, sfNight: 0 } },
    { id: 'TC-013', desc: 'Ungültig gleiche Zeit', date: '2026-07-14', start: '06:00', end: '06:00', holiday: false, invalid: true }
  ];

  function parseTime(value) {
    const [hour, minute] = value.split(':').map(Number);
    return { hour, minute };
  }

  function runTests() {
    let passed = 0;
    $('testRows').innerHTML = tests.map(test => {
      const start = parseTime(test.start);
      const end = parseTime(test.end);
      const result = calculate({
        date: toDate(test.date),
        holiday: test.holiday,
        startHour: start.hour,
        startMinute: start.minute,
        endHour: end.hour,
        endMinute: end.minute
      });

      const pass = test.invalid
        ? !result.valid
        : result.valid && Object.keys(test.expect).every(key => result.totals[key] === test.expect[key]);
      if (pass) passed += 1;

      const expected = test.invalid
        ? 'ungültig'
        : Object.entries(test.expect).filter(([, value]) => value).map(([key, value]) => `${categoryLabel[key]} ${fmtHours(value)}`).join(' / ');
      const actual = !result.valid
        ? 'ungültig'
        : Object.entries(result.totals).filter(([, value]) => value).map(([key, value]) => `${categoryLabel[key]} ${fmtHours(value)}`).join(' / ');

      return `<tr><td>${test.id}</td><td>${test.desc}</td><td>${test.date}</td><td>${test.start}</td><td>${test.end}</td><td>${test.holiday ? 'Ja' : 'Nein'}</td><td>${expected}</td><td>${actual}</td><td class="${pass ? 'status-ok' : 'status-fail'}">${pass ? 'OK' : 'FEHLER'}</td></tr>`;
    }).join('');

    $('testSummary').textContent = `${passed} von ${tests.length} Testfällen korrekt.`;
    $('testSummary').className = `test-summary ${passed === tests.length ? 'status-ok' : 'status-fail'}`;
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
    const willHide = !$('detailTableWrap').hidden;
    $('detailTableWrap').hidden = willHide;
    $('toggleDetails').textContent = willHide ? 'Rechenweg anzeigen' : 'Rechenweg ausblenden';
    $('toggleDetails').setAttribute('aria-expanded', String(!willHide));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }

})();

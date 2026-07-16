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
  $('dateInput').value = new Date().toISOString().slice(0, 10);

  const fmtHours = minutes => `${(minutes / 60).toFixed(2)} h`;

  function updateWeekday() {
    const date = toDate($('dateInput').value);
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

  function render() {
    const input = currentInput();
    const result = calculate(input);
    const day = input.date.getDay();

    $('metaWeekday').textContent = weekdays[day];
    $('metaWeekday').style.color = day === 0 || day === 6 ? '#c62828' : '';
    $('metaHoliday').textContent = input.holiday ? 'Ja' : 'Nein';
    $('metaOvernight').textContent = result.valid && result.overnight ? 'Ja' : 'Nein';
    $('metaValid').textContent = result.valid ? 'Ja' : 'Nein';
    $('metaValid').style.color = result.valid ? '#16734a' : '#c62828';
    $('errorBox').hidden = result.valid;

    if (!result.valid) {
      $('errorBox').textContent = result.error;
      ['wtDay', 'wtNight', 'sfDay', 'sfNight', 'total'].forEach(id => $(id).textContent = '0.00 h');
      $('detailRows').innerHTML = '<tr><td colspan="5" class="muted">Ungültige Eingabe.</td></tr>';
      return;
    }

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
    $('holidayInput').checked = false;
    render();
  });
  $('runTestsBtn').addEventListener('click', runTests);
  $('dateInput').addEventListener('change', () => { updateWeekday(); render(); });
  ['holidayInput', 'startHour', 'startMinute', 'endHour', 'endMinute'].forEach(id => $(id).addEventListener('change', render));

  function status() {
    const badge = $('onlineBadge');
    badge.textContent = navigator.onLine ? 'Online · Offline bereit' : 'Offline';
  }
  window.addEventListener('online', status);
  window.addEventListener('offline', status);

  updateWeekday();
  render();
  runTests();
  status();

  const detailRowsElement = document.getElementById('detailRows');
  const detailTable = detailRowsElement ? detailRowsElement.closest('table') : null;
  const toggleDetailsButton = document.getElementById('toggleDetails');
  if (toggleDetailsButton && detailTable) {
    toggleDetailsButton.addEventListener('click', () => {
      const hidden = detailTable.dataset.collapsed === 'true';
      detailTable.dataset.collapsed = hidden ? 'false' : 'true';
      detailTable.style.display = hidden ? '' : 'none';
      toggleDetailsButton.textContent = hidden ? 'Berechnung ausblenden' : 'Berechnung anzeigen';
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }

})();

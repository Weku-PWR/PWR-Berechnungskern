(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const mins = [0,15,30,45];
  const weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const short = ['So','Mo','Di','Mi','Do','Fr','Sa'];

  function fillSelect(select, values, selected){
    select.innerHTML='';
    values.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=String(v).padStart(2,'0');if(v===selected)o.selected=true;select.appendChild(o);});
  }
  fillSelect($('startHour'), [...Array(24).keys()], 6);
  fillSelect($('endHour'), [...Array(24).keys()], 18);
  fillSelect($('startMinute'), mins, 0);
  fillSelect($('endMinute'), mins, 0);
  $('dateInput').value = new Date().toISOString().slice(0,10);

  const toDate = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const fmtTime = total => `${String(Math.floor((total%1440)/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  const fmtHours = m => `${(m/60).toFixed(2)} h`;

  function updateWeekday(){
    const d=toDate($('dateInput').value); const day=d.getDay();
    $('weekdayDisplay').textContent=`${short[day]} · ${weekdays[day]}`;
    $('weekdayDisplay').classList.toggle('weekend', day===0 || day===6);
  }

  function classify(absMinute, startDate, forceHoliday){
    const dayOffset=Math.floor(absMinute/1440);
    const minute=absMinute%1440;
    const date=new Date(startDate); date.setDate(date.getDate()+dayOffset);
    const dow=date.getDay();
    const isNight = minute < 360 || minute >= 1200;
    let holiday = forceHoliday || dow===0 || (dow===6 && minute>=1020);
    let category;
    if(holiday) category=isNight?'sfNight':'sfDay'; else category=isNight?'wtNight':'wtDay';
    let reason;
    if(forceHoliday) reason='Beginn-Tag manuell als Feiertag markiert';
    else if(dow===0) reason='Sonntag';
    else if(dow===6 && minute>=1020) reason='Samstag ab 17:00 Uhr';
    else reason='Normaler Wochentag';
    reason += isNight ? ' · Nachtzeit 20:00–06:00' : ' · Tagzeit 06:00–20:00';
    return {category,reason};
  }

  function nextBoundary(absMinute, endAbs){
    const day=Math.floor(absMinute/1440), minute=absMinute%1440;
    const candidates=[360,1020,1200,1440].filter(v=>v>minute).map(v=>day*1440+v);
    return Math.min(endAbs, ...(candidates.length?candidates:[endAbs]));
  }

  function calculate(input){
    const start=input.startHour*60+input.startMinute;
    let end=input.endHour*60+input.endMinute;
    if(start===end) return {valid:false,error:'Beginn und Ende dürfen nicht identisch sein.'};
    const overnight=end<start; if(overnight) end+=1440;
    const result={valid:true,overnight,totals:{wtDay:0,wtNight:0,sfDay:0,sfNight:0},segments:[]};
    let cursor=start;
    while(cursor<end){
      const boundary=nextBoundary(cursor,end);
      const cls=classify(cursor,input.date,input.holiday);
      const duration=boundary-cursor;
      result.totals[cls.category]+=duration;
      result.segments.push({from:fmtTime(cursor),to:boundary%1440===0?'24:00':fmtTime(boundary),duration,category:cls.category,reason:cls.reason});
      cursor=boundary;
    }
    result.total=Object.values(result.totals).reduce((a,b)=>a+b,0);
    return result;
  }

  const categoryLabel={wtDay:'Wochentag Tag',wtNight:'Wochentag Nacht',sfDay:'Sonn-/Feiertag Tag',sfNight:'Sonn-/Feiertag Nacht'};

  function currentInput(){return {date:toDate($('dateInput').value),holiday:$('holidayInput').checked,startHour:+$('startHour').value,startMinute:+$('startMinute').value,endHour:+$('endHour').value,endMinute:+$('endMinute').value};}
  function render(){
    const input=currentInput(), result=calculate(input), day=input.date.getDay();
    $('metaWeekday').textContent=weekdays[day]; $('metaWeekday').style.color=(day===0||day===6)?'#c62828':'';
    $('metaHoliday').textContent=input.holiday?'Ja':'Nein';
    $('metaOvernight').textContent=result.valid&&result.overnight?'Ja':'Nein';
    $('metaValid').textContent=result.valid?'Ja':'Nein'; $('metaValid').style.color=result.valid?'#16734a':'#c62828';
    $('errorBox').hidden=result.valid;
    if(!result.valid){$('errorBox').textContent=result.error;['wtDay','wtNight','sfDay','sfNight','total'].forEach(id=>$(id).textContent='0.00 h');$('detailRows').innerHTML='<tr><td colspan="5" class="muted">Ungültige Eingabe.</td></tr>';return;}
    $('wtDay').textContent=fmtHours(result.totals.wtDay);$('wtNight').textContent=fmtHours(result.totals.wtNight);$('sfDay').textContent=fmtHours(result.totals.sfDay);$('sfNight').textContent=fmtHours(result.totals.sfNight);$('total').textContent=fmtHours(result.total);
    $('detailRows').innerHTML=result.segments.map(s=>`<tr><td>${s.from}</td><td>${s.to}</td><td>${fmtHours(s.duration)}</td><td class="${s.category.startsWith('sf')?'status-fail':''}">${categoryLabel[s.category]}</td><td>${s.reason}</td></tr>`).join('');
  }

  const tests=[
    {id:'TC-001',desc:'Normale Tagarbeit',date:'2026-07-13',start:'06:00',end:'14:00',holiday:false,expect:{wtDay:480,wtNight:0,sfDay:0,sfNight:0}},
    {id:'TC-002',desc:'Tag zu Nacht',date:'2026-07-13',start:'18:00',end:'22:00',holiday:false,expect:{wtDay:120,wtNight:120,sfDay:0,sfNight:0}},
    {id:'TC-003',desc:'Samstag vor und nach 17 Uhr',date:'2026-07-18',start:'14:00',end:'22:00',holiday:false,expect:{wtDay:180,wtNight:0,sfDay:180,sfNight:120}},
    {id:'TC-004',desc:'Samstag 22 bis Sonntag 06',date:'2026-07-18',start:'22:00',end:'06:00',holiday:false,expect:{wtDay:0,wtNight:0,sfDay:0,sfNight:480}},
    {id:'TC-005',desc:'Sonntag Tagarbeit',date:'2026-07-19',start:'08:00',end:'16:00',holiday:false,expect:{wtDay:0,wtNight:0,sfDay:480,sfNight:0}},
    {id:'TC-006',desc:'Feiertag über Mitternacht',date:'2026-07-14',start:'22:00',end:'06:00',holiday:true,expect:{wtDay:0,wtNight:0,sfDay:0,sfNight:480}},
    {id:'TC-007',desc:'Wochentag über Mitternacht',date:'2026-07-14',start:'18:30',end:'07:15',holiday:false,expect:{wtDay:165,wtNight:600,sfDay:0,sfNight:0}},
    {id:'TC-008',desc:'Ungültig gleiche Zeit',date:'2026-07-14',start:'06:00',end:'06:00',holiday:false,invalid:true}
  ];
  function parseTime(v){const [h,m]=v.split(':').map(Number);return {h,m};}
  function runTests(){
    let ok=0;
    $('testRows').innerHTML=tests.map(t=>{const s=parseTime(t.start),e=parseTime(t.end);const r=calculate({date:toDate(t.date),holiday:t.holiday,startHour:s.h,startMinute:s.m,endHour:e.h,endMinute:e.m});let pass;
      if(t.invalid) pass=!r.valid; else pass=r.valid&&Object.keys(t.expect).every(k=>r.totals[k]===t.expect[k]); if(pass)ok++;
      const exp=t.invalid?'ungültig':Object.entries(t.expect).filter(([,v])=>v).map(([k,v])=>`${categoryLabel[k]} ${fmtHours(v)}`).join(' / ');
      const got=!r.valid?'ungültig':Object.entries(r.totals).filter(([,v])=>v).map(([k,v])=>`${categoryLabel[k]} ${fmtHours(v)}`).join(' / ');
      return `<tr><td>${t.id}</td><td>${t.desc}</td><td>${t.date}</td><td>${t.start}</td><td>${t.end}</td><td>${t.holiday?'Ja':'Nein'}</td><td>${exp}</td><td>${got}</td><td class="${pass?'status-ok':'status-fail'}">${pass?'OK':'FEHLER'}</td></tr>`;}).join('');
    $('testSummary').textContent=`${ok} von ${tests.length} Testfällen korrekt.`;
    $('testSummary').className='test-summary '+(ok===tests.length?'status-ok':'status-fail');
  }

  $('calculateBtn').addEventListener('click',render);
  $('resetBtn').addEventListener('click',()=>{fillSelect($('startHour'),[...Array(24).keys()],6);fillSelect($('endHour'),[...Array(24).keys()],18);fillSelect($('startMinute'),mins,0);fillSelect($('endMinute'),mins,0);$('holidayInput').checked=false;render();});
  $('runTestsBtn').addEventListener('click',runTests);
  $('dateInput').addEventListener('change',()=>{updateWeekday();render();});
  ['holidayInput','startHour','startMinute','endHour','endMinute'].forEach(id=>$(id).addEventListener('change',render));
  function status(){const b=$('onlineBadge');b.textContent=navigator.onLine?'Online · Offline bereit':'Offline';}
  window.addEventListener('online',status);window.addEventListener('offline',status);
  updateWeekday();render();runTests();status();
  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
})();

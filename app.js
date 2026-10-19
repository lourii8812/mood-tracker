(() => {
  'use strict';
  const STORAGE_KEY = 'lunari.entries.v1';
  const MOODS = {
    happy: { emoji: '😊', label: 'Happy' },
    okay: { emoji: '😌', label: 'Okay' },
    sad: { emoji: '🥹', label: 'Sad' },
    anxious: { emoji: '😵‍💫', label: 'Anxious' },
    tired: { emoji: '😴', label: 'Tired' }
  };
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const keyFor = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const parseKey = key => { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); };
  const longDate = key => parseKey(key).toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric', year:'numeric'});
  const shortDate = key => parseKey(key).toLocaleDateString(undefined, {month:'short', day:'numeric'});
  const monthDate = date => date.toLocaleDateString(undefined, {month:'long', year:'numeric'});
  let entries = {};
  let selected = keyFor(new Date());
  let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let saveTimer;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { const parsed = JSON.parse(saved); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) entries = parsed; }
  } catch (_) { /* Storage can be unavailable in private browsing. */ }

  $('today-chip').textContent = new Date().toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
  $('today-button').addEventListener('click', () => selectDate(keyFor(new Date()), true));
  $('prev-month').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth()-1, 1); renderCalendar(); });
  $('next-month').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth()+1, 1); renderCalendar(); });
  document.querySelectorAll('[data-mood]').forEach(button => button.addEventListener('click', () => {
    const entry = entries[selected] || {};
    entry.mood = button.dataset.mood;
    entry.updatedAt = Date.now();
    entries[selected] = entry;
    persist(); renderAll();
  }));
  $('journal-note').addEventListener('input', event => {
    const entry = entries[selected] || {};
    entry.note = event.target.value;
    entry.updatedAt = Date.now();
    entries[selected] = entry;
    $('char-count').textContent = `${event.target.value.length} characters`;
    $('save-status').textContent = 'Saving…';
    clearTimeout(saveTimer); saveTimer = setTimeout(() => { persist(); renderCalendar(); renderRecent(); }, 180);
  });

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); $('save-status').textContent = 'Saved on this device automatically'; }
    catch (_) { $('save-status').textContent = 'Browser storage unavailable. Your changes may not persist.'; }
  }
  function selectDate(key, jumpMonth) {
    selected = key;
    if (jumpMonth) shownMonth = new Date(parseKey(key).getFullYear(), parseKey(key).getMonth(), 1);
    renderAll();
  }
  function renderEditor() {
    const entry = entries[selected] || {};
    $('selected-date').textContent = longDate(selected);
    $('journal-note').value = entry.note || '';
    $('char-count').textContent = `${$('journal-note').value.length} characters`;
    document.querySelectorAll('[data-mood]').forEach(button => {
      const active = button.dataset.mood === entry.mood;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderCalendar() {
    $('month-label').textContent = monthDate(shownMonth);
    const container = $('calendar-days'); container.replaceChildren();
    const first = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(shownMonth.getFullYear(), shownMonth.getMonth()+1, 0).getDate();
    for (let i=0; i<offset; i++) { const blank = document.createElement('div'); blank.className='day empty'; blank.setAttribute('aria-hidden','true'); container.append(blank); }
    const today = keyFor(new Date());
    for (let day=1; day<=count; day++) {
      const key = keyFor(new Date(shownMonth.getFullYear(), shownMonth.getMonth(), day));
      const entry = entries[key] || {};
      const button = document.createElement('button'); button.type='button'; button.className='day';
      if (key === selected) button.classList.add('selected');
      if (key === today) button.classList.add('today');
      button.setAttribute('aria-label', `${longDate(key)}${entry.mood ? `, ${MOODS[entry.mood]?.label || entry.mood}` : ''}`);
      button.setAttribute('aria-pressed', String(key === selected));
      const number = document.createElement('span'); number.className='day-number'; number.textContent=day; button.append(number);
      if (entry.mood && MOODS[entry.mood]) { const mood = document.createElement('span'); mood.className='day-mood'; mood.textContent=MOODS[entry.mood].emoji; mood.setAttribute('aria-hidden','true'); button.append(mood); }
      button.addEventListener('click', () => selectDate(key, false)); container.append(button);
    }
  }
  function renderRecent() {
    const container = $('recent-list'); container.replaceChildren();
    const recent = Object.keys(entries).filter(key => entries[key] && (entries[key].mood || (entries[key].note || '').trim())).sort((a,b) => b.localeCompare(a)).slice(0,5);
    if (!recent.length) { const empty=document.createElement('div'); empty.className='empty-history'; empty.textContent='Your check-ins will appear here. There is no rush to fill every day.'; container.append(empty); return; }
    for (const key of recent) {
      const entry=entries[key]; const button=document.createElement('button'); button.type='button'; button.className='recent-item';
      const emoji=document.createElement('span'); emoji.className='recent-emoji'; emoji.textContent=entry.mood && MOODS[entry.mood] ? MOODS[entry.mood].emoji : '✎';
      const info=document.createElement('span'); info.className='recent-info'; const title=document.createElement('strong'); title.textContent=shortDate(key)+(entry.mood && MOODS[entry.mood] ? ` · ${MOODS[entry.mood].label}` : ' · Journal');
      const note=document.createElement('small'); note.textContent=(entry.note || 'No journal note added.').trim(); info.append(title,note);
      const arrow=document.createElement('span'); arrow.className='recent-arrow'; arrow.textContent='›'; button.append(emoji,info,arrow); button.addEventListener('click',()=>selectDate(key,true)); container.append(button);
    }
  }
  function renderAll() { renderEditor(); renderCalendar(); renderRecent(); }
  renderAll();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(err => console.warn('Lunari offline setup could not start:', err)));
  }
})();

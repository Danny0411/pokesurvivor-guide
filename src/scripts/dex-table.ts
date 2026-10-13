// 圖鑑總表：篩選、排序（FLIP 換位動畫），條件寫進網址以便分享。
const table = document.querySelector<HTMLTableElement>('[data-dex]');
const form = document.querySelector<HTMLFormElement>('[data-filters]');
if (table && form) {
  const tbody = table.tBodies[0];
  const rows = [...tbody.rows];
  const shown = document.querySelector('[data-shown]')!;
  const empty = document.querySelector<HTMLElement>('[data-empty]')!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let sortKey = 'dex', dir = 1;

  const read = () => {
    const f = new FormData(form);
    return {
      q: String(f.get('q') || '').trim().toLowerCase(),
      types: f.getAll('type') as string[], rarity: f.getAll('rarity') as string[], flags: f.getAll('flag') as string[],
      gen: String(f.get('gen') || ''), beh: String(f.get('beh') || ''),
    };
  };
  function filter() {
    const c = read();
    let n = 0;
    for (const r of rows) {
      const d = r.dataset;
      const ok = (!c.q || d.zh!.includes(c.q) || d.en!.includes(c.q) || d.dex === c.q.replace(/^#|^0+/g, ''))
        && (!c.types.length || c.types.some(t => d.types!.split(' ').includes(t)))
        && (!c.rarity.length || c.rarity.includes(d.rarity!))
        && (!c.gen || d.gen === c.gen) && (!c.beh || d.beh === c.beh)
        && c.flags.every(f => d.flags!.split(' ').includes(f));
      r.hidden = !ok;
      if (ok) n++;
    }
    shown.textContent = String(n);
    empty.hidden = n > 0;
    const p = new URLSearchParams();
    if (c.q) p.set('q', c.q);
    c.types.forEach(t => p.append('type', t)); c.rarity.forEach(t => p.append('rarity', t)); c.flags.forEach(t => p.append('flag', t));
    if (c.gen) p.set('gen', c.gen); if (c.beh) p.set('beh', c.beh);
    if (sortKey !== 'dex' || dir !== 1) p.set('sort', (dir < 0 ? '-' : '') + sortKey);
    history.replaceState(null, '', p.size ? '?' + p : location.pathname);
  }
  function sort(animate = true) {
    const first = animate && !reduce.matches ? new Map(rows.filter(r => !r.hidden).map(r => [r, r.getBoundingClientRect().top])) : null;
    const val = (r: HTMLTableRowElement) => sortKey === 'zh' ? r.dataset.zh! : +r.dataset[sortKey]!;
    rows.sort((a, b) => {
      const x = val(a), y = val(b);
      const c = typeof x === 'string' ? x.localeCompare(y as string, 'zh-Hant') : (x as number) - (y as number);
      return c * dir || (+a.dataset.dex! - +b.dataset.dex!);
    });
    tbody.append(...rows);
    table.querySelectorAll('thead th[aria-sort]').forEach(th => th.setAttribute('aria-sort', th.classList.contains('col-' + sortKey) ? (dir > 0 ? 'ascending' : 'descending') : 'none'));
    if (!first) return;
    // 只對畫面附近的列做換位動畫
    const vh = innerHeight;
    for (const [r, top] of first) {
      const now = r.getBoundingClientRect().top;
      if ((top < -200 || top > vh + 200) && (now < -200 || now > vh + 200)) continue;
      const dy = top - now;
      if (!dy) continue;
      r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  table.querySelectorAll<HTMLButtonElement>('[data-sort]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.sort!;
    dir = k === sortKey ? -dir : (k === 'dex' || k === 'zh' ? 1 : -1);
    sortKey = k;
    sort(); filter();
  }));
  form.addEventListener('input', filter);
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(filter));
  document.querySelector('[data-clear]')?.addEventListener('click', () => form.reset());

  // 滑過時播放動畫
  tbody.addEventListener('pointerover', e => {
    const s = (e.target as HTMLElement).closest('tr')?.querySelector<HTMLElement>('poke-sprite');
    if (s && s.dataset.play === undefined) { s.dataset.play = ''; s.closest('tr')!.addEventListener('pointerleave', () => { delete s.dataset.play; }, { once: true }); }
  });

  // 從網址還原條件
  const p = new URLSearchParams(location.search);
  for (const [k, v] of p) {
    if (k === 'sort') { dir = v.startsWith('-') ? -1 : 1; sortKey = v.replace('-', ''); continue; }
    const el = form.querySelector<HTMLInputElement>(`[name="${k}"][value="${CSS.escape(v)}"]`) ?? form.querySelector<HTMLInputElement>(`[name="${k}"]`);
    if (!el) continue;
    if (el.type === 'checkbox') el.checked = true; else el.value = v;
  }
  if (p.has('sort')) sort(false);
  filter();
}

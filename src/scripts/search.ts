// 頂部搜尋：第一次聚焦時載入索引，逐字比對中文、英文與編號。
type Row = [string, string, string, string, string];
const box = document.querySelector<HTMLElement>('[data-search]');
if (box) {
  const input = box.querySelector('input')!;
  const list = box.querySelector('ol')!;
  let rows: Row[] | null = null;
  let active = -1;
  const base = (document.querySelector('link[rel=icon]') as HTMLLinkElement).getAttribute('href')!.replace(/favicon-32\.png$/, '');
  const load = async () => { rows ??= await (await fetch(base + 'search.json')).json(); };
  const esc = (s: string) => s.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);

  function score(r: Row, q: string) {
    const zh = r[1].toLowerCase(), en = r[2].toLowerCase();
    if (/^#?\d+$/.test(q)) return r[0] === '寶可夢' && en.endsWith('#' + q.replace('#', '')) ? 100 : -1;
    if (zh === q) return 90;
    if (zh.startsWith(q)) return 80 - zh.length / 10;
    if (zh.includes(q)) return 60 - zh.length / 10;
    if (en.startsWith(q)) return 50;
    if (en.includes(q)) return 30;
    return -1;
  }
  function render() {
    const q = input.value.trim().toLowerCase();
    if (!q || !rows) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    const hits = rows.map(r => [score(r, q), r] as const).filter(([s]) => s >= 0).sort((a, b) => b[0] - a[0]).slice(0, 40);
    active = hits.length ? 0 : -1;
    list.innerHTML = hits.length
      ? hits.map(([, r], i) => `<li role="option" id="qr${i}" aria-selected="${i === 0}"><a href="${r[3]}"><span class="k">${r[0]}</span><b>${esc(r[1])}</b><small>${esc(r[2])}${r[4] ? ' · ' + esc(r[4]) : ''}</small></a></li>`).join('')
      : `<li class="none">找不到「${esc(input.value)}」。試試英文名、編號，或換個關鍵字。</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function move(d: number) {
    const items = [...list.querySelectorAll('li[role=option]')];
    if (!items.length) return;
    active = (active + d + items.length) % items.length;
    items.forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
    items[active].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', items[active].id);
  }
  input.addEventListener('focus', () => { load().then(render); });
  input.addEventListener('input', () => { load().then(render); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { const a = list.querySelector<HTMLAnchorElement>(`#qr${active} a`); if (a) location.href = a.href; }
    else if (e.key === 'Escape') { input.value = ''; render(); input.blur(); }
  });
  document.addEventListener('click', e => { if (!box.contains(e.target as Node)) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !(e.target as HTMLElement).closest('input,textarea,select')) { e.preventDefault(); input.focus(); }
  });
}

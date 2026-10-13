import { getCollection, render } from 'astro:content';
import { POKEMON, MOVE_LIST, typeName, url } from '../lib/game';
import { CHAPTERS } from '../lib/nav';

// 搜尋索引：[種類, 中文, 英文/補充, 網址, 標籤]
export async function GET() {
  const rows: [string, string, string, string, string][] = [];
  for (const p of POKEMON) rows.push(['寶可夢', p.zh, `${p.name} #${p.dex}`, url(`/pokemon/${p.dex}/`), p.types.map(typeName).join('・')]);
  for (const m of MOVE_LIST) rows.push(['招式', m.zh, m.id.replace(/-/g, ' '), url(`/moves/${m.id}/`), typeName(m.type)]);
  for (const c of CHAPTERS) rows.push(['章節', c.zh, c.desc, url(c.href), '']);
  const docs = await getCollection('mechanics');
  const where: Record<string, string> = { moves: '/moves/rules/', player: '/run/', enemies: '/enemies/', world: '/world/', meta: '/collect/' };
  for (const d of docs) {
    const { headings } = await render(d);
    for (const h of headings) if (h.depth <= 3) rows.push(['機制', h.text, d.data.title, url(`${where[d.id] ?? '/'}#${h.slug}`), '']);
  }
  return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' } });
}


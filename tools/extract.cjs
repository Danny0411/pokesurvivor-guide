// 從 pokesurvivor.com 下載最新遊戲程式碼，在沙盒執行後把 G.* 資料匯出成 JSON。
// 用法：node tools/extract.cjs   （輸出 src/data/game/*.json，原始碼快取在 .cache/）
const fs = require('fs'), path = require('path'), load = require('./load-game.cjs');
const ROOT = path.join(__dirname, '..'), CACHE = path.join(ROOT, '.cache'), OUT = path.join(ROOT, 'src/data/game');
const MODULES = ['DEX', 'SPRITE_META', 'Moves', 'Types', 'STARTERS', 'TRAIT_TEXT', 'PERSONALITY_TEST', 'Enemies',
  'Upgrades', 'Items', 'MissionDefs', 'AchDefs', 'CHANGELOG', 'Tiles', 'LevelUp', 'Gacha', 'Weather', 'BIOME_MUSIC', 'MUSIC', 'U'];

function ser(v, seen = new WeakSet()) {
  if (typeof v === 'function') return undefined;
  if (v === Infinity) return 'Infinity';
  if (v === null || typeof v !== 'object') return v;
  if (seen.has(v)) return undefined;
  seen.add(v);
  if (v instanceof Map) return Object.fromEntries([...v].map(([k, x]) => [k, ser(x, seen)]));
  if (v instanceof Set) return [...v].map(x => ser(x, seen));
  if (Array.isArray(v)) return v.map(x => ser(x, seen));
  const o = {};
  for (const k of Object.keys(v)) { try { const s = ser(v[k], seen); if (s !== undefined) o[k] = s; } catch {} }
  return o;
}

// 遊戲用私有函式依編號決定每隻寶可夢當敵人時的行為與數值；把那段程式碼切出來直接執行
function enemyRoles(G, js) {
  const a = js.indexOf('t=a=>(a.hp-70)/.45'), b = js.indexOf('function l(a){', a);
  if (a < 0 || b < 0) throw new Error('找不到敵人行為程式碼，遊戲可能改版了');
  const { i, h } = new Function('G', 'const ' + js.slice(a, b) + ';return {i,h};')(G);
  const T = G.Enemies.TIERS, out = {};
  for (const d of G.DEX) {
    const tiers = [];
    T.forEach((t, n) => { if (d.rarity < 5 && d.bst >= t.bst[0] && d.bst <= t.bst[1] && G.SPRITE_META[d.dex]) tiers.push({ tier: n, ...h(d, t, n) }); });
    out[d.dex] = { behavior: i(d), hovers: !!G.Sprites.hovers(d.dex), tiers };
  }
  return out;
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
  const html = await (await fetch('https://pokesurvivor.com/')).text();
  const src = /src="(js\/app\.min\.js[^"]*)"/.exec(html)[1];
  const js = await (await fetch('https://pokesurvivor.com/' + src)).text();
  fs.writeFileSync(path.join(CACHE, 'app.min.js'), js);
  const { G, err } = load(path.join(CACHE, 'app.min.js'));
  if (err) throw new Error('遊戲程式碼載入失敗：' + err);
  for (const k of MODULES) fs.writeFileSync(path.join(OUT, k + '.json'), JSON.stringify(ser(G[k])));
  fs.writeFileSync(path.join(OUT, 'enemyRoles.json'), JSON.stringify(enemyRoles(G, js)));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ source: src, extractedAt: new Date().toISOString() }));
  console.log('已匯出', MODULES.length, '個模組，版本', src);
}
main().catch(e => { console.error(e); process.exit(1); });

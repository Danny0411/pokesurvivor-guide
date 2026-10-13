// 推算每個招式在 1..maxLvl 等級與 Lv5 進化後的數值，輸出 src/data/derived/moves.json。
// 規則對應 .cache/app.pretty.js 的 G.Moves（行 82139–82409）。
// 用法：node tools/derive-moves.cjs
//
// 注意：Moves.json 不含「每種類型的進化修正表 l」與「屬性→起手招式表 d」，
// 這兩張表在遊戲程式碼中是區域變數，因此在下方以常數重新抄錄（附行號），並在執行時做一致性檢查。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MOVES_IN = path.join(ROOT, 'src/data/game/Moves.json');
const STARTERS_IN = path.join(ROOT, 'src/data/game/STARTERS.json');
const OUT = path.join(ROOT, 'src/data/derived/moves.json');

// 行 82144–82145：乘法欄位（修正值相乘）與加法欄位（修正值相加）；其餘欄位直接覆寫。
const MULT = ['dmg', 'cd', 'speed', 'radius', 'dur', 'amount', 'arc', 'width', 'spread', 'life', 'size', 'rate'];
const ADD = ['count', 'pierce', 'stacks'];

// 行 82147–82149 的 o(target, mods)，逐行對應。
function apply(target, mods) {
  for (const k of Object.keys(mods)) {
    if (MULT.includes(k) && target[k] != null) target[k] *= mods[k];
    else if (ADD.includes(k)) target[k] = (target[k] || 0) + mods[k];
    else target[k] = mods[k];
  }
}

// 行 82241–82356：每種類型（buff 除外）的 Lv5 進化修正 l[kind] = { t: 說明, m: 修正值 }。
const EVO_KIND = {
  projectile: { t: '×1,8 daño, +2 proyectiles, +2 perforación y más grandes', m: { dmg: 1.8, count: 2, pierce: 2, size: 1.3, spread: 1.1 } },
  melee: { t: '×1,9 daño, más alcance y golpea en 360°', m: { dmg: 1.9, radius: 1.3, arc: 9 } },
  beam: { t: '×1,8 daño, rayo un 50% más grueso y más largo', m: { dmg: 1.8, width: 1.5, radius: 1.2, cd: 0.85 } },
  orbit: { t: '+2 orbes, ×1,7 daño y más radio', m: { count: 2, dmg: 1.7, radius: 1.15 } },
  nova: { t: '+6 proyectiles, ×1,6 daño y +1 perforación', m: { count: 6, dmg: 1.6, pierce: 1 } },
  aura: { t: '×1,8 daño y un 35% más de radio', m: { dmg: 1.8, radius: 1.35 } },
  boomerang: { t: '×1,8 daño, +1 bumerán y más alcance', m: { dmg: 1.8, count: 1, radius: 1.2, size: 1.2 } },
  chain: { t: '×1,7 daño y +3 saltos', m: { dmg: 1.7, count: 3, radius: 1.2 } },
  mine: { t: '×1,8 daño, +2 minas y explosión más grande', m: { dmg: 1.8, count: 2, radius: 1.25 } },
  meteor: { t: '×1,7 daño, +2 meteoros y más radio', m: { dmg: 1.7, count: 2, radius: 1.2 } },
  turret: { t: '×1,8 daño, +1 a la vez y dispara más rápido', m: { dmg: 1.8, count: 1, rate: 0.8 } },
  dash: { t: '×1,9 daño, más distancia y menos recarga', m: { dmg: 1.9, radius: 1.25, cd: 0.8 } },
  trail: { t: '×1,8 daño, charcos más grandes y duraderos', m: { dmg: 1.8, radius: 1.25, dur: 1.3 } },
  cone: { t: '×1,7 daño, +4 disparos y +1 perforación', m: { dmg: 1.7, count: 4, pierce: 1 } },
};

// 行 82150–82168：屬性 → 該屬性的起手招式（無起手資料時使用）。
const START_BY_TYPE = {
  fire: 'ember', water: 'water-gun', grass: 'vine-whip', electric: 'thunder-shock', psychic: 'confusion',
  poison: 'sludge', ground: 'mud-shot', flying: 'gust', bug: 'bug-bite', rock: 'rock-throw', ice: 'ice-beam',
  fighting: 'karate-chop', ghost: 'shadow-ball', dragon: 'dragon-rage', fairy: 'fairy-wind', steel: 'metal-claw',
  dark: 'bite', normal: 'tackle',
};

// 數值保留 12 位有效數字，去除浮點誤差；遊戲內為未捨入的 double。
const r12 = (v) => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toPrecision(12)) : v);
const SKIP = new Set(['id', 'name', 'type', 'kind', 'desc', 'ups', 'maxLvl']);
function statsOf(obj) {
  const out = {};
  for (const k of Object.keys(obj)) {
    if (SKIP.has(k)) continue;
    out[k] = r12(obj[k]);
  }
  return out;
}

const data = JSON.parse(fs.readFileSync(MOVES_IN, 'utf8'));
const ALL = data.ALL;
const POOL = data.POOL;
const EVO = data.EVO;
const NEED_NAME = data.NEED_NAME;
const STARTERS = JSON.parse(fs.readFileSync(STARTERS_IN, 'utf8'));

// 每種類型的升級表：遊戲行 82143 為 t.ups = a[t.kind]，同類型所有招式共用同一陣列。
// Moves.json 因序列化去重，只有每種類型的第一個招式帶有 ups，因此從那裡取回。
const kindUps = {};
for (const m of ALL) {
  if (!m.ups) continue;
  if (!kindUps[m.kind]) kindUps[m.kind] = m.ups;
  else if (JSON.stringify(kindUps[m.kind]) !== JSON.stringify(m.ups)) {
    throw new Error('同類型升級表不一致：' + m.kind + ' @ ' + m.id);
  }
}
for (const m of ALL) if (!kindUps[m.kind]) throw new Error('缺少升級表：' + m.kind + ' @ ' + m.id);

// 一致性檢查
for (const k of Object.keys(kindUps)) {
  if (k !== 'buff' && !EVO_KIND[k]) throw new Error('缺少進化修正表：' + k);
}
const ids = new Set(ALL.map((m) => m.id));
if (ids.size !== ALL.length) throw new Error('招式 id 重複');
for (const id of Object.keys(EVO)) if (!ids.has(id)) throw new Error('EVO 含未知招式：' + id);
const expectedEvo = ALL.filter((m) => m.kind !== 'buff').length;
if (Object.keys(EVO).length !== expectedEvo) throw new Error('EVO 數量應為 ' + expectedEvo);
for (const m of ALL) {
  const n = kindUps[m.kind].length + 1;
  if (n !== m.maxLvl) throw new Error('maxLvl 不符：' + m.id);
}
for (const type of Object.keys(POOL).filter((k) => k !== 'normal')) {
  const want = ALL.filter((m) => m.type === type).map((m) => m.id);
  if (JSON.stringify(want) !== JSON.stringify(POOL[type])) throw new Error('POOL 與屬性不符：' + type);
}
if (JSON.stringify(ALL.filter((m) => m.type === 'normal').map((m) => m.id)) !== JSON.stringify(POOL.normal)) {
  throw new Error('POOL.normal 與屬性不符');
}

// 行 82368–82379：instance(id, lvl) = 基礎值 + ups[0..lvl-2] 依序套用。
function instanceAt(move, lvl) {
  const inst = {};
  for (const k of Object.keys(move)) if (k !== 'ups') inst[k] = move[k];
  const ups = kindUps[move.kind];
  for (let i = 0; i < lvl - 1; i++) apply(inst, ups[i].m);
  return inst;
}

// 行 82406–82408：evolve() 會套用 l[kind].m；evoInfo 要求 lvl == maxLvl。
const moves = ALL.map((m) => {
  const ups = kindUps[m.kind];
  const maxLvl = ups.length + 1;
  const levels = [];
  for (let L = 1; L <= maxLvl; L++) {
    levels.push({ lvl: L, upText: L === 1 ? null : ups[L - 2].t, stats: statsOf(instanceAt(m, L)) });
  }
  let evo = null;
  const ev = EVO[m.id];
  if (ev && EVO_KIND[m.kind]) {
    const inst = instanceAt(m, maxLvl);
    apply(inst, EVO_KIND[m.kind].m);
    evo = {
      name: ev[0],
      needs: ev[1],
      needName: NEED_NAME[ev[1]],
      text: EVO_KIND[m.kind].t,
      modifiers: EVO_KIND[m.kind].m,
      stats: statsOf(inst),
    };
  }
  return { id: m.id, name: m.name, type: m.type, kind: m.kind, desc: m.desc, maxLvl, levels, evo };
});

const kinds = {};
for (const k of Object.keys(kindUps).sort()) {
  kinds[k] = {
    ups: kindUps[k],
    evolution: EVO_KIND[k] || null,
    moveCount: ALL.filter((m) => m.kind === k).length,
  };
}

// 起手招式：行 82386–82390 startFor(a)；行 82706–82708 G.startMoveOf。
const starters = STARTERS.map((s) => ({ dex: s.dex, start: s.start }));

const out = {
  _meta: {
    source: 'src/data/game/Moves.json（由 .cache/app.pretty.js 匯出）',
    codeRefs: {
      stats_apply: 'app.pretty.js 82144–82149',
      instance_and_levelUp: 'app.pretty.js 82368–82381',
      evolve_and_evoInfo: 'app.pretty.js 82394–82409',
      kind_ups_table: 'app.pretty.js 81250–81371（區域變數 a；行 82143 指派）',
      kind_evolution_table: 'app.pretty.js 82241–82356（區域變數 l）',
      start_by_type: 'app.pretty.js 82150–82168（區域變數 d）',
    },
    rounding: '數值保留 12 位有效數字（遊戲內為未捨入的 double）',
    note: '升級與進化修正以 apply() 規則處理：MULT 欄位相乘、ADD 欄位相加、其他欄位覆寫。',
  },
  kinds,
  moves,
  pool: POOL,
  startByType: START_BY_TYPE,
  starters,
  statNames: NEED_NAME,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const evoCount = moves.filter((m) => m.evo).length;
console.log(`已輸出 ${moves.length} 個招式、${Object.keys(kinds).length} 種類型、${evoCount} 個進化結果 → ${path.relative(ROOT, OUT)}`);

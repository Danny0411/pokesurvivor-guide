// 從 src/data/game/*.json 推導局外資料：升級費用表與效果、扭蛋池大小與機率、退款、任務與成就清單。
// 扭蛋邏輯照抄 app.pretty.js 的 G.Gacha（pool / 回退 o / d / featured / costOf / pull）。
// 用法：node tools/derive-meta.cjs   （輸出 src/data/derived/meta.json）
// 行號（_src）：若存在 .cache/app.pretty.js 會自動查出實際行號；否則只標範圍。
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src/data/game');
const OUT = path.join(ROOT, 'src/data/derived/meta.json');
const PRETTY = path.join(ROOT, '.cache/app.pretty.js');
const PRETTY_NAME = 'app.pretty.js';

const load = name => JSON.parse(fs.readFileSync(path.join(DATA, name + '.json'), 'utf8'));
const DEX = load('DEX');
const SPRITE_META = load('SPRITE_META');
const GACHA = load('Gacha');
const UPG = load('Upgrades');
const MISSIONS = load('MissionDefs');
const ACH = load('AchDefs');
const CHANGELOG = load('CHANGELOG');
const BUILD = load('meta');

const pretty = fs.existsSync(PRETTY) ? fs.readFileSync(PRETTY, 'utf8').split('\n') : null;

// 在指定行號範圍內找出符合 pattern 的第一行，回傳行號（找不到或沒有原始碼時回傳 null）。
function findLine(pattern, from, to) {
  if (!pretty) return null;
  for (let i = from - 1; i < Math.min(to, pretty.length); i++) {
    if (pattern.test(pretty[i])) return i + 1;
  }
  return null;
}
const src = (from, to) => (to && to !== from ? `${PRETTY_NAME}:${from}-${to}` : `${PRETTY_NAME}:${from}`);
const srcOr = (line, from, to) => (line ? `${PRETTY_NAME}:${line}` : src(from, to));
const idLine = (id, from, to) => findLine(new RegExp('^\\s*id: "' + id + '",?\\s*$'), from, to);

// ---- 扭蛋：照抄 G.Gacha ----
const RATES = GACHA.RATES; // [rarity, weight]
const PITY_5 = GACHA.PITY_5;
const SHINY_RATE = GACHA.SHINY_RATE;
const REFUND = GACHA.REFUND;
const sum = a => a.reduce((x, y) => x + y, 0);

// G.Gacha.pool(rarity, gen)：同 gen、有 SPRITE_META、稀有度相符的寶可夢
function pool(rarity, gen) {
  return DEX.filter(d => d.gen === gen && !!SPRITE_META[d.dex] && d.rarity === rarity);
}

// G.Gacha 內的 o(rarity, gen)：本稀有度池為空時依序試 0,-1,1,-2,2,-3,3,-4,4
function resolveRarity(rarity, gen) {
  for (const t of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
    const r = rarity + t;
    if (r < 1 || r > 5) continue;
    if (pool(r, gen).length) return r;
  }
  return rarity; // 程式碼的最後回退是整個 gen 的清單；此資料中未觸發
}

// G.Gacha 內的 d(minRarity)：依 RATES 加權抽稀有度（只取 >= minRarity）
function drawDist(minRarity = 1) {
  const t = RATES.filter(([r]) => r >= minRarity);
  const total = sum(t.map(x => x[1]));
  return t.map(([r, w]) => [r, w / total]);
}

// 單抽（不含保底與 pity）後的實際稀有度分布（已套回退）
function finalDist(gen, minRarity = 1) {
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const [r, p] of drawDist(minRarity)) out[resolveRarity(r, gen)] += p;
  return out;
}

// ×10 單抽：第 1–9 抽一般抽；第 10 抽若前 9 抽都不是 4★+，改用 d(4)。
// 回傳此 gen 的 ×10 結果機率（不含 pity 觸發）。
function tenPullStats(gen) {
  const normal = finalDist(gen, 1);
  const guard = finalDist(gen, 4);
  // 狀態 = (是否已有 4★+, 是否已有 5★)；4 種組合
  const key = (h, f) => (h ? 1 : 0) + (f ? 2 : 0);
  let st = { 0: 1, 1: 0, 2: 0, 3: 0 };
  for (let slot = 1; slot <= 9; slot++) {
    const nx = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const k of [0, 1, 2, 3]) {
      if (!st[k]) continue;
      const h = !!(k & 1), f = !!(k & 2);
      for (const r of [1, 2, 3, 4, 5]) {
        const p = normal[r];
        if (!p) continue;
        nx[key(h || r >= 4, f || r === 5)] += st[k] * p;
      }
    }
    st = nx;
  }
  const after = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const k of [0, 1, 2, 3]) {
    if (!st[k]) continue;
    const h = !!(k & 1), f = !!(k & 2);
    const dist = h ? normal : guard;
    for (const r of [1, 2, 3, 4, 5]) {
      const p = dist[r];
      if (!p) continue;
      after[key(h || r >= 4, f || r === 5)] += st[k] * p;
    }
  }
  const p4plus = after[1] + after[3];
  const p5 = after[2] + after[3];
  return {
    p_at_least_one_4plus: +p4plus.toFixed(6),
    p_at_least_one_5: +p5.toFixed(6),
    tenth_slot_when_no_4plus_before: { 4: +guard[4].toFixed(6), 5: +guard[5].toFixed(6) },
  };
}

// G.Gacha.featured(gen)：同 gen 的 5★ 依 bst 由高到低，取前 3
function featured(gen) {
  return DEX.filter(d => d.gen === gen && !!SPRITE_META[d.dex] && d.rarity === 5)
    .sort((a, b) => b.bst - a.bst)
    .slice(0, 3)
    .map(d => d.dex);
}

const r6 = x => +x.toFixed(6);

// ---- 升級費用與效果：照抄 G.Upgrades ----
const COST_LINE = findLine(/cost: function\(a, t\)/, 83345, 83348);
const PERK_LINE = findLine(/perks: function\(a = \{\}\)/, 83349, 83366);
function upgradeCost(u, level) {
  return 10 * Math.round(u.base * Math.pow(u.grow, level) / 10);
}
// 對應 G.Upgrades.perks：upgrade id -> perk key 與公式（k 為等級）
const PERK_MAP = {
  hp: { key: 'hp', formula: '8 * k', fn: k => 8 * k },
  atk: { key: 'atkMul', formula: '1 + 0.04 * k', fn: k => 1 + 0.04 * k },
  spd: { key: 'spdMul', formula: '1 + 0.03 * k', fn: k => 1 + 0.03 * k },
  cd: { key: 'cdMul', formula: '1 - 0.03 * k', fn: k => 1 - 0.03 * k },
  def: { key: 'dmgReduce', formula: '0.02 * k', fn: k => 0.02 * k },
  regen: { key: 'regen', formula: '0.2 * k', fn: k => 0.2 * k },
  magnet: { key: 'magnetMul', formula: '1 + 0.12 * k', fn: k => 1 + 0.12 * k },
  xp: { key: 'xpMul', formula: '1 + 0.05 * k', fn: k => 1 + 0.05 * k },
  coins: { key: 'coinMul', formula: '1 + 0.08 * k', fn: k => 1 + 0.08 * k },
  moves: { key: 'startMoves', formula: '1 + k', fn: k => 1 + k },
  crit: { key: 'crit', formula: '0.03 * k', fn: k => 0.03 * k },
  reroll: { key: 'rerolls', formula: 'k', fn: k => k },
  ban: { key: 'bans', formula: 'k', fn: k => k },
};

const upgradeIdLine = id => idLine(id, 83235, 83339);

const upgrades = UPG.LIST.map(u => {
  const line = upgradeIdLine(u.id);
  const costs = [];
  let cum = 0;
  const cumulative = [];
  for (let lv = 0; lv < u.max; lv++) {
    const c = upgradeCost(u, lv);
    costs.push(c);
    cum += c;
    cumulative.push(cum);
  }
  const m = PERK_MAP[u.id];
  const effects = [];
  for (let k = 0; k <= u.max; k++) effects.push(r6(m.fn(k)));
  return {
    id: u.id,
    name_es: u.name,
    unit_es: u.unit,
    icon: u.icon,
    max_level: u.max,
    base: u.base,
    grow: u.grow,
    cost_per_level: costs, // costs[i] = 升到第 i+1 級的費用（呼叫 cost(id, i)）
    cumulative_cost: cumulative,
    total_cost_to_max: cum,
    perk_key: m.key,
    perk_formula: m.formula,
    perk_value_by_level: effects, // 索引即等級 0..max
    _src: srcOr(line, 83235, 83339),
  };
});

// ---- 任務 ----
function missionEntry(def, scope, from, to) {
  const line = idLine(def.id, from, to);
  return {
    id: def.id,
    scope,
    ev: def.ev,
    param: def.param ?? null,
    mode: def.mode ?? null,
    goals: def.goals,
    tiers: def.goals.length,
    reward: def.reward,
    _src: srcOr(line, from, to),
  };
}
const missions = {
  daily: MISSIONS.daily.map(d => missionEntry(d, 'daily', 83478, 83650)),
  weekly: MISSIONS.weekly.map(d => missionEntry(d, 'weekly', 83478, 83650)),
  _src: src(83478, 83650),
};

// ---- 成就 ----
// leg_<dex> 由 84118 行的迴圈產生（leg && SPRITE_META）；legAll / ownAll / evoAll 的 goal 在執行期計算。
const LEG_GEN_LINE = findLine(/for \(const a of G\.DEX\.filter\(a => a\.leg && G\.SPRITE_META\[a\.dex\]\)\)/, 84100, 84150);
const GOAL_LINES = {
  legAll: findLine(/"legAll" === a\.id/, 84100, 84150),
  ownAll: findLine(/"ownAll" === a\.id/, 84100, 84150),
  evoAll: findLine(/"evoAll" === a\.id/, 84100, 84150),
};
const achievements = {
  count: ACH.LIST.length,
  categories: ACH.CATS.map(([id, name]) => ({ id, name_es: name })),
  by_category: {},
  computed_goals: {
    legAll: { goal: ACH.LIST.find(a => a.id === 'legAll').goal, rule: '= 含 dex 欄位的成就數（即 leg && SPRITE_META 的傳說數）', _src: srcOr(GOAL_LINES.legAll, 84100, 84150) },
    ownAll: { goal: ACH.LIST.find(a => a.id === 'ownAll').goal, rule: '= G.DEX.length', _src: srcOr(GOAL_LINES.ownAll, 84100, 84150) },
    evoAll: { goal: ACH.LIST.find(a => a.id === 'evoAll').goal, rule: '= Object.keys(G.Moves.EVO).length', _src: srcOr(GOAL_LINES.evoAll, 84100, 84150) },
  },
  list: ACH.LIST.map(a => {
    const line = a.dex !== undefined ? LEG_GEN_LINE : idLine(a.id, 83650, 84150);
    const entry = {
      id: a.id,
      cat: a.cat,
      tier: a.tier,
      goal: a.goal,
      reward: a.reward,
      name_es: a.name,
      desc_es: a.desc,
      title: a.title ?? null,
    };
    if (a.dex !== undefined) entry.dex = a.dex;
    entry._src = srcOr(line, 83650, 84150);
    return entry;
  }),
  _src: src(83650, 84150),
};
for (const a of achievements.list) achievements.by_category[a.cat] = (achievements.by_category[a.cat] || 0) + 1;

// ---- 卡池（每個 gen 一個 banner） ----
const banners = GACHA.BANNERS.map(b => {
  const pools = {};
  for (let r = 1; r <= 5; r++) pools[r] = pool(r, b.gen).length;
  const total = Object.values(pools).reduce((x, y) => x + y, 0);
  const gen_total = DEX.filter(d => d.gen === b.gen).length;
  const eligible = {};
  let eligibleAll = 0;
  let shinyPerPullApprox = 0;
  const fd = finalDist(b.gen, 1);
  for (let r = 1; r <= 5; r++) {
    const list = pool(r, b.gen);
    const e = list.filter(d => !!SPRITE_META[d.dex].sh).length;
    eligible[r] = e;
    eligibleAll += e;
    if (list.length) shinyPerPullApprox += fd[r] * (e / list.length);
  }
  const f = featured(b.gen);
  const ten = tenPullStats(b.gen);
  return {
    gen: b.gen,
    name_es: b.name,
    pool_size_by_rarity: pools,
    pool_size_total: total,
    dex_count_in_gen: gen_total,
    shiny_eligible_by_rarity: eligible,
    shiny_eligible_total: eligibleAll,
    effective_rates_single_pull: Object.fromEntries(Object.entries(fd).map(([r, p]) => [r, r6(p)])),
    shiny_per_pull_approx: r6(SHINY_RATE * shinyPerPullApprox),
    ten_pull: ten,
    featured_dex: f,
    featured_names_es: f.map(d => DEX.find(x => x.dex === d).name),
    _src: `${PRETTY_NAME}:89151-89187 (banner), ${PRETTY_NAME}:89100-89102 (pool), ${PRETTY_NAME}:89189-89191 (featured)`,
  };
});

const gacha = {
  rates_pct: RATES.map(([r, w]) => ({ rarity: r, pct: w, name_es: GACHA.RARITY_NAME[r], color: GACHA.RARITY_COLOR[r] })),
  rates_sum: sum(RATES.map(x => x[1])),
  _src_rates: src(89080, 89086),
  pity_5_threshold: PITY_5,
  pity_rule: 'pity[gen] 在每抽前 +1；達到 PITY_5 時該抽強制 5★，抽到 5★ 後歸零（pity 依 banner/gen 分開）',
  _src_pity: `${PRETTY_NAME}:89134 (PITY_5), ${PRETTY_NAME}:89195, 89199, 89204 (pity 邏輯)`,
  shiny_rate: SHINY_RATE,
  shiny_roll: 'Math.random() < 0.01，且該寶可夢需 SPRITE_META[dex].sh 為真（958/966 隻有閃光圖）',
  _src_shiny: `${PRETTY_NAME}:89135, 89206-89210; ${PRETTY_NAME}:80849-80852 (hasShiny)`,
  cost: {
    single_x1: { t1: 1 },
    ten_x10_with_t1: { t1: 10 },
    ten_x10_with_t10_ticket: { t10: 1 },
    _src: `${PRETTY_NAME}:89067-89079 (costOf)`,
  },
  refund_by_rarity: REFUND,
  refund_rule: '重複（非閃光）：REFUND[rarity] 寶可幣；新寶可夢或新閃光：0',
  shiny_duplicate_refund_branch: '程式碼 89216 含 3 * REFUND[rarity] 分支，但依 89206-89210 的重抽邏輯，閃光一定是新閃光，此分支不會觸發',
  _src_refund: `${PRETTY_NAME}:89087-89093 (REFUND), ${PRETTY_NAME}:89213-89222 (結算)`,
  ten_pull_guarantee: '第 10 抽（僅 ×10）若前 9 抽都不是 4★+，改用 d(4)：只在 4★、5★ 之間抽（RATES 6.5:1.5）',
  _src_ten: `${PRETTY_NAME}:89199, 89121-89126`,
  rarity_names: GACHA.RARITY_NAME,
  rarity_colors: GACHA.RARITY_COLOR,
  banners,
  fallback_triggered_in_data: banners.every(b => [1, 2, 3, 4, 5].every(r => b.pool_size_by_rarity[r] > 0)) ? false : true,
  _src_fallback: `${PRETTY_NAME}:89104-89118 (o)`,
};

// ---- 組合 ----
const out = {
  _generatedBy: 'tools/derive-meta.cjs',
  _build: { source: BUILD.source, extractedAt: BUILD.extractedAt },
  _note: '數值由 src/data/game 的 JSON 推導；_src 指向 .cache/app.pretty.js 的行號（有快取時精確查行，否則為範圍）。',
  currencies: {
    coins: { start_balance_new_account: 500, _src: `${PRETTY_NAME}:79597, 80178 (START_COINS)` },
    t1: { start_balance: 0, _src: `${PRETTY_NAME}:79606-79609` },
    t10: { start_balance: 0, _src: `${PRETTY_NAME}:79606-79609` },
  },
  upgrades: {
    _src_list: src(83235, 83339),
    _src_cost: `${PRETTY_NAME}:${COST_LINE || '83345-83348'} (cost), per-Pokémon 儲存 ${PRETTY_NAME}:80130-80132`,
    _src_perks: `${PRETTY_NAME}:${PERK_LINE || '83349-83366'} (perks)`,
    cost_formula: '費用(id, lv) = 10 * Math.round(base * grow^lv / 10)；lv 為目前等級（0 起算），即升到 lv+1 的價格',
    per_pokemon: true,
    list: upgrades,
  },
  gacha,
  missions,
  achievements,
  changelog: {
    count: CHANGELOG.length,
    version_field: null,
    entries: CHANGELOG.map(e => {
      const line = findLine(new RegExp('^\\s*d: "' + e.d + '",?\\s*$'), 84160, 84272);
      return { d: e.d, _src: srcOr(line, 84160, 84272) };
    }),
    _src: src(84160, 84272),
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log('wrote', path.relative(ROOT, OUT), 'bytes', fs.statSync(OUT).size, 'source lines', pretty ? 'found' : 'missing');

// 推導敵人、出怪、首領的衍生資料，寫入 src/data/derived/enemies.json。
// 輸入：src/data/game/*.json（由 tools/extract.cjs 匯出）。
// 公式從 .cache/app.pretty.js 手抄，每段標註行號（_src）。
// 驗證：用 tools/load-game.cjs 在沙盒載入 .cache/app.min.js，逐項比對遊戲實際函式的輸出；
// 任何不一致都會中止並報錯，所以寫進 JSON 的數字一定和遊戲程式碼一致。
// 用法：node tools/derive-enemies.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const load = require('./load-game.cjs');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'src/data/game');
const OUT = path.join(ROOT, 'src/data/derived/enemies.json');
const MIN_JS = path.join(ROOT, '.cache/app.min.js');

const readJSON = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const Enemies = readJSON('Enemies.json');
const DEX = readJSON('DEX.json');
const SPRITE_META = readJSON('SPRITE_META.json');

const TIERS = Enemies.TIERS;
const BOSS_SLOTS = Enemies.BOSS_SLOTS;
const LATE_FROM = Enemies.LATE_FROM;

// ---- 工具函式（app.pretty.js:1-30）----
const clamp = (a, e, t) => (a < e ? e : a > t ? t : a);
function hash(a, e, t = 0) {
  let r = Math.imul(0 | a, 374761393) ^ Math.imul(0 | e, 668265263) ^ Math.imul(0 | t, 2246822519);
  return (r = Math.imul(r ^ (r >>> 13), 1274126177)), (r ^= r >>> 16), (r >>> 0) / 4294967296;
}

// ---- G.Enemies（app.pretty.js:82955-83234）----
const tHp = a => (a.hp - 70) / 0.45; // 83036
const rSpd = a => (a.spd - 78) / 0.42; // 83037
const HEALER = new Set([35, 36, 113, 173, 183, 184, 242, 301, 440, 531, 594, 700, 764, 858]); // 83038
const SHIELDER = new Set([95, 122, 208, 213, 227, 306, 375, 410, 411, 436, 437, 439, 476, 703]); // 83039
const BOMBER = new Set([74, 75, 76, 100, 101, 102, 109, 110, 337, 338, 343, 344]); // 83040
const MINION = { 15: 13, 18: 16, 24: 23, 28: 27, 31: 29, 34: 32, 42: 41, 51: 50, 53: 52, 57: 56, 59: 58, 62: 60, 68: 66, 73: 72, 78: 77, 82: 81, 85: 84, 91: 90, 117: 116, 130: 129, 168: 167, 169: 41, 199: 79, 230: 116, 262: 261, 334: 333, 405: 403, 416: 415, 462: 81, 466: 239, 553: 551, 637: 636 }; // 83041-83074

// 行為分類（83076-83082）。h 為 hash(dex,7,11)，是固定值，同一物種永遠同一行為。
function classify(p) {
  const h = hash(p.dex, 7, 11);
  const y = (...xs) => xs.some(x => p.types.includes(x));
  if (HEALER.has(p.dex)) return 'healer';
  if (SHIELDER.has(p.dex)) return 'shielder';
  if (BOMBER.has(p.dex)) return 'bomber';
  if ((MINION[p.dex] && SPRITE_META[MINION[p.dex]]) || (y('bug') && h >= 0.6 && h < 0.78)) return 'summoner';
  if (y('electric', 'psychic', 'dragon', 'ice') && h < 0.18) return 'beamer';
  if (y('fire', 'ground', 'poison') && h < 0.18) return 'zoner';
  if (y('water', 'grass', 'bug', 'fairy') && h >= 0.18 && h < 0.32) return 'fan';
  if (y('fighting', 'ground', 'normal', 'rock') && h >= 0.42 && h < 0.56) return 'jumper';
  if ((y('psychic', 'electric', 'ghost', 'fairy') && h < 0.4) || (y('fire', 'water', 'poison', 'ice') && h < 0.22)) return 'ranged';
  if (y('fighting', 'normal', 'ground', 'rock', 'dragon', 'steel', 'dark') && h < 0.4) return 'charger';
  if (tHp(p) > 95 && rSpd(p) < 50) return 'tank';
  return 'chase';
}

// 由物種 + 梯次產生一隻敵人的基礎數值（83084-83106）。n 為梯次索引。
function mon(p, tier, n) {
  const beh = classify(p);
  const s = clamp(tHp(p) / 65, 0.7, 1.6);
  const o = clamp(0.75 + rSpd(p) / 260, 0.75, 1.3);
  const tank = beh === 'tank';
  const l = {
    dex: p.dex,
    name: p.name,
    behavior: beh,
    hp: Math.round(tier.hp * s * (tank ? 1.5 : 1)),
    spd: Math.round(tier.spd * o * (tank ? 0.7 : 1)),
    dmg: Math.round(tier.dmg * (tank ? 1.2 : 1)),
    xp: Math.max(3, Math.round(tier.xp * (tank ? 1.3 : 1))),
  };
  const shot = { ranged: 2.2 - 0.15 * n, fan: 3.2 - 0.15 * n, beamer: 4.4 - 0.2 * n, zoner: 4.6 - 0.2 * n, healer: 3.5, summoner: 7 };
  if (shot[beh] !== undefined) {
    l.shotDmg = Math.round(tier.dmg * (beh === 'fan' ? 0.7 : 0.8));
    l.shotCd = +shot[beh].toFixed(2);
    l.range = (beh === 'beamer' ? 260 : beh === 'healer' || beh === 'summoner' ? 230 : 190) + 6 * n;
  }
  if (beh === 'summoner') l.minion = MINION[p.dex];
  if (beh === 'fan') l.fanN = n < 2 ? 3 : 5;
  if (beh === 'zoner') l.zones = n < 2 ? 1 : n < 4 ? 2 : 3;
  if (beh === 'bomber') {
    l.spd = Math.round(1.25 * l.spd);
    l.hp = Math.round(0.8 * l.hp);
  }
  return l;
}

// 梯次候選池（83108-83110）：稀有度 < 5、種族值落在區間內、有圖片資料。
const candidates = tier => DEX.filter(e => e.rarity < 5 && e.bst >= tier.bst[0] && e.bst <= tier.bst[1] && SPRITE_META[e.dex]);

// 梯次索引：最後一個 from <= 時間的梯次（83166-83171）。時間單位為秒。
function tierIndex(t) {
  let r = 0;
  TIERS.forEach((tier, i) => {
    if (t >= tier.from) r = i;
  });
  return r;
}

// 晚期倍率（83158-83164）
const LATE_G = 60;
const LATE_M = 374e-6;
const late = t => Math.exp(Math.min(30, LATE_M * Math.max(0, t / 60 - LATE_G) ** 2));

// 一般敵人、首領的強度倍率（83178-83193）
const scale = t => {
  const e = late(t);
  return { hp: (1 + t / 95) * e, dmg: (1 + t / 420) * Math.pow(e, 0.7), spd: 1 + Math.min(0.35, t / 1400) };
};
const bossScale = t => {
  const e = late(t);
  return { hp: (1 + t / 600) * e, dmg: (1 + t / 600) * Math.pow(e, 0.7), spd: 1 };
};

// ---- G.Spawner（app.pretty.js:88785-88905）----
const SPAWN_CAP = 64; // 88786 a = 64
const SHINY_RATE = 1 / 4096; // 88787 e = 1/4096
const rate = t => 0.24 * (1.6 + 0.028 * t + 0.5 * Math.pow(t / 60, 1.6)); // 88797
const hpTimeFactor = t => 3.3 + Math.min(1.7, t / 210); // 88842 (a => 3.3 + Math.min(1.7, a/210))
const BOSS_HP_MULT_MULTI = 1.4; // 88860 (y.length > 1 ? 1.4 : 1)
const SURGE_FIRST = 32; // 88790 n = 32
const SURGE_MIN = 38; // 88870 G.U.rand(38, 56)
const SURGE_MAX = 56;
const surgeSize = (t, rateScale = 1) => Math.round((14 + Math.floor(t / 22)) * rateScale * 0.4); // 88873 (未封頂前)
const BOSS_HP_DEF = b => Math.round(1.35 * b.hp); // 83144
const BOSS_DMG_DEF = b => Math.round(1.2 * b.dmg); // 83146

// ---- G.Coop（app.pretty.js:91736-91737）與 G.Spawner 的多人係數 ----
const coopRate = n => 1 + 0.75 * Math.max(0, n - 1); // 91736 scaleRate
const coopHp = n => 1 + 0.3 * Math.max(0, n - 1); // 91737 scaleHp
const bossCoopHp = n => (n > 1 ? 1.4 : 1); // 88860 (y.length > 1 ? 1.4 : 1)

// ---- G.Tiles / G.World 地形（Tiles.json 的 BIOMES 前 3 筆為一般地形，之後 18 筆由 ARENA_THEMES 產生）----
const TILES = readJSON('Tiles.json');
const BIOME_CYCLE_SEC = 240; // 95226: const t = Math.floor(o / 240)
function biomeIndex(i) {
  const n = TILES.BIOMES.length;
  return ((i % n) + n) % n; // 85553-85554
}
function biomeName(i) {
  return TILES.BIOMES[biomeIndex(i)].name;
}

// ---- 沙盒驗證 ----
function near(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => near(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    return near(ka, kb) && ka.every(k => near(a[k], b[k]));
  }
  return a === b;
}
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
function must(label, mine, game) {
  if (!near(mine, game)) throw new Error(`驗證失敗：${label}\n  本腳本：${JSON.stringify(mine)}\n  遊戲程式：${JSON.stringify(game)}`);
}

function verify() {
  const { G, err } = load(MIN_JS);
  if (err || !G || !G.Enemies) throw new Error('沙盒載入失敗：' + err);
  // 1. 數值函式
  for (const t of [0, 1, 30, 60, 95, 120, 180, 210, 300, 357, 420, 600, 900, 1200, 1800, 3000, 3600, 3601, 4500, 7200]) {
    must(`scale(${t})`, scale(t), G.Enemies.scale(t));
    must(`bossScale(${t})`, bossScale(t), G.Enemies.bossScale(t));
    must(`late(${t})`, late(t), G.Enemies.late(t));
    must(`rate(${t})`, rate(t), G.Spawner.rate(t));
  }
  // 2. 候選池與常數
  must('LATE_FROM', LATE_FROM, G.Enemies.LATE_FROM);
  must('TIERS', TIERS, G.Enemies.TIERS);
  must('BOSS_SLOTS', BOSS_SLOTS, G.Enemies.BOSS_SLOTS);
  must('CAP', SPAWN_CAP, G.Spawner.CAP);
  must('SHINY_RATE', SHINY_RATE, G.Spawner.SHINY_RATE);
  TIERS.forEach((tier, i) => must(`candidates[${i}]`, candidates(tier).map(e => e.dex), G.Enemies.candidates(tier).map(e => e.dex)));
  for (const t of [0, 60, 150, 200, 300, 400, 600, 800, 1000]) {
    must(`hordeTypes(${t})`, typesWithHorde(t), G.Enemies.hordeTypes(t));
  }
  // 2b. 多人（G.Coop，app.pretty.js:91736-91737）與地形輪替（G.World，85552-85556）
  for (let n = 1; n <= 6; n++) {
    must(`coop.scaleRate(${n})`, coopRate(n), G.Coop.scaleRate(n));
    must(`coop.scaleHp(${n})`, coopHp(n), G.Coop.scaleHp(n));
  }
  must('Tiles.BIOMES.length', TILES.BIOMES.length, G.Tiles.BIOMES.length);
  for (const bi of [0, 1, 2, 3, 10, 20, 21, 22, 41]) {
    G.World.setBiome(bi, true);
    must(`biome name ${bi}`, biomeName(bi), G.World.biomeName());
  }
  // 3. 每梯次的隨機名單（每次 rollRun 結果都要與本腳本的 mon() 完全一致）
  let checked = 0;
  for (let round = 0; round < 60; round++) {
    G.Enemies.rollRun();
    const cast = G.Enemies.cast;
    cast.forEach((tierList, i) => {
      if (tierList.list.length !== TIERS[i].cast) throw new Error(`梯次 ${i} 名單長度不是 ${TIERS[i].cast}`);
      for (const entry of tierList.list) {
        const p = DEX.find(d => d.dex === entry.dex);
        const base = mon(p, TIERS[i], i);
        if (entry.behavior === 'runner') {
          // 83131-83132：同梯次 chase/charger/tank 中速度最快的一隻改為 runner
          must(`runner stats dex ${entry.dex}`, { hp: Math.round(0.7 * base.hp), spd: Math.round(1.6 * base.spd), dmg: base.dmg, xp: base.xp }, { hp: entry.hp, spd: entry.spd, dmg: entry.dmg, xp: entry.xp });
          if (!['chase', 'charger', 'tank'].includes(base.behavior)) throw new Error(`runner 來源行為異常 ${base.behavior}`);
        } else {
          must(`mon dex ${entry.dex} tier ${i}`, clean(base), clean(entry));
        }
        checked++;
      }
    });
    // 83218-83225 的 hordeTypes / hordeDefs 不在這裡重算（hordeDefs 是隨機抽 4 隻）
    G.Enemies.BOSSES.forEach((b, k) => {
      const slot = BOSS_SLOTS[k];
      const p = DEX.find(d => d.dex === b.dex);
      const spd = Math.round(clamp(40 + 0.5 * rSpd(p), 40, 100));
      const beh = classify(p) === 'ranged' ? 'ranged' : rSpd(p) > 90 ? 'charger' : 'chase';
      must(`boss ${k} dex ${b.dex}`, { at: slot.at, hp: BOSS_HP_DEF(slot), spd, dmg: BOSS_DMG_DEF(slot), xp: slot.xp, behavior: beh, shotDmg: Math.round(0.55 * slot.dmg), shotCd: 1.1, range: 260 },
        { at: b.at, hp: b.hp, spd: b.spd, dmg: b.dmg, xp: b.xp, behavior: b.behavior, shotDmg: b.shotDmg, shotCd: b.shotCd, range: b.range });
    });
  }
  return { checkedEntries: checked, rounds: 60 };
}

// 某時間可出現的 hordeTypes（與遊戲 hordeTypes 相同邏輯，83218-83221）
function typesWithHorde(t) {
  const pool = candidates(TIERS[tierIndex(t)]).filter(a => !['bomber', 'healer', 'shielder', 'summoner'].includes(classify(a)));
  return Object.keys(readJSON('U.json').TYPE_COLOR).filter(ty => pool.filter(e => e.types.includes(ty)).length >= 3);
}

// ---- 推導資料 ----
function tierTable() {
  return TIERS.map((tier, i) => {
    const pool = candidates(tier);
    const count = {};
    for (const p of pool) count[classify(p)] = (count[classify(p)] || 0) + 1;
    const groups = {
      support: pool.filter(p => ['healer', 'shielder', 'summoner'].includes(classify(p))).length,
      front: pool.filter(p => ['chase', 'charger', 'ranged', 'tank'].includes(classify(p))).length,
      other: pool.filter(p => !['chase', 'charger', 'ranged', 'tank', 'healer', 'shielder', 'summoner'].includes(classify(p))).length,
    };
    return {
      index: i,
      from: tier.from,
      bst: tier.bst,
      base: { hp: tier.hp, spd: tier.spd, dmg: tier.dmg, xp: tier.xp, cast: tier.cast },
      candidateCount: pool.length,
      candidateGroups: groups,
      candidateByBehavior: count,
      _src: 'app.pretty.js:82956-83004 (TIERS), 83109-83110 (candidates), 83076-83082 (classify)',
    };
  });
}

function scalingSamples() {
  const rows = [];
  for (let m = 0; m <= 30; m++) {
    const t = m * 60;
    const s = scale(t);
    const tf = hpTimeFactor(t);
    rows.push({
      minute: m,
      t,
      tierIndex: tierIndex(t),
      late: +late(t).toFixed(6),
      timeHpFactor: +tf.toFixed(6),
      regularHpMult: +(s.hp * tf).toFixed(4),
      regularDmgMult: +(s.dmg * 2.4).toFixed(4),
      regularSpdMult: +s.spd.toFixed(4),
      bossHpMult: +bossScale(t).hp.toFixed(4),
      bossDmgMult: +bossScale(t).dmg.toFixed(4),
      surgeSizeNoCap: surgeSize(t),
    });
  }
  return rows;
}

// 60 分鐘之後的晚期倍率樣本（83158-83164）
function lateTable() {
  return [60, 70, 80, 90, 100, 120, 180, 240].map(m => {
    const t = m * 60;
    return { minute: m, t, late: +late(t).toFixed(6), regularHpMultSolo: +(scale(t).hp * hpTimeFactor(t)).toFixed(3), bossHpMultSolo: +bossScale(t).hp.toFixed(3) };
  });
}

function timelineTable() {
  const rows = [];
  for (let t = 0; t <= 1800; t += 30) {
    rows.push({
      t,
      minute: +(t / 60).toFixed(1),
      tierIndex: tierIndex(t),
      tierFrom: TIERS[tierIndex(t)].from,
      spawnRatePerSec: +rate(t).toFixed(4),
      spawnRatePerSecBossAlive: +(rate(t) * 0.25).toFixed(4),
      cap: SPAWN_CAP,
      bossSlotsDue: BOSS_SLOTS.filter(b => b.at <= t).length,
    });
  }
  return rows;
}

function bossTable() {
  return BOSS_SLOTS.map((b, k) => ({
    slot: k,
    at: b.at,
    baseHp: b.hp,
    baseDmg: b.dmg,
    baseXp: b.xp,
    defHp: BOSS_HP_DEF(b),
    defDmg: BOSS_DMG_DEF(b),
    hpAtSpawnSolo: Math.round(BOSS_HP_DEF(b) * bossScale(b.at).hp),
    dmgAtSpawnSolo: +(BOSS_DMG_DEF(b) * bossScale(b.at).dmg).toFixed(4),
    shotDmgBase: Math.round(0.55 * b.dmg),
    shotCd: 1.1,
    range: 260,
    _src: 'app.pretty.js:83011-83034 (BOSS_SLOTS), 83135-83152 (boss def), 88858-88862 (spawn)',
  }));
}

function coopTable() {
  return [1, 2, 3, 4, 5].map(n => ({
    players: n,
    scaleRate: +coopRate(n).toFixed(4),
    scaleHp: +coopHp(n).toFixed(4),
    bossHpFactorExtra: bossCoopHp(n),
    surgeSizeAt0: Math.min(SPAWN_CAP, Math.round((14 + 0) * coopRate(n) * 0.4)),
    _src: 'app.pretty.js:91736 (scaleRate), 91737 (scaleHp), 88860 (boss ×1.4 when >1 player), 88873 (surge size)',
  }));
}

function biomeTable() {
  return TILES.BIOMES.map((b, i) => ({
    index: i,
    name: b.name,
    liquid: b.liquid,
    kind: i < 3 ? 'normal' : 'rift-theme',
  }));
}

function arenaTable() {
  return TILES.ARENA_TYPES.map(type => {
    const th = TILES.ARENA_THEMES[type];
    return {
      type,
      name: th.name,
      liquid: th.liquid,
      weather: th.weather,
      pools: th.pools,
      pillars: th.pillars,
      _src: 'Tiles.json ARENA_TYPES / ARENA_THEMES（app.pretty.js:85181-85182, 84711 名稱前綴 "Grieta · "）',
    };
  });
}

function mapSpecialTable() {
  return {
    _src: 'app.pretty.js:85346（每格：f < .0032 才會生成；altar f<4e-4，spring f<8e-4，bigchest f<.0011，其餘為 trap）',
    perCellThreshold: 0.0032,
    perKind: { altar: 0.0004, spring: 0.0004, bigchest: 0.0003, trap: 0.0021 },
    variantCount: { altar: 4, spring: 3, bigchest: 3, trap: 3 },
    note: 'f 為 x(n,o,seed+909) 的種子雜湊值，與本場世界種子有關；同種子的地圖相同。',
  };
}

function propDropTable() {
  return [
    {
      prop: 'rock',
      drops: 'XP 6（機率 40%）；金幣 value 2（機率 25%，e>.75）；heal（機率 6%，e>.94）',
      _src: 'app.pretty.js:85502-85507',
    },
    {
      prop: 'chest',
      drops: '金幣 4–7 顆（value 3）；heal 或 magnet 各 50%；XP 20；道具 8%（G.Items.roll）',
      _src: 'app.pretty.js:85508-85511（以 85509-85511 為準，語法見原碼）',
    },
    {
      prop: 'bigchest',
      drops: '金幣 9 顆（value 4）；ticket 1–3 顆（value 1）；ticket10 15%；道具 50%；XP = G.Game.levelXp()；進度 event "chest"',
      _src: 'app.pretty.js:85512-85518',
    },
  ];
}

function runEndTable() {
  return {
    _src: 'app.pretty.js:95076-95082（M 函式，遊戲結束結算）',
    formula: 'round((floor(時間/5) + floor(0.25×擊倒數) + 80×首領數 + 拾取金幣) × coinMul)',
    terms: { tiempo: 'floor(o / 5)', derrotados: 'floor(0.25 * kills)', jefes: '80 * bosses', recogidas: 'coins' },
  };
}

// ---- 裂隙（G.Rift，app.pretty.js:89342-89568）：手抄，並於下方以行號註記 ----
const RIFT = {
  _src: 'app.pretty.js:89346 (timer r=30), 89475-89477 (check), 89361 (ttl 45), 89471 (enter 30px), 89496 (lose 1.4s), 89343 (fight 120s)',
  checkIntervalSec: 30,
  firstCheckAfterRunSec: 75,
  portalTtlSec: 45,
  enterRadiusPx: 30,
  fightLimitSec: 120,
  loseAllDeadSec: 1.4,
  arenaRadiusTiles: 11,
  placement: { tries: 24, radiusMin: 380, radiusMax: 560, ySquash: 0.85, isFreeRadius: 22 },
  legendWeight: { alreadyDefeated: 1, notYetDefeated: 4 },
  arenaShinyChance: 1 / 512,
  forcedWeatherSec: 135,
  winEndSec: 5,
  loseEndSec: 1.2,
};

// 觸發階梯：每次判定 p = min(1, 0.2 × (1 + o))，o 為連續落空次數（89477）。
function riftLadder() {
  const rows = [];
  for (let o = 0; o <= 4; o++) {
    const p = Math.min(1, 0.2 * (1 + o));
    rows.push({ consecutiveMisses: o, checkNumber: o + 1, chance: +p.toFixed(2), firstCheckAtRunSec: 105 + 30 * o, _src: 'app.pretty.js:89477' });
  }
  return rows;
}

function riftBossSamples() {
  // 數值（n=1 人）：HP = (3200 + 9T) × late(T)；傷害 = (36 + T/20) × late^0.7；射擊傷害 = (18 + T/40) × late^0.7；經驗 = 500 + 1.2T（89404-89409）
  return [0, 300, 600, 900, 1200, 1800, 3600].map(T => {
    const s = late(T);
    return {
      runMinute: +(T / 60).toFixed(1),
      T,
      hpSolo: Math.round((3200 + 9 * T) * s),
      meleeDmg: Math.round((36 + T / 20) * Math.pow(s, 0.7)),
      shotDmg: Math.round((18 + T / 40) * Math.pow(s, 0.7)),
      xp: Math.round(500 + 1.2 * T),
      shotCd: 0.9,
      range: 300,
    };
  });
}

// ---- 隨機事件（G.Events，app.pretty.js:89569-89869）----
const EVENTS = {
  _src: 'app.pretty.js:89570-89572 (timers), 89758-89763 (scheduler), 89582-89593 (horde), 89594-89600 (gold), 89602-89638 (lost), 89655-89682 (thief)',
  schedulerIntervalSec: [240, 300],
  schedulerBossDelaySec: 10,
  thiefFirstSec: [120, 240],
  thiefGapSec: [240, 360],
  thiefBossDelaySec: 8,
  thiefMaxPerRun: 2,
  types: [
    { id: 'horde', durationSec: 30, pool: 'G.Enemies.hordeTypes(time) → 隨機一種；空則改成 gold', burstCount: 'round(6 × scaleRate(players))', spawnBag: 'hordeDefs(type, time)：同梯次同屬性候選中隨機最多 4 種（排除 bomber/healer/shielder/summoner）', _src: 'app.pretty.js:89582-89593, 89765-89766' },
    { id: 'gold', durationSec: 30, effect: '場上非遠端敵人全部變金色（經驗 ×2、死亡 35% 掉 1 枚金幣）；期間新生敵人也是金色', _src: 'app.pretty.js:89594-89600, 86974-86976, 87017, 89849-89850, 88843' },
    { id: 'lost', durationSec: 'until delivered or 120s timeout', monsterHp: 100, grantChance: 0.2, followRadiusPx: '(enemy.r + monster.r + 18)', deliverRadiusPx: 56, healOnDeliver: 0.5, damageEverySec: 0.5, damagePerTick: 'min(30, Σ(4 + 0.12 × enemy.dmg))', timeoutSec: 120, reward: '12 coins（value 5）+ 1 ticket（value 1）+ 回復 50% HP；grant 時 G.onRescue', _src: 'app.pretty.js:89602-89638, 89728-89756, 89700-89705, 89743-89747' },
    { id: 'thief', durationSec: 'enemy life 15s', spawnDex: { normal: 52, ticketVariant: 1000, ticketChance: 0.25 }, hp: '60 × (1 + time/95) × (1.5 if ticket variant)', spd: 92, xp: 10, loot: 'coins（20 × coin value 5）或 ticket10 variant（6 × coin value 5 + ticket10 value 1）', escape: '生命歸零則逃走，無掉落', _src: 'app.pretty.js:89655-89682, 87017-87020, 87634-87636' },
  ],
};

// ---- 天氣（G.Weather，app.pretty.js:89870-90100）----
const WEATHER = {
  _src: 'app.pretty.js:89934-89947 (biome tables), 89878-89928 (effects), 90022-90044 (roll and damage)',
  rollEverySec: 60,
  rollChance: 0.18,
  startsAfterRunSec: 120,
  durationSec: 'round(rand(55, 75))',
  rampSec: 3,
  biomeTables: [
    { biomeIndexMod3: 0, weights: { rain: 3, fog: 2, sun: 1.5, snow: 0.5, sand: 0.5 } },
    { biomeIndexMod3: 1, weights: { fog: 3, snow: 2.5, rain: 1, sand: 1 } },
    { biomeIndexMod3: 2, weights: { sun: 3, sand: 3, fog: 1 } },
  ],
  kinds: [
    { id: 'sun', name: 'Sol abrasador', mult: { fire: 1.5, water: 0.5 } },
    { id: 'rain', name: 'Lluvia', mult: { water: 1.5, electric: 1.2, fire: 0.5 } },
    { id: 'sand', name: 'Tormenta de arena', mult: { rock: 1.3, ground: 1.3, steel: 1.3 }, safe: ['rock', 'ground', 'steel'] },
    { id: 'snow', name: 'Nevada', mult: { ice: 1.5 }, safe: ['ice'], slowsNonIce: 0.1 },
    { id: 'fog', name: 'Niebla', mult: { ghost: 1.3, fairy: 1.3, psychic: 1.3 } },
  ],
  damage: {
    playerEverySec: 2,
    playerPerTick: 'max(1, 0.012 × maxHp)，僅當天氣對玩家屬性造成傷害且強度 > 0.5',
    enemyEverySec: 2,
    enemyPerTick: '0.02 × maxHp + 1，僅沙暴/雪，強度 > 0.5，略過首領與遠端敵人',
    _src: 'app.pretty.js:90038-90043',
  },
};

// ---- 掉落（敵人死亡、地圖道具）----
const DROPS = {
  _src: 'app.pretty.js:87004-87027 (die), 87772-87785 (dropXp), 85502-85518 (prop break), 95128-95139 (rescue/shiny)',
  normalEnemyDeath: [
    { item: 'XP orb', value: 'round(5.6 × base xp) at spawn（經驗值由 Enemy.xp 帶入）', _src: 'app.pretty.js:88843, 87781' },
    { item: 'ticket（value 1）', chance: 0.0025, _src: 'app.pretty.js:87781' },
    { item: 'heal', chance: 0.012, _src: 'app.pretty.js:87782-87783' },
    { item: 'magnet', chance: 0.008, _src: 'app.pretty.js:87783' },
    { item: 'bomb', chance: 0.006, _src: 'app.pretty.js:87783' },
  ],
  bossDeath: [
    { item: 'coin（value 5）', count: 10, _src: 'app.pretty.js:87012-87014' },
    { item: 'item（G.Items.roll()）', count: 1, _src: 'app.pretty.js:87015' },
    { item: 'xpBig orbs', count: 14, valueEach: 'ceil(xp / 14)', _src: 'app.pretty.js:87774-87777' },
    { item: 'heal（value 0）+ magnet（value 0）', count: 2, _src: 'app.pretty.js:87779' },
    { item: 'ticket10', chance: 'legend 時 0.5，否則 1/3', _src: 'app.pretty.js:87736, 87779' },
  ],
  goldenEnemyDeath: [{ item: 'coin（value 3）', chance: 0.35, _src: 'app.pretty.js:87017' }],
  thiefDeath: { coins: 20, coinValue: 5, ticket10Variant: { coins: 6, ticket10: 1 }, _src: 'app.pretty.js:87017-87020' },
  legendDeath: { tickets: { count: 3, value: 1 }, coins: { count: 10, value: 8 }, _src: 'app.pretty.js:87022-87025' },
  shinyDeath: { onShinyCaught: 'G.DB.grantShiny(dex,"wild")：新收錄則收錄；重複則 +300 金幣', _src: 'app.pretty.js:87026, 95128-95139' },
  propBreak: [
    { prop: 'rock', drops: 'XP 6（40%）、coin value 2（25%）、heal（6%）', _src: 'app.pretty.js:85502-85507' },
    { prop: 'chest', drops: '4–7 coins（value 3）、heal 或 magnet（各 50%）、XP 20、道具（8%）', _src: 'app.pretty.js:85508-85511' },
    { prop: 'bigchest', drops: '9 coins（value 4）、1–3 tickets（value 1）、ticket10（15%）、道具（50%）、XP（G.Game.levelXp）', _src: 'app.pretty.js:85512-85518' },
  ],
  runEnd: { formula: 'round((floor(time/5) + floor(0.25 × kills) + 80 × bosses + coins) × coinMul)', _src: 'app.pretty.js:95076-95082' },
};

function main() {
  const checks = verify();
  const out = {
    _meta: {
      source: 'src/data/game/*.json + .cache/app.pretty.js（行號見各段 _src）',
      verifiedAgainst: '.cache/app.min.js 沙盒（tools/load-game.cjs）',
      verification: checks,
      note: '隨機名單（cast / BOSSES）每場重抽，這裡的 Enemies.json 只是一次抽樣。',
    },
    tiers: tierTable(),
    bossSlots: bossTable(),
    scalingSamplesByMinute: scalingSamples(),
    timeline: timelineTable(),
    timelineSource: 'app.pretty.js:88797 (rate), 88786-88787 (CAP, SHINY_RATE), 88790 (surge first), 88870 (surge gap 38-56s), 88873 (surge size)',
    coop: coopTable(),
    biomes: { cycleSeconds: BIOME_CYCLE_SEC, rule: 'index = floor(runTime / 240) mod 21（app.pretty.js:95226, 85552-85555）', list: biomeTable() },
    arenaTypes: arenaTable(),
    mapSpecials: mapSpecialTable(),
    propDrops: propDropTable(),
    runEnd: runEndTable(),
    lateSamples: lateTable(),
    rift: { ...RIFT, ladder: riftLadder(), bossSamplesSolo: riftBossSamples() },
    events: EVENTS,
    weather: WEATHER,
    drops: DROPS,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log('已寫入', OUT, '| 驗證通過：', JSON.stringify(checks));
}

main();

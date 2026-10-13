// 遊戲資料的唯一入口：讀取 tools/extract.cjs 匯出的 JSON，併上中文翻譯與推導欄位。
import DEX from '../data/game/DEX.json';
import TYPES from '../data/game/Types.json';
import U from '../data/game/U.json';
import STARTERS from '../data/game/STARTERS.json';
import GACHA from '../data/game/Gacha.json';
import ENEMIES from '../data/game/Enemies.json';
import ROLES from '../data/game/enemyRoles.json';
import META from '../data/game/meta.json';
import SPRITES from '../data/sprites.json';
import MOVES from '../data/derived/moves.json';
import ZH_POKEMON from '../i18n/zh/pokemon.json';
import ZH_TYPES from '../i18n/zh/types.json';
import ZH_MOVES from '../i18n/zh/moves.json';
import ZH_RUN from '../i18n/zh/run.json';

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (p: string) => `${BASE}${p.startsWith('/') ? p : '/' + p}`;
export const gameVersion = (META as any).source.replace(/^.*v=/, '');
export const extractedAt = (META as any).extractedAt as string;

// ---------- 屬性 ----------
export type TypeId = keyof typeof ZH_TYPES;
export const TYPE_IDS = Object.keys(ZH_TYPES) as TypeId[];
export const typeName = (t: string) => (ZH_TYPES as Record<string, string>)[t] ?? t;
export const typeColor = (t: string) => (U as any).TYPE_COLOR[t] as string;
const CHART = (TYPES as any).CHART as Record<string, Record<string, number>>;
const MULT: Record<string, number> = { 2: 1.6, 0.5: 0.6, 0: 0.3 };
/** 與遊戲 G.Types.mult 相同：每個防守屬性相乘，夾在 0.3–2.4 */
export function typeMult(atk: string, def: string[]) {
  const row = CHART[atk];
  if (!row) return 1;
  let m = 1;
  for (const d of def) if (row[d] != null) m *= MULT[row[d]];
  return Math.min(2.4, Math.max(0.3, m));
}
export const chartRaw = (atk: string, def: string) => CHART[atk]?.[def] ?? 1;

// ---------- 稀有度 ----------
export const RARITY_NAME: Record<number, string> = { 1: '普通', 2: '少見', 3: '稀有', 4: '史詩', 5: '傳說' };
export const RARITY_COLOR = (GACHA as any).RARITY_COLOR as Record<string, string>;
export const BANNERS = ((GACHA as any).BANNERS as { gen: number; name: string }[]).map(b => ({ ...b, zh: REGION_ZH(b.name) }));
function REGION_ZH(n: string) {
  return ({ Kanto: '關都', Johto: '城都', Hoenn: '豐緣', Sinnoh: '神奧', Teselia: '合眾', Kalos: '卡洛斯', Alola: '阿羅拉', Galar: '伽勒爾', Paldea: '帕底亞' } as Record<string, string>)[n] ?? n;
}
export const genRegion = (gen: number) => BANNERS.find(b => b.gen === gen)?.zh ?? `第 ${gen} 世代`;

// ---------- 敵人行為 ----------
export const BEHAVIOR: Record<string, { name: string; desc: string }> = {
  chase: { name: '追擊', desc: '朝玩家前進，碰到玩家造成接觸傷害（之後 0.55 秒內不再因接觸造成傷害）。' },
  charger: { name: '衝撞', desc: '玩家距離低於 200 時先蓄力 0.55 秒，再以 3.4 倍速衝刺 0.42 秒，之後行走 1.1 秒。' },
  ranged: { name: '遠程', desc: '保持約 0.82 倍射程的距離，發射一發投射物；間隔 2.2 − 0.15n 秒，傷害 round(傷害 × 0.8)。' },
  tank: { name: '坦克', desc: '生命 ×1.5、速度 ×0.7、傷害 ×1.2、經驗 ×1.3。' },
  fan: { name: '扇射', desc: '保持距離，一次射出扇形 3 發（第 1–2 梯次）或 5 發；間隔 3.2 − 0.15n 秒，傷害 round(傷害 × 0.7)。' },
  beamer: { name: '光束', desc: '保持距離，發射長 360、寬 22 的光束；間隔 4.4 − 0.2n 秒，射程 260 + 6n。' },
  zoner: { name: '範圍', desc: '保持距離，在玩家附近放出 1–3 個傷害區域；間隔 4.6 − 0.2n 秒。' },
  healer: { name: '治療', desc: '每 3.5 秒回復 150 像素內受傷敵人最大生命的 7%（隨玩家攻擊倍率提高，最多 2.5 倍）。' },
  shielder: { name: '護盾', desc: '每 6 秒替 160 像素內最近的最多 6 隻敵人加上最大生命 35% 的護盾，持續 8 秒。' },
  summoner: { name: '召喚', desc: '每 7 秒召喚 2 隻幼體，同時最多 4 隻；幼體生命 35%、速度 110%、傷害 60%。' },
  bomber: { name: '自爆', desc: '貼近玩家時點燃引信，1 秒後在原地爆炸（半徑 62、傷害 ×1.4）；速度 ×1.25、生命 ×0.8。' },
  jumper: { name: '跳躍', desc: '玩家在 250 像素內時，每 5–7 秒跳向玩家位置；落點半徑 50、傷害 ×1.2。' },
  runner: { name: '疾跑', desc: '每個梯次速度最快的一種前排敵人改為疾跑：速度 ×1.6、生命 ×0.7，朝玩家的預測位置前進。' },
  thief: { name: '竊盜', desc: '逃離玩家，距離 300 像素以上時速度降為 0.35 倍。' },
};
export const ENEMY_TIERS = (ENEMIES as any).TIERS as { from: number; bst: [number, number]; hp: number; spd: number; dmg: number; xp: number; cast: number }[];

// ---------- 招式 ----------
type MoveLevel = { lvl: number; upText: string | null; stats: Record<string, number> };
export type Move = {
  id: string; name: string; type: string; kind: string; desc: string; maxLvl: number;
  levels: MoveLevel[];
  evo?: { name: string; needs: string; needName: string; text: string; modifiers: Record<string, number>; stats: Record<string, number> };
  zh: string; zhDesc: string; zhUps: string[]; evoZh?: string;
};
const zhMoves = ZH_MOVES as any;
export const MOVE_LIST: Move[] = (MOVES as any).moves.map((m: any) => ({
  ...m,
  zh: zhMoves[m.id]?.name ?? m.name,
  zhDesc: zhMoves[m.id]?.desc ?? m.desc,
  zhUps: zhMoves[m.id]?.ups ?? [],
  evoZh: zhMoves[m.id]?.evo?.name ?? zhMoves[m.id]?.evoName,
}));
export const MOVE_BY = Object.fromEntries(MOVE_LIST.map(m => [m.id, m]));
export const KINDS = zhMoves._kinds as Record<string, { name: string; desc: string }>;
export const STAT_CARD = zhMoves._stats as Record<string, string>;
const POOL = (MOVES as any).pool as Record<string, string[]>;
/** 與遊戲 G.Moves.poolFor 相同：一般系招式加上每個屬性的招式 */
export function movePool(types: string[]) {
  const s = new Set(POOL.normal);
  for (const t of types) for (const m of POOL[t] ?? []) s.add(m);
  return [...s];
}
export const POOL_BY_TYPE = POOL;

// ---------- 寶可夢 ----------
type SpriteAnim = { src: string; w: number; h: number; d: number[]; ax: number; ay: number; n: number; shiny: boolean };
export type Pokemon = {
  dex: number; name: string; zh: string; types: string[]; hp: number; spd: number; atk: number;
  rarity: number; bst: number; gen: number; leg: boolean; starter: boolean;
  start?: string; traits?: string[];
  sprite: Record<string, SpriteAnim> | null;
  role: { behavior: string; hovers: boolean; tiers: any[] };
  gacha: boolean;
};
const starterBy = Object.fromEntries((STARTERS as any[]).map(s => [s.dex, s]));
export const POKEMON: Pokemon[] = (DEX as any[]).map(d => {
  const sp = (SPRITES as any)[d.dex];
  return {
    dex: d.dex, name: d.name, zh: (ZH_POKEMON as any)[d.dex] ?? d.name, types: d.types,
    hp: d.hp, spd: d.spd, atk: d.atk, rarity: d.rarity, bst: d.bst, gen: d.gen,
    leg: !!d.leg, starter: !!starterBy[d.dex], start: starterBy[d.dex]?.start, traits: starterBy[d.dex]?.traits,
    sprite: sp ? sp.anims : null,
    role: (ROLES as any)[d.dex],
    gacha: !!sp,
  };
});
export const POKEMON_BY = Object.fromEntries(POKEMON.map(p => [p.dex, p]));
export const traitName = (t: string) => (ZH_RUN as any).traits?.[t]?.name ?? (ZH_RUN as any).traits?.[t] ?? t;

/** 所有寶可夢各數值的最小、最大值，用於固定色階 */
export const RANGE = (['hp', 'spd', 'atk', 'bst'] as const).reduce((o, k) => {
  const v = POKEMON.map(p => p[k]);
  o[k] = [Math.min(...v), Math.max(...v)];
  return o;
}, {} as Record<'hp' | 'spd' | 'atk' | 'bst', [number, number]>);
/** 全站共用的 10 階數值色階：回傳 0–9 */
export const step = (v: number, [lo, hi]: [number, number]) => Math.max(0, Math.min(9, Math.floor(((v - lo) / (hi - lo || 1)) * 10)));

export const pad = (n: number) => String(n).padStart(4, '0');
export const fmt = (n: number, d = 2) => (Number.isInteger(n) ? String(n) : n.toFixed(d).replace(/\.?0+$/, ''));

// ---------- 取得方式與敵人身分（依遊戲程式碼的篩選條件） ----------
export const BOSS_SLOTS = (ENEMIES as any).BOSS_SLOTS as { at: number; hp: number; dmg: number; xp: number; bst: [number, number] }[];
/** 首領：每個時段從 bst 範圍內、非傳說、有動畫圖的寶可夢隨機選一隻（同一場不重複） */
export function bossSlots(p: Pokemon) {
  if (p.leg || !p.sprite) return [];
  const r = (p.spd - 78) / 0.42;
  return BOSS_SLOTS.filter(s => p.bst >= s.bst[0] && p.bst <= s.bst[1]).map(s => ({
    at: s.at, hp: Math.round(1.35 * s.hp), dmg: Math.round(1.2 * s.dmg), xp: s.xp,
    spd: Math.round(Math.min(100, Math.max(40, 40 + 0.5 * r))),
    ai: bossAI(p),
    shotDmg: Math.round(0.55 * s.dmg), shotCd: 1.1, range: 260,
  }));
}
/** 救援事件給的寶可夢：3 星以下、非傳說、有動畫圖、不會飄浮 */
export const rescuable = (p: Pokemon) => p.rarity <= 3 && !p.leg && !!p.sprite && !p.role.hovers;
export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ---------- 招式欄位 ----------
export const FIELD: Record<string, { zh: string; unit?: string; tip: string }> = {
  dmg: { zh: '傷害', tip: '每次命中的基礎傷害，再乘上攻擊倍率、屬性相剋與天氣' },
  cd: { zh: '冷卻', unit: '秒', tip: '兩次施放之間的秒數' },
  radius: { zh: '範圍', unit: 'px', tip: '判定半徑或長度（依招式類型而定）' },
  arc: { zh: '角度', unit: '°', tip: '扇形判定或散布的總角度；超過 360° 視為全圓' },
  width: { zh: '寬度', unit: 'px', tip: '直線判定的寬度' },
  knock: { zh: '擊退', tip: '擊退力道；總位移約為數值 × 0.154 像素，首領不受擊退' },
  count: { zh: '數量', tip: '同時發射或存在的數量' },
  pierce: { zh: '穿透', tip: '最多額外命中的敵人數' },
  speed: { zh: '速度', unit: 'px/秒', tip: '投射物飛行速度' },
  life: { zh: '射程', unit: '秒', tip: '投射物存在的秒數' },
  size: { zh: '大小', unit: 'px', tip: '投射物的碰撞半徑' },
  spread: { zh: '散布', unit: '°', tip: '相鄰投射物之間的角度' },
  dur: { zh: '持續', unit: '秒', tip: '效果或場地持續的秒數' },
  amount: { zh: '效果量', tip: '每層增益的數值' },
  stacks: { zh: '層數上限', tip: '增益最多疊加的層數' },
  stat: { zh: '增益能力', tip: '增益作用的能力' },
  burn: { zh: '燃燒', unit: '層', tip: '每次命中附加的燃燒層數（每 0.5 秒受傷，最多 8 層）' },
  poison: { zh: '中毒', unit: '層', tip: '每次命中附加的中毒層數（每 0.6 秒受最大生命 1.2% × 層數 + 1，最多 8 層）' },
  slow: { zh: '減速', tip: '命中後移動速度乘以 (1 − 數值)' },
  homing: { zh: '追蹤', tip: '朝 340 像素內最近敵人轉向的速率' },
  rate: { zh: '射擊間隔', unit: '秒', tip: '砲台兩次射擊之間的秒數' },
  range: { zh: '索敵距離', unit: 'px', tip: '砲台尋找目標的距離' },
  hex: { zh: '祟殺', tip: '目標有燃燒、中毒或減速時，該次傷害乘以此數' },
};
export const FIELD_ORDER = Object.keys(FIELD);
const DEG = ['arc', 'spread'];
export function fieldValue(k: string, v: number | string) {
  if (typeof v === 'string') return STAT_ZH[v] ?? v;
  if (DEG.includes(k)) { const d = (v * 180) / Math.PI; return d >= 359.5 ? '360' : fmt(d, 0); }
  if (k === 'slow' || (k === 'amount')) return fmt(v, 3);
  return fmt(v, 2);
}
const STAT_ZH: Record<string, string> = { atk: '攻擊', spd: '速度', def: '減傷', rgn: '回復', regen: '回復', hp: '最大生命', cd: '冷卻', mag: '拾取' };

// 首領自己的 AI（app.pretty.js bossInit）：遠近傾向與 4 招由屬性和編號決定
export function ghash(a: number, e: number, t = 0) {
  let r = Math.imul(a | 0, 374761393) ^ Math.imul(e | 0, 668265263) ^ Math.imul(t | 0, 2246822519);
  r = Math.imul(r ^ (r >>> 13), 1274126177); r ^= r >>> 16;
  return (r >>> 0) / 4294967296;
}
export const BOSS_MOVE: Record<string, string> = { slam: '重擊', dash: '衝刺', leap: '跳躍', rain: '落雨', beam: '光束', nova: '環射', volley: '連射' };
export function bossAI(p: Pokemon) {
  const has = (...t: string[]) => t.some(x => p.types.includes(x));
  const melee = ['slam', ghash(p.dex, 3, 7) < 0.5 ? 'dash' : 'leap'];
  const main = has('fire', 'ground', 'poison', 'rock', 'grass') ? 'rain' : has('electric', 'psychic', 'dragon', 'ice', 'steel') ? 'beam' : has('fairy', 'ghost', 'water', 'flying') ? 'nova' : 'volley';
  const rest = ['rain', 'beam', 'nova', 'volley'].filter(x => x !== main);
  const ranged = [main, rest[Math.floor(3 * ghash(p.dex, 5, 9)) % 3]];
  const far = p.role.behavior === 'ranged';
  return { melee, ranged, far };
}

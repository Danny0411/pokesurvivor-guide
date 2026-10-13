// 敵人與裂隙頁面的資料整理。數字全部來自 src/data（遊戲擷取與研究推導），這裡只做篩選、排序與套用 md 記載的公式。
import DER from '../../data/derived/enemies.json';
import ENEMIES from '../../data/game/Enemies.json';
import { POKEMON, ENEMY_TIERS, BOSS_SLOTS, bossSlots, type Pokemon } from '../../lib/game';

export const D = DER as any;
export const TIERS = ENEMY_TIERS;
export const BOSS_AT: number[] = BOSS_SLOTS.map(s => s.at);
/** 晚期強化開始的執行時間（分鐘） */
export const LATE_FROM = (ENEMIES as any).LATE_FROM as number;

export const SUBS = [
  { href: '/enemies/', zh: '總覽' },
  { href: '/enemies/bosses/', zh: '首領' },
  { href: '/enemies/rift/', zh: '裂隙' },
  { href: '/enemies/events/', zh: '隨機事件' },
];

/** 千分位，用於生命、經驗等整數 */
export const n0 = (v: number) => Math.round(v).toLocaleString('en-US');

/** 梯次名單的候選：稀有度低於 5、種族值在梯次區間內、有動畫圖（與 derived 的 candidateCount 相同） */
export const TIER_POOL: Pokemon[][] = TIERS.map(t =>
  POKEMON.filter(p => p.rarity < 5 && p.bst >= t.bst[0] && p.bst <= t.bst[1] && !!p.sprite).sort((a, b) => a.dex - b.dex),
);

/** 首領候選：非傳奇、有動畫圖、種族值在時段區間內（同一場不重複，這裡列出所有可能的物種） */
export const BOSS_POOL = BOSS_SLOTS.map((s, i) => ({
  k: i + 1,
  at: s.at,
  base: s,
  list: POKEMON
    .filter(p => !p.leg && !!p.sprite && p.bst >= s.bst[0] && p.bst <= s.bst[1])
    .sort((a, b) => a.dex - b.dex)
    .map(p => ({ p, v: bossSlots(p).find(b => b.at === s.at)! })),
}));

/** 傳說候選（裂隙）：leg 標記且有動畫圖 */
export const LEGENDS = POKEMON.filter(p => p.leg && !!p.sprite).sort((a, b) => a.dex - b.dex);

/** 首領的行為只分遠程與近戰：遠程型首領的遠程模式較長，其餘相反（md：首領的行為） */
export const bossStyle = (behavior: string) => (behavior === 'ranged' ? '遠程型' : '近戰型');

// 收集與成長章節的子頁籤：總覽（index.astro 的 Chapter）與各子頁共用。
export type SubLink = { href: string; zh: string };

export const COLLECT_SUB: SubLink[] = [
  { href: '/collect/', zh: '總覽' },
  { href: '/collect/gacha/', zh: '扭蛋' },
  { href: '/collect/upgrades/', zh: '永久升級' },
  { href: '/collect/missions/', zh: '任務' },
  { href: '/collect/achievements/', zh: '成就' },
];

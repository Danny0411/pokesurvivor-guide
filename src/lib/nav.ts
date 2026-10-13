// 章節：每章一個印刷色，對應側邊索引標籤
export type Chapter = { id: string; zh: string; short: string; href: string; desc: string };
export const CHAPTERS: Chapter[] = [
  { id: 'pokemon', zh: '寶可夢圖鑑', short: '圖鑑', href: '/pokemon/', desc: '966 隻寶可夢的能力值、屬性、可學招式、動畫，以及當敵人時的行為。' },
  { id: 'moves', zh: '招式', short: '招式', href: '/moves/', desc: '64 招每一級的傷害、冷卻、範圍，升級效果、Lv5 進化與傷害公式。' },
  { id: 'types', zh: '屬性相剋', short: '屬性', href: '/types/', desc: '18 種屬性的相剋倍率，以及雙屬性的實際受傷倍率。' },
  { id: 'run', zh: '冒險中', short: '冒險', href: '/run/', desc: '能力值公式、經驗與等級、升級選卡、羈絆、持有物與掉落物。' },
  { id: 'enemies', zh: '敵人與裂隙', short: '敵人', href: '/enemies/', desc: '出怪時間線、強度成長、首領、裂隙、隨機事件與多人模式。' },
  { id: 'world', zh: '地圖與天氣', short: '地圖', href: '/world/', desc: '生態區、地形、地圖物件、大寶箱、傳說之力、天氣與競技場。' },
  { id: 'collect', zh: '收集與成長', short: '收集', href: '/collect/', desc: '貨幣、結算獎勵、永久升級、扭蛋與保底、任務與成就。' },
  { id: 'log', zh: '更新紀錄', short: '更新', href: '/changelog/', desc: '遊戲每次更新的內容。' },
];
export const chapterOf = (id: string) => CHAPTERS.find(c => c.id === id)!;

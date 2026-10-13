// 清單縮圖：Idle 動畫圖的長邊超過縮圖框（box px）時等比縮小，否則維持 1 倍（不放大，避免像素變糊）。
import type { Pokemon } from '../../lib/game';

export const THUMB_BOX = 56;

export function thumbScale(p: Pokemon, box = THUMB_BOX): number {
  const idle = p.sprite?.Idle;
  if (!idle) return 1;
  const m = Math.max(idle.w, idle.h);
  return m > box ? Math.round((box / m) * 100) / 100 : 1;
}

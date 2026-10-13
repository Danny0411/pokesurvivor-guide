// 寶可夢頁的圖版控制：切換動作、方向、閃光，以及自動旋轉。
type A = { src: string; w: number; h: number; d: number[] };
const plate = document.querySelector<HTMLElement>('[data-plate]');
const anims: Record<string, { n: A; s: A | null }> | null = plate?.dataset.anims ? JSON.parse(plate.dataset.anims) : null;
const sprite = plate?.querySelector<HTMLElement>('poke-sprite');
if (plate && anims && sprite) {
  let anim = 'Idle', dir = 0, shiny = false, spin: number | null = null;
  const shinyBtn = plate.querySelector<HTMLButtonElement>('[data-shiny]')!;
  const spinBtn = plate.querySelector<HTMLButtonElement>('[data-spin]')!;
  const apply = () => {
    const a = anims[anim];
    shinyBtn.disabled = !a.s;
    sprite.dataset.anim = JSON.stringify(shiny && a.s ? a.s : a.n);
    sprite.dataset.dir = String(dir);
    plate.querySelectorAll<HTMLElement>('[data-anim-btn]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.animBtn === anim)));
    plate.querySelectorAll<HTMLElement>('[data-dir-btn]').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.dirBtn! === dir)));
    shinyBtn.setAttribute('aria-pressed', String(shiny && !!a.s));
  };
  const radio = (sel: string, key: string, set: (v: string) => void) => {
    const group = [...plate.querySelectorAll<HTMLElement>(sel)];
    group.forEach((b, i) => {
      b.addEventListener('click', () => { set(b.dataset[key]!); apply(); });
      b.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const nb = group[(i + d + group.length) % group.length];
        nb.focus(); nb.click();
      });
    });
  };
  radio('[data-anim-btn]', 'animBtn', v => { anim = v; });
  radio('[data-dir-btn]', 'dirBtn', v => { dir = +v; stopSpin(); });
  shinyBtn.addEventListener('click', () => { shiny = !shiny; apply(); });
  const stopSpin = () => { if (spin) { clearInterval(spin); spin = null; spinBtn.setAttribute('aria-pressed', 'false'); } };
  spinBtn.addEventListener('click', () => {
    if (spin) return stopSpin();
    spinBtn.setAttribute('aria-pressed', 'true');
    spin = window.setInterval(() => { dir = (dir + 1) % 8; apply(); }, 700);
  });
  apply();
}

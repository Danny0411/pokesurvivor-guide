// <poke-sprite>：播放 SpriteCollab 動畫表。每列是一個方向（0 下、1 右下、2 右 … 7 左下），
// 每格時長以 1/60 秒為單位，和遊戲 G.Sprites.Animator 相同。所有實例共用一個 rAF，只播放畫面上看得到的。
type Anim = { src: string; w: number; h: number; d: number[] };
const live = new Set<PokeSprite>();
let last = 0;
function tick(now: number) {
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
  last = now;
  for (const s of live) s.step(dt);
  if (live.size) requestAnimationFrame(tick); else last = 0;
}
const io = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(es => es.forEach(e => (e.target as PokeSprite).visible(e.isIntersecting)), { rootMargin: '120px' })
  : null;
const still = matchMedia('(prefers-reduced-motion: reduce)');

class PokeSprite extends HTMLElement {
  static observedAttributes = ['data-anim', 'data-dir', 'data-play', 'data-scale'];
  a: Anim | null = null;
  frame = 0; t = 0; dir = 0; scale = 2; seen = false;
  el = document.createElement('i');
  connectedCallback() {
    if (!this.el.isConnected) this.appendChild(this.el);
    this.read();
    io ? io.observe(this) : this.visible(true);
  }
  disconnectedCallback() { io?.unobserve(this); live.delete(this); }
  attributeChangedCallback() { if (this.isConnected) this.read(); }
  read() {
    this.a = JSON.parse(this.dataset.anim || 'null');
    this.dir = +(this.dataset.dir || 0);
    this.scale = +(this.dataset.scale || 2);
    this.frame = 0; this.t = 0;
    if (!this.a) return;
    const { w, h, d } = this.a, s = this.scale;
    Object.assign(this.el.style, {
      width: `${w * s}px`, height: `${h * s}px`,
      backgroundSize: `${w * d.length * s}px auto`,
    });
    if (this.seen) this.el.style.backgroundImage = `url(${this.a.src})`;
    this.draw();
    this.sync();
  }
  visible(v: boolean) {
    if (v && !this.seen && this.a) { this.seen = true; this.el.style.backgroundImage = `url(${this.a.src})`; }
    this.dataset.vis = v ? '1' : '';
    this.sync();
  }
  sync() {
    const play = this.dataset.vis && this.dataset.play !== undefined && this.dataset.play !== 'false' && !still.matches;
    if (play) { if (!live.size) requestAnimationFrame(tick); live.add(this); } else live.delete(this);
  }
  step(dt: number) {
    const a = this.a!;
    this.t += dt * 60;
    let changed = false;
    while (this.t >= a.d[this.frame]) { this.t -= a.d[this.frame]; this.frame = (this.frame + 1) % a.d.length; changed = true; }
    if (changed) this.draw();
  }
  draw() {
    const { w, h } = this.a!, s = this.scale;
    this.el.style.backgroundPosition = `${-this.frame * w * s}px ${-this.dir * h * s}px`;
  }
}
if (!customElements.get('poke-sprite')) customElements.define('poke-sprite', PokeSprite);

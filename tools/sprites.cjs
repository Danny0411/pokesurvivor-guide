// 從 SpriteCollab（需先 sparse checkout 到 .cache/sc）複製遊戲用到的動畫圖到 public/sprites。
// 遊戲缺某動作時會借用尺寸與幀時長相同的其他動作，這裡用 AnimData.xml 找出同樣的替代檔。
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SC = path.join(ROOT, '.cache/sc/sprite'), OUT = path.join(ROOT, 'public/sprites');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/game/SPRITE_META.json')));
const ANIMS = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];
const dim = f => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

function animData(dir) {
  const f = path.join(dir, 'AnimData.xml');
  if (!fs.existsSync(f)) return {};
  const xml = fs.readFileSync(f, 'utf8'), out = {};
  for (const block of xml.split('<Anim>').slice(1)) {
    const name = /<Name>(\w+)<\/Name>/.exec(block)[1];
    const copy = /<CopyOf>(\w+)<\/CopyOf>/.exec(block);
    out[name] = copy ? { copy: copy[1] } : {
      w: +/<FrameWidth>(\d+)/.exec(block)[1], h: +/<FrameHeight>(\d+)/.exec(block)[1],
      d: [...block.matchAll(/<Duration>(\d+)<\/Duration>/g)].map(m => +m[1]),
    };
  }
  for (const k in out) if (out[k].copy) out[k] = { ...out[out[k].copy], copyOf: out[k].copy };
  return out;
}

const { execFileSync } = require('child_process');
const manifest = {}, problems = [], jobs = [];
for (const id of Object.keys(meta)) {
  const dir = path.join(SC, String(id).padStart(4, '0')), sdir = path.join(dir, '0000/0001'), ad = animData(dir);
  const entry = manifest[id] = { anims: {} };
  for (const a of ANIMS) {
    const m = meta[id].a[a];
    const file = (d, name) => path.join(d, name + '-Anim.png');
    const fits = name => { const f = file(dir, name); if (!fs.existsSync(f)) return false; const [w, h] = dim(f); return w === m.w * m.n && h === m.h * m.r; };
    // 同名且尺寸相符 → 尺寸與幀時長相同的替代動作 → SpriteCollab 較新的同名動作（遊戲版本較舊時）
    let src = fits(a) ? a : Object.keys(ad).find(k => !ad[k].copyOf && ad[k].w === m.w && ad[k].h === m.h && ad[k].d.join() === m.d.join() && fits(k));
    let frame = { w: m.w, h: m.h, d: m.d, ax: m.ax, ay: m.ay };
    if (!src && ad[a] && fs.existsSync(file(dir, a))) { src = a; frame = { w: ad[a].w, h: ad[a].h, d: ad[a].d, ax: (ad[a].w - 1) / 2, ay: ad[a].h * m.ay / m.h }; problems.push(`${id} ${a}（用新版圖）`); }
    if (!src) { problems.push(`${id} ${a}（缺圖）`); continue; }
    const out = path.join(OUT, id, src + '.webp');
    const shinyFrom = fs.existsSync(file(sdir, src)) ? file(sdir, src) : null;
    entry.anims[a] = { src, ...frame, n: frame.d.length, shiny: !!shinyFrom };
    for (const [from, to] of [[file(dir, src), out], ...(shinyFrom ? [[shinyFrom, path.join(OUT, id, 's', src + '.webp')]] : [])]) {
      if (fs.existsSync(to)) continue;
      fs.mkdirSync(path.dirname(to), { recursive: true });
      jobs.push(from + '\0' + to);
    }
    if (meta[id].sh && !shinyFrom) problems.push(`${id} ${a}（缺閃光圖）`);
  }
}
// 平行轉成無損 WebP（-z 6：速度比 -z 9 快約 80 倍，檔案大約 18%）
if (jobs.length) execFileSync('sh', ['-c', `xargs -0 -n 2 -P ${require('os').cpus().length} sh -c 'cwebp -quiet -lossless -z 6 -exact "$0" -o "$1"'`], { input: jobs.join('\0') + '\0', stdio: ['pipe', 'inherit', 'inherit'] });
fs.writeFileSync(path.join(ROOT, 'src/data/sprites.json'), JSON.stringify(manifest));
console.log('完成；特殊情況', problems.length, '筆：', problems.join('、'));

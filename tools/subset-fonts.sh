#!/bin/sh
# 從 src/ 收集網站用到的所有字元，把字型裁成只含這些字的 woff2（Noto Sans TC 全檔約 12MB）。
set -e
cd "$(dirname "$0")/.."
mkdir -p src/assets/fonts .cache tools/fonts
# 字型原檔不進 git，缺少時從 Google Fonts 的 GitHub 下載（OFL 授權）
GF=https://github.com/google/fonts/raw/main/ofl
[ -f tools/fonts/NotoSansTC.ttf ] || curl -sL -o tools/fonts/NotoSansTC.ttf "$GF/notosanstc/NotoSansTC%5Bwght%5D.ttf"
for w in SemiBold Bold ExtraBold; do [ -f tools/fonts/BarlowCondensed-$w.ttf ] || curl -sL -o tools/fonts/BarlowCondensed-$w.ttf "$GF/barlowcondensed/BarlowCondensed-$w.ttf"; done
node -e '
const fs=require("fs"),path=require("path");const set=new Set();
const walk=d=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(/\.(astro|ts|js|json|md|mdx|css)$/.test(f.name))for(const c of fs.readFileSync(p,"utf8"))set.add(c)}};
walk("src");for(let c=0x20;c<0x7f;c++)set.add(String.fromCharCode(c));
"　，。、；：？！「」『』（）《》〈〉…—～·＋－×÷％→←↑↓★☆●○◆◇■□▲△▼▽①②③④⑤".split("").forEach(c=>set.add(c));
fs.writeFileSync(".cache/chars.txt",[...set].join(""));console.log("字元數",set.size)'
SUB="uvx --python 3.12 --from fonttools[woff] pyftsubset"
$SUB tools/fonts/NotoSansTC.ttf --text-file=.cache/chars.txt --flavor=woff2 --layout-features='*' --output-file=src/assets/fonts/NotoSansTC.woff2
for w in SemiBold Bold ExtraBold; do
  $SUB tools/fonts/BarlowCondensed-$w.ttf --unicodes=U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201D,U+2026,U+2190-2193,U+2212,U+00D7,U+00F7 --flavor=woff2 --layout-features='*' --output-file=src/assets/fonts/BarlowCondensed-$w.woff2
done
ls -la src/assets/fonts

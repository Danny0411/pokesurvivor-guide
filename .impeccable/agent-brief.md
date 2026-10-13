# 給頁面製作 subagent 的共用規範

專案：/Users/chiachun/Developer/personal/pokesurvivor/guide（Astro 7 靜態站，base `/pokesurvivor-guide`，trailingSlash always）。
網站名稱：「PokéSurvivor 完全圖鑑」，PokéSurvivor 這款瀏覽器遊戲的繁中百科。

## 內容規則（最重要）
- 只呈現遊戲實際內容，不寫推薦、評價、流派、「建議」、「值得」、「最強」。
- 所有數字都來自 JSON（`src/data/game/*.json` 是從遊戲擷取的原始資料，`src/data/derived/*.json` 是研究推導，`src/i18n/zh/*.json` 是中文翻譯）。不要自己編數字。需要確認時查 `.cache/app.pretty.js`（遊戲原始碼，約 9.5 萬行）。研究筆記在 `src/content/mechanics/*.md`，每句附 `<!-- app.pretty.js:行號 -->`。
- 文字用台灣繁體中文、台灣寶可夢官方譯名。句子短、直接。
- 程式碼沒有明確定義的地方寫「程式碼未明確」，不要猜。

## 視覺世界：「完全攻略本」（日本遊戲完全攻略本）
先讀這些檔案，照它們的寫法：
- `src/styles/global.css`：色彩 token、`.spec` 資料表、`.spec-wrap`、`.ramp`／`.s0`–`.s9` 固定色階、`.halftone` 網點、`.prose`、`.type`、`.rarity`。
- `src/layouts/Base.astro`：版型，props 有 `title`、`description`、`chapter`、`wide`。
- `src/components/Chapter.astro`：機制章節頁，含 `sub` 子頁籤 prop、`before` slot 和預設 slot。
- `src/pages/pokemon/[dex].astro`、`src/pages/moves/[id].astro`：完成度的標準範例。
- 元件：`Type.astro`（屬性標籤）、`Rarity.astro`、`Sprite.astro`（`<Sprite dex scale play />` 寶可夢動畫）、`Icon.astro`（只用裡面有的圖示）、`KindDiagram.astro`（SVG 動畫範例）。
- 資料入口：`src/lib/game.ts`（POKEMON、MOVE_LIST、typeName、typeColor、typeMult、url()、RARITY_NAME、BANNERS、BEHAVIOR、mmss、fmt、pad…）。站內連結一律用 `url('/路徑/')`。

規則：
- 每章一個印刷色 `var(--ch)`，由 Base 的 `chapter` prop 決定。只用在表頭色帶、粗分隔線、章節標記、雙數列底色 `--ch-tint`。
- 屬性的 18 色是固定語言，只用在屬性相關的東西上。
- 保留色 `var(--sel)`（螢光黃）只用來標示「目前選取／被改變」。
- 數字一律用 `class="num"`（Barlow Condensed、等寬數字）。
- 資料優先用 `.spec` 表格。標題前不要加小標籤或 eyebrow；不要用相同大小的「圖示＋標題＋文字」卡片格；不要用漸層字、玻璃效果、粗的彩色左邊框、emoji。
- 鼓勵用 SVG 圖解或動畫說明機制（時間線、機率階梯、開箱進度環、範圍圖），但內容要在動畫之前就看得到（從可見狀態開始動）。動畫要尊重 `prefers-reduced-motion`（global.css 已全域處理）。
- 手機（390px 寬）要能用：表格包在 `.spec-wrap` 裡可以橫向捲動。
- 深色模式由 token 自動處理，不要寫死顏色（白字在 `var(--ch)` 上可以）。

## 驗證
- 只改你被指派的檔案；需要新元件就放在 `src/components/<你的前綴>/`。
- 完成後用 `npx astro build --outDir .cache/build-<你的名字>` 確認可以編譯（不要用預設的 dist，其他人也在編譯）。
- 不要啟動 dev server，不要截圖，不要 git commit。
- 回報（300 字內）：改了哪些檔案、新增哪些頁面網址、有哪些資料不確定。

# PokéSurvivor 完全圖鑑

https://danny0411.github.io/pokesurvivor-guide/

非官方粉絲網站。從 [PokéSurvivor](https://pokesurvivor.com/) 公開的遊戲程式碼整理出的繁中百科：966 隻寶可夢、64 招式、屬性相剋、敵人與裂隙、地圖與天氣、持有物、永久升級、扭蛋、任務、成就與更新紀錄。

## 遊戲改版後更新資料

```sh
npm run update   # 下載最新遊戲程式碼、匯出資料、重算推導資料、重新裁切字型
npm run build
```

寶可夢動畫圖來自 [PMDCollab SpriteCollab](https://sprites.pmdcollab.org/)（CC BY-NC 4.0）。要重建時，先把 SpriteCollab sparse checkout 到 `.cache/sc`，再執行 `npm run sprites`。

推送到 `main` 後，GitHub Actions 會自動建置並部署到 GitHub Pages。

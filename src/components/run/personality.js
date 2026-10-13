// 性格測驗的計分與結果，與遊戲 G.personalityResult（.cache/app.pretty.js:82943）相同。
// 分數物件依「第一次獲得分數的順序」建立 key，同分時取先出現的特質（Object.keys 的順序 + 穩定排序）。
// 同分的初始夥伴：遊戲用 G.U.pick（隨機）挑一隻，這裡以 pick 參數注入，預設隨機。

/** 把每題所選選項的 p 依序加進分數表（遊戲 Lr: for (a in n.p) t[a] = (t[a]||0) + n.p[a]） */
export function addScores(scores, p) {
  for (const k in p) scores[k] = (scores[k] || 0) + p[k];
  return scores;
}

/**
 * @param {Record<string, number>} scores 分數表（key 順序 = 獲得分數的順序）
 * @param {{dex:number, traits:string[]}[]} starters 初始夥伴名單（順序同 G.STARTERS）
 * @param {(a: any[]) => any} pick 同分時挑一隻的函式，預設隨機
 */
export function personalityResult(scores, starters, pick = a => a[Math.floor(Math.random() * a.length)]) {
  const trait = Object.keys(scores).sort((x, y) => scores[y] - scores[x])[0];
  let ties = [];
  let best = -1;
  for (const s of starters) {
    const n = 2 * (scores[s.traits[0]] || 0) + (scores[s.traits[1]] || 0);
    if (n > best) { best = n; ties = [s]; } else if (n === best) ties.push(s);
  }
  return { trait, score: best, ties, dex: pick(ties).dex };
}

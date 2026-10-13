/* PokéSurvivor 攻略站 — 共用工具：屬性、招式、屬性相剋、導覽列與主題切換 */
(function () {
  'use strict';

  var TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground',
               'flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
  var TYPE_ZH = {
    normal:'一般', fire:'火', water:'水', electric:'電', grass:'草', ice:'冰', fighting:'格鬥',
    poison:'毒', ground:'地面', flying:'飛行', psychic:'超能力', bug:'蟲', rock:'岩石',
    ghost:'幽靈', dragon:'龍', dark:'惡', steel:'鋼', fairy:'妖精'
  };
  var TYPE_EN = {
    normal:'Normal', fire:'Fire', water:'Water', electric:'Electric', grass:'Grass', ice:'Ice',
    fighting:'Fighting', poison:'Poison', ground:'Ground', flying:'Flying', psychic:'Psychic',
    bug:'Bug', rock:'Rock', ghost:'Ghost', dragon:'Dragon', dark:'Dark', steel:'Steel', fairy:'Fairy'
  };
  // 屬性顏色沿用遊戲原始碼 TYPE_COLOR；fighting／poison／ghost 略調深，讓白字達到 WCAG AA 4.5:1
  var TYPE_COLOR = {
    normal:'#b0a99f', fire:'#ff7b3d', water:'#4b9bff', electric:'#ffd33d', grass:'#5fcb6a', ice:'#7fe0e0',
    fighting:'#cc4c38', poison:'#a656b4', ground:'#d6b25c', flying:'#9bb8ff', psychic:'#ff5f9e', bug:'#a3c43d',
    rock:'#bfa96b', ghost:'#796ac2', dragon:'#6b58ff', dark:'#6b5c52', steel:'#a8b8c4', fairy:'#ff9ed8'
  };
  var KIND_ZH = {
    melee:'近戰', dash:'衝刺', buff:'增益', projectile:'投射', cone:'扇形', orbit:'環繞', nova:'環狀爆發',
    beam:'直線光束', boomerang:'迴旋', aura:'光環', chain:'連鎖', trail:'足跡', mine:'地雷', meteor:'隕石', turret:'砲台'
  };
  var KIND_HINT = {
    melee:'貼近目標的近距離攻擊', dash:'向前衝刺造成傷害', buff:'增益效果，不造成傷害',
    projectile:'發射物飛向目標', cone:'面前扇形範圍', orbit:'圍繞自身旋轉的範圍傷害',
    nova:'以自身為中心向外擴散', beam:'直線光束', boomerang:'去回的迴旋攻擊', aura:'自身周圍持續生效的範圍',
    chain:'在目標之間連鎖跳躍', trail:'行走時留下效果區域', mine:'放置後等待觸發的地雷', meteor:'落在指定區域的隕石',
    turret:'固定位置的砲台'
  };
  // 進化所需的局內能力卡（遊戲內英文名 + 中文）
  var STAT_CARD = {
    hp:{zh:'最大血', en:'Vigor'}, atk:{zh:'攻擊', en:'Power'}, spd:{zh:'速度', en:'Sprint'},
    cd:{zh:'冷卻', en:'Reflexes'}, def:{zh:'減傷', en:'Armor'}, rgn:{zh:'回血', en:'Synthesis'}, mag:{zh:'拾取', en:'Magnet'}
  };
  var GEN_ZH = {1:'關都',2:'城都',3:'豐緣',4:'神奧',5:'合眾',6:'卡洛斯',7:'阿羅拉',8:'伽勒爾',9:'帕底亞'};

  // 屬性相剋（標準寶可夢表）；本作倍率：克制 ×1.6、不擅長 ×0.6、免疫 ×0.3，雙屬性相乘，最終限制在 0.3–2.4
  var SUPER = {
    normal:[], fire:['grass','ice','bug','steel'], water:['fire','ground','rock'], electric:['water','flying'],
    grass:['water','ground','rock'], ice:['grass','ground','flying','dragon'], fighting:['normal','ice','rock','dark','steel'],
    poison:['grass','fairy'], ground:['fire','electric','poison','rock','steel'], flying:['grass','fighting','bug'],
    psychic:['fighting','poison'], bug:['grass','psychic','dark'], rock:['fire','ice','flying','bug'],
    ghost:['psychic','ghost'], dragon:['dragon'], dark:['psychic','ghost'], steel:['ice','rock','fairy'],
    fairy:['fighting','dragon','dark']
  };
  var RESIST = {
    normal:['rock','steel'], fire:['fire','water','rock','dragon'], water:['water','grass','dragon'],
    electric:['electric','grass','dragon'], grass:['fire','grass','poison','flying','bug','dragon','steel'],
    ice:['fire','water','ice','steel'], fighting:['poison','flying','psychic','bug','fairy'],
    poison:['poison','ground','rock','ghost'], ground:['grass','bug'], flying:['electric','rock','steel'],
    psychic:['steel','psychic'], bug:['fire','fighting','poison','flying','ghost','steel','fairy'],
    rock:['fighting','ground','steel'], ghost:['dark'], dragon:['steel'], dark:['fighting','dark','fairy'],
    steel:['fire','water','electric','steel'], fairy:['fire','poison','steel']
  };
  var IMMUNE = {
    normal:['ghost'], electric:['ground'], fighting:['ghost'], poison:['steel'], ground:['flying'],
    psychic:['dark'], ghost:['normal'], dragon:['fairy']
  };

  function mult(att, def) {
    if ((IMMUNE[att] || []).indexOf(def) >= 0) return 0.3;
    if (SUPER[att].indexOf(def) >= 0) return 1.6;
    if (RESIST[att].indexOf(def) >= 0) return 0.6;
    return 1;
  }
  // 回傳受到各攻擊屬性的傷害倍率（只含 ≠1 的項目）
  function incoming(types) {
    var out = [];
    TYPES.forEach(function (att) {
      var m = 1;
      types.forEach(function (d) { m *= mult(att, d); });
      m = Math.min(2.4, Math.max(0.3, m));
      m = Math.round(m * 100) / 100;
      if (m !== 1) out.push({ type: att, m: m });
    });
    return out;
  }
  function fmtMult(m) { return '×' + String(m); }

  // 招式池：一般系 + 自身屬性系
  function movePool(types) {
    var order = ['normal'].concat(types);
    return window.PSG.moves
      .filter(function (m) { return m.type === 'normal' || types.indexOf(m.type) >= 0; })
      .sort(function (a, b) { return order.indexOf(a.type) - order.indexOf(b.type); });
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // 回傳與屬性底色對比較高的文字色（白或深色），以相對亮度計算 WCAG 對比
  function onColor(hex) {
    var n = parseInt(hex.slice(1), 16);
    var ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    var cWhite = 1.05 / (lum + 0.05);
    var cDark = (lum + 0.05) / (0.0117 + 0.05);
    return cWhite >= cDark ? '#ffffff' : '#161b30';
  }
  function chip(type) {
    var c = TYPE_COLOR[type];
    return '<span class="chip" title="' + esc(TYPE_EN[type]) + '" style="--c:' + c + ';--on:' + onColor(c) + '">' +
      esc(TYPE_ZH[type]) + '</span>';
  }
  function stars(n) {
    return '<span class="stars" aria-label="' + n + ' 星">' + '★'.repeat(n) + '☆'.repeat(5 - n) + '</span>';
  }
  function statLabel(stat) {
    var s = STAT_CARD[stat];
    return s ? esc(s.zh) + '卡（' + esc(s.en) + '）' : esc(stat);
  }

  // 導覽列目前頁、主題切換
  function markNav() {
    var page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) a.setAttribute('aria-current', 'page');
    });
  }
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('psg-theme', t); } catch (e) { /* 無法儲存時略過 */ }
    var btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = t === 'light' ? '深色' : '淺色';
  }
  function initTheme() {
    var btn = document.getElementById('theme-btn');
    if (btn) {
      btn.addEventListener('click', function () { setTheme(currentTheme() === 'light' ? 'dark' : 'light'); });
    }
    setTheme(currentTheme());
  }

  window.PSGUI = {
    TYPES: TYPES, TYPE_ZH: TYPE_ZH, TYPE_EN: TYPE_EN, TYPE_COLOR: TYPE_COLOR,
    KIND_ZH: KIND_ZH, KIND_HINT: KIND_HINT, STAT_CARD: STAT_CARD, GEN_ZH: GEN_ZH,
    incoming: incoming, fmtMult: fmtMult, movePool: movePool, mult: mult,
    esc: esc, chip: chip, onColor: onColor, stars: stars, statLabel: statLabel
  };

  markNav();
  initTheme();
})();

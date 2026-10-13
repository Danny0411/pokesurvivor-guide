/* PokéSurvivor 圖鑑頁：篩選、排序、卡片與詳細面板 */
(function () {
  'use strict';
  var U = window.PSGUI;
  var D = window.PSG.dex;
  var BY_NO = {};
  var MAX = { hp: 0, spd: 0, atk: 0 };
  D.forEach(function (p) {
    BY_NO[p.no] = p;
    MAX.hp = Math.max(MAX.hp, p.hp);
    MAX.spd = Math.max(MAX.spd, p.spd);
    MAX.atk = Math.max(MAX.atk, p.atk);
  });

  var $ = function (id) { return document.getElementById(id); };
  var grid = $('grid'), countEl = $('count'), dlg = $('detail');
  var st = { q: '', types: [], tmode: 'any', star: 0, gen: 0, leg: false, poison: false, sort: 'no' };

  function pad(n) { return ('000' + n).slice(-3); }
  function comp(p) { return p.hp * p.spd * p.atk; }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }

  var SORT = {
    no: function (a, b) { return a.no - b.no; },
    atk: function (a, b) { return b.atk - a.atk || a.no - b.no; },
    hp: function (a, b) { return b.hp - a.hp || a.no - b.no; },
    spd: function (a, b) { return b.spd - a.spd || a.no - b.no; },
    comp: function (a, b) { return comp(b) - comp(a) || a.no - b.no; }
  };

  function match(p) {
    if (st.leg && !p.leg) return false;
    if (st.poison && p.t.indexOf('poison') < 0) return false;
    if (st.star && p.star !== st.star) return false;
    if (st.gen && p.gen !== st.gen) return false;
    if (st.types.length) {
      var hit = st.tmode === 'all'
        ? st.types.every(function (t) { return p.t.indexOf(t) >= 0; })
        : st.types.some(function (t) { return p.t.indexOf(t) >= 0; });
      if (!hit) return false;
    }
    if (st.q) {
      if (/^#?\d+$/.test(st.q)) return p.no === parseInt(st.q.replace('#', ''), 10);
      return (p.zh + ' ' + p.en).toLowerCase().indexOf(st.q) >= 0;
    }
    return true;
  }

  function bar(k, label, ratio, text) {
    var pct = Math.max(3, Math.min(100, Math.round(ratio * 100)));
    return '<div class="bar-row"><span class="k">' + label + '</span>' +
      '<span class="bar ' + k + '"><i style="width:' + pct + '%"></i></span>' +
      '<span class="v">' + text + '</span></div>';
  }

  function badges(p) {
    var b = '';
    if (p.leg) b += '<span class="badge leg" title="傳說寶可夢">傳說 LEG</span>';
    if (p.st) b += '<span class="badge st" title="初始夥伴">初始</span>';
    if (p.t.indexOf('poison') >= 0) b += '<span class="badge pz" title="含毒系，可用毒系招式">毒系打法</span>';
    return b;
  }

  function cardHTML(p) {
    return '<button type="button" class="pk" data-no="' + p.no + '" aria-label="' + U.esc(p.zh + ' ' + p.en) + '">' +
      '<span class="pk-no">#' + pad(p.no) + '</span>' +
      '<img src="sprites/' + p.no + '.png" alt="" width="96" height="96" loading="lazy" decoding="async">' +
      '<span class="pk-zh">' + U.esc(p.zh) + '</span>' +
      '<span class="pk-en">' + U.esc(p.en) + '</span>' +
      '<span class="pk-types">' + p.t.map(U.chip).join('') + '</span>' +
      '<span class="pk-star">' + U.stars(p.star) + '</span>' +
      '<span class="bars">' +
        bar('hp', '血', p.hp / MAX.hp, p.hp) +
        bar('spd', '速', p.spd / MAX.spd, p.spd) +
        bar('atk', '攻', p.atk / MAX.atk, '×' + p.atk.toFixed(2)) +
      '</span>' +
      (badges(p) ? '<span class="pk-badges">' + badges(p) + '</span>' : '') +
      '</button>';
  }

  function render() {
    var list = D.filter(match).sort(SORT[st.sort]);
    countEl.textContent = '顯示 ' + list.length + ' / ' + D.length + ' 隻';
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : '<p class="empty">沒有符合條件的寶可夢，試著放寬篩選條件。</p>';
  }

  // ----- 詳細面板 -----
  function moveCard(m) {
    var meta = '<span class="kind" title="' + U.esc(U.KIND_HINT[m.kind] || '') + '">' + U.esc(U.KIND_ZH[m.kind] || m.kind) + '</span>';
    if (m.poison) meta += '<span class="badge pz">中毒 ' + m.poison + ' 層</span>';
    var evo = m.evo
      ? '<div class="ev">Lv5 進化 → <b>' + U.esc(m.evo.zh) + '</b> <span class="muted">' + U.esc(m.evo.en) +
        '</span>，需要 <b>' + U.statLabel(m.evo.stat) + '</b></div>'
      : '<div class="ev">沒有進化（增益招式）</div>';
    return '<li class="mv' + (m.poison ? ' poison' : '') + '"><div class="nm">' + U.esc(m.zh) +
      '<span class="en">' + U.esc(m.en) + '</span></div><div class="mt">' + meta + '</div>' + evo + '</li>';
  }
  function moveGrid(list) {
    return list.length ? '<ul class="mv-grid">' + list.map(moveCard).join('') + '</ul>' : '<p class="muted">無</p>';
  }
  function dfx(list) {
    return list.length
      ? list.map(function (x) { return U.chip(x.type) + '<span class="m">' + U.fmtMult(x.m) + '</span>'; }).join(' ')
      : '<span class="muted">無</span>';
  }

  function fillDetail(p) {
    $('dlg-pic').innerHTML = '<img src="sprites/' + p.no + '.png" alt="' + U.esc(p.zh) + '" width="144" height="144">';
    $('dlg-info').innerHTML =
      '<h2 id="dlg-title">' + U.esc(p.zh) + '</h2>' +
      '<div class="en">' + U.esc(p.en) + ' · #' + pad(p.no) + '</div>' +
      '<div class="meta">' + p.t.map(U.chip).join('') + U.stars(p.star) +
      '<span class="kind">' + U.esc(U.GEN_ZH[p.gen]) + '世代</span>' + badges(p) + '</div>';

    var prof = U.incoming(p.t);
    var weak = prof.filter(function (x) { return x.m > 1; }).sort(function (a, b) { return b.m - a.m; });
    var resist = prof.filter(function (x) { return x.m < 1; }).sort(function (a, b) { return a.m - b.m; });
    var pool = U.movePool(p.t);
    var normal = pool.filter(function (m) { return m.type === 'normal'; });

    var h = '';
    h += '<h3>基礎數值 <span class="tag">理論值</span></h3>';
    h += '<div class="bars">' +
      bar('hp', '血', p.hp / MAX.hp, p.hp) +
      bar('spd', '速', p.spd / MAX.spd, p.spd) +
      bar('atk', '攻', p.atk / MAX.atk, '×' + p.atk.toFixed(2)) + '</div>';
    h += '<p class="sub">綜合值（血 × 速 × 攻）：' + num(comp(p)) + '</p>';

    h += '<h3>受到傷害倍率</h3>';
    h += '<p class="sub">屬性不會加成自己的招式，只影響你受到的傷害。倍率：克制 ×1.6、不擅長 ×0.6、免疫 ×0.3，雙屬性相乘。</p>';
    h += '<div class="dfx"><span class="m">弱點</span>' + dfx(weak) + '</div>';
    h += '<div class="dfx" style="margin-top:6px"><span class="m">抗性</span>' + dfx(resist) + '</div>';

    h += '<h3>可學招式（共 ' + pool.length + ' 招）</h3>';
    h += '<p class="sub">招式池 = 一般系招式 + 自身屬性的招式。紫框為毒系招式（會疊中毒層數）。</p>';
    h += '<div class="sec-sub"><b>一般系</b><span class="muted">所有夥伴都能學</span></div>';
    h += moveGrid(normal);
    p.t.forEach(function (t) {
      var own = pool.filter(function (m) { return m.type === t; });
      h += '<div class="sec-sub">' + U.chip(t) + '<span class="muted">' + U.TYPE_ZH[t] + '系招式</span></div>';
      h += moveGrid(own);
    });
    $('dlg-body').innerHTML = h;
  }

  function openDetail(no, updateHash) {
    var p = BY_NO[no];
    if (!p) return;
    fillDetail(p);
    if (!dlg.open) dlg.showModal();
    $('dlg-body').scrollTop = 0;
    if (updateHash) {
      try { history.replaceState(null, '', '#' + p.no); } catch (e) { /* file:// 下若不允許則略過 */ }
    }
  }
  function closeDetail() { if (dlg.open) dlg.close(); }

  // ----- 篩選列 -----
  function buildFilters() {
    var box = $('f-types');
    box.innerHTML = U.TYPES.map(function (t) {
      return '<button type="button" class="tf" data-t="' + t + '" aria-pressed="false" style="--c:' + U.TYPE_COLOR[t] +
        ';--on:' + U.onColor(U.TYPE_COLOR[t]) + '" title="' + U.TYPE_EN[t] + '">' + U.TYPE_ZH[t] + '</button>';
    }).join('');
    var gen = '<option value="0">全部世代</option>';
    for (var g = 1; g <= 9; g++) gen += '<option value="' + g + '">第 ' + g + ' 世代（' + U.GEN_ZH[g] + '）</option>';
    $('f-gen').innerHTML = gen;
    var star = '<option value="0">全部星級</option>';
    for (var s = 1; s <= 5; s++) star += '<option value="' + s + '">★ ' + s + '</option>';
    $('f-star').innerHTML = star;
  }
  function syncToggle(btn, on) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }

  function bind() {
    $('q').addEventListener('input', function () { st.q = this.value.trim().toLowerCase(); render(); });
    $('f-types').addEventListener('click', function (e) {
      var b = e.target.closest('.tf'); if (!b) return;
      var t = b.getAttribute('data-t');
      var i = st.types.indexOf(t);
      if (i >= 0) st.types.splice(i, 1); else st.types.push(t);
      syncToggle(b, i < 0);
      render();
    });
    $('tmode').addEventListener('change', function () { st.tmode = this.value; render(); });
    $('f-star').addEventListener('change', function () { st.star = +this.value; render(); });
    $('f-gen').addEventListener('change', function () { st.gen = +this.value; render(); });
    $('f-sort').addEventListener('change', function () { st.sort = this.value; render(); });
    $('f-leg').addEventListener('click', function () { st.leg = !st.leg; syncToggle(this, st.leg); render(); });
    $('f-poison').addEventListener('click', function () { st.poison = !st.poison; syncToggle(this, st.poison); render(); });
    $('f-reset').addEventListener('click', function () {
      st = { q: '', types: [], tmode: 'any', star: 0, gen: 0, leg: false, poison: false, sort: 'no' };
      $('q').value = ''; $('tmode').value = 'any'; $('f-star').value = '0'; $('f-gen').value = '0'; $('f-sort').value = 'no';
      syncToggle($('f-leg'), false); syncToggle($('f-poison'), false);
      document.querySelectorAll('#f-types .tf').forEach(function (b) { syncToggle(b, false); });
      render();
    });
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.pk'); if (!card) return;
      openDetail(+card.getAttribute('data-no'), true);
    });
    $('dlg-close').addEventListener('click', closeDetail);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDetail(); }); // 點背景關閉
    dlg.addEventListener('close', function () {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* 略過 */ }
    });
  }

  buildFilters();
  bind();
  render();
  var m = location.hash.match(/^#(\d+)$/);
  if (m && BY_NO[+m[1]]) openDetail(+m[1], false);
  window.addEventListener("hashchange", function () {
    var h = location.hash.match(/^#(\d+)$/);
    if (h && BY_NO[+h[1]]) openDetail(+h[1], false);
  });
})();

/* PokéSurvivor 招式表：依屬性分組、搜尋與中毒篩選 */
(function () {
  'use strict';
  var U = window.PSGUI, P = window.PSG;
  var D = P.dex, M = P.moves;
  var $ = function (id) { return document.getElementById(id); };
  var box = $('groups'), countEl = $('count');
  var st = { q: '', poison: false };

  // 可學寶可夢數：一般系所有夥伴可學，屬性系需含該屬性
  var LEARN = {};
  M.forEach(function (m) {
    LEARN[m.id] = D.filter(function (p) { return m.type === 'normal' || p.t.indexOf(m.type) >= 0; }).length;
  });

  function match(m) {
    if (st.poison && !m.poison) return false;
    if (!st.q) return true;
    var hay = [m.zh, m.en, m.evo ? m.evo.zh : '', m.evo ? m.evo.en : '', U.KIND_ZH[m.kind] || ''].join(' ').toLowerCase();
    return hay.indexOf(st.q) >= 0;
  }

  function rowHTML(m) {
    var kind = '<span class="kind" title="' + U.esc(U.KIND_HINT[m.kind] || '') + '">' + U.esc(U.KIND_ZH[m.kind] || m.kind) + '</span>';
    var poison = m.poison ? '<span class="badge pz">' + m.poison + ' 層</span>' : '<span class="muted">—</span>';
    var evo = m.evo
      ? '<b>' + U.esc(m.evo.zh) + '</b> <span class="muted">' + U.esc(m.evo.en) + '</span>'
      : '<span class="muted">無進化（增益）</span>';
    var card = m.evo ? U.statLabel(m.evo.stat) : '<span class="muted">—</span>';
    return '<li class="mvt-row' + (m.poison ? ' poison' : '') + '">' +
      '<span class="nm"><b>' + U.esc(m.zh) + '</b><span class="en">' + U.esc(m.en) + '</span></span>' +
      '<span><span class="lb">類型</span>' + kind + '</span>' +
      '<span><span class="lb">中毒</span>' + poison + '</span>' +
      '<span><span class="lb">Lv5 進化</span>' + evo + '</span>' +
      '<span><span class="lb">所需卡</span>' + card + '</span>' +
      '<span><span class="lb">可學寶可夢</span>' + LEARN[m.id] + ' 隻</span>' +
      '</li>';
  }

  function render() {
    var total = 0, html = '';
    U.TYPES.forEach(function (t) {
      var list = M.filter(function (m) { return m.type === t && match(m); });
      if (!list.length) return;
      total += list.length;
      html += '<section class="card mvt-group" id="t-' + t + '">' +
        '<h2>' + U.chip(t) + ' ' + U.TYPE_ZH[t] + '系 <span class="muted">（' + list.length + ' 招）</span></h2>' +
        '<div class="mvt-head" aria-hidden="true"><span>招式</span><span>類型</span><span>中毒</span>' +
        '<span>Lv5 進化</span><span>所需卡</span><span>可學寶可夢</span></div>' +
        '<ul class="mvt">' + list.map(rowHTML).join('') + '</ul></section>';
    });
    box.innerHTML = html || '<p class="empty">沒有符合條件的招式，試著換個關鍵字。</p>';
    countEl.textContent = '顯示 ' + total + ' / ' + M.length + ' 招';
  }

  function buildJump() {
    $('jump').innerHTML = U.TYPES.map(function (t) {
      return '<a class="tf" href="#t-' + t + '" style="--c:' + U.TYPE_COLOR[t] + ';--on:' + U.onColor(U.TYPE_COLOR[t]) + '">' +
        U.TYPE_ZH[t] + '</a>';
    }).join('');
    $('kind-legend').innerHTML = Object.keys(U.KIND_ZH).map(function (k) {
      return '<li><span class="kind">' + U.esc(U.KIND_ZH[k]) + '</span> ' + U.esc(U.KIND_HINT[k] || '') + '</li>';
    }).join('');
  }

  $('q').addEventListener('input', function () { st.q = this.value.trim().toLowerCase(); render(); });
  $('f-poison').addEventListener('click', function () {
    st.poison = !st.poison;
    this.setAttribute('aria-pressed', st.poison ? 'true' : 'false');
    render();
  });
  $('f-reset').addEventListener('click', function () {
    st = { q: '', poison: false };
    $('q').value = '';
    $('f-poison').setAttribute('aria-pressed', 'false');
    render();
  });

  buildJump();
  render();
})();

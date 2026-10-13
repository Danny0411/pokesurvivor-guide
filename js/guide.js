/* 攻略頁互動：夥伴屬性與星級、毒層模擬、招式進化、競技場篩選、目錄定位、存活計時 */
(function () {
  'use strict';
  var U = window.PSGUI;
  var BY_NO = {};
  window.PSG.dex.forEach(function (p) { BY_NO[p.no] = p; });
  var MOVE = {};
  window.PSG.moves.forEach(function (m) { MOVE[m.id] = m; });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ZH2TYPE = {};
  Object.keys(U.TYPE_ZH).forEach(function (t) { ZH2TYPE[U.TYPE_ZH[t]] = t; });

  function paint(el, type) {
    var c = U.TYPE_COLOR[type];
    if (!c) return;
    el.style.setProperty('--c', c);
    el.style.setProperty('--on', U.onColor(c));
  }

  var esc = U.esc;
  var MOVES = window.PSG.moves;
  var AREA = ['aura', 'nova', 'orbit', 'trail'];
  var setText = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  setText('hs-dex', window.PSG.dex.length);
  setText('hs-mv', MOVES.length);

  // 初始夥伴
  var starters = document.getElementById('starters');
  if (starters) {
    starters.innerHTML = window.PSG.dex.filter(function (p) { return p.st; }).map(function (p) {
      return '<a href="dex.html#' + p.no + '"><img src="sprites/' + p.no + '.png" alt="" width="64" height="64" loading="lazy" decoding="async">' +
        esc(p.zh) + '<span class="tps">' + p.t.map(U.chip).join('') + '</span></a>';
    }).join('');
  }

  // 各屬性招式池
  var poolGrid = document.getElementById('pool-grid');
  if (poolGrid) {
    poolGrid.innerHTML = U.TYPES.map(function (t) {
      var ms = MOVES.filter(function (m) { return m.type === t; });
      var rows = ms.map(function (m) {
        return '<li><span>' + esc(m.zh) + '</span><span class="kind" title="' + esc(U.KIND_HINT[m.kind]) + '">' +
          esc(U.KIND_ZH[m.kind]) + '</span><span class="ev">' + (m.evo ? esc(U.STAT_CARD[m.evo.stat].zh) + '卡' : '不進化') + '</span></li>';
      }).join('');
      var c = U.TYPE_COLOR[t];
      return '<div class="pl' + (t === 'normal' ? ' all' : '') + '" style="--c:' + c + '"><div class="pl-h">' + U.chip(t) +
        (t === 'normal' ? '<b>人人都能學</b>' : '') + '<span class="n">' + ms.length + ' 招</span></div><ul>' + rows + '</ul></div>';
    }).join('');
  }

  // 招式類型
  var kindsGrid = document.getElementById('kinds-grid');
  if (kindsGrid) {
    kindsGrid.innerHTML = Object.keys(U.KIND_ZH).map(function (k) {
      var ms = MOVES.filter(function (m) { return m.kind === k; });
      return '<div class="kn' + (AREA.indexOf(k) >= 0 ? ' area' : '') + '"><span class="c">' + ms.length + ' 招</span><b>' + esc(U.KIND_ZH[k]) +
        '</b><p>' + esc(U.KIND_HINT[k]) + '</p><small>' + ms.map(function (m) { return esc(m.zh); }).join('、') + '</small></div>';
    }).join('');
  }

  // 進化需要的能力卡
  var evoBox = document.getElementById('evo-cards');
  if (evoBox) {
    var cnt = {}, max = 0, evoTotal = 0;
    MOVES.forEach(function (m) { if (m.evo) { cnt[m.evo.stat] = (cnt[m.evo.stat] || 0) + 1; evoTotal++; } });
    Object.keys(cnt).forEach(function (k) { max = Math.max(max, cnt[k]); });
    evoBox.innerHTML = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) {
      return '<div class="ec"><b>' + U.statLabel(k) + '</b><div class="bar2"><i style="width:' + (cnt[k] / max * 100) + '%"></i></div><span>' +
        cnt[k] + ' / ' + evoTotal + ' 招</span></div>';
    }).join('');
  }

  // 推薦夥伴：屬性、徽章、星級（資料來自 PSG.dex）
  document.querySelectorAll('a.partner[data-no]').forEach(function (a) {
    var p = BY_NO[+a.getAttribute('data-no')];
    if (!p) return;
    var box = a.querySelector('.pt');
    box.innerHTML = p.t.map(U.chip).join('') +
      (p.leg ? '<span class="badge leg">傳說 LEG</span>' : '') +
      (p.st ? '<span class="badge st">初始</span>' : '') +
      '<span class="stars" aria-label="' + p.star + ' 星">' + '★'.repeat(p.star) + '</span>';
  });

  // 毒系招式卡：補上進化資訊
  document.querySelectorAll('.mv4[data-move]').forEach(function (el) {
    var m = MOVE[el.getAttribute('data-move')];
    if (!m || !m.evo) return;
    el.querySelector('.mevo').textContent = '進化：' + m.evo.zh + '（' + m.evo.en + '），需 ' +
      U.STAT_CARD[m.evo.stat].zh + '卡（' + U.STAT_CARD[m.evo.stat].en + '）';
  });

  // 羈絆示意格上色
  document.querySelectorAll('.bond-in [data-t]').forEach(function (el) { paint(el, el.getAttribute('data-t')); });

  // 毒層模擬：每秒約 2% × 層數（不含每跳 +1）
  var range = document.getElementById('stack');
  if (range) {
    var pips = document.querySelectorAll('.pips i');
    var rows = document.querySelectorAll('.ptbl tr[data-s]');
    var setStack = function (n) {
      range.value = n;
      document.getElementById('so-stack').textContent = n;
      document.getElementById('so-pct').textContent = (2 * n) + '%';
      document.getElementById('so-sec').textContent = (Math.round(500 / n) / 10).toString();
      pips.forEach(function (p, i) { p.classList.toggle('on', i < n); });
      rows.forEach(function (r) { r.classList.toggle('on', +r.getAttribute('data-s') === n); });
    };
    range.addEventListener('input', function () { setStack(+range.value); });
    rows.forEach(function (r) {
      r.style.cursor = 'pointer';
      r.addEventListener('click', function () { setStack(+r.getAttribute('data-s')); });
    });
    setStack(+range.value);
  }

  // 競技場：上色＋依攻擊屬性篩選
  var list = document.getElementById('arena-list');
  if (list) {
    var items = list.querySelectorAll('li');
    items.forEach(function (li) {
      paint(li.querySelector('.ar'), li.getAttribute('data-a'));
      paint(li.querySelector('.ak'), li.getAttribute('data-k'));
    });
    var used = [];
    items.forEach(function (li) {
      var k = li.getAttribute('data-k');
      if (used.indexOf(k) < 0) used.push(k);
    });
    used.sort(function (a, b) { return U.TYPES.indexOf(a) - U.TYPES.indexOf(b); });
    var btnBox = document.getElementById('af-btns');
    var count = document.getElementById('af-count');
    var cur = '';
    var apply = function () {
      var n = 0;
      list.classList.toggle('filtering', !!cur);
      items.forEach(function (li) {
        var hit = !!cur && li.getAttribute('data-k') === cur;
        li.classList.toggle('hit', hit);
        if (hit) n++;
      });
      count.textContent = cur ? U.TYPE_ZH[cur] + '系可以打 ' + n + ' 個競技場' : '';
      btnBox.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === cur));
      });
    };
    var mk = function (t, label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tf';
      b.setAttribute('data-t', t);
      b.textContent = label;
      if (t) paint(b, t);
      b.addEventListener('click', function () { cur = (cur === t) ? '' : t; apply(); });
      btnBox.appendChild(b);
    };
    mk('', '全部');
    used.forEach(function (t) { mk(t, U.TYPE_ZH[t]); });
    document.getElementById('af').hidden = false;
    apply();
  }

  // 目錄：目前章節高亮
  var tocLinks = document.querySelectorAll('#toc a');
  var secs = [];
  tocLinks.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) secs.push({ a: a, s: s });
  });
  var head = document.querySelector('.site-head');
  var setHeadH = function () { document.documentElement.style.setProperty('--head-h', head.offsetHeight + 'px'); };
  setHeadH();
  addEventListener('resize', setHeadH);
  var lastOn = null;
  var spy = function () {
    var y = innerHeight * 0.3, on = null;
    secs.forEach(function (o) { if (o.s.getBoundingClientRect().top <= y) on = o; });
    if (on === lastOn) return;
    tocLinks.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
    if (on) {
      on.a.classList.add('on');
      on.a.setAttribute('aria-current', 'location');
      var bar = on.a.closest('ol');
      if (bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: on.a.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    lastOn = on;
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  // 區塊進場
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.sec').forEach(function (s) {
      if (s.getBoundingClientRect().top > innerHeight) { s.classList.add('reveal'); io.observe(s); }
    });
  }

  // Hero 存活計時（排行榜只看存活秒數）
  var alive = document.getElementById('alive');
  if (alive) {
    var t0 = Date.now();
    var tick = function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      alive.textContent = ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2);
    };
    setInterval(tick, 1000);
  }
})();

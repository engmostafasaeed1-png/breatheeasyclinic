/* Breathe Easy — live content from the admin console (Supabase):
   site settings, opening hours and closure dates, announcement pop-up, news bar,
   extra gallery photos, and anonymous visit / button-tap counts.
   Does nothing until config.js has a Supabase URL and key. */
(function () {
  'use strict';
  var cfg = window.BE_SUPA || {}, D = window.BE_DEFAULTS || {};
  if (!cfg.url || !cfg.key) return;
  var AR = document.documentElement.lang === 'ar';
  var C = window.CLINIC || {}, S = C.s || {};
  var API = cfg.url.replace(/\/$/, '') + '/rest/v1/';
  var H = { apikey: cfg.key };
  if (/^eyJ/.test(cfg.key)) H.Authorization = 'Bearer ' + cfg.key;
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (q) { return fetch(API + q, { headers: H }).then(function (r) { if (!r.ok) throw r; return r.json(); }); };
  var digits = function (s) { return String(s || '').replace(/[^\d]/g, ''); };
  var fmtP = function (n) { n = digits(n); return /^0\d{10}$/.test(n) ? '+20 ' + n.slice(1, 4) + ' ' + n.slice(4, 7) + ' ' + n.slice(7) : n; };
  var num = function (n) { return AR ? Number(n).toLocaleString('ar-EG', { useGrouping: false }) : String(n); };
  function cairoDate(addDays) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var d = new Date(Date.UTC(+p.year, +p.month - 1, +p.day + (addDays || 0)));
    return { iso: d.toISOString().slice(0, 10), dow: d.getUTCDay(), date: d };
  }

  /* ---------- 1. Site settings: phones, email, WhatsApp, social, address ---------- */
  function swapText(el, from, to) {
    if (!from || !to || from === to) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf(from) > -1) n.nodeValue = n.nodeValue.split(from).join(to);
  }
  function applySite(v) {
    if (!v || typeof v !== 'object') return;
    (D.phones || []).forEach(function (oldP, i) {
      var nu = digits((v.phones || [])[i]);
      if (!nu || nu === oldP) return;
      document.querySelectorAll('a[href="tel:+2' + oldP + '"]').forEach(function (a) { a.href = 'tel:+2' + nu; swapText(a, fmtP(oldP), fmtP(nu)); swapText(a, oldP, nu); });
      document.querySelectorAll('.foot-cols, .contact-info').forEach(function (el) { swapText(el, fmtP(oldP), fmtP(nu)); });
      if (window.CLINIC && window.CLINIC.phones) window.CLINIC.phones[i] = nu;
    });
    if (v.email && v.email !== D.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      document.querySelectorAll('a[href^="mailto:' + D.email + '"]').forEach(function (a) { a.href = 'mailto:' + v.email; swapText(a, D.email, v.email); });
    }
    var wa = digits(v.whatsapp);
    if (wa) {
      var intl = wa.charAt(0) === '0' ? '2' + wa : wa;
      document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) { a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + intl); });
    }
    [['facebook', /^https:\/\/(www\.|m\.)?facebook\.com\//], ['instagram', /^https:\/\/(www\.)?instagram\.com\//]].forEach(function (x) {
      var u = v[x[0]]; if (u && x[1].test(u)) document.querySelectorAll('.soc-' + x[0] + ', .fsoc-' + x[0]).forEach(function (a) { a.href = u; });
    });
    ['addr_1', 'addr_2', 'landmark'].forEach(function (k) {
      var t = v[k + (AR ? '_ar' : '_en')];
      if (t) document.querySelectorAll('[data-live="' + k + '"]').forEach(function (el) { el.textContent = t; });
    });
    var full = v[(AR ? 'addr_1_ar' : 'addr_1_en')];
    var mc = document.querySelector('.map-copy');
    if (mc && full) mc.setAttribute('data-addr', (AR ? 'عيادة تنفّس بسهولة، ' : 'Breathe Easy Clinic, ') + full + ' ' + (v[AR ? 'addr_2_ar' : 'addr_2_en'] || ''));
  }

  /* ---------- 2. Opening hours and closure dates ---------- */
  function fmtT(hhmm, suffix) {
    var h = +hhmm.slice(0, 2), m = +hhmm.slice(3, 5), pm = h >= 12, h12 = h % 12 || 12;
    var t = AR ? num(h12) + (m ? ':' + num(String(m).padStart(2, '0')) : '') : h12 + (m ? ':' + String(m).padStart(2, '0') : '');
    if (!suffix) return t;
    return t + (AR ? (pm ? ' مساءً' : ' صباحًا') : (pm ? ' pm' : ' am'));
  }
  function fmtRange(a, b) {
    var same = (+a.slice(0, 2) >= 12) === (+b.slice(0, 2) >= 12);
    if (AR) return 'من ' + fmtT(a, !same) + ' إلى ' + fmtT(b, true);
    return fmtT(a, !same) + '–' + fmtT(b, true);
  }
  function joinDays(list) {
    if (AR) return list.join(' و');
    return list.length < 3 ? list.join(' and ') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }
  var ORDER = [6, 0, 1, 2, 3, 4, 5], docName = { hedya: S.dr_hedya_short, wael: S.dr_wael_short };
  var hoursIcon = (function () { var s = document.querySelector('.hours li svg'); return s ? s.outerHTML : ''; })();
  function applySchedule(sc) {
    if (!sc || typeof sc !== 'object') return;
    var days = sc.days && typeof sc.days === 'object' ? sc.days : null;
    if (days) {
      var sched = {};
      Object.keys(days).forEach(function (d) {
        var x = days[d];
        if (!x || !docName[x.id] || !/^\d\d:\d\d$/.test(x.from || '') || !/^\d\d:\d\d$/.test(x.to || '') || x.from >= x.to) return;
        sched[d] = { id: x.id, from: x.from, to: x.to, doc: docName[x.id], time: fmtRange(x.from, x.to) };
      });
      C.schedule = sched;
      /* weekly table */
      document.querySelectorAll('.days .day').forEach(function (li) {
        var s = sched[li.getAttribute('data-day')];
        li.classList.toggle('off', !s);
        li.querySelector('.d-doc').textContent = s ? s.doc : S.closed;
        li.querySelector('.d-time').textContent = s ? s.time : '—';
      });
      /* doctor cards */
      document.querySelectorAll('ul.hours[data-hours]').forEach(function (ul) {
        var id = ul.getAttribute('data-hours'), groups = [], by = {};
        ORDER.forEach(function (d) {
          var s = sched[String(d)]; if (!s || s.id !== id) return;
          var k = s.from + '-' + s.to;
          if (!by[k]) { by[k] = { days: [], time: s.time }; groups.push(by[k]); }
          by[k].days.push(C.days[d]);
        });
        if (groups.length) ul.innerHTML = groups.map(function (g) { return '<li>' + hoursIcon + '<span>' + esc(joinDays(g.days) + ' | ' + g.time) + '</span></li>'; }).join('');
      });
      var st = document.querySelector('[data-stat="days"]'), n = Object.keys(sched).length;
      if (st) { st.setAttribute('data-count', n); st.textContent = num(n); }
    }
    /* closure dates (holidays): skipped by "open now", next session and the visit planner */
    var closed = (Array.isArray(sc.closed) ? sc.closed : []).filter(function (c) { return c && /^\d{4}-\d\d-\d\d$/.test(c.date); });
    C.closed = closed.map(function (c) { return c.date; });
    var fmtD = new Intl.DateTimeFormat(AR ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    document.querySelectorAll('.days .day.holiday').forEach(function (li) { li.classList.remove('holiday'); });
    for (var k = 0; k < 7; k++) {
      var cd = cairoDate(k), hit = closed.filter(function (c) { return c.date === cd.iso; })[0];
      if (!hit) continue;
      var li = document.querySelector('.days .day[data-day="' + cd.dow + '"]'); if (!li) continue;
      li.classList.add('off', 'holiday');
      li.querySelector('.d-doc').textContent = S.holiday + ' · ' + fmtD.format(cd.date);
      var note = AR ? hit.note_ar || hit.note_en : hit.note_en || hit.note_ar;
      li.querySelector('.d-time').textContent = note || '—';
    }
    if (window.BE_refreshSchedule) window.BE_refreshSchedule();
  }

  /* ---------- 3. Announcement (pop-up or highlighted banner) ---------- */
  var annShown = false;
  function applyAnnounce(a) {
    if (annShown || !a || !a.active) return;
    var today = cairoDate(0).iso;
    if ((a.start && today < a.start) || (a.end && today > a.end)) return;
    var title = AR ? a.title_ar || a.title_en : a.title_en || a.title_ar, text = AR ? a.text_ar || a.text_en : a.text_en || a.text_ar;
    if (!title && !text) return;
    var key = 'be-ann-' + (a.v || ''), store = a.style === 'banner' ? sessionStorage : localStorage;
    try { if (store.getItem(key)) return; } catch (e) {}
    annShown = true;
    var btn = AR ? a.btn_ar || a.btn_en : a.btn_en || a.btn_ar, link = a.link && /^(https?:\/\/|#|\/|tel:)/.test(a.link) ? a.link : '';
    var cta = link && btn ? '<a class="btn btn-primary ann-cta" href="' + esc(link) + '"' + (/^https?:/.test(link) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(btn) + '</a>' : '';
    var body = esc(text).replace(/\n/g, '<br>');
    var close = function (el) { el.classList.add('out'); setTimeout(function () { el.remove(); }, 300); try { store.setItem(key, '1'); } catch (e) {} };
    if (a.style === 'banner') {
      var bar = document.createElement('div');
      bar.className = 'ann-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', title || 'Notice');
      bar.innerHTML = '<span class="ann-ic" aria-hidden="true">!</span><p>' + (title ? '<b>' + esc(title) + '</b> ' : '') + body + '</p>' + (cta ? cta.replace('btn btn-primary', 'ann-link') : '') +
        '<button class="ann-x" type="button" aria-label="' + esc(S.ann_close || 'Close') + '">&times;</button>';
      var header = document.querySelector('.site-header'); if (!header) return;
      header.insertBefore(bar, header.firstChild);
      bar.querySelector('.ann-x').addEventListener('click', function () { close(bar); });
      return;
    }
    var pop = document.createElement('div');
    pop.className = 'ann-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-labelledby', 'annTitle');
    pop.innerHTML = '<div class="ann-card"><button class="ann-x" type="button" aria-label="' + esc(S.ann_close || 'Close') + '">&times;</button>' +
      '<span class="ann-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>' +
      (title ? '<h3 id="annTitle">' + esc(title) + '</h3>' : '') + (body ? '<p>' + body + '</p>' : '') + cta + '</div>';
    var show = function () {
      if (document.documentElement.classList.contains('has-intro')) return setTimeout(show, 800);
      document.body.appendChild(pop); requestAnimationFrame(function () { pop.classList.add('in'); });
      var x = pop.querySelector('.ann-x'); x.focus({ preventScroll: true });
      x.addEventListener('click', function () { close(pop); });
      pop.addEventListener('click', function (e) { if (e.target === pop) close(pop); });
      var c = pop.querySelector('.ann-cta'); if (c) c.addEventListener('click', function () { close(pop); });
      document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(pop); document.removeEventListener('keydown', k); } });
    };
    setTimeout(show, 1500);
  }

  /* settings rows: 'site', 'schedule', 'announce' (cached so repeat visits update instantly) */
  function applyAll(rows, fresh) {
    if (!rows || typeof rows !== 'object') return;
    try { applySite(rows.site); } catch (e) {}
    try { applySchedule(rows.schedule); } catch (e) {}
    if (fresh) try { applyAnnounce(rows.announce); } catch (e) {}   /* never from the cache: a switched-off notice must not reappear */
  }
  try { applyAll(JSON.parse(localStorage.getItem('be-settings2') || 'null')); } catch (e) {}
  get('settings?select=key,value').then(function (list) {
    var rows = {};
    (list || []).forEach(function (r) { rows[r.key] = r.value; });
    try { localStorage.setItem('be-settings2', JSON.stringify(rows)); } catch (e) {}
    applyAll(rows, true);
  }).catch(function () {});

  /* ---------- 4. News bar ---------- */
  var NEWS_KEY = 'be-news-closed';
  get('news?select=id,text_en,text_ar,link&order=sort.asc,created_at.desc&limit=10').then(function (rows) {
    rows = (rows || []).filter(function (n) { return (AR ? n.text_ar || n.text_en : n.text_en || n.text_ar); });
    if (!rows.length) return;
    var sig = rows.map(function (n) { return n.id; }).join(',');
    try { if (sessionStorage.getItem(NEWS_KEY) === sig) return; } catch (e) {}
    var items = rows.map(function (n) {
      var t = esc(AR ? n.text_ar || n.text_en : n.text_en || n.text_ar);
      var ok = n.link && /^(https?:\/\/|#|\/)/.test(n.link);
      return ok ? '<a class="nb-item" href="' + esc(n.link) + '"' + (/^https?:/.test(n.link) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>' : '<span class="nb-item">' + t + '</span>';
    }).join('');
    var bar = document.createElement('div');
    bar.className = 'news-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', AR ? 'أخبار العيادة' : 'Clinic news');
    var single = rows.length === 1;
    bar.innerHTML = '<span class="nb-label"><i aria-hidden="true"></i>' + (AR ? 'جديد' : 'News') + '</span>' +
      '<div class="nb-viewport"><div class="nb-track' + (single ? ' nb-static' : '') + '">' + items + (single ? '' : '<span aria-hidden="true" class="nb-dup">' + items + '</span>') + '</div></div>' +
      '<button class="nb-close" type="button" aria-label="' + (AR ? 'إخفاء الأخبار' : 'Hide news') + '">&times;</button>';
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ann = header.querySelector('.ann-bar');
    header.insertBefore(bar, ann ? ann.nextSibling : header.firstChild);
    var track = bar.querySelector('.nb-track');
    if (!single) track.style.animationDuration = Math.max(18, rows.length * 9) + 's';
    bar.querySelector('.nb-close').addEventListener('click', function () {
      bar.remove(); try { sessionStorage.setItem(NEWS_KEY, sig); } catch (e) {}
    });
  }).catch(function () {});

  /* ---------- 5. Extra gallery photos ---------- */
  var gallery = document.querySelector('.gallery');
  if (gallery) get('photos?select=url,caption_en,caption_ar&order=sort.asc,created_at.desc&limit=24').then(function (rows) {
    (rows || []).forEach(function (p) {
      if (!/^https:\/\//.test(p.url)) return;
      var cap = esc(AR ? p.caption_ar || p.caption_en : p.caption_en || p.caption_ar);
      var f = document.createElement('figure');
      f.className = 'g-item g-live';
      f.innerHTML = '<img src="' + esc(p.url) + '" alt="' + cap + '" loading="lazy" decoding="async">' + (cap ? '<figcaption>' + cap + '</figcaption>' : '');
      gallery.appendChild(f);
    });
    if (window.BE_prepGallery) window.BE_prepGallery();
  }).catch(function () {});

  /* ---------- 6. Anonymous visit counter and button taps (no cookies, no personal data) ---------- */
  var vid = '', canTrack = false;
  try {
    var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    canTrack = !(dnt || localStorage.getItem('be-notrack') === '1' || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent));
    if (canTrack) {
      vid = localStorage.getItem('be-vid'); var isNew = false;
      if (!vid) {
        vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
        localStorage.setItem('be-vid', vid); isNew = true;
      }
      var ref = '';
      try { if (document.referrer) { var h = new URL(document.referrer).hostname; if (h !== location.hostname) ref = h.replace(/^www\./, '').slice(0, 200); } } catch (e) {}
      var w = window.innerWidth, device = w < 768 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop';
      var body = JSON.stringify({ vid: vid.slice(0, 64), path: location.pathname.slice(0, 200), lang: AR ? 'ar' : 'en', ref: ref, device: device, new_visitor: isNew });
      fetch(API + 'visits', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H), body: body, keepalive: true }).catch(function () {});
    }
  } catch (e) {}
  var lastTap = {};
  function track(kind) {
    if (!canTrack) return;
    var now = Date.now(); if (lastTap[kind] && now - lastTap[kind] < 3000) return; lastTap[kind] = now;
    try {
      fetch(API + 'events', { method: 'POST', keepalive: true, headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
        body: JSON.stringify({ kind: kind, vid: (vid || '').slice(0, 64), path: location.pathname.slice(0, 200), lang: AR ? 'ar' : 'en' }) }).catch(function () {});
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button'); if (!el) return;
    var href = el.getAttribute('href') || '';
    if (/^tel:/i.test(href)) track('call');
    else if (/wa\.me\/|api\.whatsapp\.com|whatsapp:/i.test(href)) track('whatsapp');
    else if (/google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com/i.test(href) || el.classList.contains('map-copy')) track('directions');
    else if (/^mailto:/i.test(href)) track('email');
    else if (/facebook\.com/i.test(href)) track('facebook');
    else if (/instagram\.com/i.test(href)) track('instagram');
  }, true);
  document.addEventListener('be:subscribed', function () { track('subscribe'); });
})();

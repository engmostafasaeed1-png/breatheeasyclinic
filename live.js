/* Breathe Easy — live content from the admin console (Supabase):
   site settings, news bar, extra gallery photos and anonymous visit counts.
   Does nothing until config.js has a Supabase URL and key. */
(function () {
  'use strict';
  var cfg = window.BE_SUPA || {}, D = window.BE_DEFAULTS || {};
  if (!cfg.url || !cfg.key) return;
  var AR = document.documentElement.lang === 'ar';
  var API = cfg.url.replace(/\/$/, '') + '/rest/v1/';
  var H = { apikey: cfg.key };
  if (/^eyJ/.test(cfg.key)) H.Authorization = 'Bearer ' + cfg.key;
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (q) { return fetch(API + q, { headers: H }).then(function (r) { if (!r.ok) throw r; return r.json(); }); };
  var digits = function (s) { return String(s || '').replace(/[^\d]/g, ''); };
  var fmtP = function (n) { n = digits(n); return /^0\d{10}$/.test(n) ? '+20 ' + n.slice(1, 4) + ' ' + n.slice(4, 7) + ' ' + n.slice(7) : n; };

  /* ---------- 1. Settings: phones, email, WhatsApp, social, address ---------- */
  function swapText(el, from, to) {
    if (!from || !to || from === to) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf(from) > -1) n.nodeValue = n.nodeValue.split(from).join(to);
  }
  function applySettings(v) {
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
  try { applySettings(JSON.parse(localStorage.getItem('be-settings') || 'null')); } catch (e) {}
  get('settings?key=eq.site&select=value').then(function (rows) {
    var v = rows[0] && rows[0].value;
    try { localStorage.setItem('be-settings', JSON.stringify(v || {})); } catch (e) {}
    applySettings(v);
  }).catch(function () {});

  /* ---------- 2. News bar ---------- */
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
    header.insertBefore(bar, header.firstChild);
    var track = bar.querySelector('.nb-track');
    if (!single) track.style.animationDuration = Math.max(18, rows.length * 9) + 's';
    bar.querySelector('.nb-close').addEventListener('click', function () {
      bar.remove(); try { sessionStorage.setItem(NEWS_KEY, sig); } catch (e) {}
    });
  }).catch(function () {});

  /* ---------- 3. Extra gallery photos ---------- */
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

  /* ---------- 4. Anonymous visit counter (no cookies, no personal data) ---------- */
  try {
    var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    if (dnt || localStorage.getItem('be-notrack') === '1' || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)) return;
    var vid = localStorage.getItem('be-vid'), isNew = false;
    if (!vid) {
      vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem('be-vid', vid); isNew = true;
    }
    var ref = '';
    try { if (document.referrer) { var h = new URL(document.referrer).hostname; if (h !== location.hostname) ref = h.replace(/^www\./, '').slice(0, 200); } } catch (e) {}
    var w = window.innerWidth, device = w < 768 ? 'mobile' : w < 1100 ? 'tablet' : 'desktop';
    var body = JSON.stringify({ vid: vid.slice(0, 64), path: location.pathname.slice(0, 200), lang: AR ? 'ar' : 'en', ref: ref, device: device, new_visitor: isNew });
    fetch(API + 'visits', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H), body: body, keepalive: true }).catch(function () {});
  } catch (e) {}
})();

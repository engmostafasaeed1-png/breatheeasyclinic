(function () {
  'use strict';
  var C = window.CLINIC || {}, S = C.s || {}, AR = C.lang === 'ar';
  var $ = function (q, el) { return (el || document).querySelector(q); };
  var $$ = function (q, el) { return Array.prototype.slice.call((el || document).querySelectorAll(q)); };
  var root = document.documentElement;
  var num = function (n) { return AR ? Number(n).toLocaleString('ar-EG', { useGrouping: false }) : String(n); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- 1. Intro ---------- */
  var intro = $('#intro');
  function endIntro() {
    if (!root.classList.contains('has-intro') || root.classList.contains('intro-out')) return;
    root.classList.add('intro-out');
    try { sessionStorage.setItem('be-intro', '1'); } catch (e) {}
    setTimeout(function () { root.classList.remove('has-intro', 'intro-out'); if (intro) intro.remove(); }, 750);
  }
  if (intro) {
    if (root.classList.contains('has-intro')) {
      var iv = intro.querySelector('.intro-video'), introMs = 3300;
      var saveData = navigator.connection && navigator.connection.saveData;
      if (iv && !saveData) {
        iv.play().then(function () { intro.classList.add('has-video'); }).catch(function () {});
        introMs = 6200;
      } else if (iv) { iv.remove(); }
      setTimeout(endIntro, introMs);
      $('.intro-skip', intro).addEventListener('click', endIntro);
      document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { endIntro(); document.removeEventListener('keydown', k); } });
    } else { intro.remove(); }
  }

  /* ---------- 2. Header, progress, menu ---------- */
  var header = $('.site-header'), bar = $('#progress');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var btn = $('.menu-btn');
  btn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open'); btn.setAttribute('aria-expanded', open);
  });
  $$('.main-nav a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded', false); });
  });

  /* ---------- 3. Reveal, active nav, counters ---------- */
  var hasIO = 'IntersectionObserver' in window;
  var els = $$('.reveal');
  if (hasIO) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });

    var links = $$('.main-nav a');
    var nio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) nio.observe(s); });

    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
          el.textContent = num(v); if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* card spotlight */
  $$('.card, .panel').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- 4. Cairo clock + schedule ---------- */
  var toMin = function (s) { return +s.slice(0, 2) * 60 + +s.slice(3); };
  function cairoNow() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: (+p.hour % 24) * 60 + +p.minute };
  }
  var dateFmt = new Intl.DateTimeFormat(AR ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  function hourLabel(hhmm) { var h = +hhmm.slice(0, 2) - 12; return AR ? num(h) + ' مساءً' : h + ' pm'; }
  function dur(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (AR) return (h ? num(h) + ' ساعة' + (m ? ' و' : '') : '') + (m || !h ? num(m) + ' دقيقة' : '');
    return (h ? h + ' h ' : '') + (m || !h ? m + ' min' : '');
  }
  function upcoming(limit, docId) {
    var n = cairoNow(), out = [];
    for (var k = 0; k < 21 && out.length < limit; k++) {
      var dow = (n.dow + k) % 7, s = C.schedule[String(dow)];
      if (!s || (docId && docId !== 'any' && s.id !== docId)) continue;
      if (k === 0 && n.min >= toMin(s.to)) continue;
      var date = new Date(Date.UTC(n.y, n.m - 1, n.d + k));
      if (C.closed && C.closed.indexOf(date.toISOString().slice(0, 10)) > -1) continue;   /* closure date set in the admin console */
      out.push({ k: k, dow: dow, s: s, date: date,
        live: k === 0 && n.min >= toMin(s.from),
        startsIn: k * 1440 + toMin(s.from) - n.min, endsIn: toMin(s.to) - n.min,
        label: k === 0 ? S.today_word : k === 1 ? S.tomorrow_word : C.days[dow],
        full: dateFmt.format(date) });
    }
    return out;
  }

  function updateLive() {
    var n = cairoNow(), next = upcoming(1)[0];
    var row = $('.day.is-today'); if (row) row.classList.remove('is-today');
    row = $('.day[data-day="' + n.dow + '"]'); if (row) row.classList.add('is-today');

    var st = $('#status'), card = $('#todayCard');
    $$('.live-badge').forEach(function (b) { b.hidden = true; });
    if (!next) return;
    var lbl = $('#todayLabel'), doc = $('#todayDoc'), tm = $('#todayTime');
    card.classList.remove('off', 'live');
    if (next.live) {
      st.className = 'status open';
      $('span', st).textContent = S.status_open + ' · ' + S.status_until + ' ' + hourLabel(next.s.to);
      lbl.textContent = S.status_open; doc.textContent = next.s.doc;
      tm.textContent = S.ends_in + ' ' + dur(next.endsIn); card.classList.add('live');
      var b = $('.live-badge[data-doc="' + next.s.id + '"]'); if (b) { b.textContent = S.status_open; b.hidden = false; }
    } else {
      st.className = 'status';
      $('span', st).textContent = S.status_next + ' · ' + next.label + ' ' + hourLabel(next.s.from);
      lbl.textContent = next.k === 0 ? S.today : S.next_session + ' · ' + next.label;
      doc.textContent = next.s.doc;
      tm.textContent = next.startsIn < 1440 ? S.starts_in + ' ' + dur(next.startsIn) : next.s.time;
      if (next.k > 0) card.classList.add('off');
    }
    st.hidden = false;
  }
  try { updateLive(); setInterval(updateLive, 30000); } catch (e) { /* static fallback */ }
  window.BE_refreshSchedule = function () { try { updateLive(); } catch (e) {} };   /* live.js calls this after loading hours from the admin console */

  /* ---------- 5. Visit planner ---------- */
  var planner = $('#planner');
  var ICON = {
    first: '<path d="M12 3v7"/><path d="M8.5 6.5C5.5 7 4 10.5 4 14.5c0 3 1 5.5 3 5.5s2.5-2 2.5-4.5V9"/><path d="M15.5 6.5c3 .5 4.5 4 4.5 8 0 3-1 5.5-3 5.5s-2.5-2-2.5-4.5V9"/>',
    follow: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
    bronch: '<circle cx="6" cy="6" r="3"/><path d="M8.2 8.2 14 14"/><path d="M14 14c2 2 5 2 6.5.5S21 10 19 9.5"/>',
    any: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M15 14.5c2.8 0 5 2 5 5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>'
  };
  var svg = function (k) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };
  var TYPES = [{ id: 'first', t: S.t_first, d: S.t_first_d }, { id: 'follow', t: S.t_follow, d: S.t_follow_d }, { id: 'bronch', t: S.t_bronch, d: S.t_bronch_d }];
  var DOCS = [
    { id: 'hedya', t: S.hedya_n, d: S.hedya_role, img: 'dr-hedya.webp' },
    { id: 'wael', t: S.wael_n, d: S.wael_role, img: 'dr-wael.webp' },
    { id: 'any', t: S.any_doc, d: S.any_doc_d }
  ];
  var pre = AR ? '../' : '';
  var state = { step: 1, type: null, doc: null, sess: null };

  function setSteps() {
    $$('#planSteps li').forEach(function (li, i) { li.classList.toggle('on', i + 1 === state.step); li.classList.toggle('done', i + 1 < state.step || state.step === 4); });
  }
  function head(n, q) {
    return '<div class="pl-head"><span class="pl-step">' + esc(S.step) + ' ' + num(n) + ' / ' + num(3) + '</span>' +
      (n > 1 ? '<button type="button" class="btn-link" data-act="back">' + esc(S.back) + '</button>' : '') + '</div><h3>' + esc(q) + '</h3>';
  }
  function render() {
    var h = '';
    if (state.step === 1) {
      h = head(1, S.q1) + '<div class="opts">' + TYPES.map(function (o) {
        return '<button type="button" class="opt" data-type="' + o.id + '"><span class="opt-ic img3d"><img src="' + pre + 'assets/icon3d-' + ({ first: 'lungs', follow: 'follow', bronch: 'bronch' })[o.id] + '.webp" alt=""></span><span><b>' + esc(o.t) + '</b><small>' + esc(o.d) + '</small></span></button>';
      }).join('') + '</div>';
    } else if (state.step === 2) {
      h = head(2, S.q2) + '<div class="opts">' + DOCS.map(function (o) {
        var pic = o.img ? '<img src="' + pre + 'assets/' + o.img + '" alt="">' : svg('any');
        return '<button type="button" class="opt" data-doc="' + o.id + '"><span class="opt-ic pic">' + pic + '</span><span><b>' + esc(o.t) + '</b><small>' + esc(o.d) + '</small></span></button>';
      }).join('') + '</div>';
    } else if (state.step === 3) {
      var list = upcoming(6, state.doc);
      h = head(3, S.q3) + (state.type === 'bronch' ? '<p class="pl-note">' + esc(S.only_hedya) + '</p>' : '') +
        '<div class="sessions">' + list.map(function (x, i) {
          return '<button type="button" class="sess' + (x.live ? ' live' : '') + '" data-sess="' + i + '"><span class="s-when">' + esc(x.label) + '</span><span class="s-date">' + esc(x.full) + '</span><span class="s-meta">' + esc(x.s.doc) + ' · ' + esc(x.s.time) + '</span></button>';
        }).join('') + '</div>';
      state._list = list;
    } else {
      var x = state.sess, type = TYPES.filter(function (o) { return o.id === state.type; })[0];
      var bring = S['bring_' + state.type] || [];
      h = '<div class="pl-head"><span class="pl-step done">' + svg('check') + esc(S.your_plan) + '</span><button type="button" class="btn-link" data-act="restart">' + esc(S.restart) + '</button></div>' +
        '<dl class="summary"><div><dt>' + esc(S.visit) + '</dt><dd>' + esc(type.t) + '</dd></div><div><dt>' + esc(S.doctor) + '</dt><dd>' + esc(x.s.doc) + '</dd></div>' +
        '<div><dt>' + esc(S.session) + '</dt><dd>' + esc(x.full) + '<br><small>' + esc(x.s.time) + '</small></dd></div></dl>' +
        '<h4>' + esc(S.bring) + '</h4><ul class="bring">' + bring.map(function (b) { return '<li>' + svg('check') + esc(b) + '</li>'; }).join('') + '</ul>' +
        '<p class="pl-note">' + esc(S.plan_note) + '</p>' +
        '<div class="pl-actions"><a class="btn btn-primary" href="tel:+2' + C.phone + '">' + svg('phone') + '<span>' + esc(S.call_confirm) + '</span></a>' +
        '<button type="button" class="btn btn-ghost" data-act="ics">' + svg('cal') + '<span>' + esc(S.add_cal) + '</span></button>' +
        '<button type="button" class="btn-link" data-act="copy">' + svg('copy') + '<span>' + esc(S.copy) + '</span></button></div>';
    }
    planner.innerHTML = '<div class="pl-card">' + h + '</div>';
    setSteps();
  }
  function go(step) { state.step = step; render(); var f = $('.opt, .sess, .btn', planner); if (f && step > 1) f.focus({ preventScroll: true }); }

  function summaryText() {
    var x = state.sess, type = TYPES.filter(function (o) { return o.id === state.type; })[0];
    return [S.brand + ' — ' + S.your_plan, S.visit + ': ' + type.t, S.doctor + ': ' + x.s.doc, S.session + ': ' + x.full + ' (' + x.s.time + ')',
      S.bring + ': ' + (S['bring_' + state.type] || []).join(' / '), S.addr_1 + ' ' + S.addr_2, C.phones.map(function (n) { n = String(n).replace(/\D/g, ''); return /^0\d{10}$/.test(n) ? '+20 ' + n.slice(1, 4) + ' ' + n.slice(4, 7) + ' ' + n.slice(7) : n; }).join(' / ')].join('\n');
  }
  function ics() {
    var x = state.sess, d = x.date, ymd = d.getUTCFullYear() + ('0' + (d.getUTCMonth() + 1)).slice(-2) + ('0' + d.getUTCDate()).slice(-2);
    var t = function (hhmm) { return ymd + 'T' + hhmm.replace(':', '') + '00'; };
    var e = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n'); };
    var type = TYPES.filter(function (o) { return o.id === state.type; })[0];
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Breathe Easy Clinic//Visit planner//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VTIMEZONE', 'TZID:Africa/Cairo', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0200', 'END:STANDARD', 'END:VTIMEZONE',
      'BEGIN:VEVENT', 'UID:' + ymd + '-' + state.type + '-' + Math.random().toString(36).slice(2) + '@breathe-easy-clinic', 'DTSTAMP:' + stamp,
      'DTSTART;TZID=Africa/Cairo:' + t(x.s.from), 'DTEND;TZID=Africa/Cairo:' + t(x.s.to),
      'SUMMARY:' + e(S.brand + ' · ' + type.t + ' · ' + x.s.doc),
      'LOCATION:' + e('THE CLINICS, Clinic 311, third floor, South 90th Street, Fifth Settlement, New Cairo'),
      'DESCRIPTION:' + e(summaryText()),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + e(S.brand), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'breathe-easy-visit-' + ymd + '.ics'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function copy(btnEl) {
    var txt = summaryText(), done = function () { var s = $('span', btnEl); s.textContent = S.copied; setTimeout(function () { s.textContent = S.copy; }, 2000); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, done);
    else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
  }
  if (planner) {
    planner.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.type) { state.type = b.dataset.type; if (state.type === 'bronch') { state.doc = 'hedya'; go(3); } else go(2); }
      else if (b.dataset.doc) { state.doc = b.dataset.doc; go(3); }
      else if (b.dataset.sess) { state.sess = state._list[+b.dataset.sess]; go(4); }
      else if (b.dataset.act === 'back') { go(state.step === 3 && state.type === 'bronch' ? 1 : state.step - 1); }
      else if (b.dataset.act === 'restart') { state = { step: 1 }; go(1); }
      else if (b.dataset.act === 'ics') ics();
      else if (b.dataset.act === 'copy') copy(b);
    });
    render();
  }

  /* ---------- 6. Checklist ---------- */
  var ck = $('#checklist');
  if (ck) {
    var boxes = $$('input[type=checkbox]', ck), KEY = 'be-checklist';
    var saved = []; try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) {}
    boxes.forEach(function (b) { b.checked = saved.indexOf(+b.dataset.i) > -1; });
    var upd = function () {
      var on = boxes.filter(function (b) { return b.checked; });
      $('#ckCount').textContent = num(on.length) + '/' + num(boxes.length);
      $('#ckBar').style.transform = 'scaleX(' + on.length / boxes.length + ')';
      ck.classList.toggle('complete', on.length === boxes.length);
      try { localStorage.setItem(KEY, JSON.stringify(on.map(function (b) { return +b.dataset.i; }))); } catch (e) {}
    };
    boxes.forEach(function (b) { b.addEventListener('change', upd); }); upd();
    $('#ckClear').addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); upd(); });
    $('#ckPrint').addEventListener('click', function () {
      document.body.classList.add('print-check'); window.print();
      setTimeout(function () { document.body.classList.remove('print-check'); }, 500);
    });
  }

  /* ---------- 7. Gallery lightbox ---------- */
  var lb = $('#lightbox'), cur = 0, lastFocus;
  function gItems() { return $$('.g-item'); }
  function show(i) {
    var items = gItems(); cur = (i + items.length) % items.length;
    var img = $('img', items[cur]);
    $('img', lb).src = img.currentSrc || img.src; $('img', lb).alt = img.alt;
    $('figcaption', lb).textContent = ($('figcaption', items[cur]) || {}).textContent || '';
  }
  function closeLb() { lb.hidden = true; document.body.classList.remove('lb-open'); if (lastFocus) lastFocus.focus(); }
  window.BE_prepGallery = function () { gItems().forEach(function (it) { it.tabIndex = 0; it.setAttribute('role', 'button'); }); };
  if (lb) {
    window.BE_prepGallery();
    var openIt = function (it) { lastFocus = it; show(gItems().indexOf(it)); lb.hidden = false; document.body.classList.add('lb-open'); $('.lb-close', lb).focus(); };
    document.addEventListener('click', function (e) { var it = e.target.closest && e.target.closest('.g-item'); if (it) openIt(it); });
    document.addEventListener('keydown', function (e) { var it = e.target.closest && e.target.closest('.g-item'); if (it && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openIt(it); } });
    var step = function (d) { show(cur + d); };
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') step(AR ? -1 : 1);
      if (e.key === 'ArrowLeft') step(AR ? 1 : -1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) step((dx < 0 ? 1 : -1) * (AR ? -1 : 1));
    });
  }
})();

/* ---------- 8. Hero video (plays only when allowed and visible) ---------- */
(function () {
  var v = document.querySelector('.hero-video');
  if (!v) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) { v.remove(); return; }
  var start = function () {
    v.play().then(function () { v.parentNode.classList.add('has-video'); }).catch(function () {});
  };
  v.addEventListener('canplay', function once() { v.removeEventListener('canplay', once); start(); });
  v.preload = 'auto'; v.load();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) v.play().catch(function () {}); else v.pause(); }); }).observe(v);
  }
})();

/* ---------- 9. Section background videos ---------- */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  document.querySelectorAll('.bg-video').forEach(function (v) {
    if (reduce || saveData || !('IntersectionObserver' in window)) return;
    var loaded = false, broken = false;
    // if the browser can't decode a video, keep showing the photo instead of a frozen frame
    function fail() { broken = true; v.pause(); v.classList.remove('on'); }
    v.addEventListener('error', fail);
    var srcs = v.querySelectorAll('source');
    if (srcs.length) srcs[srcs.length - 1].addEventListener('error', fail);
    new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) {
          if (broken) return;
          if (!loaded) { loaded = true; v.preload = 'auto'; v.load(); }
          v.play().then(function () { if (!v.error) v.classList.add('on'); }).catch(function () {});
        } else v.pause();
      });
    }, { rootMargin: '200px 0px' }).observe(v);
  });
})();

/* ---------- 10. Newsletter sign-up (saved in the clinic's Supabase database; only the admin can read it) ---------- */
(function () {
  var f = document.getElementById('nlForm'); if (!f) return;
  var C = window.CLINIC || {}, S = C.s || {}, msg = document.getElementById('nlMsg');
  var btn = f.querySelector('button[type=submit] span');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = f.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !f.consent.checked) {
      msg.className = 'nl-msg err'; msg.textContent = S.nl_bad; return;
    }
    if (f._honey.value) return;
    var cfg = window.BE_SUPA || {};
    if (!cfg.url || !cfg.key) { msg.className = 'nl-msg err'; msg.textContent = S.nl_err; return; }
    var data = { email: email.toLowerCase().slice(0, 254), name: ((f.elements.name && f.elements.name.value) || '').trim().slice(0, 80), lang: document.documentElement.lang === 'ar' ? 'ar' : 'en' };
    var H = { 'Content-Type': 'application/json', apikey: cfg.key, Prefer: 'return=minimal' };
    if (/^eyJ/.test(cfg.key)) H.Authorization = 'Bearer ' + cfg.key;
    f.classList.add('busy'); btn.textContent = S.nl_sending; msg.textContent = '';
    fetch(cfg.url.replace(/\/$/, '') + '/rest/v1/subscribers', { method: 'POST', headers: H, body: JSON.stringify(data) })
      .then(function (r) {
        var ok = r.ok || r.status === 409;   /* 409 = already subscribed: same thank-you message */
        msg.className = 'nl-msg ' + (ok ? 'ok' : 'err'); msg.textContent = ok ? S.nl_ok : S.nl_err;
        if (ok) { f.reset(); try { document.dispatchEvent(new CustomEvent('be:subscribed')); } catch (e2) {} }
      })
      .catch(function () { msg.className = 'nl-msg err'; msg.textContent = S.nl_err; })
      .then(function () { f.classList.remove('busy'); btn.textContent = S.nl_btn; });
  });
})();

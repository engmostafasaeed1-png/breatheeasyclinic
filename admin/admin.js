/* Breathe Easy — admin console (Supabase). Only users listed in public.admins can use it;
   the database itself enforces that (row level security), not just this page. */
(function () {
  'use strict';
  var cfg = window.BE_SUPA || {}, DEF = window.BE_DEFAULTS || {};
  var $ = function (q, el) { return (el || document).querySelector(q); };
  var $$ = function (q, el) { return Array.prototype.slice.call((el || document).querySelectorAll(q)); };
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- language ---------- */
  var AR_T = {
    setup_h: 'لوحة التحكم غير متصلة بعد', setup_p: 'لم تتم إضافة رابط ومفتاح Supabase إلى الموقع بعد. بعد إضافتهما تصبح هذه الصفحة صفحة دخول المسؤول.',
    login_h: 'لوحة تحكم العيادة', first_time: 'أول مرة؟ أنشئ حساب المسؤول', create_acc: 'إنشاء الحساب', back_login: 'لدي حساب بالفعل، تسجيل الدخول', login_p: 'سجّل الدخول بحساب المسؤول.', email: 'البريد الإلكتروني', password: 'كلمة المرور', sign_in: 'تسجيل الدخول',
    console: 'لوحة التحكم', tab_dash: 'الزوار', tab_news: 'شريط الأخبار', tab_photos: 'الصور', tab_settings: 'الإعدادات',
    view_site: 'عرض الموقع ↗', sign_out: 'تسجيل الخروج',
    dash_h: 'الزوار', dash_p: 'إحصاءات زيارات مجهولة الهوية من الموقع (بتوقيت القاهرة). زياراتك أنت من هذا الجهاز لا تُحتسب.',
    daily_h: 'الزوار يوميًا', show_table: 'عرض كجدول', pages_h: 'أكثر الصفحات زيارة', refs_h: 'من أين جاء الزوار', dev_h: 'الأجهزة', lang_h: 'اللغة',
    news_h: 'شريط الأخبار', news_p: 'الأخبار المفعّلة تتحرك في شريط أعلى الموقع لكل الزوار.',
    text_en: 'النص (إنجليزي)', text_ar: 'النص (عربي)', link: 'رابط (اختياري)', ends: 'إخفاء بعد تاريخ (اختياري)', order: 'الترتيب',
    show_now: 'إظهار على الموقع', save_news: 'حفظ الخبر', clear_form: 'تفريغ النموذج', news_list: 'كل الأخبار',
    photos_h: 'الصور', photos_p: 'الصور التي تضيفها تظهر في نهاية معرض الصور بالموقع. يتم تصغير الصور الكبيرة تلقائيًا.',
    choose_photo: 'اختر صورة', photo_hint: 'JPG أو PNG أو WebP', cap_en: 'التعليق (إنجليزي)', cap_ar: 'التعليق (عربي)', upload: 'رفع الصورة', photo_list: 'الصور المضافة',
    set_h: 'الإعدادات', set_p: 'تظهر التغييرات على الموقع خلال ثوانٍ. اترك الحقل فارغًا للإبقاء على القيمة الأصلية الظاهرة باللون الرمادي.',
    contact_h: 'التواصل', phone1: 'الهاتف ١', phone2: 'الهاتف ٢', whatsapp: 'رقم واتساب', social_h: 'التواصل الاجتماعي', addr_h: 'العنوان',
    addr1_en: 'سطر العنوان (إنجليزي)', addr1_ar: 'سطر العنوان (عربي)', addr2_en: 'الوصف والاتجاهات (إنجليزي)', addr2_ar: 'الوصف والاتجاهات (عربي)',
    land_en: 'علامة مميزة (إنجليزي)', land_ar: 'علامة مميزة (عربي)', save_set: 'حفظ الإعدادات',
    set_note: 'مواعيد العمل والأطباء ونصوص الصفحات جزء من تصميم الموقع، اطلبها من مطوّر الموقع.'
  };
  var EN_T = {};
  $$('[data-t]').forEach(function (el) { EN_T[el.getAttribute('data-t')] = el.textContent; });
  var M = {
    en: { bad_login: 'Email or password is incorrect.', not_admin: 'This account is not an admin.', saved: 'Saved', deleted: 'Deleted', err: 'Something went wrong: ',
      live: 'Online now', today: 'Visitors today', views_today: 'page views', period_v: 'Visitors', period_p: 'Page views', newv: 'New visitors', all: 'All time',
      last: 'last %d days', day: 'Day', visitors: 'Visitors', views: 'Views', none: 'No data yet. Visits will appear here as people open the website.',
      edit: 'Edit', del: 'Delete', hide: 'Hide', show: 'Show', on: 'Visible', off: 'Hidden', until: 'until', confirm_del: 'Delete this permanently?', need_text: 'Write the news in English or Arabic.',
      uploading: 'Uploading…', need_file: 'Choose a photo first.', bad_phone: 'Phone numbers should be 11 digits, e.g. 01xxxxxxxxx.', bad_url: 'Check the link, it must start with https://',
      direct: 'Direct / typed', acc_made: 'Account created. Tell Claude so it can be made an admin, then sign in.', acc_closed: 'New accounts are switched off. Ask the website developer.', weak: 'Use at least 10 characters for the password.', peak: 'Busiest day:', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop', en: 'English', ar: 'Arabic', signed: 'Signed in as ' },
    ar: { bad_login: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', not_admin: 'هذا الحساب ليس حساب مسؤول.', saved: 'تم الحفظ', deleted: 'تم الحذف', err: 'حدث خطأ: ',
      live: 'متصل الآن', today: 'زوار اليوم', views_today: 'مشاهدة صفحة', period_v: 'الزوار', period_p: 'مشاهدات الصفحات', newv: 'زوار جدد', all: 'منذ البداية',
      last: 'آخر %d يوم', day: 'اليوم', visitors: 'الزوار', views: 'المشاهدات', none: 'لا توجد بيانات بعد. ستظهر الزيارات هنا عندما يفتح الناس الموقع.',
      edit: 'تعديل', del: 'حذف', hide: 'إخفاء', show: 'إظهار', on: 'ظاهر', off: 'مخفي', until: 'حتى', confirm_del: 'حذف نهائي؟', need_text: 'اكتب الخبر بالعربية أو الإنجليزية.',
      uploading: 'جارٍ الرفع…', need_file: 'اختر صورة أولًا.', bad_phone: 'رقم الهاتف يجب أن يكون ١١ رقمًا مثل 01xxxxxxxxx.', bad_url: 'تأكد من الرابط، يجب أن يبدأ بـ https://',
      direct: 'مباشر / كتابة الرابط', acc_made: 'تم إنشاء الحساب. أخبر Claude ليتم تفعيله كمسؤول، ثم سجّل الدخول.', acc_closed: 'إنشاء حسابات جديدة متوقف. تواصل مع مطوّر الموقع.', weak: 'استخدم ١٠ أحرف على الأقل لكلمة المرور.', peak: 'أكثر يوم زيارة:', mobile: 'موبايل', tablet: 'تابلت', desktop: 'كمبيوتر', en: 'الإنجليزية', ar: 'العربية', signed: 'مسجّل باسم ' }
  };
  var lang = 'en';
  try { lang = localStorage.getItem('be-admin-lang') || ((navigator.language || '').slice(0, 2) === 'ar' ? 'ar' : 'en'); } catch (e) {}
  var m = function (k) { return M[lang][k] || k; };
  function setLang(l) {
    lang = l; try { localStorage.setItem('be-admin-lang', l); } catch (e) {}
    document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    $$('[data-t]').forEach(function (el) { var k = el.getAttribute('data-t'); el.textContent = (l === 'ar' ? AR_T[k] : EN_T[k]) || EN_T[k]; });
    $$('[data-lang-toggle]').forEach(function (b) { b.textContent = l === 'ar' ? 'English' : 'العربية'; });
    if (lastStats) renderStats(lastStats);
    if (sb && !$('#app').hidden) { loadNews(); loadPhotos(); }
  }
  $$('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { setLang(lang === 'ar' ? 'en' : 'ar'); }); });

  var toastT;
  function toast(msg, bad) { var t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' err' : ''); clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 2600); }
  function fail(e) { toast(m('err') + ((e && e.message) || e), true); console.error(e); }
  var nf = function (n) { return Number(n || 0).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB'); };

  /* ---------- start ---------- */
  var sb = null, lastStats = null;
  setLang(lang);
  if (!cfg.url || !cfg.key || !window.supabase) { $('#scrSetup').hidden = false; return; }
  sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true } });

  function showLogin(msg) { $('#app').hidden = true; $('#scrLogin').hidden = false; $('#loginMsg').textContent = msg || ''; }
  function enter(user) {
    sb.rpc('is_admin').then(function (r) {
      if (r.error || r.data !== true) { sb.auth.signOut(); showLogin(m('not_admin')); return; }
      try { localStorage.setItem('be-notrack', '1'); } catch (e) {}
      $('#scrLogin').hidden = true; $('#app').hidden = false;
      $('#whoami').textContent = m('signed') + (user.email || '');
      loadStats(); loadNews(); loadPhotos(); loadSettings();
    });
  }
  sb.auth.getSession().then(function (r) { var s = r.data && r.data.session; if (s) enter(s.user); else showLogin(); });

  var signUpMode = false;
  EN_T.first_time = 'First time? Create the admin account'; EN_T.create_acc = 'Create account'; EN_T.back_login = 'I already have an account. Sign in';
  $('#modeBtn').addEventListener('click', function () {
    signUpMode = !signUpMode; $('#loginMsg').textContent = '';
    var lb = $('#loginBtn'), mb = $('#modeBtn');
    lb.setAttribute('data-t', signUpMode ? 'create_acc' : 'sign_in'); mb.setAttribute('data-t', signUpMode ? 'back_login' : 'first_time');
    $('#loginForm').password.setAttribute('autocomplete', signUpMode ? 'new-password' : 'current-password');
    setLang(lang);
  });
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, btn = $('button[type=submit]', f); btn.disabled = true; $('#loginMsg').textContent = '';
    if (signUpMode) {
      if (f.password.value.length < 10) { btn.disabled = false; $('#loginMsg').textContent = m('weak'); return; }
      sb.auth.signUp({ email: f.email.value.trim(), password: f.password.value }).then(function (r) {
        btn.disabled = false; f.password.value = '';
        if (r.error) { $('#loginMsg').textContent = /not allowed|disabled/i.test(r.error.message) ? m('acc_closed') : m('err') + r.error.message; return; }
        sb.auth.signOut(); $('#loginMsg').textContent = m('acc_made'); $('#modeBtn').click(); $('#loginMsg').textContent = m('acc_made');
      });
      return;
    }
    sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value }).then(function (r) {
      btn.disabled = false; f.password.value = '';
      if (r.error) { $('#loginMsg').textContent = m('bad_login'); return; }
      enter(r.data.user);
    });
  });
  $('#signOut').addEventListener('click', function () { sb.auth.signOut().then(function () { showLogin(); }); });

  /* ---------- tabs ---------- */
  $$('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.tabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      $$('.panel').forEach(function (p) { p.hidden = p.id !== 'tab-' + b.dataset.tab; });
      if (b.dataset.tab === 'dash') loadStats();
    });
  });

  /* ---------- dashboard ---------- */
  var days = 30;
  $$('#range button').forEach(function (b) {
    b.addEventListener('click', function () { days = +b.dataset.days; $$('#range button').forEach(function (x) { x.classList.toggle('on', x === b); }); loadStats(); });
  });
  function loadStats() {
    sb.rpc('admin_stats', { p_days: days }).then(function (r) { if (r.error) return fail(r.error); lastStats = r.data; renderStats(r.data); });
  }
  function renderStats(s) {
    var lastLbl = m('last').replace('%d', nf(days));
    $('#kpis').innerHTML = [
      ['live', m('live'), s.live, ''],
      ['', m('today'), s.today.visitors, nf(s.today.views) + ' ' + m('views_today')],
      ['', m('period_v'), s.period.visitors, lastLbl],
      ['', m('period_p'), s.period.views, lastLbl],
      ['', m('newv'), s.period.new, lastLbl],
      ['', m('all'), s.all.visitors, nf(s.all.views) + ' ' + m('views_today')]
    ].map(function (k) { return '<div class="kpi ' + k[0] + '"><small>' + esc(k[1]) + '</small><b>' + nf(k[2]) + '</b><span>' + esc(k[3]) + '</span></div>'; }).join('');
    drawChart(s.daily || []);
    bars('#bPages', s.pages, function (k) { return k === '/' ? (lang === 'ar' ? 'الرئيسية (إنجليزي)' : 'Home (English)') : k === '/ar/' ? (lang === 'ar' ? 'الرئيسية (عربي)' : 'Home (Arabic)') : k; });
    bars('#bRefs', s.refs, function (k) { return k === 'direct' ? m('direct') : k; });
    bars('#bDev', s.devices, function (k) { return m(k); });
    bars('#bLang', s.langs, function (k) { return m(k); });
  }
  function bars(sel, rows, label) {
    rows = rows || [];
    if (!rows.length) { $(sel).innerHTML = '<p class="empty">' + esc(m('none')) + '</p>'; return; }
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; })), tot = rows.reduce(function (a, r) { return a + r.n; }, 0);
    $(sel).innerHTML = rows.map(function (r) {
      return '<div class="brow"><span class="k" title="' + esc(r.k) + '">' + esc(label(r.k)) + '</span><span class="n">' + nf(r.n) + ' · ' + Math.round(r.n / tot * 100) + '%</span><span class="track"><span class="fill" style="width:' + (r.n / max * 100).toFixed(1) + '%"></span></span></div>';
    }).join('');
  }
  function drawChart(data) {
    var box = $('#chart'), W = box.clientWidth || 600, H = 240, pl = 34, pr = 6, pt = 10, pb = 26;
    var total = data.reduce(function (a, d) { return a + d.visitors; }, 0);
    var peak = data.reduce(function (a, d) { return d.visitors > a.visitors ? d : a; }, data[0] || { visitors: 0, day: '' });
    $('#chartSum').textContent = peak.visitors ? m('peak') + ' ' + nf(peak.visitors) + ' · ' + peak.day : '';
    $('#chartTable').innerHTML = '<table><thead><tr><th>' + esc(m('day')) + '</th><th class="n">' + esc(m('visitors')) + '</th><th class="n">' + esc(m('views')) + '</th></tr></thead><tbody>' +
      data.slice().reverse().map(function (d) { return '<tr><td>' + esc(d.day) + '</td><td class="n">' + nf(d.visitors) + '</td><td class="n">' + nf(d.views) + '</td></tr>'; }).join('') + '</tbody></table>';
    if (!total) { box.innerHTML = '<p class="empty">' + esc(m('none')) + '</p>'; return; }
    var max = Math.max(1, Math.max.apply(null, data.map(function (d) { return d.visitors; })));
    var step = Math.pow(10, Math.floor(Math.log10(max))), nice = Math.ceil(max / step) * step; if (nice / step > 5) step *= 2; nice = Math.ceil(max / step) * step;
    var n = data.length, cw = (W - pl - pr) / n, bw = Math.max(2, cw - 2), ih = H - pt - pb;
    var rtl = lang === 'ar', X = function (i) { return rtl ? W - pr - (i + 1) * cw : pl + i * cw; };
    if (rtl) { pl = 6; pr = 34; X = function (i) { return W - pr - (i + 1) * cw; }; }
    var y = function (v) { return pt + ih - v / nice * ih; };
    var g = '<g class="grid">', ax = '<g class="axis">';
    for (var t = 0; t <= nice; t += step) { g += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>'; ax += '<text x="' + (rtl ? W - pr + 6 : pl - 6) + '" y="' + (y(t) + 4) + '" text-anchor="' + (rtl ? 'start' : 'end') + '">' + nf(t) + '</text>'; }
    var every = Math.ceil(n / 8), bars = '';
    data.forEach(function (d, i) {
      var x = X(i) + 1, h = d.visitors / nice * ih, top = pt + ih - h, r = Math.min(4, bw / 2, h);
      var path = h > 0 ? 'M' + x + ',' + (pt + ih) + 'V' + (top + r) + 'Q' + x + ',' + top + ' ' + (x + r) + ',' + top + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + top + ' ' + (x + bw) + ',' + (top + r) + 'V' + (pt + ih) + 'Z' : '';
      bars += '<rect class="hit" data-i="' + i + '" x="' + X(i) + '" y="' + pt + '" width="' + cw + '" height="' + ih + '"/>' + (path ? '<path class="bar" data-b="' + i + '" d="' + path + '"/>' : '');
      if (i % every === 0 || (i === n - 1 && (n - 1) % every >= every / 2)) ax += '<text x="' + (X(i) + cw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(d.day.slice(5).replace('-', '/')) + '</text>';
    });
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(m('visitors')) + '">' + g + '</g>' + ax + '</g>' + bars + '</svg><div class="tip" hidden></div>';
    var tip = $('.tip', box);
    $$('.hit', box).forEach(function (h) {
      h.addEventListener('mouseenter', function () {
        var i = +h.dataset.i, d = data[i];
        $$('.bar', box).forEach(function (b) { b.classList.toggle('hov', +b.dataset.b === i); });
        tip.innerHTML = '<b>' + esc(d.day) + '</b><br>' + esc(m('visitors')) + ': ' + nf(d.visitors) + ' · ' + esc(m('views')) + ': ' + nf(d.views);
        tip.hidden = false; tip.style.left = (X(i) + cw / 2) / W * 100 + '%'; tip.style.top = y(d.visitors) + 'px';
      });
      h.addEventListener('mouseleave', function () { tip.hidden = true; $$('.bar', box).forEach(function (b) { b.classList.remove('hov'); }); });
    });
  }
  var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (lastStats) drawChart(lastStats.daily || []); }, 200); });

  /* ---------- news ---------- */
  var newsRows = [];
  function loadNews() {
    sb.from('news').select('*').order('sort').order('created_at', { ascending: false }).then(function (r) {
      if (r.error) return fail(r.error);
      newsRows = r.data || [];
      $('#newsList').innerHTML = newsRows.length ? newsRows.map(function (n) {
        var expired = n.ends_at && new Date(n.ends_at) < new Date(), on = n.active && !expired;
        return '<div class="item' + (on ? '' : ' off') + '"><div><p>' + esc(n.text_en) + '</p>' + (n.text_ar ? '<p class="ar">' + esc(n.text_ar) + '</p>' : '') +
          '<p class="meta"><span class="pill' + (on ? '' : ' off') + '">' + esc(on ? m('on') : m('off')) + '</span>' + (n.ends_at ? ' · ' + esc(m('until')) + ' ' + esc(n.ends_at.slice(0, 10)) : '') + (n.link ? ' · ' + esc(n.link) : '') + '</p></div>' +
          '<div class="acts"><button class="btn sm ghost" data-act="edit" data-id="' + n.id + '">' + esc(m('edit')) + '</button><button class="btn sm ghost" data-act="toggle" data-id="' + n.id + '">' + esc(n.active ? m('hide') : m('show')) + '</button><button class="btn sm danger" data-act="del" data-id="' + n.id + '">' + esc(m('del')) + '</button></div></div>';
      }).join('') : '<p class="empty">—</p>';
    });
  }
  $('#newsList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = +b.dataset.id, n = newsRows.filter(function (x) { return x.id === id; })[0]; if (!n) return;
    if (b.dataset.act === 'edit') {
      var f = $('#newsForm'); f.id.value = n.id; f.text_en.value = n.text_en; f.text_ar.value = n.text_ar; f.link.value = n.link || '';
      f.ends_at.value = n.ends_at ? n.ends_at.slice(0, 10) : ''; f.sort.value = n.sort; f.active.checked = n.active; f.text_en.focus();
    } else if (b.dataset.act === 'toggle') {
      sb.from('news').update({ active: !n.active }).eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('saved')); loadNews(); });
    } else if (b.dataset.act === 'del' && confirm(m('confirm_del'))) {
      sb.from('news').delete().eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('deleted')); loadNews(); });
    }
  });
  function resetNews() { var f = $('#newsForm'); f.reset(); f.id.value = ''; f.active.checked = true; $('#newsMsg').textContent = ''; }
  $('#newsReset').addEventListener('click', resetNews);
  $('#newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#newsMsg');
    var row = { text_en: f.text_en.value.trim(), text_ar: f.text_ar.value.trim(), link: f.link.value.trim() || null, sort: +f.sort.value || 0, active: f.active.checked,
      ends_at: f.ends_at.value ? new Date(f.ends_at.value + 'T23:59:59+02:00').toISOString() : null };
    if (!row.text_en && !row.text_ar) { msg.className = 'form-msg err'; msg.textContent = m('need_text'); return; }
    if (row.link && !/^(https:\/\/|#|\/)/.test(row.link)) { msg.className = 'form-msg err'; msg.textContent = m('bad_url'); return; }
    var q = f.id.value ? sb.from('news').update(row).eq('id', +f.id.value) : sb.from('news').insert(row);
    q.then(function (r) { if (r.error) return fail(r.error); toast(m('saved')); resetNews(); loadNews(); });
  });

  /* ---------- photos ---------- */
  var photoRows = [];
  var fileIn = $('#photoForm input[type=file]'), prev = $('.drop-prev');
  fileIn.addEventListener('change', function () {
    var file = fileIn.files[0]; if (!file) { prev.hidden = true; return; }
    prev.src = URL.createObjectURL(file); prev.hidden = false;
  });
  ['dragenter', 'dragover'].forEach(function (ev) { $('#drop').addEventListener(ev, function () { $('#drop').classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { $('#drop').addEventListener(ev, function () { $('#drop').classList.remove('over'); }); });
  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('image')); }, 'image/webp', 0.84);
      };
      img.onerror = function () { rej(new Error('image')); };
      img.src = URL.createObjectURL(file);
    });
  }
  $('#photoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#photoMsg'), file = fileIn.files[0], btn = $('button[type=submit]', f);
    if (!file) { msg.className = 'form-msg err'; msg.textContent = m('need_file'); return; }
    btn.disabled = true; msg.className = 'form-msg'; msg.textContent = m('uploading');
    var path = new Date().toISOString().slice(0, 7) + '/' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)) + '.webp';
    shrink(file).then(function (blob) {
      return sb.storage.from('gallery').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    }).then(function (r) {
      if (r.error) throw r.error;
      var url = sb.storage.from('gallery').getPublicUrl(path).data.publicUrl;
      return sb.from('photos').insert({ path: path, url: url, caption_en: f.caption_en.value.trim(), caption_ar: f.caption_ar.value.trim() });
    }).then(function (r) {
      if (r.error) throw r.error;
      btn.disabled = false; msg.textContent = ''; f.reset(); prev.hidden = true; toast(m('saved')); loadPhotos();
    }).catch(function (err) { btn.disabled = false; msg.textContent = ''; fail(err); });
  });
  function loadPhotos() {
    sb.from('photos').select('*').order('sort').order('created_at', { ascending: false }).then(function (r) {
      if (r.error) return fail(r.error);
      photoRows = r.data || [];
      $('#photoList').innerHTML = photoRows.length ? photoRows.map(function (p) {
        return '<div class="ph-card' + (p.active ? '' : ' off') + '"><img src="' + esc(p.url) + '" alt="" loading="lazy"><div class="pb"><p>' + esc(p.caption_en || '—') + '</p>' + (p.caption_ar ? '<p dir="rtl">' + esc(p.caption_ar) + '</p>' : '') +
          '<div class="acts"><button class="btn sm ghost" data-act="toggle" data-id="' + p.id + '">' + esc(p.active ? m('hide') : m('show')) + '</button><button class="btn sm danger" data-act="del" data-id="' + p.id + '">' + esc(m('del')) + '</button></div></div></div>';
      }).join('') : '<p class="empty">—</p>';
    });
  }
  $('#photoList').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = +b.dataset.id, p = photoRows.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    if (b.dataset.act === 'toggle') sb.from('photos').update({ active: !p.active }).eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('saved')); loadPhotos(); });
    else if (b.dataset.act === 'del' && confirm(m('confirm_del'))) {
      sb.storage.from('gallery').remove([p.path]).then(function () { return sb.from('photos').delete().eq('id', id); })
        .then(function (r) { if (r.error) return fail(r.error); toast(m('deleted')); loadPhotos(); });
    }
  });

  /* ---------- settings ---------- */
  var FIELDS = ['email', 'whatsapp', 'facebook', 'instagram', 'addr_1_en', 'addr_1_ar', 'addr_2_en', 'addr_2_ar', 'landmark_en', 'landmark_ar'];
  function loadSettings() {
    var f = $('#setForm');
    f.phone1.placeholder = (DEF.phones || [])[0] || ''; f.phone2.placeholder = (DEF.phones || [])[1] || '';
    FIELDS.forEach(function (k) { if (f[k]) f[k].placeholder = DEF[k] || ''; });
    sb.from('settings').select('value').eq('key', 'site').maybeSingle().then(function (r) {
      if (r.error) return fail(r.error);
      var v = (r.data && r.data.value) || {};
      f.phone1.value = (v.phones || [])[0] || ''; f.phone2.value = (v.phones || [])[1] || '';
      FIELDS.forEach(function (k) { if (f[k]) f[k].value = v[k] || ''; });
    });
  }
  $('#setForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#setMsg'), v = {}, bad = '';
    var p1 = f.phone1.value.replace(/[^\d]/g, ''), p2 = f.phone2.value.replace(/[^\d]/g, ''), wa = f.whatsapp.value.replace(/[^\d]/g, '');
    [p1, p2, wa].forEach(function (p) { if (p && !/^01\d{9}$/.test(p)) bad = m('bad_phone'); });
    ['facebook', 'instagram'].forEach(function (k) { var u = f[k].value.trim(); if (u && !/^https:\/\//.test(u)) bad = m('bad_url'); });
    if (bad) { msg.className = 'form-msg err'; msg.textContent = bad; return; }
    if (p1 || p2) v.phones = [p1, p2];
    FIELDS.forEach(function (k) { var x = f[k].value.trim(); if (x) v[k] = k === 'whatsapp' ? wa : x; });
    msg.className = 'form-msg'; msg.textContent = '';
    sb.from('settings').upsert({ key: 'site', value: v, updated_at: new Date().toISOString() }).then(function (r) {
      if (r.error) return fail(r.error);
      msg.className = 'form-msg ok'; msg.textContent = m('saved') + ' ✓'; toast(m('saved'));
    });
  });
})();

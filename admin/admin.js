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
    login_h: 'لوحة تحكم العيادة', send_link: 'أرسل لي رابط تسجيل الدخول', code_lbl: 'أو اكتب الكود المكوّن من ٦ أرقام من البريد', code_btn: 'دخول بالكود', use_pw: 'تسجيل الدخول بكلمة مرور بدلًا من ذلك', first_time: 'أول مرة؟ أنشئ حساب المسؤول', create_acc: 'إنشاء الحساب', back_login: 'لدي حساب بالفعل، تسجيل الدخول', login_p: 'سجّل الدخول بحساب المسؤول.', email: 'البريد الإلكتروني', password: 'كلمة المرور', sign_in: 'تسجيل الدخول',
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
    set_note: 'مواعيد العمل والأطباء ونصوص الصفحات جزء من تصميم الموقع، اطلبها من مطوّر الموقع.',
    tab_subs: 'المشتركون', subs_h: 'المشتركون', subs_p: 'الأشخاص الذين اشتركوا في النشرة من الموقع. هذه القائمة تظهر لك فقط.',
    mail_h: 'راسل المشتركين', mail_p: 'اكتب الرسالة هنا ثم افتحها في Gmail أو تطبيق البريد. يُضاف المشتركون في خانة BCC فلا يرى أحدهم بريد الآخرين.',
    mail_to: 'إرسال إلى', aud_all: 'كل المشتركين النشطين', aud_en: 'المشتركون بالإنجليزية', aud_ar: 'المشتركون بالعربية', mail_subj: 'الموضوع', mail_body: 'الرسالة',
    mail_footer: 'إضافة ملاحظة إلغاء الاشتراك في نهاية الرسالة', use_news: 'استخدم آخر خبر', mk_mail: 'تجهيز الرسالة',
    subs_list: 'قائمة المشتركين', copy_emails: 'نسخ العناوين', dl_csv: 'تنزيل CSV', search: 'بحث', show_lbl: 'عرض', f_active: 'النشطون', f_all: 'الكل', f_off: 'ألغوا الاشتراك',
    name: 'الاسم', language: 'اللغة', joined: 'تاريخ الاشتراك', status: 'الحالة', add_sub: 'إضافة مشترك يدويًا', add: 'إضافة', add_note: 'أضف فقط من وافق على استلام أخبار العيادة.'
  };
  var EN_T = {};
  $$('[data-t]').forEach(function (el) { EN_T[el.getAttribute('data-t')] = el.textContent; });
  var M = {
    en: { bad_login: 'Email or password is incorrect.', not_admin: 'Signed in, but this account is not an admin yet. Ask your web developer to activate it.', need_email: 'Type your email address first.', link_sent2: 'Done. Open the NEWEST email from Supabase (check Spam) and click its link within a few minutes.', need_code: 'Type the 6-digit code from the email.', bad_code: 'That code is wrong or expired. Request a new email.', sending: 'Sending…', link_sent: 'Done. Check your email (and Spam): click the link, or type the code below.', saved: 'Saved', deleted: 'Deleted', err: 'Something went wrong: ',
      live: 'Online now', today: 'Visitors today', views_today: 'page views', period_v: 'Visitors', period_p: 'Page views', newv: 'New visitors', all: 'All time',
      last: 'last %d days', day: 'Day', visitors: 'Visitors', views: 'Views', none: 'No data yet. Visits will appear here as people open the website.',
      edit: 'Edit', del: 'Delete', hide: 'Hide', show: 'Show', on: 'Visible', off: 'Hidden', until: 'until', confirm_del: 'Delete this permanently?', need_text: 'Write the news in English or Arabic.',
      uploading: 'Uploading…', need_file: 'Choose a photo first.', bad_phone: 'Phone numbers should be 11 digits, e.g. 01xxxxxxxxx.', bad_url: 'Check the link, it must start with https://',
      direct: 'Direct / typed', acc_made: 'Account created. Tell Claude so it can be made an admin, then sign in.', acc_closed: 'New accounts are switched off. Ask the website developer.', weak: 'Use at least 10 characters for the password.', peak: 'Busiest day:', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop', en: 'English', ar: 'Arabic', signed: 'Signed in as ',
      s_total: 'Active subscribers', s_new: 'New in 30 days', s_en: 'English', s_ar: 'Arabic', s_off: 'unsubscribed', active: 'Active', unsub: 'Unsubscribed',
      do_unsub: 'Unsubscribe', do_resub: 'Re-activate', copied: 'Copied %d email addresses', none_subs: 'No subscribers yet. Sign-ups from the website form will appear here.',
      no_match: 'No subscribers match.', need_subj: 'Write a subject and a message.', no_aud: 'There are no active subscribers in this group.', batch: 'Group %d: %a to %b',
      gmail: 'Open in Gmail', mailapp: 'Open in email app', batch_note: 'Open each group, check the message, then press Send.', dup: 'This email is already on the list.', bad_email: 'Check the email address.',
      foot_en: 'You are receiving this email because you subscribed to Breathe Easy Clinic news at breatheeasyclinic.com. To stop these emails, reply with "unsubscribe".',
      foot_ar: 'تصلك هذه الرسالة لأنك اشتركت في أخبار عيادة تنفّس بسهولة على breatheeasyclinic.com. لإيقاف هذه الرسائل، رُد بكلمة «إلغاء الاشتراك».', no_news: 'There is no news item yet.' },
    ar: { bad_login: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', not_admin: 'تم تسجيل الدخول، لكن هذا الحساب لم يُفعَّل كمسؤول بعد. اطلب من مطوّر الموقع تفعيله.', need_email: 'اكتب بريدك الإلكتروني أولًا.', link_sent2: 'تم. افتح أحدث رسالة من Supabase (وراجع Spam) واضغط الرابط خلال دقائق.', need_code: 'اكتب الكود المكوّن من ٦ أرقام من البريد.', bad_code: 'الكود غير صحيح أو انتهت صلاحيته. اطلب رسالة جديدة.', sending: 'جارٍ الإرسال…', link_sent: 'تم. افتح بريدك (وراجع Spam): اضغط الرابط أو اكتب الكود بالأسفل.', saved: 'تم الحفظ', deleted: 'تم الحذف', err: 'حدث خطأ: ',
      live: 'متصل الآن', today: 'زوار اليوم', views_today: 'مشاهدة صفحة', period_v: 'الزوار', period_p: 'مشاهدات الصفحات', newv: 'زوار جدد', all: 'منذ البداية',
      last: 'آخر %d يوم', day: 'اليوم', visitors: 'الزوار', views: 'المشاهدات', none: 'لا توجد بيانات بعد. ستظهر الزيارات هنا عندما يفتح الناس الموقع.',
      edit: 'تعديل', del: 'حذف', hide: 'إخفاء', show: 'إظهار', on: 'ظاهر', off: 'مخفي', until: 'حتى', confirm_del: 'حذف نهائي؟', need_text: 'اكتب الخبر بالعربية أو الإنجليزية.',
      uploading: 'جارٍ الرفع…', need_file: 'اختر صورة أولًا.', bad_phone: 'رقم الهاتف يجب أن يكون ١١ رقمًا مثل 01xxxxxxxxx.', bad_url: 'تأكد من الرابط، يجب أن يبدأ بـ https://',
      direct: 'مباشر / كتابة الرابط', acc_made: 'تم إنشاء الحساب. أخبر Claude ليتم تفعيله كمسؤول، ثم سجّل الدخول.', acc_closed: 'إنشاء حسابات جديدة متوقف. تواصل مع مطوّر الموقع.', weak: 'استخدم ١٠ أحرف على الأقل لكلمة المرور.', peak: 'أكثر يوم زيارة:', mobile: 'موبايل', tablet: 'تابلت', desktop: 'كمبيوتر', en: 'الإنجليزية', ar: 'العربية', signed: 'مسجّل باسم ',
      s_total: 'المشتركون النشطون', s_new: 'جدد خلال ٣٠ يومًا', s_en: 'الإنجليزية', s_ar: 'العربية', s_off: 'ألغوا الاشتراك', active: 'نشط', unsub: 'ألغى الاشتراك',
      do_unsub: 'إلغاء الاشتراك', do_resub: 'إعادة التفعيل', copied: 'تم نسخ %d عنوان بريد', none_subs: 'لا يوجد مشتركون بعد. ستظهر هنا الاشتراكات من نموذج الموقع.',
      no_match: 'لا يوجد مشتركون مطابقون.', need_subj: 'اكتب الموضوع والرسالة.', no_aud: 'لا يوجد مشتركون نشطون في هذه المجموعة.', batch: 'المجموعة %d: من %a إلى %b',
      gmail: 'فتح في Gmail', mailapp: 'فتح في تطبيق البريد', batch_note: 'افتح كل مجموعة وراجع الرسالة ثم اضغط إرسال.', dup: 'هذا البريد موجود بالفعل في القائمة.', bad_email: 'تأكد من عنوان البريد.',
      foot_en: 'You are receiving this email because you subscribed to Breathe Easy Clinic news at breatheeasyclinic.com. To stop these emails, reply with "unsubscribe".',
      foot_ar: 'تصلك هذه الرسالة لأنك اشتركت في أخبار عيادة تنفّس بسهولة على breatheeasyclinic.com. لإيقاف هذه الرسائل، رُد بكلمة «إلغاء الاشتراك».', no_news: 'لا يوجد خبر بعد.' }
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
    if (sb && !$('#app').hidden) { loadNews(); loadPhotos(); renderSubs(); }
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
  sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' } });
  sb.auth.onAuthStateChange(function (ev, session) { if (ev === 'SIGNED_IN' && session && $('#app').hidden) enter(session.user); });

  function showLogin(msg) { $('#app').hidden = true; $('#scrLogin').hidden = false; $('#loginMsg').textContent = msg || ''; }
  function enter(user) {
    sb.rpc('is_admin').then(function (r) {
      if (r.error || r.data !== true) { var em = user.email || ''; sb.auth.signOut(); showLogin(m('not_admin') + ' (' + em + ')'); return; }
      try { localStorage.setItem('be-notrack', '1'); } catch (e) {}
      $('#scrLogin').hidden = true; $('#app').hidden = false;
      $('#whoami').textContent = m('signed') + (user.email || '');
      loadStats(); loadNews(); loadPhotos(); loadSettings(); loadSubs();
    });
  }
  sb.auth.getSession().then(function (r) { var s = r.data && r.data.session; if (s) enter(s.user); else showLogin(); });

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, btn = $('button[type=submit]', f); btn.disabled = true; $('#loginMsg').textContent = '';
    sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value }).then(function (r) {
      btn.disabled = false; f.password.value = '';
      if (r.error) { $('#loginMsg').textContent = m('bad_login'); return; }
      enter(r.data.user);
    });
  });
  EN_T.send_link = 'Email me a sign-in link'; EN_T.use_pw = 'Sign in with a password instead';
  $('#linkBtn').addEventListener('click', function () {
    var f = $('#loginForm'), email = f.email.value.trim(), btn = $('#linkBtn'), msg = $('#loginMsg');
    msg.className = 'form-msg';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = m('need_email'); f.email.focus(); return; }
    btn.disabled = true; msg.textContent = m('sending');
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + '/admin/', shouldCreateUser: true } }).then(function (r) {
      btn.disabled = false;
      if (r.error) { msg.className = 'form-msg err'; msg.textContent = m('err') + r.error.message; return; }
      msg.className = 'form-msg ok'; msg.textContent = m('link_sent2');
    });
  });
  EN_T.code_lbl = 'Or type the 6-digit code from the email'; EN_T.code_btn = 'Sign in with code';
  $('#codeBtn').addEventListener('click', function () {
    var f = $('#loginForm'), code = f.code.value.replace(/\D/g, ''), msg = $('#loginMsg'), btn = $('#codeBtn');
    if (code.length < 6) { msg.className = 'form-msg err'; msg.textContent = m('need_code'); return; }
    btn.disabled = true;
    sb.auth.verifyOtp({ email: f.email.value.trim(), token: code, type: 'email' }).then(function (r) {
      btn.disabled = false;
      if (r.error) { msg.className = 'form-msg err'; msg.textContent = m('bad_code'); return; }
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
      if (b.dataset.tab === 'subs') loadSubs();
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
      var f = $('#newsForm'); f.elements.id.value = n.id; f.text_en.value = n.text_en; f.text_ar.value = n.text_ar; f.link.value = n.link || '';
      f.ends_at.value = n.ends_at ? n.ends_at.slice(0, 10) : ''; f.sort.value = n.sort; f.active.checked = n.active; f.text_en.focus();
    } else if (b.dataset.act === 'toggle') {
      sb.from('news').update({ active: !n.active }).eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('saved')); loadNews(); });
    } else if (b.dataset.act === 'del' && confirm(m('confirm_del'))) {
      sb.from('news').delete().eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('deleted')); loadNews(); });
    }
  });
  function resetNews() { var f = $('#newsForm'); f.reset(); f.elements.id.value = ''; f.active.checked = true; $('#newsMsg').textContent = ''; }
  $('#newsReset').addEventListener('click', resetNews);
  $('#newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#newsMsg');
    var row = { text_en: f.text_en.value.trim(), text_ar: f.text_ar.value.trim(), link: f.link.value.trim() || null, sort: +f.sort.value || 0, active: f.active.checked,
      ends_at: f.ends_at.value ? new Date(f.ends_at.value + 'T23:59:59+02:00').toISOString() : null };
    if (!row.text_en && !row.text_ar) { msg.className = 'form-msg err'; msg.textContent = m('need_text'); return; }
    if (row.link && !/^(https:\/\/|#|\/)/.test(row.link)) { msg.className = 'form-msg err'; msg.textContent = m('bad_url'); return; }
    var q = f.elements.id.value ? sb.from('news').update(row).eq('id', +f.elements.id.value) : sb.from('news').insert(row);
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

  /* ---------- subscribers ---------- */
  var subRows = [];
  function loadSubs() {
    sb.from('subscribers').select('*').order('created_at', { ascending: false }).then(function (r) {
      if (r.error) return fail(r.error);
      subRows = r.data || []; renderSubs();
    });
  }
  function fmtDate(t) { return new Date(t).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function visibleSubs() {
    var q = ($('#subSearch').value || '').trim().toLowerCase(), f = $('#subFilter').value;
    return subRows.filter(function (x) {
      if (f === 'active' && !x.active) return false;
      if (f === 'off' && x.active) return false;
      return !q || x.email.indexOf(q) > -1 || (x.name || '').toLowerCase().indexOf(q) > -1;
    });
  }
  function renderSubs() {
    if (!$('#subRows')) return;
    var act = subRows.filter(function (x) { return x.active; }), since = Date.now() - 30 * 864e5;
    $('#subKpis').innerHTML = [
      [m('s_total'), act.length, nf(subRows.length - act.length) + ' ' + m('s_off')],
      [m('s_new'), act.filter(function (x) { return new Date(x.created_at) > since; }).length, ''],
      [m('s_en'), act.filter(function (x) { return x.lang === 'en'; }).length, ''],
      [m('s_ar'), act.filter(function (x) { return x.lang === 'ar'; }).length, '']
    ].map(function (k) { return '<div class="kpi"><small>' + esc(k[0]) + '</small><b>' + nf(k[1]) + '</b><span>' + esc(k[2]) + '</span></div>'; }).join('');
    var rows = visibleSubs();
    $('#subRows').innerHTML = rows.length ? rows.map(function (x) {
      return '<tr class="' + (x.active ? '' : 'off') + '"><td class="em"><a href="mailto:' + esc(x.email) + '">' + esc(x.email) + '</a></td><td>' + esc(x.name || '—') + '</td><td>' + esc(m(x.lang)) + '</td><td>' + esc(fmtDate(x.created_at)) + '</td>' +
        '<td><span class="pill' + (x.active ? '' : ' off') + '">' + esc(x.active ? m('active') : m('unsub')) + '</span></td>' +
        '<td class="act"><button class="btn sm ghost" type="button" data-act="toggle" data-id="' + x.id + '">' + esc(x.active ? m('do_unsub') : m('do_resub')) + '</button><button class="btn sm danger" type="button" data-act="del" data-id="' + x.id + '">' + esc(m('del')) + '</button></td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">' + esc(subRows.length ? m('no_match') : m('none_subs')) + '</td></tr>';
  }
  $('#subSearch').addEventListener('input', renderSubs);
  $('#subFilter').addEventListener('change', renderSubs);
  $('#subRows').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = +b.dataset.id, x = subRows.filter(function (r) { return r.id === id; })[0]; if (!x) return;
    if (b.dataset.act === 'toggle') sb.from('subscribers').update({ active: !x.active }).eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('saved')); loadSubs(); });
    else if (b.dataset.act === 'del' && confirm(m('confirm_del') + '\n' + x.email)) sb.from('subscribers').delete().eq('id', id).then(function (r) { if (r.error) return fail(r.error); toast(m('deleted')); loadSubs(); });
  });
  $('#subCopy').addEventListener('click', function () {
    var list = visibleSubs().map(function (x) { return x.email; });
    var done = function () { toast(m('copied').replace('%d', nf(list.length))); };
    if (navigator.clipboard) navigator.clipboard.writeText(list.join(', ')).then(done, function () { prompt('', list.join(', ')); });
    else prompt('', list.join(', '));
  });
  $('#subCsv').addEventListener('click', function () {
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    var csv = '﻿' + ['email,name,language,subscribed,status'].concat(visibleSubs().map(function (x) {
      return [x.email, x.name, x.lang, x.created_at.slice(0, 10), x.active ? 'active' : 'unsubscribed'].map(q).join(',');
    })).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'breathe-easy-subscribers-' + new Date().toISOString().slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  });
  $('#addSub').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, em = f.email.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return toast(m('bad_email'), true);
    sb.from('subscribers').insert({ email: em, name: f.elements.name.value.trim(), lang: f.elements.lang.value, source: 'admin' }).then(function (r) {
      if (r.error) return r.error.code === '23505' ? toast(m('dup'), true) : fail(r.error);
      f.reset(); toast(m('saved')); loadSubs();
    });
  });
  /* compose: subscribers go in BCC, split into groups so the link stays short enough for Gmail and mail apps */
  $('#useNews').addEventListener('click', function () {
    var n = newsRows.filter(function (x) { return x.active; })[0] || newsRows[0], f = $('#mailForm');
    if (!n) return toast(m('no_news'), true);
    var aud = f.aud.value, txt = aud === 'ar' ? (n.text_ar || n.text_en) : aud === 'en' ? (n.text_en || n.text_ar) : [n.text_ar, n.text_en].filter(Boolean).join('\n\n');
    if (!f.subject.value) f.subject.value = aud === 'en' ? 'News from Breathe Easy Clinic' : aud === 'ar' ? 'أخبار عيادة تنفّس بسهولة' : 'أخبار عيادة تنفّس بسهولة | Breathe Easy Clinic news';
    f.body.value = txt + (n.link ? '\n\n' + (/^https?:/.test(n.link) ? n.link : 'https://breatheeasyclinic.com/' + n.link.replace(/^\//, '')) : '') + '\n\nhttps://breatheeasyclinic.com';
  });
  $('#mkMail').addEventListener('click', function () {
    var f = $('#mailForm'), out = $('#mailBatches'), aud = f.aud.value, subj = f.subject.value.trim(), body = f.body.value.trim();
    out.innerHTML = '';
    if (!subj || !body) { $('#mailMsg').className = 'form-msg err'; $('#mailMsg').textContent = m('need_subj'); return; }
    var list = subRows.filter(function (x) { return x.active && (aud === 'all' || x.lang === aud); }).map(function (x) { return x.email; });
    if (!list.length) { $('#mailMsg').className = 'form-msg err'; $('#mailMsg').textContent = m('no_aud'); return; }
    $('#mailMsg').className = 'form-msg'; $('#mailMsg').textContent = m('batch_note');
    if (f.footer.checked) body += '\n\n—\n' + (aud === 'en' ? M.en.foot_en : aud === 'ar' ? M.ar.foot_ar : M.ar.foot_ar + '\n' + M.en.foot_en);
    var to = DEF.email || '', SIZE = 40, html = '', enc = encodeURIComponent;
    for (var i = 0; i < list.length; i += SIZE) {
      var bcc = list.slice(i, i + SIZE).join(',');
      var gm = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + enc(to) + '&bcc=' + enc(bcc) + '&su=' + enc(subj) + '&body=' + enc(body);
      var mt = 'mailto:' + enc(to) + '?bcc=' + enc(bcc) + '&subject=' + enc(subj) + '&body=' + enc(body);
      html += '<div class="batch"><b>' + esc(m('batch').replace('%d', i / SIZE + 1).replace('%a', nf(i + 1)).replace('%b', nf(Math.min(i + SIZE, list.length)))) + '</b>' +
        '<a class="btn sm" target="_blank" rel="noopener" href="' + esc(gm) + '">' + esc(m('gmail')) + '</a><a class="btn sm ghost" href="' + esc(mt) + '">' + esc(m('mailapp')) + '</a></div>';
    }
    out.innerHTML = html;
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

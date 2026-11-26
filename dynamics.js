/* Breathe Easy — extra motion: airflow particles, headline reveal, parallax,
   magnetic buttons, marquee and a "breathe with us" pacer. All off for reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var AR = document.documentElement.lang === 'ar';

  /* 1. Headline: words rise in one by one */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce && AR) { h1.classList.add("rise"); }
  else if (h1 && !reduce) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.setAttribute('aria-label', h1.textContent.trim());
    h1.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="animation-delay:' + (0.15 + i * 0.09).toFixed(2) + 's">' + w + '</span></span>';
    }).join(' ');
    h1.classList.add('h1-split');
  }

  /* 2. Airflow particles behind the hero */
  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    var cv = document.createElement('canvas');
    cv.className = 'airflow'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild);
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), P = [], mouse = { x: -1e3, y: -1e3 }, t = 0, running = true;
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, W / 18));
      P = []; for (var i = 0; i < n; i++) P.push(spawn(true));
    }
    function spawn(any) {
      return { x: any ? Math.random() * W : (AR ? W + 10 : -10), y: Math.random() * H,
        r: 1 + Math.random() * 2.6, s: 0.25 + Math.random() * 0.6, ph: Math.random() * 6.28,
        a: 0.15 + Math.random() * 0.35, g: Math.random() < 0.7 };
    }
    function frame() {
      if (!running) return;
      t += 0.012;
      var breath = (Math.sin(t * 1.1) + 1) / 2; // slow inhale / exhale rhythm
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        var dir = AR ? -1 : 1;
        p.x += dir * p.s * (0.6 + breath * 0.9);
        p.y += Math.sin(t * 2 + p.ph) * 0.35;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.2; p.x += dx / 60 * f; p.y += dy / 60 * f; }
        if ((dir > 0 && p.x > W + 10) || (dir < 0 && p.x < -10)) P[i] = spawn(false);
        ctx.beginPath();
        ctx.fillStyle = p.g ? 'rgba(76,174,28,' + (p.a * (0.6 + breath * 0.4)) + ')' : 'rgba(12,42,77,' + p.a * 0.5 + ')';
        ctx.arc(p.x, p.y, p.r * (0.8 + breath * 0.4), 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size(); frame();
    window.addEventListener('resize', size);
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -1e3; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting; if (vis && !running) { running = true; frame(); } else if (!vis) running = false;
    }).observe(hero);
  }

  /* 3. Gentle parallax on banners and the hero image */
  var px = Array.prototype.slice.call(document.querySelectorAll('.banner img, .panel-img img, .hero-img'));
  if (px.length && !reduce) {
    var ticking = false;
    function para() {
      var vh = window.innerHeight;
      px.forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
        var k = el.classList.contains('hero-img') ? -0.06 : 0.08;
        var y = ((r.top + r.height / 2) - vh / 2) * k;
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(para); } }, { passive: true });
    para();
  }

  /* 4. Magnetic primary buttons (mouse only) */
  if (finePointer && !reduce) {
    document.querySelectorAll('.btn-primary, .sub-btn, .phone').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* 5. Breathe-with-us pacer */
  var pacer = document.getElementById('pacer');
  if (pacer) {
    var btn = pacer.querySelector('button'), label = pacer.querySelector('.pc-label'), timer = null, phase = 0;
    var L = JSON.parse(pacer.getAttribute('data-labels'));
    function stop() { clearInterval(timer); timer = null; pacer.classList.remove('on', 'in', 'out'); label.textContent = L.start; btn.setAttribute('aria-pressed', 'false'); }
    function step() { phase = 1 - phase; pacer.classList.toggle('in', phase === 1); pacer.classList.toggle('out', phase === 0); label.textContent = phase ? L.inhale : L.exhale; }
    btn.addEventListener('click', function () {
      if (timer) return stop();
      pacer.classList.add('on'); btn.setAttribute('aria-pressed', 'true'); phase = 0; step();
      timer = setInterval(step, 4000);
      setTimeout(function () { if (timer) stop(); }, 60000);
    });
  }
  /* ===== Dynamics v2 ===== */
  /* 6. Breathing back-to-top button with a scroll-progress ring */
  var top = document.createElement('button'); top.className = 'to-top'; top.type = 'button';
  top.setAttribute('aria-label', AR ? 'العودة إلى الأعلى' : 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="tt-track" cx="22" cy="22" r="19"/><circle class="tt-ring" cx="22" cy="22" r="19"/><path d="M22 29V15m-6 6 6-6 6 6"/></svg>';
  document.body.appendChild(top);
  var ring = top.querySelector('.tt-ring'), CIRC = 2 * Math.PI * 19; ring.style.strokeDasharray = CIRC.toFixed(1);
  var sTick = false;
  function prog() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight, p = max > 0 ? h.scrollTop / max : 0;
    ring.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
    top.classList.toggle('show', h.scrollTop > 700);
    sTick = false;
  }
  window.addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(prog); } }, { passive: true });
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  prog();

  /* 7. Air ripples leaving the hero lungs */
  var hv = document.querySelector('.hero-visual');
  if (hv && !reduce) {
    for (var k = 0; k < 3; k++) { var rp = document.createElement('span'); rp.className = 'air-ripple'; rp.style.animationDelay = (k * 2.4) + 's'; rp.setAttribute('aria-hidden', 'true'); hv.insertBefore(rp, hv.firstChild); }
  }

  /* 8. 3D tilt + glare on cards, doctors, gallery and hours (mouse only) */
  if (finePointer && !reduce) {
    document.querySelectorAll('.card, .doc, .g-item, .day').forEach(function (c) {
      c.classList.add('tilt');
      var lift = c.classList.contains('card') ? -6 : -3, amp = c.classList.contains('doc') ? 2.5 : 6;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) translateY(' + lift + 'px) rotateX(' + (-y * amp).toFixed(2) + 'deg) rotateY(' + (x * amp).toFixed(2) + 'deg)';
        c.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%'); c.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* 9. Section titles: a green underline swipes in when they appear */
  var heads = document.querySelectorAll('.sec-head h2, .faq-title, .about-grid h2, .nl-grid h2, .plan-grid h2, .contact-grid h2');
  Array.prototype.forEach.call(heads, function (h) { h.classList.add('swipe'); });
  if ('IntersectionObserver' in window && !reduce) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('drawn'); sio.unobserve(e.target); } }); }, { threshold: 0.6 });
    Array.prototype.forEach.call(heads, function (h) { sio.observe(h); });
  } else Array.prototype.forEach.call(heads, function (h) { h.classList.add('drawn'); });

  /* 10. Hours days and FAQ answers arrive one after another */
  document.querySelectorAll('.week .day').forEach(function (el, i) { el.style.setProperty('--d', (200 + i * 90) + 'ms'); el.classList.add('stagger'); });
  document.querySelectorAll('.faq-group').forEach(function (g) {
    Array.prototype.forEach.call(g.querySelectorAll('.qa'), function (el, i) { el.style.setProperty('--d', (200 + i * 110) + 'ms'); el.classList.add('stagger'); });
  });

  /* 11. Follow a breath: scroll-driven airway story */
  var jr = document.getElementById('journey');
  if (jr) {
    var jSteps = jr.querySelectorAll('.jr-step'), jAirs = jr.querySelectorAll('.jr-air'), jAlv = jr.querySelectorAll('.jr-alv'), jList = jr.querySelector('.jr-steps');
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; }, jt = false;
    function jUpd() {
      var vh = window.innerHeight, mid = vh * (window.innerWidth < 861 ? 0.72 : 0.55), r = jList.getBoundingClientRect();
      var p = reduce ? 1 : clamp((mid - r.top) / r.height);
      Array.prototype.forEach.call(jAirs, function (a) { var s0 = +a.dataset.a, s1 = +a.dataset.b; a.style.strokeDashoffset = (1 - clamp((p - s0) / (s1 - s0))).toFixed(3); });
      Array.prototype.forEach.call(jAlv, function (g, i) { var f = clamp((p - 0.5 - (i % 3) * 0.025) / 0.14); g.style.opacity = (0.12 + 0.88 * f).toFixed(2); g.style.transform = 'scale(' + (0.55 + 0.45 * f).toFixed(2) + ')'; });
      var st = 0;
      Array.prototype.forEach.call(jSteps, function (s, i) { if (s.getBoundingClientRect().top < mid) st = i + 1; });
      if (reduce) st = 4;
      jr.setAttribute('data-stage', st);
      Array.prototype.forEach.call(jSteps, function (s, i) { s.classList.toggle('on', reduce || i + 1 === st); });
      jt = false;
    }
    window.addEventListener('scroll', function () { if (!jt) { jt = true; requestAnimationFrame(jUpd); } }, { passive: true });
    window.addEventListener('resize', jUpd);
    jUpd();
    /* breath counter: ~15 breaths a minute, lungs gently inflate with each one */
    var jc = jr.querySelector('.jr-count'), n = 0, nf = AR ? new Intl.NumberFormat('ar-EG') : new Intl.NumberFormat('en-GB');
    setInterval(function () {
      n++; jc.textContent = nf.format(n);
      if (!reduce) { jr.classList.add('puff'); setTimeout(function () { jr.classList.remove('puff'); }, 1800); }
    }, 4000);
  }

})();

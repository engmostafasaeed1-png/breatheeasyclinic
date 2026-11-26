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
    h1.classList.add('split');
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
})();

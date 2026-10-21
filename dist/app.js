(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.07 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  let toastTimer;
  function toast(text) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
  }
  document.getElementById('reaction-button')?.addEventListener('click', e => {
    e.currentTarget.textContent = 'Реакция поставлена ♥'; e.currentTarget.disabled = true;
    toast('Бахрам одобрил. Можно продолжать дружить.');
  });
  let okayIndex = 0;
  const okayPhrases = ['Мнение принято. Обсуждение закрыто.', 'Эмоциональный диапазон: безграничный.', 'Ещё одно «ок». Коллекция пополняется.', 'Да, Бахрам. Мы тебя тоже любим.'];
  document.getElementById('okay-button')?.addEventListener('click', () => {
    document.getElementById('okay-caption').textContent = okayPhrases[okayIndex++ % okayPhrases.length];
  });
  document.getElementById('hug-button')?.addEventListener('click', e => {
    e.currentTarget.innerHTML = 'Обнял крепко <span>♥</span>';
    document.getElementById('hug-answer').textContent = 'Ок ❤️';
    document.querySelector('.letter')?.classList.add('hugged');
  });

  document.querySelectorAll('.power').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) document.querySelectorAll('.power').forEach(other => { if (other !== detail) other.open = false; });
  }));

  const canvas = document.getElementById('web');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, frame = 0, visible = true;
  let pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
  const finePointer = matchMedia('(pointer:fine)');
  function resize() {
    width = hero.clientWidth; height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function point(r, a, ring) {
    const warp = Math.sin(a * 3 + ring * 0.6) * 0.018;
    return { x: width * 0.71 + smooth.x * 16 + Math.cos(a + warp) * r,
      y: height * 0.4 + smooth.y * 13 + Math.sin(a + warp) * r * 0.89 };
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const rays = 22, max = Math.max(width, height) * 1.2;
    ctx.lineWidth = 0.65;
    for (let ray = 0; ray < rays; ray++) {
      const a = ray * Math.PI * 2 / rays;
      const c = point(22, a, 0), p = point(max, a, 0);
      ctx.strokeStyle = `rgba(190,119,94,${ray % 3 === 0 ? 0.25 : 0.12})`;
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    for (let ring = 1; ring <= 15; ring++) {
      const radius = 22 + Math.pow(ring / 15, 1.5) * max;
      ctx.strokeStyle = `rgba(184,119,97,${0.16 - ring * 0.004})`;
      ctx.beginPath();
      for (let ray = 0; ray <= rays; ray++) {
        const a = ray * Math.PI * 2 / rays, p = point(radius, a, ring);
        if (!ray) ctx.moveTo(p.x, p.y);
        else { const previous = point(radius, a - Math.PI * 2 / rays, ring); const inward = point(radius * 0.93, a - Math.PI / rays, ring); ctx.quadraticCurveTo(inward.x, inward.y, p.x, p.y); }
      }
      ctx.closePath(); ctx.stroke();
    }
  }
  function animate() {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) return;
    smooth.x += (pointer.x - smooth.x) * 0.055; smooth.y += (pointer.y - smooth.y) * 0.055;
    document.getElementById('hero-visual').style.setProperty('--px', `${smooth.x * 9}px`);
    document.getElementById('hero-visual').style.setProperty('--py', `${smooth.y * 6}px`);
    draw();
    if (Math.abs(pointer.x - smooth.x) + Math.abs(pointer.y - smooth.y) > 0.002) frame = requestAnimationFrame(animate);
  }
  function start() { if (!frame && !reduced.matches && visible && !document.hidden) frame = requestAnimationFrame(animate); }
  hero.addEventListener('pointermove', e => { if (!finePointer.matches) return; const box = hero.getBoundingClientRect(); pointer = { x: (e.clientX - box.left) / width - 0.5, y: (e.clientY - box.top) / height - 0.5 }; start(); });
  hero.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; start(); });
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start(); });
  reduced.addEventListener('change', () => { if (reduced.matches) { pointer = smooth = { x: 0, y: 0 }; cancelAnimationFrame(frame); frame = 0; document.getElementById('hero-visual').style.cssText = ''; draw(); } else start(); });
})();

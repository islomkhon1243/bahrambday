(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const entry = $('entry'), form = $('entry-form'), answer = $('entry-answer');
  const archive = $('archive'), grid = $('photo-grid'), viewer = $('photo-viewer');
  const data = (window.BAHRAM_GALLERY || []).map((frame, i) => ({...frame, id:i,
    width: Number(frame.width) > 0 ? Number(frame.width) : 3,
    height: Number(frame.height) > 0 ? Number(frame.height) : 4,
    title: frame.title || `Кадр ${i + 1}`, alt: frame.alt || `Фотография ${i + 1}`}));
  const pad = value => String(value).padStart(2, '0');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let unlocked = false, built = false, current = 0, renderRequest = 0, opener;
  let timer, autoplay = false, touchStart = null, unlocking = false;
  function placeholder(frame) {
    const el = document.createElement('div');
    el.className = 'empty-photo';
    el.style.setProperty('--ratio', `${frame.width}/${frame.height}`);
    el.style.setProperty('--hue', String(335 + frame.id % 6 * 7));
    const number = document.createElement('span'); number.className = 'empty-number'; number.textContent = pad(frame.id + 1);
    const label = document.createElement('span'); label.className = 'empty-label'; label.textContent = 'МЕСТО ДЛЯ МОМЕНТА';
    el.append(number, label); return el;
  }
  function artwork(frame, eager = false) {
    if (!frame.src) return placeholder(frame);
    const image = new Image(); image.alt = frame.alt; image.decoding = 'async';
    image.loading = eager ? 'eager' : 'lazy'; image.width = frame.width; image.height = frame.height;
    image.addEventListener('load', () => {image.width=image.naturalWidth;image.height=image.naturalHeight;}, {once:true});
    image.addEventListener('error', () => image.replaceWith(placeholder(frame)), {once:true});
    image.src = frame.src; return image;
  }
  function build() {
    if (built) return; built = true;
    const heroConfig = window.BAHRAM_GALLERY_HERO;
    const heroMedia = $('hero-media');
    if (heroConfig?.src && heroMedia) {
      const image = new Image();
      image.alt = heroConfig.alt || '';
      image.decoding = 'async';
      image.addEventListener('load', () => {
        heroMedia.replaceChildren(image);
        heroMedia.classList.add('has-media');
      }, {once:true});
      image.src = heroConfig.src;
    }
    $('frame-count').textContent = data.length;
    data.forEach((frame, i) => {
      const card = document.createElement('button'); card.className = 'photo-card';
      card.setAttribute('aria-label', `Открыть кадр ${i+1}: ${frame.title}`);
      const art = document.createElement('div'); art.className = 'photo-art'; art.append(artwork(frame));
      const meta = document.createElement('div'); meta.className = 'photo-meta';
      const title = document.createElement('span'); title.textContent=frame.title;
      const number = document.createElement('span'); number.textContent=pad(i+1);
      meta.append(title, number); card.append(art, meta); card.addEventListener('click',()=>open(i,card)); grid.append(card);
      const thumb=document.createElement('button'); thumb.setAttribute('aria-label',`Кадр ${i+1}`);
      thumb.append(artwork(frame)); thumb.addEventListener('click',()=>show(i)); $('filmstrip').append(thumb);
    });
  }
  function reveal() {
    unlocked=true; unlocking=false; entry.hidden=true; archive.hidden=false;
    document.body.classList.remove('is-locked'); build();
    window.scrollTo(0,0); $('archive-title').focus({preventScroll:true});
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); if(unlocking)return;
    if(answer.value.trim()!=='69') {
      $('entry-error').textContent='Не-а. Лучший друг сейчас бы закатил глаза. Попробуй ещё.';
      answer.setAttribute('aria-invalid','true'); entry.classList.remove('wrong');
      void entry.offsetWidth; entry.classList.add('wrong'); answer.focus(); answer.select(); return;
    }
    unlocking=true; answer.removeAttribute('aria-invalid'); $('entry-error').textContent='Свой. Добро пожаловать.';
    window.BahramSound?.play();
    if(reduced)reveal();else{entry.classList.add('leaving');setTimeout(reveal,480);}
  });
  answer.addEventListener('input',()=>{answer.removeAttribute('aria-invalid');$('entry-error').textContent='';entry.classList.remove('wrong');});
  $('lock-gallery').addEventListener('click',()=>{
    unlocked=false;archive.hidden=true;entry.hidden=false;entry.classList.remove('leaving');
    document.body.classList.add('is-locked');answer.value='';$('entry-error').textContent='';
    window.BahramSound?.pause(); window.scrollTo(0,0);answer.focus();
  });
  document.querySelectorAll('[data-density]').forEach(button=>button.addEventListener('click',()=>{
    grid.classList.toggle('compact',button.dataset.density==='compact');
    document.querySelectorAll('[data-density]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }));
  function restartTimer() {
    clearTimeout(timer); const bar=$('slide-progress');bar.classList.remove('running');
    if(!autoplay||!viewer.open||document.hidden)return;
    void bar.offsetWidth;bar.classList.add('running');timer=setTimeout(()=>show(current+1),6000);
  }
  function stop() {autoplay=false;clearTimeout(timer);$('slide-progress').classList.remove('running');$('viewer-play').textContent='▶';$('viewer-play').setAttribute('aria-pressed','false');$('viewer-play').setAttribute('aria-label','Включить слайд-шоу');}
  async function show(index) {
    if(!data.length)return;
    current=(index+data.length)%data.length;
    const frame=data[current],request=++renderRequest;
    $('viewer-count').textContent=`${pad(current+1)} / ${pad(data.length)}`;
    $('viewer-label').textContent=`КАДР ${pad(current+1)} / ЛИЧНАЯ КОЛЛЕКЦИЯ`;
    $('viewer-title').textContent=frame.title;$('viewer-description').textContent=frame.caption||'';
    [...$('filmstrip').children].forEach((thumb,i)=>{thumb.classList.toggle('selected',i===current);thumb.setAttribute('aria-pressed',String(i===current));});
    const selected=$('filmstrip').children[current];
    if(selected)$('filmstrip').scrollTo({left:selected.offsetLeft-$('filmstrip').clientWidth/2+selected.offsetWidth/2,behavior:reduced?'instant':'smooth'});
    const art=artwork(frame,true);
    $('viewer-art').replaceChildren(placeholder(frame));
    if(art.tagName==='IMG'&&art.decode){try{await art.decode();}catch{if(request===renderRequest)$('viewer-art').replaceChildren(placeholder(frame));restartTimer();return;}}
    if(request!==renderRequest)return;
    $('viewer-art').replaceChildren(art);restartTimer();
  }
  function open(index, trigger) {
    if(!unlocked||!data.length)return;opener=trigger;viewer.showModal();show(index);$('viewer-close').focus();
  }
  $('viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>{++renderRequest;stop();opener?.focus({preventScroll:true});});
  $('viewer-prev').addEventListener('click',()=>show(current-1));$('viewer-next').addEventListener('click',()=>show(current+1));
  $('viewer-play').addEventListener('click',()=>{if(autoplay){stop();return;}autoplay=true;$('viewer-play').textContent='Ⅱ';$('viewer-play').setAttribute('aria-pressed','true');$('viewer-play').setAttribute('aria-label','Остановить слайд-шоу');restartTimer();});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1));}});
  $('lightbox-stage').addEventListener('touchstart',event=>{if(event.touches.length===1)touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};else touchStart=null;},{passive:true});
  $('lightbox-stage').addEventListener('touchend',event=>{if(!touchStart)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)show(current+(dx<0?1:-1));touchStart=null;},{passive:true});
  $('lightbox-stage').addEventListener('touchcancel',()=>touchStart=null,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else restartTimer();});
  $('back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'instant':'smooth'}));
  addEventListener('pagehide',()=>clearTimeout(timer));
})();

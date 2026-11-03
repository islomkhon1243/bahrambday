(() => {
  'use strict';
  const archive = document.getElementById('archive');
  const viewer = document.getElementById('photo-viewer');
  const stage = document.getElementById('gallery-pile');
  if (!archive || !stage) return;
  const options = window.BAHRAM_GALLERY_PILE || {};
  const clamp = (v, fallback, min, max) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
  const cfg = {
    cell:clamp(options.cell,86,40,200),rate:clamp(options.rate,6,1,20),
    opacity:clamp(options.opacity,.32,0,1),fill:clamp(options.fill,.78,.2,.95),
    cycle:clamp(options.cycle,45,8,120),speed:clamp(options.speed,.8,.1,3),wave:options.wave!==false,maxItems:clamp(options.maxItems,120,24,180),minPlayback:clamp(options.minPlayback,6,0,120)
  };
  stage.style.setProperty('--pile-opacity',cfg.opacity);
  // Native <img> elements keep GIF animation alive while CSS moves them.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let W=0,H=0,cell=cfg.cell,columns=1,rows=1,offset=0,heights,pieces=[],images=[];
  let phase='fill',elapsed=0,acc=0,rejections=0,raf=0,last=0,loading=false,loaded=false;
  function release(p){p.el.remove();if(p.objectURL)URL.revokeObjectURL(p.objectURL);}
  function reset(){for(const p of pieces)release(p);pieces=[];heights=new Uint16Array(columns);phase='fill';elapsed=0;acc=0;rejections=0;}
  function resize(){
    W=stage.clientWidth;H=stage.clientHeight;if(!W||!H)return;
    cell=W<600?Math.max(48,cfg.cell*.72):cfg.cell;
    columns=Math.max(1,Math.floor(W/cell));rows=Math.max(1,Math.ceil(H/cell));offset=(W-columns*cell)/2;
    reset();draw();
  }
  function spawn(){
    if(!images.length||pieces.length>=Math.min(W<600?Math.min(60,cfg.maxItems):cfg.maxItems,columns*(rows+1)))return false;
    let col=Math.floor(Math.random()*columns);
    for(let k=0;k<2;k++){const candidate=Math.floor(Math.random()*columns);if(heights[candidate]<heights[col])col=candidate;}
    const row=heights[col];if(row>=rows)return false;heights[col]++;
    const source=images[Math.floor(Math.random()*images.length)];
    const el=new Image();el.className='pile-sprite';el.alt='';el.draggable=false;
    el.setAttribute('aria-hidden','true');el.decoding='async';
    el.style.width=el.style.height=`${cell*.87}px`;el.style.willChange='transform';
    el.style.visibility='hidden';
    el.addEventListener('error',()=>{el.style.display='none';},{once:true});
    // Unique resource per sprite prevents the browser sharing one GIF timeline.
    const objectURL=source.blob?URL.createObjectURL(source.blob):null;
    el.src=objectURL||source.src;stage.append(el);
    pieces.push({col,target:H-row*cell,y:-cell-Math.random()*cell,vy:0,angle:(Math.random()-.5)*.18,
      spin:0,delay:0,landed:false,dirty:true,el,objectURL,age:0});
    return true;
  }
  function beginDrop(){
    phase='drop';for(const p of pieces){p.delay=Math.random()*.2+(cfg.wave?p.col/columns*.65:0);p.spin=(Math.random()-.5)*3.5;p.landed=false;p.vy=0;p.el.style.willChange='transform';}
  }
  function update(dt){
    const gravity=2700*(cell/70);
    if(phase==='fill'){
      elapsed+=dt;acc+=dt*cfg.rate;
      while(acc>=1){acc--;rejections=spawn()?0:rejections+1;}
      let sum=0;for(const h of heights)sum+=h;
      if(sum/columns>=rows*cfg.fill||rejections>12||elapsed>cfg.cycle)phase='hold';
    }
    let alive=false;
    for(const p of pieces){
      p.age+=dt/cfg.speed;
      if(phase!=='drop'){
        if(!p.landed){p.dirty=true;p.vy+=gravity*dt;p.y+=p.vy*dt;
          if(p.y>=p.target){p.y=p.target;if(p.vy>450)p.vy=-p.vy*.2;else{p.vy=0;p.landed=true;p.el.style.willChange='auto';}}
        }
      }else{
        if(p.delay>0)p.delay-=dt;else{p.dirty=true;p.vy+=gravity*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;}
        if(p.y-cell*1.5<H)alive=true;
      }
    }
    if(phase==='hold'&&pieces.every(p=>p.age>=cfg.minPlayback&&p.landed))beginDrop();
    if(phase==='drop'&&!alive)reset();
  }
  function draw(){
    for(const p of pieces){
      if(!p.dirty)continue;p.dirty=false;
      p.el.style.visibility=p.y<-cell||p.y-cell>H?'hidden':'visible';
      p.el.style.transform=`translate3d(${offset+(p.col+.5)*cell}px,${p.y-cell*.5}px,0) translate(-50%,-50%) rotate(${p.angle}rad)`;
    }
  }
  function visible(){return !archive.hidden&&!document.hidden&&!viewer?.open&&!motion.matches;}
  function frame(now){
    raf=0;if(!visible()||motion.matches)return;
    if(!last)last=now;
    if(now-last>=1000/30){const dt=Math.min(.05,(now-last)/1000)*cfg.speed;last=now;update(dt);draw();}
    raf=requestAnimationFrame(frame);
  }
  function run(){if(!visible()||motion.matches||!images.length||raf)return;last=0;raf=requestAnimationFrame(frame);}
  function pause(){cancelAnimationFrame(raf);raf=0;last=0;}
  async function load(){
    if(loading||loaded)return;loading=true;
    const paths=[...new Set((Array.isArray(options.images)?options.images:[]).filter(p=>typeof p==='string'&&p.trim()))].slice(0,20);
    images=(await Promise.all(paths.map(async src=>{
      const source=await new Promise(resolve=>{
        const image=new Image();image.onload=()=>resolve(image.naturalWidth&&image.naturalHeight?image:null);image.onerror=()=>resolve(null);image.src=src;
      });
      if(!source)return null;
      let blob=null;
      try{
        const response=await fetch(src,{cache:'force-cache'});
        if(response.ok){const file=await response.blob();if(file.type==='image/gif'||/\.gif(?:[?#]|$)/i.test(src))blob=file;}
      }catch{} // Native URL fallback for file:// and restricted remote sources.
      return {src:source.src,blob};
    }))).filter(Boolean);
    loaded=true;loading=false;resize();sync();
  }
  function sync(){stage.hidden=!visible();if(!visible()){pause();return;}if(!loaded){load();return;}resizeIfNeeded();run();}
  function resizeIfNeeded(){if(W!==stage.clientWidth||H!==stage.clientHeight)resize();}
  const observer=new MutationObserver(sync);observer.observe(archive,{attributes:true,attributeFilter:['hidden']});
  if(viewer)observer.observe(viewer,{attributes:true,attributeFilter:['open']});
  const resizer=new ResizeObserver(()=>{if(visible()){resizeIfNeeded();run();}});resizer.observe(stage);
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',()=>{pause();if(motion.matches)reset();sync();});
  addEventListener('pagehide',pause);addEventListener('pageshow',sync);
  sync();
})();

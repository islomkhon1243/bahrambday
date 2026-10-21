from pathlib import Path
p=Path('dist/experience.js');s=p.read_text(encoding='utf-8')
s=s.replace('const config = window.BAHRAM_MUSIC || {};', "const config = (document.body.classList.contains('night-body') ? window.BAHRAM_NIGHT_MUSIC : window.BAHRAM_MUSIC) || {};")
s=s.replace("const isNight = document.body.classList.contains('night-body');", "const isNight = document.body.classList.contains('night-body');\n  const musicScope = config.storageKey || (isNight ? 'night' : 'main');")
s=s.replace('let ctx, master, timer, playing', 'let ctx, master, mediaSource, mediaGain, timer, playing')
s=s.replace("const volumeInput = document.querySelector('.music-volume'), dock = document.querySelector('.sound-dock');", "const volumeInput = document.querySelector('.music-volume'), dock = document.querySelector('.sound-dock');\n  const timeKey = () => 'bahram-track-time-' + musicScope + '-' + (track.src.startsWith('blob:') ? 'custom' : track.src);")
old="function level() { const target = volume * (ducked ? .22 : 1); if(master&&ctx) master.gain.setTargetAtTime(playing ? target * .28 : 0,ctx.currentTime,.35); if(audio) audio.volume = Math.min(1,target); }"
new="""function level() {
    const target = volume * (ducked ? .38 : 1), smoothing = ducked ? .12 : .45;
    dock.dataset.ducked = String(ducked);
    if(master&&ctx) master.gain.setTargetAtTime(playing ? target * .28 : 0,ctx.currentTime,smoothing);
    if(mediaGain&&ctx) { mediaGain.gain.cancelScheduledValues(ctx.currentTime); mediaGain.gain.setTargetAtTime(playing ? target : 0,ctx.currentTime,smoothing); audio.volume=1; }
    else if(audio) audio.volume = Math.min(1,target);
  }
  async function prepareMediaMix() {
    try { const AudioContextClass=window.AudioContext||window.webkitAudioContext;
      if(!AudioContextClass)return;
      if(!ctx)ctx=new AudioContextClass();
      if(!mediaSource){mediaSource=ctx.createMediaElementSource(audio);mediaGain=ctx.createGain();mediaGain.gain.value=0;mediaSource.connect(mediaGain);mediaGain.connect(ctx.destination);}
      await ctx.resume();
    } catch { /* HTML audio remains usable when Web Audio is unavailable. */ }
  }"""
assert old in s;s=s.replace(old,new)
s=s.replace("const saved=Number(safeGet('bahram-track-time')||0)", "const saved=Number(safeGet(timeKey())||0)")
s=s.replace("}playing=true;level();await audio.play();", "}await prepareMediaMix();playing=true;level();await audio.play();")
s=s.replace("safeSet('bahram-track-time',audio.currentTime)", "safeSet(timeKey(),audio.currentTime)")
s=s.replace("safeSet('bahram-track-time',0)", "safeSet(timeKey(),0)")
s=s.replace(".get('selected')", ".get('selected-'+musicScope)")
s=s.replace(".put(file,'selected')", ".put(file,'selected-'+musicScope)")
s=s.replace("audio?.remove();audio=null;", "audio?.remove();mediaSource?.disconnect();mediaGain?.disconnect();mediaSource=null;mediaGain=null;audio=null;")
p.write_text(s,encoding='utf-8')

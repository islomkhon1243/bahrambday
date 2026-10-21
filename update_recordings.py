from pathlib import Path
p=Path('dist/night-story.js');s=p.read_text(encoding='utf-8')
s=s.replace("speaking=false, utterance, switching=false;", "speaking=false, switching=false;")
start=s.index('  const synth=window.speechSynthesis')
end=s.index('  function showControls()',start)
replacement="""  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tags=[];
  const characterIds=['reina','aki','yuki'];
  const voiceAudio=document.createElement('audio');voiceAudio.id='character-voice';voiceAudio.hidden=true;voiceAudio.preload='metadata';document.body.append(voiceAudio);
  const autoButton=document.createElement('button');autoButton.id='dialogue-auto';autoButton.type='button';voice.after(autoButton);
  let autoVoice=true, playbackId=0;
  try {autoVoice=sessionStorage.getItem('bahram-auto-voice')!=='false';}catch{}
  function currentClip(){const number=phase==='opening'?1:phase==='reply'?chosen+2:0;return number?`assets/voices/${characterIds[chapter]}-${number}.mp3`:null;}
  function updateAuto(){autoButton.textContent=autoVoice?'Голоса: авто ✓':'Голоса: вручную';autoButton.setAttribute('aria-pressed',String(autoVoice));try{sessionStorage.setItem('bahram-auto-voice',String(autoVoice));}catch{}}
  function resetVoice(){speaking=false;voice.classList.remove('active');voice.textContent=currentClip()?'▶ Послушать':'Запись не добавлена';voice.disabled=!currentClip();window.BahramSound?.duck(false);}
  function stopVoice(){playbackId++;voiceAudio.pause();try{voiceAudio.currentTime=0;}catch{}resetVoice();}
  async function say(revealText=true){
    if(speaking){stopVoice();return;}
    const clip=currentClip();if(!clip)return;
    if(revealText)finishTyping();stopVoice();const request=++playbackId;
    voiceAudio.src=clip;voice.disabled=false;voice.textContent='Подготовка записи…';
    document.getElementById('voice-disclaimer').textContent='Записанная озвучка · музыка приглушается автоматически';
    try {await voiceAudio.play();if(request!==playbackId)return;speaking=true;voice.classList.add('active');voice.textContent='■ Остановить';window.BahramSound?.duck(true);}
    catch(error){if(request!==playbackId)return;resetVoice();if(error.name==='NotAllowedError')document.getElementById('voice-disclaimer').textContent='Нажми «Послушать», чтобы разрешить воспроизведение записи.';else if(error.name!=='AbortError')document.getElementById('voice-disclaimer').textContent='Не удалось открыть запись. Текст реплики остаётся доступен.';}
  }
  voiceAudio.addEventListener('playing',()=>{speaking=true;window.BahramSound?.duck(true);voice.classList.add('active');voice.textContent='■ Остановить';});
  voiceAudio.addEventListener('ended',resetVoice);
  voiceAudio.addEventListener('error',()=>{resetVoice();document.getElementById('voice-disclaimer').textContent='Запись недоступна. Текст реплики остаётся на экране.';});
  voice.addEventListener('click',()=>say());
  autoButton.addEventListener('click',()=>{autoVoice=!autoVoice;updateAuto();if(!autoVoice)stopVoice();else if(currentClip())say(false);});
  updateAuto();
"""
s=s[:start]+replacement+s[end:]
needle="skip.hidden=false;if(reduced.matches)"
s=s.replace(needle,"skip.hidden=false;voice.disabled=!currentClip();voice.textContent=currentClip()?'▶ Послушать':'Запись не добавлена';document.getElementById('voice-disclaimer').textContent=currentClip()?'Записанная озвучка · музыка приглушается автоматически':'Для этой дополнительной реплики пока есть только текст.';if(autoVoice&&currentClip())say(false);if(reduced.matches)")
s=s.replace("stage.classList.add('in-story');renderChapter();", "stage.classList.add('in-story');window.BahramSound?.play();renderChapter();")
s=s.replace('  if(synth)synth.getVoices();\n','')
p.write_text(s,encoding='utf-8')
p=Path('dist/night-shift.html');s=p.read_text(encoding='utf-8-sig').replace('Войти. Я в списке','Войти. Включить вечер').replace('Голос устройства · поздравление доступно текстом','Записанная озвучка · музыка приглушается автоматически').replace('ИНТЕРАКТИВНАЯ ИСТОРИЯ · 3–5 МИНУТ · ЗВУК ПО ЖЕЛАНИЮ','МУЗЫКА И ГОЛОСА ВКЛЮЧАТСЯ ПОСЛЕ ВХОДА · ГРОМКОСТЬ НАСТРАИВАЕТСЯ')
p.write_text(s,encoding='utf-8')

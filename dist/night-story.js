(() => {
  'use strict';
  const story = [
    {name:'РЕЙНА',role:'ХОЗЯЙКА ВЕЧЕРА',place:'01 / У ВХОДА',focus:'13%',accent:'#c56a7e',pitch:1.03,rate:.93,
      opening:'Бахрам? Наконец-то. Твой друг просил устроить тебе особенный вечер. Сказал: «Только не давайте ему ответить “ок” и уйти». Так что маску оставь у входа. Сегодня тебе двадцать шесть. И весь этот вечер — твой.',
      choices:[{label:'Ислам слишком много знает.',reply:'Настолько много, что вместо обычной открытки открыл тебе целую вселенную. Такой человек — роскошь, Бахрам. Я бы его берегла. А тебя сегодня немного побалую вниманием.',tag:'СВОЙ ЧЕЛОВЕК'},{label:'Я пришёл за особым отношением.',reply:'Как уверенно. Мне нравится. Особое отношение уже началось: тебя встретили по имени, и сегодня тебе ничего не нужно доказывать. Только не перепутай уверенность с привычкой отвечать «ок».',tag:'ОСОБЫЙ ГОСТЬ'}],
      tease:'Скажи честно: ты уже мысленно оценил сайт, но другу ещё не написал? Бахрам, реакции сами себя не поставят.'},
    {name:'АКИ',role:'ХОЗЯЙКА ПЛЕЙЛИСТА',place:'02 / У ДИДЖЕЙСКОГО ПУЛЬТА',focus:'51%',accent:'#c89266',pitch:1.13,rate:1.02,
      opening:'Вот он, человек, который приносит в чат весь интернет. Я Аки. Сегодня у нас музыка, хороший свет и очень важный вопрос: куда ты потащишь друга в следующем году? Только не говори «как-нибудь». Мы оба знаем твоё любимое слово.',
      choices:[{label:'Го. Билеты потом разберём.',reply:'Вот теперь я узнаю именинника. Желаю тебе столько свободы, чтобы планы действительно превращались в поездки. И компанию, которая скажет «го» раньше, чем ты успеешь отправить вторую ссылку.',tag:'ГЕНЕРАТОР ПРИКЛЮЧЕНИЙ'},{label:'Сначала включи мою песню.',reply:'Вот это правильный заказ. Управление музыкой — внизу слева. Включай, добавляй громкость и забирай этот вечер себе. С днём рождения, Бахрам. Пусть в жизни будет больше моментов, которые хочется поставить на повтор.',tag:'ГЛАВНЫЙ В ПЛЕЙЛИСТЕ'}],
      tease:'Рилсов от тебя столько, что я успела бы сыграть целый сет, пока друг досмотрит вчерашние. Сегодня потерпишь: теперь твоя очередь принимать контент.'},
    {name:'ЮКИ',role:'ПОСЛЕДНИЙ СЛОЖНЫЙ УРОВЕНЬ',place:'03 / ЛИЧНАЯ ЛОЖА',focus:'91%',accent:'#af91bb',pitch:.94,rate:.92,
      opening:'Слишком легко тебя пропустили. Я Юки. Прежде чем вручить последнее поздравление, проверим легенду. Друг прислал длинное искреннее сообщение. Твой ответ? Осторожно: от этого зависит моя оценка твоих коммуникативных навыков.',
      choices:[{label:'Ок.',reply:'Предсказуемо. Две буквы, а человек потратил на тебя целый сайт. Но мы оба знаем: за твоим «ок» есть и дела, и приглашения, и сотни обычных дней рядом. Просто сегодня напиши ему чуть больше. Он заслужил.',tag:'ЛЕГЕНДАРНОЕ «ОК»'},{label:'Обнял, брат. Ты лучший.',reply:'Вот. Можешь ведь, когда захочешь. Запомни это ощущение: рядом есть человек, которому ты нужен именно таким. С твоими приколами, планами и бесконечными ссылками. Это редкая удача, Бахрам.',tag:'КРИТИЧЕСКОЕ ПОПАДАНИЕ В СЕРДЦЕ'}],
      tease:'Двадцать шесть лет. До сих пор без инструкции по эксплуатации. Хорошо, что Ислам уже знает все твои баги и всё равно выбирает с тобой дружить.'}
  ];
  const stage=document.getElementById('club-stage'), start=document.getElementById('club-start'), cover=document.getElementById('club-cover'), conversation=document.getElementById('conversation'), text=document.getElementById('dialogue-text'), options=document.getElementById('dialogue-options'), next=document.getElementById('dialogue-next'), skip=document.getElementById('dialogue-skip'), voice=document.getElementById('dialogue-voice');
  let chapter=0, phase='opening', chosen=-1, typingTimer, current='', typeIndex=0, speaking=false, switching=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tags=[];
  const characterIds=['reina','aki','yuki'];
  // Playback-only balancing: bring the supplied recordings to a similar average level.
  const voiceLevels={reina:[.77,.58,.63],aki:[.80,.68,.58],yuki:[.72,.98,1]};
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
    voiceAudio.src=clip;voiceAudio.volume=voiceLevels[characterIds[chapter]][phase==='opening'?0:chosen+1];voice.disabled=false;voice.textContent='Подготовка записи…';
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
  function showControls(){skip.hidden=true;options.hidden=phase!=='opening';next.hidden=phase==='opening';document.getElementById('dialogue-tease').hidden=phase==='tease';text.setAttribute('aria-live','polite');}
  function finishTyping(){clearInterval(typingTimer);text.textContent=current;showControls();}
  skip.addEventListener('click',finishTyping);
  function type(message){stopVoice();clearInterval(typingTimer);current=message;typeIndex=0;text.textContent='';text.setAttribute('aria-live','off');options.hidden=true;next.hidden=true;skip.hidden=false;voice.disabled=!currentClip();voice.textContent=currentClip()?'▶ Послушать':'Запись не добавлена';document.getElementById('voice-disclaimer').textContent=currentClip()?'Записанная озвучка · музыка приглушается автоматически':'Для этой дополнительной реплики пока есть только текст.';if(autoVoice&&currentClip())say(false);if(reduced.matches){finishTyping();return;}typingTimer=setInterval(()=>{typeIndex+=2;text.textContent=current.slice(0,typeIndex);if(typeIndex>=current.length)finishTyping();},22);}
  function renderChapter(){const s=story[chapter];stage.style.setProperty('--focus',s.focus);stage.style.setProperty('--scene-accent',s.accent);stage.dataset.chapter=String(chapter);document.getElementById('speaker-name').textContent=s.name;document.getElementById('speaker-role').textContent=s.role;document.getElementById('scene-location').textContent=s.place;document.getElementById('scene-number').textContent=`0${chapter+1}`;document.getElementById('act-count').textContent=`0${chapter+1} / 03`;document.querySelectorAll('.act-marker').forEach((el,i)=>{el.classList.toggle('current',i===chapter);el.classList.toggle('completed',i<chapter);});phase='opening';chosen=-1;options.replaceChildren();s.choices.forEach((choice,index)=>{const button=document.createElement('button');button.innerHTML=`<span>0${index+1}</span><strong></strong><b>↗</b>`;button.querySelector('strong').textContent=choice.label;button.addEventListener('click',()=>choose(index));options.append(button);});document.getElementById('chosen-reply').hidden=true;type(s.opening);}
  function choose(index){chosen=index;phase='reply';tags[chapter]=story[chapter].choices[index].tag;const chosenReply=document.getElementById('chosen-reply');chosenReply.textContent='ТЫ: '+story[chapter].choices[index].label;chosenReply.hidden=false;next.textContent=chapter===2?'Забрать своё поздравление ↗':'Дальше. Я ещё не ухожу ↗';type(story[chapter].choices[index].reply);}
  document.getElementById('dialogue-tease').addEventListener('click',()=>{phase='tease';next.textContent=chosen<0?'Ладно, отвечу нормально ↗':chapter===2?'Забрать своё поздравление ↗':'Дальше. Я ещё не ухожу ↗';type(story[chapter].tease);});
  function transition(action){if(switching)return;switching=true;stopVoice();finishTyping();stage.classList.add('scene-changing');setTimeout(()=>{action();stage.classList.remove('scene-changing');switching=false;},reduced.matches?0:520);}
  next.addEventListener('click',()=>{if(chosen<0){phase='opening';type(story[chapter].opening);return;}if(chapter<2)transition(()=>{chapter++;renderChapter();});else transition(showEnding);});
  function showEnding(){conversation.hidden=true;stage.classList.add('ending');document.getElementById('club-ending').hidden=false;document.getElementById('earned-tags').replaceChildren();tags.forEach(tag=>{const span=document.createElement('span');span.textContent=tag;document.getElementById('earned-tags').append(span);});document.getElementById('scene-location').textContent='04 / ПОСЛЕ ПОЛУНОЧИ';document.getElementById('ending-title').focus({preventScroll:true});burst();}
  function burst(){if(reduced.matches)return;const holder=document.getElementById('celebration');holder.replaceChildren();for(let i=0;i<55;i++){const piece=document.createElement('i');piece.style.cssText=`--x:${Math.random()*100}%;--delay:${Math.random()*.7}s;--duration:${2+Math.random()*2}s;--rotation:${Math.random()*700}deg;background:${['#d8b080','#d47b90','#e6c9d8','#9c658e'][i%4]}`;holder.append(piece);}setTimeout(()=>holder.replaceChildren(),5000);}
  start.addEventListener('click',()=>{cover.classList.add('departed');conversation.hidden=false;stage.classList.add('in-story');window.BahramSound?.play();renderChapter();setTimeout(()=>cover.hidden=true,700);});
  document.getElementById('replay-story').addEventListener('click',()=>transition(()=>{chapter=0;tags.length=0;stage.classList.remove('ending');document.getElementById('club-ending').hidden=true;conversation.hidden=false;renderChapter();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();});addEventListener('pagehide',()=>{stopVoice();clearInterval(typingTimer);});
})();

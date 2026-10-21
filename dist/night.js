(() => {
  'use strict';
  const guests = [
    { name: 'РЕЙНА', role: 'ХОЗЯЙКА ВЕЧЕРА', id: 'reina', pos: '12%', alt: 'Рейна в бордовом костюме', signature: 'Твой вечер, Бахрам. — Рейна', pitch: 1.05, rate: 0.91,
      kind: 'Бахрам, с днём рождения. Сегодня ты в гостевом списке первым. Улыбнись хотя бы — лучший друг устроил тебе целую премьеру. Желаю тебе вечеров, которые хочется продлить, и людей, которых хочется позвать снова. Сегодня всё внимание — тебе.',
      roast: 'Бахрам, тебе двадцать шесть. Пора бы уже отвечать на длинные поздравления чем-нибудь кроме «ок». Человек сделал тебе целую вселенную, а ты наверняка ищешь, где поставить реакцию. С днём рождения. Ты редкий экземпляр. Мы проверяли.' },
    { name: 'АКИ', role: 'У НЕЁ СВОЙ РИТМ', id: 'aki', pos: '51%', alt: 'Аки с каштановыми волосами в чёрном вечернем платье', signature: 'Следующий трек — тебе. — Аки', pitch: 1.16, rate: 1.02,
      kind: 'Бахрам, сегодня у твоей жизни новый выпуск. Пусть в нём будет больше поездок, музыки, тренировок и того самого «го», после которого случаются лучшие истории. Желаю времени на себя, смелости на новое и друзей, которые всегда подхватят твой ритм. С днём рождения!',
      roast: 'Ты приносишь в чат столько роликов, что тебе пора выдавать зарплату за интернет. Но сегодня мы признаём: без тебя было бы подозрительно тихо. Не сбавляй обороты, Бахрам. Просто иногда давай людям досмотреть предыдущие сорок видео. С днём рождения, легенда.' },
    { name: 'ЮКИ', role: 'СЛОЖНЫЙ УРОВЕНЬ', id: 'yuki', pos: '91%', alt: 'Юки с серебристыми волосами в сливовом костюме', signature: 'Сохранение выполнено. — Юки', pitch: 0.92, rate: 0.94,
      kind: 'Бахрам, новый уровень открыт. Желаю здоровья, сил и возможностей делать то, что нравится. Пусть рядом будут свои люди, работа оставляет время на жизнь, а хорошие планы становятся настоящими приключениями. С днём рождения. Продолжение у этой истории обещает быть интересным.',
      roast: 'Поздравляю, Бахрам. Ты открыл секретную комнату и пока ничего не сломал. Для двадцати шести лет отличный результат. Награда уже у тебя: лучший друг, который помнит твои приколы и сделал из них сайт. Такой предмет второй раз не выпадает. Береги.' }
  ];
  let selected = 0, mode = 'kind', speaking = false, utterance;
  const tabs = [...document.querySelectorAll('[data-guest]')];
  const voiceButton = document.getElementById('voice-button');
  const synth = window.speechSynthesis;
  function resetVoice() { speaking = false; voiceButton.classList.remove('speaking'); document.getElementById('voice-icon').textContent = '▶'; document.getElementById('voice-label').textContent = 'Послушать поздравление'; }
  function stopVoice() { if (synth) synth.cancel(); resetVoice(); }
  function render() {
    stopVoice(); const guest = guests[selected];
    tabs.forEach((tab, index) => { tab.setAttribute('aria-selected', String(index === selected)); tab.tabIndex = index === selected ? 0 : -1; });
    document.getElementById('guest-panel').setAttribute('aria-labelledby', `tab-${guest.id}`);
    document.getElementById('guest-portrait').style.setProperty('--pos', guest.pos);
    document.getElementById('guest-image').alt = guest.alt;
    document.getElementById('guest-name').textContent = guest.name;
    document.getElementById('guest-role').textContent = guest.role;
    document.getElementById('guest-signature').textContent = guest.signature;
    document.getElementById('greeting-text').textContent = guest[mode];
    document.getElementById('kind-mode').classList.toggle('selected', mode === 'kind');
    document.getElementById('roast-mode').classList.toggle('selected', mode === 'roast');
    document.getElementById('kind-mode').setAttribute('aria-pressed', String(mode === 'kind'));
    document.getElementById('roast-mode').setAttribute('aria-pressed', String(mode === 'roast'));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { selected = index; render(); });
    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); selected = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (selected + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
      render(); tabs[selected].focus();
    });
  });
  document.getElementById('kind-mode').addEventListener('click', () => { mode = 'kind'; render(); });
  document.getElementById('roast-mode').addEventListener('click', () => { mode = 'roast'; render(); });
  voiceButton.addEventListener('click', () => {
    if (!synth || !window.SpeechSynthesisUtterance) { document.getElementById('voice-note').textContent = 'Этот браузер не поддерживает озвучку. Поздравление можно прочитать выше.'; return; }
    if (speaking) { stopVoice(); return; }
    synth.cancel(); const guest = guests[selected]; utterance = new SpeechSynthesisUtterance(guest[mode]);
    utterance.lang = 'ru-RU'; utterance.rate = guest.rate; utterance.pitch = guest.pitch; utterance.volume = 1;
    const voices = synth.getVoices(); const russian = voices.filter(v => /^ru/i.test(v.lang));
    const preferred = russian.find(v => /irina|ирина|svetlana|светлана|female|milena|милена/i.test(v.name)) || russian[0];
    if (preferred) utterance.voice = preferred;
    utterance.onend = resetVoice; utterance.onerror = e => { resetVoice(); if (e.error !== 'canceled' && e.error !== 'interrupted') document.getElementById('voice-note').textContent = 'Озвучка недоступна на этом устройстве. Текст поздравления — выше.'; };
    speaking = true; voiceButton.classList.add('speaking'); document.getElementById('voice-icon').textContent = '■'; document.getElementById('voice-label').textContent = 'Остановить поздравление';
    synth.speak(utterance);
  });
  if (synth) synth.getVoices();

  let audio, master, ambientOn = false, timer, beat = 0;
  const activeOscillators = new Set();
  const chords = [[146.83,174.61,220,261.63],[130.81,164.81,196,246.94],[116.54,146.83,174.61,220],[130.81,164.81,196,233.08]];
  function note(frequency, duration, volume) {
    const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    const now = audio.currentTime; gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(volume, now + 0.12); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain); gain.connect(master); oscillator.start(now); oscillator.stop(now + duration + 0.1); activeOscillators.add(oscillator); oscillator.onended = () => { activeOscillators.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
  }
  function tick() { if (!ambientOn || document.hidden) return; const chord = chords[Math.floor(beat / 4) % chords.length]; if (beat % 4 === 0) chord.forEach(f => note(f, 3.8, 0.075)); if (beat % 2 === 0) note(chord[(Math.floor(beat / 2)) % chord.length] * 2, 1.7, 0.045); beat++; }
  function ambientOff() { ambientOn = false; clearInterval(timer); if (audio && master) master.gain.setTargetAtTime(0, audio.currentTime, .12); document.getElementById('ambient-button').setAttribute('aria-pressed', 'false'); document.getElementById('ambient-label').textContent = 'ЗВУК ВЫКЛ.'; }
  document.getElementById('ambient-button').addEventListener('click', async () => {
    if (ambientOn) { ambientOff(); return; }
    try { const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) throw new Error('No audio support'); if (!audio) { audio = new Audio(); master = audio.createGain(); master.gain.value = 0; master.connect(audio.destination); } await audio.resume(); ambientOn = true; master.gain.setTargetAtTime(0.4, audio.currentTime, .3); tick(); timer = setInterval(tick, 1100); document.getElementById('ambient-button').setAttribute('aria-pressed', 'true'); document.getElementById('ambient-label').textContent = 'ЗВУК ВКЛ.'; }
    catch { document.getElementById('ambient-label').textContent = 'БЕЗ ЗВУКА'; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopVoice(); ambientOff(); } });
  window.addEventListener('pagehide', () => { stopVoice(); ambientOff(); activeOscillators.forEach(o => { try { o.stop(); } catch {} }); audio?.close(); });
})();

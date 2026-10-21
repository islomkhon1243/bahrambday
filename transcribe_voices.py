from pathlib import Path
from faster_whisper import WhisperModel
import json
model=WhisperModel('base',device='cpu',compute_type='int8',local_files_only=True)
files=sorted(p for p in (Path.cwd().parents[1]/'assets').glob('*.mp3') if p.stem.split()[0] in ['рейна','аки','юки'])
results=[]
for p in files:
 segments,info=model.transcribe(str(p),language='ru',beam_size=3,vad_filter=True)
 text=' '.join(s.text.strip() for s in segments)
 results.append({'file':p.name,'text':text})
 print(p.name,':',text,flush=True)
 Path('outputs/voice-transcripts.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')

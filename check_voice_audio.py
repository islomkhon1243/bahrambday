from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,re,json
files=sorted(Path('dist/assets/voices').glob('*.mp3'))
def inspect(p):
 r=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-af','volumedetect','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
 mean=re.search(r'mean_volume: ([\-\d.]+) dB',r.stderr);peak=re.search(r'max_volume: ([\-\d.]+) dB',r.stderr)
 d=subprocess.run(['ffprobe','-v','quiet','-show_entries','format=duration','-of','json',str(p)],capture_output=True,text=True)
 return dict(file=p.name,duration=round(float(json.loads(d.stdout)['format']['duration']),2),mean_db=float(mean[1]) if mean else None,peak_db=float(peak[1]) if peak else None,decode_ok=r.returncode==0)
results=list(ThreadPoolExecutor(max_workers=3).map(inspect,files))
Path('outputs/voice-audio-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
for row in results:print(row)
assert all(x['decode_ok'] for x in results)

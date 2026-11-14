"""Convert completed local Kokoro clips and build the browser voice index."""
from pathlib import Path
import hashlib,json,subprocess
project=Path(__file__).resolve().parent.parent
source=project/'output/voiceover/kokoro/robot-v1'
target=project/'dist/assets/audio/michael';target.mkdir(parents=True,exist_ok=True)
pack=json.loads((project/'production/MICHAEL_ROBOT_MANIFEST.json').read_text())
clips=[]
for line in pack['lines']:
    wav=source/(line['id']+'.wav')
    if not wav.exists():continue
    mp3=target/(line['id']+'.mp3')
    if not mp3.exists() or wav.stat().st_mtime>mp3.stat().st_mtime:
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-20:LRA=7:TP=-2','-codec:a','libmp3lame','-b:a','128k','-metadata','comment=AI-generated Kokoro am_michael',str(mp3)],check=True)
    clips.append({**line,'audio':'assets/audio/michael/'+mp3.name,'sha256':hashlib.sha256(mp3.read_bytes()).hexdigest()})
for line in json.loads((project/'production/MICHAEL_GARDEN_SCIENCE.json').read_text())['lines']:
    wav=project/'dist/assets/audio/garden-michael'/(line['id']+'.wav')
    clips.append({**line,'audio':'assets/audio/garden-michael/'+wav.name,'sha256':hashlib.sha256(wav.read_bytes()).hexdigest()})
(project/'dist/michael-voice.json').write_text(json.dumps({'voice':'am_michael','provenance':'AI-generated local Kokoro speech','clips':clips},indent=2),encoding='utf-8')
print('Assembled',len(clips),'Michael clips')

from pathlib import Path
import json,subprocess

base=Path(__file__).resolve().parent
out=base/'delivery';clips=out/'clips';segments=base/'segments'
clips.mkdir(parents=True,exist_ok=True);segments.mkdir(exist_ok=True)
takes=json.loads((base/'TAKES.json').read_text())
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],check=True)
def video(source,target,start=0,duration=None):
 args=['-ss',str(start),'-i',str(source)]
 if duration:args+=['-t',str(duration)]
 args+=['-an','-vf','fps=30,scale=1920:1080:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration=2','-c:v','libx264','-preset','veryfast','-crf','18','-threads','1','-pix_fmt','yuv420p','-movflags','+faststart']
 if duration:args+=['-t',str(duration)]
 run([*args,str(target)])
for t in takes:
 target=clips/(t['id']+'.mp4')
 if not target.exists():video(t['file'],target,t['ready_seconds'])
 print('Exported',target.name,flush=True)
def event(n,name):return next(e['seconds'] for e in takes[n-1]['events'] if e['name']==name)
plan=[
 (2,event(2,'discover')+.5,3.5,'A quiet Mars base. A new friend.'),
 (1,event(1,'full-character')-2,2.5,'Choose a name and a full explorer.'),
 (3,event(3,'motor')-3,4.5,'Connect the circuit and restore power.'),
 (4,event(4,'seed')+.5,2,'Plant a crop.'),
 (4,event(4,'water'),2,'Prepare light and water.'),
 (5,event(5,'harvest')+.5,4.5,'Harvest one plant at a time.'),
 (6,event(6,'science'),3,'Discover the science after playing.'),
 (7,event(7,'archive'),4.5,'Inspect real Curiosity/RAD measurements.'),
 (1,event(1,'full-character')+1.3,3.5,'NEILO آ· Explore, experiment, learn.')
]
timeline=[];clock=0;paths=[]
for i,(n,start,duration,beat) in enumerate(plan):
 target=segments/f'{i+1:02}.mp4';video(takes[n-1]['file'],target,start,duration);paths.append(target)
 timeline.append({'start':clock,'end':clock+duration,'source':takes[n-1]['id'],'source_in':round(start,3),'beat':beat});clock+=duration
concat=segments/'concat.txt';concat.write_text('\n'.join("file '"+p.as_posix()+"'" for p in paths),encoding='utf-8')
run(['-f','concat','-safe','0','-i',str(concat),'-an','-vf','fps=30,tpad=stop_mode=clone:stop_duration=1','-t','30','-c:v','libx264','-preset','veryfast','-crf','18','-threads','1','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'NEILO_30s_SILENT.mp4')])
(out/'TIMELINE.json').write_text(json.dumps(timeline,indent=2),encoding='utf-8')
print('Silent 30-second edit complete',flush=True)

"""Create web copies; never modify the user's source clips."""
from pathlib import Path
import subprocess,json

root=Path(__file__).resolve().parents[2]
dest=root/'neilo-engine/dist/assets/video'; dest.mkdir(exist_ok=True)
files=list((root/'cutscence').glob('*.mp4'))
specs=[('voyage','Boy_viewing',None,None),('harness','Boy_fastens',None,None),('descent','Safety_capsule',0,4.2),('enter','Boy_entering',None,None),('discover','Boy_approaching',0,7.5),('wake','Boy_approaching',7.5,None)]
manifest=[]
for name,prefix,start,end in specs:
    source=next(p for p in files if p.name.startswith(prefix))
    target=dest/(name+'.mp4')
    args=['ffmpeg','-v','error','-y']
    if start is not None: args+=['-ss',str(start)]
    args+=['-i',str(source)]
    if end is not None: args+=['-t',str(end-(start or 0))]
    args+=['-an','-vf','scale=960:-2','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(target)]
    subprocess.run(args,check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(target)]))
    manifest.append({'id':name,'source':source.name,'start':start,'end':end,'duration':duration,'bytes':target.stat().st_size,'source_audio':'preserved in original; muted in web copy pending review'})
    print(name,round(duration,2),target.stat().st_size)
(root/'output/cutscene-review/web-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

"""Build the supplemental narration library. A model session is reused and completed clips are cached by text."""
import json,hashlib,subprocess,sys,time,argparse
parser=argparse.ArgumentParser();parser.add_argument("--from-id");parser.add_argument("--index",default="michael-phase.json");parser.add_argument("--threads",type=int,default=2);args=parser.parse_args()
from pathlib import Path
import onnxruntime as ort
from kokoro_onnx import Kokoro
import soundfile as sf
import numpy as np
root=Path(__file__).resolve().parent.parent
model=root/'tools/kokoro/models'
out=root/'dist/assets/audio/michael'
pack=json.loads((root/'production/PHASE_ONE_NARRATION.json').read_text(encoding='utf-8-sig'))
index=root/'dist'/args.index
catalog=json.loads(index.read_text()) if index.exists() else {'voice':pack['voice'],'provenance':'AI-generated locally using Kokoro v1.0 INT8, Michael','clips':[]}
cache={x['id']:x for x in catalog['clips']}
opt=ort.SessionOptions();opt.intra_op_num_threads=args.threads;opt.inter_op_num_threads=1;opt.add_session_config_entry('session.intra_op.allow_spinning','0');opt.add_session_config_entry('session.inter_op.allow_spinning','0')
tts=Kokoro.from_session(ort.InferenceSession(str(model/'kokoro-v1.0.int8.onnx'),sess_options=opt,providers=['CPUExecutionProvider']),str(model/'voices-v1.0.bin'))
temp=root/'output/voiceover/kokoro/phase-one';temp.mkdir(parents=True,exist_ok=True)
lines=pack['lines'];lines=lines[next(i for i,x in enumerate(lines) if x['id']==args.from_id):] if args.from_id else lines
for item in lines:
    key=item['id']; target=out/(key+'.mp3'); start=time.monotonic()
    if key in cache and cache[key]['text']==item['text'] and target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()==cache[key]['sha256']:continue
    samples,sr=tts.create(item['text'],voice=pack['voice'],speed=pack['speed'],lang='en-us')
    if not np.isfinite(samples).all() or np.max(np.abs(samples))<.001:raise ValueError(key)
    wav=temp/(key+'.wav');sf.write(str(wav),samples,sr)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-20:LRA=7:TP=-2','-ar','24000','-b:a','96k','-metadata','comment=AI-generated narration with Kokoro am_michael',str(target)],check=True)
    cache[key]={**item,'audio':'assets/audio/michael/'+target.name,'duration':round(len(samples)/sr,3),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    catalog['clips']=list(cache.values());index.write_text(json.dumps(catalog,indent=2),encoding='utf-8')
    print(key,round(time.monotonic()-start,1),flush=True)

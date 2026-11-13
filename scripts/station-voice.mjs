import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../dist/',import.meta.url);
const lines=JSON.parse(await readFile(new URL('station-voice.json',root),'utf8'));
if(process.argv.includes('--script')) {
  for(const {id,text} of lines) console.log(id+'\n'+text);
} else {
  const key=process.env.ELEVENLABS_API_KEY, voice=process.env.NEILO_VOICE_ID||'nNXPmxHfg9PtGzFxr9Zd';
  if(!key) throw new Error('Set ELEVENLABS_API_KEY in this shell, or use --script to export the lines.');
  const dir=new URL('assets/audio/station/',root); await mkdir(dir,{recursive:true});
  const manifest=[];
  for(const line of lines) {
    const digest=createHash('sha256').update(voice+'\n'+line.text).digest('hex').slice(0,16);
    const audio='assets/audio/station/'+line.id+'-'+digest+'.mp3', path=new URL(audio,root);
    try {await readFile(path);} catch (err) {
      if(err.code!=='ENOENT')throw err;
      const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice),{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},body:JSON.stringify({text:line.text,model_id:'eleven_multilingual_v2'}),signal:AbortSignal.timeout(90000)});
      if(!response.ok||!response.headers.get('content-type')?.startsWith('audio/'))throw Error('Speech request failed ('+response.status+').');
      const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<500)throw Error('Empty audio result.');
      const tmp=new URL(path.href+'.tmp');await writeFile(tmp,bytes);await rename(tmp,path);
    }
    manifest.push({...line,audio,voice});
  }
  const tmp=new URL('station-recordings.tmp',root);await writeFile(tmp,JSON.stringify(manifest,null,2));await rename(tmp,new URL('station-recordings.json',root));
}

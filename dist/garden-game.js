import {audio} from './audio.js?v=voices-supplied-v1';
export function mountGarden(root,getState,commit,leave,next){
 const token=crypto.randomUUID(),frame=document.createElement('iframe');
 frame.title='NEILO growing workshop';frame.style.cssText='display:block;width:100%;height:100svh;border:0;background:#0b211e';
 frame.src='./garden-workshop.html?token='+encodeURIComponent(token);
 let alive=true;
 const respond=(type,data={})=>frame.contentWindow?.postMessage({channel:'neilo-garden',token,type,...data},location.origin);
 function receive(e){
  if(!alive||e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.channel!=='neilo-garden'||e.data.token!==token)return;
  const m=e.data;
  if(m.type==='ready')respond('hydrate',{garden:getState().garden,name:getState().name,enabled:audio.enabled});
  if(m.type==='progress'){const r=commit({type:'garden-workshop-progress',snapshot:m.snapshot});if(!r.ok)respond('error',{message:r.message});}
  if(m.type==='complete'){const r=commit({type:'garden-workshop-finish'});respond(r.ok?'completed':'error',{message:r.message});}
  if(m.type==='reset'){const r=commit({type:'garden-workshop-reset'});if(r.ok)respond('reload');else respond('error',{message:r.message});}
  if(m.type==='leave')leave();
  if(m.type==='next'&&getState().garden.complete)next();
  if(m.type==='say')audio.say(String(m.text).slice(0,500));
  if(m.type==='voice'){if(m.playing)audio.stopVoice();audio.music.duck(m.playing===true);}
 }
 window.addEventListener('message',receive);root.replaceChildren(frame);
 return {stop(){alive=false;window.removeEventListener('message',receive);audio.stopVoice();audio.music.duck(false);}};
}

import {audio} from './audio.js?v=voices-supplied-v1';
export function mountPower(root,state,commit,leave){
 const token=crypto.randomUUID();
 const frame=document.createElement('iframe');frame.title='NEILO power wiring workshop';frame.style.cssText='display:block;width:100%;height:100svh;border:0;background:#07131d';
 frame.src='./power-workshop.html?stage='+(state.water>=5?'2':'1')+'&token='+encodeURIComponent(token);
 root.replaceChildren(frame);let alive=true;
 function receive(e){if(!alive||e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.channel!=='neilo-wiring'||e.data.token!==token)return;
 if(e.data.type==='leave'){leave();return;}
 if(e.data.type==='off'){commit({type:'power-off'});return;}
 if(e.data.type==='connect'){
  const device=e.data.device;if(!['pump','radio'].includes(device))return;
  if(device==='radio'&&state.water<5)return;
  const result=commit({type:'power-plan',devices:{lights:false,water:device==='pump',uplink:device==='radio'}});
  frame.contentWindow.postMessage({channel:'neilo-wiring',token,type:'result',ok:result.ok,message:result.message},location.origin);
 }
 }
 window.addEventListener('message',receive);
 return {stop(){alive=false;window.removeEventListener('message',receive);audio.stopVoice();}};
}

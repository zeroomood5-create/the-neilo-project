import {audio} from './audio.js?v=voices-supplied-v1';
import {powerUsed,capacity} from './engine.js';
export function mountPower(root,state,commit,leave) {
 let devices={...state.devices},selected=false,feedback='Tap the source, then a device to connect it.',tested=false;
 function render(){
  const demand=powerUsed({...state,devices});
  root.innerHTML='<section class="power-game"><header><span class="brand">NEILO ✦</span><span>1 · POWER CONNECTIONS</span><button class="glass-btn" data-leave>Back to room</button></header><main><h1>Bring a machine to life</h1><div class="circuit '+(demand>capacity?'over-budget':'')+'"><button class="source-node '+(selected?'selected':'')+'" data-source><b>ϟ</b><span>Power source</span><small>'+demand+' / '+capacity+' slots</small></button><div class="power-branches">'+[['lights','Cabin lights',1],['water','Water pump',3],['uplink','Radio',4]].map(([id,name,draw])=>'<div class="power-branch '+(devices[id]?'connected':'')+'"><i></i><button data-device="'+id+'" aria-pressed="'+devices[id]+'"><b>'+({lights:'☀',water:'◈',uplink:'⌁'}[id])+'</b><span>'+name+'</span><small>'+draw+' slots · '+(devices[id]?'connected':'disconnected')+'</small></button></div>').join('')+'</div></div><div class="protected-power">Life support · 2 slots · always connected</div><div class="power-capacity">'+Array.from({length:capacity},(_,i)=>'<i class="'+(i<demand?'used':'')+'"></i>').join('')+'</div></main><footer><img src="./assets/neilo-companion-v2.webp" alt="Neilo"><p role="status">'+feedback+'</p><button class="btn" data-test>Test my plan</button><button class="btn primary" data-follow '+(!tested?'hidden':'')+'>Follow the next light →</button></footer></section>';
  root.querySelector('[data-leave]').onclick=leave;
  root.querySelector('[data-source]').onclick=()=>{selected=true;feedback='Now choose the machine to connect. Tap a connected machine to pause it.';audio.say(feedback);render();};
  root.querySelectorAll('[data-device]').forEach(b=>b.onclick=()=>{
   if(!selected&&!devices[b.dataset.device]){feedback='Start at the glowing power source.';audio.say(feedback);render();return;}
   devices[b.dataset.device]=!devices[b.dataset.device];tested=false;feedback=devices[b.dataset.device]?'Cable connected. Test the plan to see whether it fits.':'Cable removed. That machine will wait for its turn.';
   audio.cue('tap');render();
  });
  root.querySelector('[data-test]').onclick=()=>{
   const result=commit({type:'power-plan',devices});feedback=result.message;tested=result.ok;render();
  };
  root.querySelector('[data-follow]').onclick=leave;
 }
 function key(e){if(e.key==='Escape')leave();}
 document.addEventListener('keydown',key);render();
 return {stop(){document.removeEventListener('keydown',key);audio.stopVoice();}};
}


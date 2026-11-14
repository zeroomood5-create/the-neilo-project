import {audio} from './audio.js?v=voices-supplied-v1';
export function playBriefing(root,done) {
 const beats=[
  ['A journey interrupted','A fault separated your safety capsule from the crew’s ship.','separation'],
  ['Two places, one team','Your crew is still in orbit. Your capsule landed at the old base.','landed'],
  ['Our first goal','Emergency air and heat are on. The radio is off. Find a way to reach your crew.','goal']
 ];
 let index=0,alive=true;
 function finish(){if(!alive)return;alive=false;audio.stopVoice();done();}
 function render(){
  if(!alive)return;
  const [title,text,stage]=beats[index];
  root.innerHTML='<section class="story-map '+stage+'" aria-label="Where you are"><header><span class="brand">NEILO ✦</span><button class="glass-btn" data-story-skip>Skip recap</button></header><main><div class="orbit-diagram"><div class="mars-world"></div><div class="orbit-ship">CREW<br><small>IN ORBIT</small></div><div class="capsule-dot"></div><div class="base-dot">YOU<br><small>AT THE BASE</small></div><div class="radio-broken">⌁</div></div><h1>'+title+'</h1><p>'+text+'</p></main><footer><button class="glass-btn" data-story-listen>Hear again</button><button class="btn primary" data-story-next>'+(index===2?'Step inside →':'Next →')+'</button></footer></section>';
  audio.sayCue(['recap-separated','recap-landed','recap-goal'][index]);
  root.querySelector('[data-story-listen]').onclick=()=>audio.sayCue(['recap-separated','recap-landed','recap-goal'][index]);
  root.querySelector('[data-story-skip]').onclick=finish;
  root.querySelector('[data-story-next]').onclick=()=>{if(index===2)finish();else{index++;render();}};
  root.querySelector('[data-story-next]').focus();
 }
 render();return {stop(){alive=false;audio.stopVoice();}};
}

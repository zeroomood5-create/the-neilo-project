import { audio } from './audio.js?v=voices-supplied-v1';

// Supplied Flow clips with imported James / Valf recordings.
export const cinematics = {
  opening: [
    { id:'voyage', audio:'assets/audio/supplied-v1/voyage.mp3', image:'assets/voyage.webp', video:'assets/video/voyage.mp4', duration:8100, speaker:'MISSION COMMANDER', caption:'Welcome, explorers. Our journey has brought us to Mars. Look below. That research base once helped people learn how to live here.' },
    { id:'harness', audio:'assets/audio/supplied-v1/harness.mp3', image:'assets/capsule.webp', video:'assets/video/harness.mp4', duration:13000, speaker:'MISSION COMMANDER', caption:'A guidance fault. Fasten your harness. Your safety capsule will take you down to the research base. We are safe in orbit.' },
    { id:'descent', audio:'assets/audio/supplied-v1/descent.mp3', image:'assets/capsule.webp', video:'assets/video/descent.mp4', duration:10000, speaker:'CAPSULE SYSTEM', caption:'Your capsule is approaching the base. Once inside, follow the lights.' },
    { id:'enter', audio:'assets/audio/supplied-v1/enter.mp3', image:'assets/arrival-bay.webp', video:'assets/video/enter.mp4', duration:10000, speaker:'YOUR NEXT STEP', caption:'The base is quiet. Beneath the workbench, a small robot waits. Take a closer look.' }
  ],
  crew: [
    { id: 'crew-signal', audio:'assets/audio/supplied-v1/crew-signal.mp3', image: 'assets/voyage.webp', video: null, duration: 11000, speaker: 'MISSION COMMANDER · RECEIVED MESSAGE', caption: 'We are safe in orbit. It is wonderful to hear from the base. Prepare your supplies, then send us your ready signal. We will plan the next step together.' }
  ],
  wake: [
    { id:'discover', image:'assets/arrival-bay.webp', video:'assets/video/discover.mp4', narration:'none', duration:7500, speaker:'A NEW COMPANION', caption:'A little help can make a big difference.' },
    { id:'wake', audio:'assets/audio/supplied-v1/wake.mp3', image:'assets/arrival-bay.webp', video:'assets/video/wake.mp4', duration:7500, speaker:'NEILO', caption:'Oh! You are new. I am NEILO. You are the first visitor in a very long time. Shall we explore together?' }
  ],
  signal: [
    { id: 'first-signal', audio:'assets/audio/supplied-v1/first-signal.mp3', image: 'assets/mission-control.webp', video: null, duration: 9000, speaker: 'NEILO', caption: 'There it goes. Your first signal! You gave every system its turn. And now your crew knows we are here. Together.' }
  ]
};

export function playCinematic(root, clips, onComplete) {
 let index=0, finished=false, paused=false, generation=0, frame, track, video;
 let start=0, elapsed=0, fallback=0, soundFailed=false, videoFailed=false, metadataAt=0;
 function stopMedia(){cancelAnimationFrame(frame);audio.stopVoice();audio.music.duck(false);track?.pause();video?.pause();}
 function done(){if(finished)return;finished=true;generation++;stopMedia();document.removeEventListener('visibilitychange',visibility);onComplete();}
 function next(){if(index<clips.length-1){index++;render();}else done();}
 function activeMedia(){
  return [!videoFailed&&video,audio.enabled&&!soundFailed&&track].filter(Boolean);
 }
 function tick(now){
  if(finished||paused)return;
  elapsed=now-start;
  const media=activeMedia();
  const loaded=media.filter(m=>Number.isFinite(m.duration)&&m.duration>0);
  // A short metadata grace period prevents static fallbacks from ending during a slow load.
  const waiting=loaded.length<media.length && now-metadataAt<10000;
  let duration=loaded.length?Math.max(...loaded.map(m=>m.duration*1000)):fallback;
  const position=loaded.length?Math.max(...loaded.map(m=>m.currentTime*1000)):elapsed;
  root.querySelector('.cinema-progress span').style.transform='scaleX('+Math.min(1,position/duration)+')';
  const ended=loaded.length?loaded.every(m=>m.ended||m.currentTime>=m.duration-.05):elapsed>=duration;
  if(!waiting&&ended&&clips[index].id!=='harness'){next();return;}
  frame=requestAnimationFrame(tick);
 }
 function play(media,isVoice,token){
  media.play().then(()=>{if(token!==generation||finished||paused)media.pause();}).catch(()=>{
   if(token!==generation||finished)return;
   if(isVoice){soundFailed=true;audio.music.duck(false);}else{videoFailed=true;media.hidden=true;}
  });
 }
 function render(){
  stopMedia();generation++;const token=generation,clip=clips[index];
  track=null;video=null;paused=false;soundFailed=false;videoFailed=false;
  start=metadataAt=performance.now();elapsed=0;fallback=clip.duration;
  root.innerHTML=`<section class="cinematic" aria-label="Story scene"><div class="cinema-image" style="background-image:url('${clip.image}')"></div>${clip.video?`<video playsinline muted preload="auto" src="${clip.video}" poster="${clip.image}"></video>`:''}<div class="cinema-shade"></div><header><div class="brand">NEILO<i>✦</i></div><span class="scene-counter">${index+1} / ${clips.length}</span><button class="glass-btn" data-cinema="skip">Skip scene</button></header><div class="cinema-subtitles" role="status"><small>${clip.speaker}</small><p>${clip.caption}</p>${clip.id==='harness'?'<button class="btn primary" data-cinema="buckle">Fasten my harness</button>':''}</div><footer><button class="glass-btn" data-cinema="sound">${audio.enabled?'Sound on':'Sound off'}</button><div class="cinema-progress"><span></span></div><button class="glass-btn" data-cinema="pause">Pause</button><button class="glass-btn" data-cinema="next">${index===clips.length-1?'Continue →':'Next scene →'}</button></footer></section>`;
  video=root.querySelector('video');
  if(video){video.onerror=()=>{videoFailed=true;video.hidden=true;};play(video,false,token);}
  if(clip.narration!=='none'){
   track=new Audio(clip.audio||'assets/audio/'+clip.id+'.mp3');
   track.preload='auto';track.onerror=()=>{soundFailed=true;audio.music.duck(false);};track.load();
   track.onended=()=>audio.music.duck(false);
   if(audio.enabled){audio.music.duck(true);play(track,true,token);}
  }
  root.querySelector('[data-cinema=skip]').focus();
  root.querySelectorAll('[data-cinema]').forEach(b=>b.onclick=()=>{
   if(['next','buckle'].includes(b.dataset.cinema))return next();
   if(b.dataset.cinema==='skip')return done();
   if(b.dataset.cinema==='pause')return setPaused(!paused);
   audio.toggle();b.textContent=audio.enabled?'Sound on':'Sound off';
   if(!audio.enabled){track?.pause();audio.music.duck(false);}
   else if(track&&!soundFailed&&!paused){track.currentTime=Math.min(track.duration||0,elapsed/1000);audio.music.duck(true);play(track,true,token);}
  });
  frame=requestAnimationFrame(tick);
 }
 function setPaused(value){
  if(finished||value===paused)return;paused=value;
  root.querySelector('.cinematic').classList.toggle('paused',value);
  root.querySelector('[data-cinema=pause]').textContent=value?'Resume':'Pause';
  if(value){elapsed=performance.now()-start;stopMedia();}
  else{start=performance.now()-elapsed;if(video&&!videoFailed)play(video,false,generation);if(track&&!soundFailed&&audio.enabled){audio.music.duck(true);play(track,true,generation);}frame=requestAnimationFrame(tick);}
 }
 function visibility(){if(document.hidden)setPaused(true);}
 document.addEventListener('visibilitychange',visibility);render();
 return {stop(){finished=true;generation++;stopMedia();document.removeEventListener('visibilitychange',visibility);}};
}
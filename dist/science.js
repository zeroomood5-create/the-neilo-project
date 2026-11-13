import { gardenScene } from './mission-view.js';
import {audio} from './audio.js?v=voices-supplied-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function illustration(visual) {
 if(['battery','pump','route','swap'].includes(visual)) return '<figure class="lesson-illustration power-cutaway"><img src="assets/power-science.png" alt="Illustrated battery connected to an electric motor that turns a water pump"><figcaption>BATTERY → MOTOR → PUMP <small>AI-generated illustration · simplified mechanism</small></figcaption></figure>';
 if(visual==='garden') return '<div class="lesson-illustration">'+gardenScene({crop:'lettuce',day:28})+'</div>';
 if(visual==='calendar') return '<div class="lesson-illustration crop-compare"><div><b>Leaf lettuce</b><strong>21–28</strong><span>days · approximate</span></div><div><b>Soybean</b><strong>45–65</strong><span>days · approximate</span></div></div>';
 if(visual==='kitchen') return '<div class="lesson-illustration kitchen-art"><div class="cooking-pot"><i></i><i></i><i></i></div><strong>HARVEST → PREPARE → SERVE</strong></div>';
 if(visual==='archive') return '<div class="lesson-illustration archive-art"><b>Curiosity · RAD</b><strong>84 readings</strong><span>Mars surface · 1 January 2015</span></div>';
 if(visual==='shelter') return '<div class="lesson-illustration shelter-art"><div class="rock-wall"></div><div class="sky-particles">⋮ ⋮ ⋮ ⋮ ⋮ ⋮ ⋮</div><strong>M12 · SEPTEMBER 2016</strong><span>Some sky is blocked by the terrain</span></div>';
 if(visual==='unknown') return '<div class="lesson-illustration unknown-art"><strong>—</strong><span>Measurement not available</span></div>';
 return null;
}
export function playLesson(root,lesson,name,done){
 let index=-1,paused=false,alive=true;
 function stop(){audio.stopVoice();}
 function finish(){if(!alive)return;alive=false;stop();document.removeEventListener('visibilitychange',visibility);done();}
 function speak(text){if(!paused)audio.say(text);}
 function render(){
  stop();paused=false;
  const intro=index===-1, question=index===lesson.frames.length, frame=lesson.frames[index];
  const title=intro?lesson.title:question?'Try the idea somewhere new':frame.title;
  const text=intro?lesson.personal(name):question?lesson.question:frame.text;
  const visual=intro?lesson.frames[0].visual:question?lesson.frames.at(-1).visual:frame.visual;
  const source=frame?.source||lesson.source;
  const art=illustration(visual);
  root.innerHTML='<section class="science-screen" aria-label="Mission science"><header><span class="brand">NEILO ✦</span><button class="glass-btn" data-sci="skip">Back to mission</button></header><div class="science-body"><small>'+esc(name)+' & NEILO · DISCOVERY</small><h1>'+esc(title)+'</h1>'+(art||'<div class="energy-animation '+visual+'" aria-label="Energy flow illustration"><div class="energy-sun">☀</div><div class="energy-path"></div><div class="energy-battery">▰<span>ENERGY</span></div><div class="energy-path"></div><div class="energy-device"><b class="pump-wheel">⚙</b><b class="radio-wave">⌁</b></div></div>')+'<p class="science-caption">'+esc(text)+'</p><p class="science-feedback" role="status"></p>'+(question?'<div class="science-choices">'+lesson.choices.map((c,i)=>'<button class="btn" data-choice="'+i+'">'+esc(c)+'</button>').join('')+'</div>':'')+'</div><footer><div><button class="glass-btn" data-sci="pause">Pause</button><button class="glass-btn" data-sci="repeat">Hear again</button></div><small>'+esc(lesson.scope)+' <a href="'+source.url+'" target="_blank" rel="noopener">'+esc(source.title)+'</a></small><button class="btn primary" data-sci="next">'+(question?'Continue adventure':'Next →')+'</button></footer></section>';
  root.querySelector('[data-sci=next]').focus();speak(text);
  root.querySelectorAll('[data-sci]').forEach(b=>b.onclick=()=>{
   if(b.dataset.sci==='skip')return finish();
   if(b.dataset.sci==='next'){if(question)return finish();index++;render();return;}
   if(b.dataset.sci==='repeat'){paused=false;root.querySelector('.science-screen').classList.remove('paused');root.querySelector('[data-sci=pause]').textContent='Pause';return speak(text);}
   paused=!paused;root.querySelector('.science-screen').classList.toggle('paused',paused);b.textContent=paused?'Resume':'Pause';if(paused)stop();else speak(text);
  });
  root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
   const correct=Number(b.dataset.choice)===lesson.correct;
   const line=correct?'Yes, '+name+'! You can use that idea on your next mission.':'Let’s look again. '+lesson.frames.at(-1).text;
   root.querySelector('.science-feedback').textContent=line;speak(line);
  });
 }
 function visibility(){if(document.hidden){paused=true;stop();root.querySelector('.science-screen')?.classList.add('paused');const b=root.querySelector('[data-sci=pause]');if(b)b.textContent='Resume';}}
 document.addEventListener('visibilitychange',visibility);render();
 return {stop(){alive=false;stop();document.removeEventListener('visibilitychange',visibility);}};
}

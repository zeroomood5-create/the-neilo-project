import { crops, gardenPlans, sources } from './mission-data.js';
import { audio } from './audio.js?v=voices-supplied-v1';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const control=(label,type,extra='',disabled=false)=>'<button class="btn" data-mission="'+type+'" '+extra+(disabled?' disabled':'')+'>'+label+'</button>';
export function sourceNote(source) {
 return '<details class="evidence-note"><summary>Science notebook</summary><p>'+esc(source.locator)+'</p><p>'+esc(source.scope)+'</p><a href="'+source.url+'" target="_blank" rel="noopener">'+esc(source.title)+'</a></details>';
}
function seedlings(crop,day) {
 const progress=crop?Math.min(1,day/crops[crop].modelDay):0;
 const height=progress===0?0:30+progress*110;
 return '<div class="seed-tray '+(crop||'empty')+'" style="--growth:'+height+'px">'+[0,1,2].map(i=>'<div class="plant plant-'+i+'"><i class="stem"></i>'+[0,1,2,3,4,5].map(j=>'<i class="leaf leaf-'+j+'"></i>').join('')+'</div>').join('')+'<div class="soil"></div></div>';
}
export function gardenScene(garden) {
 return seedlings(garden.crop,garden.day);
}
function gardenMarkup(state) {
 const g=state.garden, crop=crops[g.crop], plan=gardenPlans[g.round];
 const ready=crop&&g.day>=crop.modelDay;
 let actions='';
 if(g.complete) actions=control('Replay the science','explain')+control('Field notes →','next-mission');
 else if(!crop) actions=Object.entries(crops).map(([id,c])=>
  '<button class="seed-choice '+id+'" data-mission="garden-plant" data-crop="'+id+'"><b>'+c.name+'</b><span>'+c.days.join('–')+' days · approx.</span><small>'+c.preparation+'</small><small>'+c.nutrients+'</small></button>').join('');
 else if(!g.harvested) {
  actions=control(g.light?'Light on ☀':'Switch on light','garden-light')+control(g.water?'Water connected ◈':'Connect water','garden-water')+
   control(ready?'Harvest '+crop.name:'Advance 7 simulation days',ready?'garden-harvest':'garden-advance');
  if(g.day>=plan.deadline&&!g.reserve&&!ready) actions+=control('Use stored meals','garden-reserve');
  actions+=control('Replan this tray','garden-replan');
 } else if(crop.cooking&&!g.cooked) actions=control('Boil the soybeans','garden-cook')+control('Replan this tray','garden-replan');
 else if(g.round===0) actions=control('Try the longer menu →','garden-next');
 else actions=control('Serve the planned crop','garden-finish')+control('Replan this tray','garden-replan');
 const stage=g.complete?'Plans complete':g.harvested?(crop.cooking&&!g.cooked?'Harvested · needs cooking':'Ready to serve'):ready?'Harvest time':g.day?'Growing':'Choose a crop';
 return '<div class="mission-stage garden-stage"><div class="garden-window"></div><div class="grow-lamp '+(g.light?'lit':'')+'"></div>'+
  seedlings(g.crop,g.day)+'<div class="tray-label">'+esc(state.name)+'’s '+(crop?crop.name:'garden')+'</div>'+
  '<div class="calendar"><small>SIMULATION DAY</small><b>'+g.day+'</b><span>Meal plan · day '+plan.deadline+'</span></div>'+
  '<div class="garden-indicators"><span class="'+(g.light?'active':'')+'">☀ LIGHT</span><span class="'+(g.water?'active':'')+'">◈ WATER</span><span>'+esc(stage)+'</span></div></div>'+
  '<div class="mission-controls"><span class="eyebrow">GARDEN PLANNER · '+(g.round+1)+' / 2</span><h2>'+esc(g.complete?'You planned two harvests':plan.title)+'</h2><p>'+
  esc(g.complete?state.name+', your first plan used '+(crops[g.firstCrop]?.name.toLowerCase()||'an earlier crop')+'. Your second plan used cooked soybeans.':plan.request)+'</p>'+
  '<div class="mission-actions">'+actions+'</div>'+
  '<small class="model-note">Training simulation · Calendar jumps do not pass days in the base. We model harvest at the upper end of each teaching range. Meals include stored food and other ingredients.</small>'+
  sourceNote(sources.crops)+'</div>';
}
function surveyMarkup(state) {
 const s=state.scout;
 let actions='';
 const step=!s.priority?'Choose the first job':!s.archive?'Open the rover archive':!s.missing?'What does the dash mean?':!s.helped?'Repair the relay':!s.sent?'Send your field notes':'Report delivered';
 const line=!s.priority?'The crew needs a radio relay and a rover report. Which job will you start with?':!s.archive?'Open the rover archive. Look for a missing reading.':!s.missing?'A dash is not zero. What should we tell the crew?':!s.helped?'Repair the relay so the crew can receive your notes.':!s.sent?'Tell the crew what you know. The next site still needs a measurement.':'Your notes are ready for the next expedition.';
 if(!s.priority)actions=control('Fix the relay first','scout-priority','data-priority="base"')+control('Read rover data first','scout-priority','data-priority="evidence"');
 else if(!s.archive)actions=control('Open Curiosity’s readings','scout-archive');
 else if(!s.missing)actions='<div class="missing-field"><span>Equivalent dose rate: —</span>'+control('It measured zero','scout-missing','data-value="zero"')+control('No reading available','scout-missing','data-value="unknown"')+'</div>';
 else if(!s.helped)actions=control('Repair the relay','scout-help');
 else if(!s.sent){actions=control(s.study?'Send report with M12 study':'Send preliminary report','scout-report',s.study?'data-report="followup"':'data-report="preliminary"');if(!s.study)actions+=control('Look at one more study','scout-study');}
 else actions=control('Finish the chapter','next-mission')+control('Replay the science','explain');
 const study=s.study?'<article class="study-card"><b>M12 STUDY · SEPTEMBER 2016</b><p>Curiosity parked beside a butte that blocked about 19% of its surrounding sky view. Researchers found a 4% decrease in expected dose rate there.</p><small>The neutral-particle environment decreased 7.5%. That is a different measurement.</small>'+sourceNote(sources.butte)+'</article>':'<div class="butte-silhouette"><i></i><span>Murray Buttes · diagram</span></div>';
 return '<div class="mission-stage survey-stage"><div class="survey-route"><span class="'+(s.helped?'done':'waiting')+'">BASE RELAY · '+(s.helped?'REPAIRED':'WAITING')+'</span><span>ROBOT TURNS · '+s.turns+'</span></div>'+study+
  (s.archive?'<div class="rad-chart"><b>Curiosity / RAD · Mars surface · 1 Jan 2015</b><canvas width="720" height="220" tabindex="0" aria-label="84 archived absorbed dose rate readings. Use left and right arrows to inspect points."></canvas><p class="reading-label" aria-live="polite">Loading saved archive…</p><small>Absorbed dose rate · μGy/hour · historical instrument readings</small></div>':'<div class="archive-locked"><strong>What can a place change?</strong><p>Help NEILO read a real rover archive before sending your field notes.</p></div>')+'</div>'+
  '<div class="mission-controls"><span class="eyebrow">FIELD NOTES · '+(s.sent?'REPORT SENT':'YOUR PLAN')+'</span><h2>'+esc(step)+'</h2><p data-stage-line>'+esc(line)+'</p><div class="mission-actions">'+actions+'</div><small class="model-note">Planning scenario · Robot turns are game values. The 2015 graph and 2016 study describe separate observations. Our new site still needs measurement.</small>'+sourceNote(sources.rad)+'</div>';
}
export function mountMission(root,kind,getState,dispatch,leave,explain,nextMission) {
 let alive=true, feedback='',busy=false, archive=null;
 const controller=new AbortController();
 async function loadArchive() {
  try {
   const response=await fetch('./data/rad-2015-01-01.json',{signal:controller.signal});
   if(!response.ok)throw Error();
   const pack=await response.json();
   if(!Array.isArray(pack.data)||!pack.data.length||!pack.data.every(r=>typeof r[2]==='number'&&r[1]==='MSL-RAD-Surface'&&r[4]==='Mars surface'))throw Error();
   archive=pack.data;if(alive&&kind==='survey'&&getState().scout.archive)drawChart();
  }catch(e){if(!alive)return;const label=root.querySelector('.reading-label');if(label)label.textContent='Archive could not load. Return to the room and open the console to retry.';}
 }
 function drawChart() {
  const canvas=root.querySelector('.rad-chart canvas');if(!canvas||!archive)return;
  const ctx=canvas.getContext('2d'), values=archive.map(r=>r[2]);
  const low=Math.floor(Math.min(...values)), high=Math.ceil(Math.max(...values));
  let selected=0;
  function draw() {
   ctx.clearRect(0,0,720,220);ctx.font='13px sans-serif';ctx.textAlign='right';
   for(let v=low;v<=high;v++){const y=180-(v-low)/(high-low)*140;ctx.strokeStyle='#b3e0df22';ctx.beginPath();ctx.moveTo(44,y);ctx.lineTo(696,y);ctx.stroke();ctx.fillStyle='#c0ded9';ctx.fillText(v,34,y+4);}
   ctx.beginPath();
   archive.forEach((r,i)=>{const x=44+i/(archive.length-1)*652,y=180-(r[2]-low)/(high-low)*140;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
   ctx.strokeStyle='#85e6d9';ctx.lineWidth=2;ctx.stroke();
   const row=archive[selected], x=44+selected/(archive.length-1)*652,y=180-(row[2]-low)/(high-low)*140;
   ctx.fillStyle='#ffce8a';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
   ctx.textAlign='left';ctx.fillStyle='#c0ded9';ctx.fillText(archive[0][0].slice(11,16),44,207);ctx.textAlign='right';ctx.fillText(archive.at(-1)[0].slice(11,16),696,207);
   root.querySelector('.reading-label').textContent='Reading '+(selected+1)+' / '+archive.length+' · '+row[0]+' · '+row[2].toFixed(3)+' μGy/hour · Equivalent rate: '+(row[3]===null?'not available':row[3]);
  }
  canvas.onclick=e=>{const b=canvas.getBoundingClientRect();selected=Math.max(0,Math.min(archive.length-1,Math.round(((e.clientX-b.left)/b.width*720-44)/652*(archive.length-1))));draw();};
  canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();selected=Math.max(0,Math.min(archive.length-1,selected+(e.key==='ArrowLeft'?-1:1)));draw();};
  draw();
 }
 function render(){
  if(!alive)return;
  const state=getState();
  root.innerHTML='<section class="mission-screen '+kind+'-screen" aria-label="'+(kind==='garden'?'Garden planner':'Field notes')+'"><header><div><span class="brand">NEILO ✦</span><span>'+esc(state.name)+' · '+(kind==='garden'?'OUR FIRST GARDEN':'FIELD NOTES')+'</span></div><button class="glass-btn" data-exit>Back to room</button></header><div class="mission-layout">'+(kind==='garden'?gardenMarkup(state):surveyMarkup(state))+'</div><footer><img src="./assets/neilo-companion-v2.webp" alt="Neilo"><p class="mission-feedback" role="status">'+esc(feedback|| (kind==='garden'?state.name+', shall we try a plan before we grow?':'I’ll keep track of the jobs while you choose the order.'))+'</p><button class="glass-btn" data-help>Help</button><button class="glass-btn" data-listen>Hear again</button></footer></section>';
  root.querySelector('[data-exit]').onclick=leave;
  root.querySelector('[data-listen]').onclick=()=>audio.say(root.querySelector('[data-stage-line]')?.textContent||root.querySelector('.mission-feedback').textContent);
  root.querySelector('[data-help]').onclick=()=>{
   const g=state.garden,s=state.scout;
   const selector=kind==='garden'?(g.complete?'[data-mission=next-mission]':!g.crop?'[data-crop=lettuce]':!g.light&&!g.harvested?'[data-mission=garden-light]':!g.water&&!g.harvested?'[data-mission=garden-water]':g.day>=gardenPlans[g.round].deadline&&!g.reserve&&!g.harvested&&g.day<crops[g.crop].modelDay?'[data-mission=garden-reserve]':g.harvested?(crops[g.crop].cooking&&!g.cooked?'[data-mission=garden-cook]':g.round===0?'[data-mission=garden-next]':g.crop!=='soy'?'[data-mission=garden-replan]':'[data-mission=garden-finish]'):g.day>=crops[g.crop].modelDay?'[data-mission=garden-harvest]':'[data-mission=garden-advance]'):!s.priority?'[data-priority=base]':!s.archive?'[data-mission=scout-archive]':!s.missing?'[data-value=unknown]':!s.sent?'[data-report=preliminary]':!s.helped?'[data-mission=scout-help]':'[data-exit]';
   const target=kind==='survey'?(root.querySelector('[data-value=unknown]')||root.querySelector('[data-mission]')):root.querySelector(selector);target?.classList.add('hint-target');target?.focus();
   const text=kind==='garden'?'Look at the meal request, then compare time and preparation. Follow the highlighted control to try the next step.':root.querySelector('[data-stage-line]').textContent;
   root.querySelector('.mission-feedback').textContent=text;audio.say(text);
  };
  root.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{
   if(busy)return;
   audio.unlock();audio.cue('tap');
   const type=b.dataset.mission;
   if(type==='explain')return explain();
   if(type==='next-mission')return nextMission();
   if(kind==='survey' && type==='scout-report' && !archive){const msg='The rover readings have not loaded. Return to the room and open the archive again.';root.querySelector('.mission-feedback').textContent=msg;return;}
   busy=true;
   const result=dispatch({type,crop:b.dataset.crop,priority:b.dataset.priority,value:b.dataset.value,report:b.dataset.report});
   feedback=result.message;busy=false;
   if(alive){render();if(kind==='survey'&&!getState().pendingScience)audio.say(root.querySelector('[data-stage-line]').textContent);root.querySelector('.mission-feedback').focus();}
  });
  if(kind==='survey'&&state.scout.archive){if(archive)drawChart();else loadArchive();}
 }
 function key(event){if(event.key==='Escape')leave();}
 document.addEventListener('keydown',key);render();if(kind==='survey')audio.say(root.querySelector('[data-stage-line]').textContent);
 return {stop(){alive=false;controller.abort();document.removeEventListener('keydown',key);audio.stopVoice();}};
}


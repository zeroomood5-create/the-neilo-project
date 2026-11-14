const bridgeToken=new URLSearchParams(location.search).get('token');const send=(type,extra={})=>parent.postMessage({channel:'neilo-garden',token:bridgeToken,type,...extra},location.origin);let hydrating=true,cooked=false,voiceEnabled=true,lastSaved='',lastActivity=performance.now(),lastNudge='';
const $=s=>document.querySelector(s),svg=$('#scene'),NS='http://www.w3.org/2000/svg';
const crops={lettuce:{name:'lettuce',range:'21–28',days:28,deadline:35},soy:{name:'soybeans',range:'45–65',days:65,deadline:70}};
let crop=null,light=false,water=0,day=0,growing=false,ripe=false,served=false,pourTimer=null,growthTime=0,drag=null,boiling=false,lesson=0;
const picked=[false,false,false],nodes=[],basket=[];
const point=e=>new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
const hint=s=>{$('#hint').textContent=s;lastActivity=performance.now();};
function speech(s){stopLessonVoice();if(voiceEnabled)send('say',{text:s});}
function make(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;}
function drawPlant(i){
 const group=make('g',{'data-plant':i},$('#plants')),stem=make('path',{d:crop==='soy'?'M0 0Q4 -65 0 -128M0 -50L-43 -78M0 -80L40 -112':'M0 0V-40',class:'plant-stem'},group);
 const foliage=make('g',{},group),leaves=[];
 const count=crop==='soy'?5:7;
 for(let j=0;j<count;j++){
  const angle=crop==='soy'?(j%2?1:-1)*(50+j%3*13):(j-3)*23;
  const leaf=make('g',{},foliage);leaf.dataset.angle=angle;leaf.dataset.height=crop==='soy'?-30-j*18:-10;
  make('path',{d:crop==='soy'?'M0 0Q-48 -10 -35 -55Q2 -60 0 0Z':'M0 0C-17 -5 -50 -17 -46 -40C-70 -60 -40 -93 -20 -75C2 -85 22 -33 0 0Z',class:'leaf'},leaf);
  make('path',{d:crop==='soy'?'M0 0Q-16 -25 -30 -46':'M0 0Q-15 -32 -32 -62M-17 -34L-35 -37M-24 -48L-19 -64',class:'vein'},leaf);leaves.push(leaf);
 }
 const pick=crop==='lettuce'?foliage:make('g',{},group);
 if(crop==='soy')for(let j=0;j<4;j++){
  const pod=make('g',{transform:`translate(${j%2?19:-27} ${-47-j*20}) rotate(${j%2?22:-15})`},pick);
  make('path',{d:'M0 0Q-12 -18 0 -37Q14 -20 0 0Z',class:'pod'},pod);for(let k=0;k<3;k++)make('ellipse',{cx:1,cy:-8-k*9,rx:4,ry:4,fill:'#bdcf87'},pod);
 }
 make('rect',{x:-42,y:-150,width:84,height:155,fill:'transparent','pointer-events':'all'},pick);
 pick.classList.add('collectible');pick.setAttribute('data-harvest',i);pick.setAttribute('role','button');pick.setAttribute('tabindex','0');pick.setAttribute('aria-label','Harvest plant '+(i+1)+' when ready');
 const node={group,stem,foliage,leaves,pick,x:310+i*142,y:414,offset:{x:0,y:0},fly:null};nodes.push(node);
 pick.onpointerdown=e=>{if(!ripe||picked[i]||served)return;e.preventDefault();drag={i,start:point(e)};pick.setPointerCapture(e.pointerId);};
 pick.onpointermove=e=>{if(drag?.i!==i)return;const p=point(e);node.offset={x:p.x-drag.start.x,y:p.y-drag.start.y};};
 pick.onpointerup=e=>{if(drag?.i!==i)return;drag=null;const p=point(e);if(p.x>=755&&p.x<=950&&p.y>=350&&p.y<=550)harvest(i);else{node.fly={start:performance.now(),from:{...node.offset},to:{x:0,y:0},returning:true};hint('Bring just this plant’s harvest to the plate on the right.');}};
 pick.onpointercancel=()=>{drag=null;node.offset={x:0,y:0};};
 pick.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&ripe&&!picked[i]){e.preventDefault();harvest(i);}};
}
const pot=make('g',{id:'cooking-pot',display:'none'},svg);
make('path',{d:'M783 459H905L893 511H797Z',fill:'#52766b',stroke:'#bbd3be','stroke-width':3},pot);make('ellipse',{cx:844,cy:459,rx:62,ry:14,fill:'#90af91'},pot);
for(let j=0;j<3;j++)make('path',{d:`M${820+j*24} 431q-9 -12 0 -22q9 -10 0 -20`,class:'steam'},pot);
make('text',{x:766,y:566,class:'harvest-progress',id:'harvest-count'},svg).textContent='HARVEST 0 / 3';
function render(){
 persistProgress();
 $('#lamp').classList.toggle('lit',light);$('#light').textContent=light?'☀ Grow light ON':'☀ Turn grow light ON';
 $('#light').disabled=!crop||growing||ripe;$('#water').disabled=!crop||growing||ripe;
 $('#grow').disabled=!crop||!light||water<2||water>4||growing||ripe;
 $('#meter').innerHTML=Array.from({length:6},(_,i)=>'<i class="'+(i<water?(i>3?'extra':'wet'):'')+'"></i>').join('');
 $('#drain').hidden=water<=4||growing||ripe;$('#water-label').textContent=!crop?'Plant first. Then prepare the tray.':water>4?'Too much in our model. Drain a little.':water<2?'Hold briefly until the water marks fill.':'Water ready. You can stop pouring.';
 $('#day').textContent=Math.floor(day);$('#timebar').style.width=(crop?day/crops[crop].deadline*100:0)+'%';
 $('#s1').className=crop?'done':'active';$('#s2').className=ripe?'done':crop?'active':'';$('#s3').className=served?'done':ripe?'active':'';
 $('#harvest-count').textContent='HARVEST '+picked.filter(Boolean).length+' / 3';
}
function plant(id){
 if(crop)return;crop=id;$('#pack-lettuce').style.display='none';$('#pack-soy').style.display='none';$('#target').style.display='none';$('#drag-label').textContent='PREPARE THE LIGHT AND WATER';
 $('#deadline').textContent=crops[id].deadline;$('#heading').textContent=id==='soy'?'A longer plan: grow soybeans for day 70.':'Grow fresh lettuce for day 35.';
 $('#panel-title').textContent='Your '+crops[id].name+' tray';$('#status').textContent=id==='soy'?'Stored meals cover the earlier wait.':'Seeds planted · prepare conditions';
 hint(id==='soy'?'Soybeans need more time. We’ll use stored meals while this day-70 plan grows. Prepare the light and water.':'Lettuce is in. Turn on the grow light, then add water.');
 for(let i=0;i<3;i++)drawPlant(i);render();
}
for(const id of ['lettuce','soy']){
 const node=$('#pack-'+id),home={x:id==='lettuce'?80:744,y:174};let start;
 node.onpointerdown=e=>{if(crop)return;e.preventDefault();start=point(e);drag={seed:id};node.setPointerCapture(e.pointerId);};
 node.onpointermove=e=>{if(drag?.seed!==id)return;const p=point(e);node.setAttribute('transform',`translate(${home.x+p.x-start.x} ${home.y+p.y-start.y})`);};
 node.onpointerup=e=>{if(drag?.seed!==id)return;drag=null;const p=point(e);node.setAttribute('transform',`translate(${home.x} ${home.y})`);if(p.x>175&&p.x<750&&p.y>300&&p.y<485)plant(id);else hint('Release the packet over the growing tray.');};
 node.onpointercancel=()=>{drag=null;node.setAttribute('transform',`translate(${home.x} ${home.y})`);};
 node.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();plant(id);}};
}
$('#light').onclick=()=>{light=!light;hint(light?'Light is ready. Add water, then run our calendar simulation.':'The tray needs its light before growing.');render();};
function stopPour(){clearInterval(pourTimer);pourTimer=null;$('#rain').classList.remove('watering');$('#water').classList.remove('pouring');}
function startPour(){if(!crop||growing||ripe||pourTimer)return;$('#rain').classList.add('watering');$('#water').classList.add('pouring');const tick=()=>{water=Math.min(6,water+1);render();if(water>=6){stopPour();hint('Our tray is too wet. Drain some and try again.');}};tick();if(water<6)pourTimer=setInterval(tick,450);}
$('#water').onpointerdown=e=>{e.preventDefault();$('#water').setPointerCapture(e.pointerId);startPour();};$('#water').onpointerup=stopPour;$('#water').onpointercancel=stopPour;$('#water').onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();startPour();}};$('#water').onkeyup=stopPour;
window.addEventListener('blur',stopPour);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPour();});
$('#drain').onclick=()=>{water=Math.max(0,water-1);render();hint(water<=4?'Ready to try growing?':'Drain a little more.');};
$('#grow').onclick=()=>{if($('#grow').disabled)return;growing=true;stopPour();growthTime=day/crops[crop].days*(crop==='soy'?9500:6500);$('#heading').textContent='Watch weeks pass in our simulation.';$('#status').textContent='Accelerated calendar · no base days pass';hint('We are fast-forwarding a training calendar. Real plants take weeks, not seconds.');render();};
function harvest(i){
 if(picked[i])return;picked[i]=true;const n=nodes[i];n.fly={start:performance.now(),from:{...n.offset},to:{x:842-n.x+(i-1)*15,y:472-n.y},returning:false};render();
 if(picked.every(Boolean)){
  if(crop==='soy'){$('#cook').hidden=false;pot.setAttribute('display','');$('#heading').textContent='All three plants harvested. Prepare the soybeans.';$('#drag-label').textContent='SOYBEANS NEED PREPARATION';hint('Three harvests collected. The CSA example says to boil soybeans in their shells before eating. Try our cooking simulation.');}
  else finish();
 }else hint('Harvest '+picked.filter(Boolean).length+' of 3 collected. Bring the next plant’s harvest over.');
}
$('#cook').onclick=()=>{if(boiling||served)return;boiling=true;$('#cook').disabled=true;pot.classList.add('boiling');$('#heading').textContent='Preparing the soybean harvest.';hint('This animation represents boiling in shell. Its short duration is not a real cooking instruction.');setTimeout(()=>{boiling=false;pot.classList.remove('boiling');finish();},2600);};
const lessonData=()=>[
 {title:'Light helps a plant make food.',text:'Leaves use light, water and carbon dioxide to make sugars for growth.',art:'<div class="lesson-unit"><b>☀</b><small>LIGHT</small></div><span class="lesson-arrow">→</span><div class="lesson-unit"><b>🌿</b><small>LEAVES · WATER · CO₂</small></div><span class="lesson-arrow">→</span><div class="lesson-unit"><b>✦</b><small>SUGARS FOR GROWTH</small></div>'},
 {title:'A plant needs time, too.',text:'Different crops need different growing times. These example ranges are approximate.',art:'<div class="lesson-unit"><b>21–28</b><small>LETTUCE · DAYS</small></div><span class="lesson-arrow">≠</span><div class="lesson-unit"><b>45–65</b><small>SOYBEAN · DAYS</small></div>'},
 {title:'Harvest does not always mean ready to eat.',text:'Our soybean example needs boiling in its shell before serving.',art:'<div class="lesson-unit"><b>🌿</b><small>LETTUCE · NO PROCESSING LISTED</small></div><span class="lesson-arrow">/</span><div class="lesson-unit"><b>♨</b><small>SOYBEAN · BOIL IN SHELL</small></div>'},
 {title:'Your harvest adds variety.',text:'Different foods provide different nutrients. Your harvest adds variety to stored meals.',art:'<div class="lesson-unit"><b>🥬</b><small>FRESH CROPS</small></div><span class="lesson-arrow">+</span><div class="lesson-unit"><b>▣</b><small>OTHER FOODS</small></div><span class="lesson-arrow">→</span><div class="lesson-unit"><b>◉</b><small>A VARIED MENU</small></div>'}
];
const voiceIds=['science-light','science-time','science-prepare','science-variety'];
const lessonAudio=new Audio();lessonAudio.preload='auto';let voiceRequest=0,narrationEnabled=true;
function stopLessonVoice(){send('voice',{playing:false});voiceRequest++;lessonAudio.pause();lessonAudio.currentTime=0;speechSynthesis.cancel();$('#lesson-hear').textContent='Listen · Michael';}
function playLessonVoice(){
 stopLessonVoice();if(!voiceEnabled)return;send('voice',{playing:true});const request=voiceRequest;narrationEnabled=true;lessonAudio.src='assets/audio/garden-michael/'+voiceIds[lesson]+'.wav';
 $('#voice-status').textContent='Michael · local AI narration';
 lessonAudio.play().then(()=>{if(request===voiceRequest)$('#lesson-hear').textContent='Playing · Michael';}).catch(e=>{if(request===voiceRequest&&e.name!=='AbortError')$('#voice-status').textContent='Press Listen to start the narration.';});
}
lessonAudio.onended=()=>{send('voice',{playing:false});$('#lesson-hear').textContent='Listen again · Michael';};
lessonAudio.onerror=()=>{send('voice',{playing:false});$('#voice-status').textContent='This clip could not load. Press Listen to retry.';$('#lesson-hear').textContent='Retry · Michael';};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLessonVoice();});window.addEventListener('pagehide',stopLessonVoice);
function showLesson(){stopLessonVoice();const frames=lessonData(),f=frames[lesson];$('#lesson-count').textContent='THE SCIENCE BEHIND YOUR MISSION · '+(lesson+1)+' / '+frames.length;$('#lesson-title').textContent=f.title;$('#lesson-art').innerHTML=f.art;$('#lesson-text').textContent=f.text;$('#lesson-next').hidden=lesson===frames.length-1;$('#lesson-replay').hidden=lesson!==frames.length-1;}
function finish(){if(crop==='soy')cooked=true;persistProgress();send('complete');served=true;$('#cook').hidden=true;$('#heading').textContent='Three harvests. A new addition to the menu.';$('#drag-label').textContent='GARDEN TASK COMPLETE';hint('You harvested every plant separately. Now explore the science behind your plan below.');$('#science').hidden=false;showLesson();if(narrationEnabled)playLessonVoice();render();$('#science').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
$('#lesson-next').onclick=()=>{lesson=Math.min(3,lesson+1);showLesson();if(narrationEnabled)playLessonVoice();};$('#lesson-replay').onclick=()=>{lesson=0;showLesson();playLessonVoice();};$('#lesson-hear').onclick=playLessonVoice;$('#lesson-stop').onclick=()=>{narrationEnabled=false;stopLessonVoice();$('#voice-status').textContent='Narration stopped. Press Listen whenever you want.';};$('#hear').onclick=()=>help(true);$('#exit').onclick=()=>{persistProgress();stopLessonVoice();send('leave');};$('#next-mission').onclick=()=>{stopLessonVoice();send('next');};
let last=performance.now();function frame(t){const dt=Math.min(50,t-last);last=t;if(growing&&!document.hidden){growthTime+=dt;const duration=crop==='soy'?9500:6500;day=Math.min(crops[crop].days,growthTime/duration*crops[crop].days);if(day>=crops[crop].days){growing=false;ripe=true;$('#heading').textContent='Harvest one plant at a time.';$('#drag-label').textContent='DRAG EACH HARVEST TO THE PLATE →';$('#status').textContent='Day '+crops[crop].days+' · plan target '+crops[crop].deadline;hint('Harvest is ready. Drag one plant’s harvest onto the plate. The other two will stay in their tray.');}render();}
 for(const n of nodes){const progress=crop?day/crops[crop].days:0,scale=.11+progress*.89;n.group.setAttribute('transform',`translate(${n.x} ${n.y}) scale(${scale})`);for(let j=0;j<n.leaves.length;j++){const leaf=n.leaves[j],open=Math.max(.05,Math.min(1,progress*1.8-j*.1));const sway=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.sin(t/1600+n.x+j*.6)*1.4;leaf.setAttribute('transform',`translate(0 ${leaf.dataset.height}) rotate(${Number(leaf.dataset.angle)*open+sway}) scale(${.3+open*.7})`);leaf.style.opacity=.25+open*.75;}
 if(n.fly){const f=n.fly,p=Math.min(1,(t-f.start)/420),e=1-Math.pow(1-p,3);n.offset={x:f.from.x+(f.to.x-f.from.x)*e,y:f.from.y+(f.to.y-f.from.y)*e-Math.sin(p*Math.PI)*20};if(p===1){n.fly=null;if(!f.returning){n.pick.style.opacity=0;const item=make('g',{transform:`translate(${826+basket.length*16} 474) scale(.22)`},$('#plate'));item.innerHTML=n.pick.innerHTML;basket.push(item);}}}
 n.pick.setAttribute('transform',`translate(${n.offset.x/scale} ${n.offset.y/scale})`);
 }
 if(t-lastActivity>12000&&!document.hidden){const key=phaseKey();if(lastNudge!==key){lastNudge=key;help(false);}}requestAnimationFrame(frame);
}render();requestAnimationFrame(frame);

function snapshot(){return {version:1,crop,light,water,day:Math.floor(day),picked:[...picked],cooked};}
function persistProgress(){if(hydrating||!crop)return;const snap=snapshot(),key=JSON.stringify(snap);if(key===lastSaved)return;lastSaved=key;send('progress',{snapshot:snap});}
function phaseKey(){return [crop,light,water<2?'dry':water>4?'wet':'ready',growing,ripe,picked.filter(Boolean).length,cooked,served,lesson].join('|');}
function help(voice=true){
 document.querySelectorAll('.attention').forEach(n=>n.classList.remove('attention'));
 let selector,text;
 if(!crop){selector='#pack-lettuce';text='Drag either seed packet into the growing tray.';}
 else if(water>4){selector='#drain';text='The tray is too wet. Drain a little and try again.';}
 else if(!light&&!ripe){selector='#light';text='Turn on the grow light, then hold the water button.';}
 else if(water<2&&!ripe){selector='#water';text='Turn on the grow light, then hold the water button.';}
 else if(growing){selector='#day';text='We are fast-forwarding a simulation. Real plants take weeks to grow.';}
 else if(!ripe){selector='#grow';text='Conditions are ready. Start the training calendar.';}
 else if(picked.some(v=>!v)){selector='[data-harvest="'+picked.indexOf(false)+'"]';text='Drag one plant’s harvest to the plate. Then collect the next.';}
 else if(crop==='soy'&&!cooked){selector='#cook';text='Harvest collected. Simulate boiling the soybean pods before serving.';}
 else {selector=lesson<3?'#lesson-next':'#next-mission';text='Three harvests collected! Let us discover the science behind your plan.';}
 const target=$(selector);target?.classList.add('attention');if(voice){target?.focus({preventScroll:true});speech(text);}hint(text);
}
$('#help').onclick=()=>help(true);
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{lastActivity=performance.now();document.querySelectorAll('.attention').forEach(n=>n.classList.remove('attention'));});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==parent||e.data?.channel!=='neilo-garden'||e.data.token!==bridgeToken)return;
 const m=e.data;
 if(m.type==='completed'){$('#next-mission').hidden=false;return;}
 if(m.type==='error'){hint(m.message);return;}
 if(m.type==='reload'){location.reload();return;}
 if(m.type!=='hydrate')return;
 voiceEnabled=m.enabled!==false;
 const g=m.garden,w=g.workshop||(g.crop?{crop:g.crop,light:g.light,water:g.water?3:0,day:g.day,picked:[g.harvested,g.harvested,g.harvested],cooked:g.cooked}:null);
 if(w){plant(w.crop);light=w.light;water=w.water;day=w.day;ripe=day>=crops[crop].days;picked.splice(0,3,...w.picked);cooked=w.cooked;for(const [i,n]of nodes.entries())if(picked[i])n.pick.style.opacity=0;
  if(ripe){$('#heading').textContent='Harvest one plant at a time.';$('#drag-label').textContent='DRAG EACH HARVEST TO THE PLATE →';}
  if(picked.every(Boolean)&&crop==='soy'&&!cooked){$('#cook').hidden=false;pot.setAttribute('display','');}
 }
 hydrating=false;lastSaved=crop?JSON.stringify(snapshot()):'';render();if(g.complete||w&&picked.every(Boolean)&&(crop!=='soy'||cooked))finish();else help(false);
});
send('ready');

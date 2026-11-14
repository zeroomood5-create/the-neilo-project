import { content } from './content.js';
import { freshState, restoreState, applyAction, powerUsed, objectives, SAVE_KEY, capacity } from './engine.js';
import { createScene, resetScenePositions } from './scene.js';
import { audio } from './audio.js?v=voices-supplied-v1';
import { cinematics, playCinematic } from './cinematics.js?v=voices-supplied-v1';
import { menuMarkup, gameMarkup } from './presentation.js?v=voices-supplied-v1';

import { guidance, powerDisplay, memory } from './flight.js';
import { suitPicker } from './suits.js';
import { lessons } from './lessons.js';
import { playLesson } from './science.js';
import { nextStep, lockedReason, targetForRoom } from './progression.js';
import { playBriefing } from './briefing.js';
import { mountPower } from './power-game.js';
import { mountMission } from './mission-view.js';
import { mountGarden } from './garden-game.js';
let blockedDevice = null;
const endingLine='The crew heard you. The garden is growing. Next time, we step outside.';
function canEnd(){return state.sent && state.garden.complete && state.scout.sent && state.scout.helped && state.seen.includes('science-field') && !state.pendingScience;}
function ending(){
 if(!canEnd())return openMission('survey');
 closePanel();destroyScene();cinematicPlayer?.stop();cinematicPlayer=null;
 act({type:'seen',id:'end-phase-one'});
 app.innerHTML='<section class="expedition-end"><div class="end-card"><small>EXPEDITION LOG / 01 &nbsp; • &nbsp; TRANSMITTED</small><h1>First signal<br><em>received.</em></h1><p>'+escape(state.name)+', the crew has your field notes. The airlock window glows. Beyond it lies the next expedition.</p><strong>Chapter one complete</strong><p>This is a playable demo of NEILO’s journey on Mars. Surface exploration is the next chapter.</p><div class="actions">'+button('Roll credits','credits',true)+button('Return to base','back-base')+'</div></div></section>';
 audio.say(endingLine);
}
function checkPending(done){
 const lesson=lessons.find(l=>l.id===state.pendingScience);
 if(!lesson)return done();
 runScience(lesson,()=>{act({type:'seen',id:'science-'+lesson.id});done();});
}
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
let state = freshState();
let storageAvailable = true;
try { state = restoreState(localStorage.getItem(SAVE_KEY)); } catch { storageAvailable = false; }
let scene;
let walking = false;
let currentPanel = null;
let feedback = null;
let previousFocus;
let neiloMessage = '';
let mentorTab = 'energy';
let cinematicPlayer;

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const button = (label, action, primary = false) => `<button class="btn ${primary ? 'primary' : ''}" data-action="${action}">${label}</button>`;

function announce(text) {
  document.querySelector('#announcement').textContent = text;
}
function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
}
function act(action) {
  const result = applyAction(state, {...action,discovery:true});
  state = result.state;
  if (result.message && result.ok && ['water','calibrate','send'].includes(action.type)) result.message = state.name+', '+result.message[0].toLowerCase()+result.message.slice(1);
  feedback = result.message ? { text: result.message, ok: result.ok } : null;
  if (result.message) neiloMessage = result.message;
  persist();
  announce(result.message);
  if (result.message) { audio.cue(result.ok ? 'discover' : 'warning'); audio.say(result.message); }
  return result;
}
function defaultHint() {
  return guidance(state, currentPanel, blockedDevice).text;
}
function destroyScene() { scene?.destroy(); scene = null; }

function renderCover() {
  destroyScene();
  cinematicPlayer?.stop();
  app.innerHTML = menuMarkup(state);
  document.querySelector('#start-form').addEventListener('submit', event => {
    event.preventDefault();
    audio.unlock();
    audio.cue('discover');
    if (state.started) {
      state.name=String(new FormData(event.target).get('name')||state.name).trim().slice(0,24)||state.name;
      persist();neiloMessage='Welcome back, '+state.name+'. '+defaultHint();checkPending(()=>canEnd()?ending():renderGame());return;
    }
    act({ type: 'start', name: new FormData(event.target).get('name') });
    renderStory();
  });
}
function runMovie(clips, done) {
  destroyScene();
  cinematicPlayer?.stop();
  cinematicPlayer = playCinematic(app, clips, () => { cinematicPlayer = null; done(); });
}
function renderStory() {
  const itinerary = cinematics.opening.slice(0,3);
  runMovie(itinerary, () => {cinematicPlayer=playBriefing(app,()=>{cinematicPlayer=null;renderGame();});});
}
function runScience(lesson,done) {
  destroyScene();cinematicPlayer?.stop();
  cinematicPlayer=playLesson(app,lesson,state.name,()=>{cinematicPlayer=null;done();});
}
function openMission(kind) {
  if(kind==='garden' && state.pendingScience && state.pendingScience!=='garden')return checkPending(()=>openMission(kind));
  if (kind==='garden' && !state.sent) {feedback={text:'Send your first signal to open the garden planner.',ok:false};showPanel('plants');return;}
  if(kind==='survey' && state.pendingScience)return checkPending(()=>openMission('survey'));
  if (kind==='survey' && !state.garden.complete) {feedback={text:'Complete your garden plan, then the crew will open field notes.',ok:false};showPanel('survey');return;}
  closePanel();destroyScene();cinematicPlayer?.stop();
  const leave=()=>{cinematicPlayer?.stop();cinematicPlayer=null;renderGame();};
  if(kind==='garden'){cinematicPlayer=mountGarden(app,()=>state,act,leave,()=>checkPending(()=>openMission('survey')));return;}
  const explain=()=>{
    const lesson=lessons.find(l=>l.id===(kind==='garden'?'garden':'field'));
    runScience(lesson,()=>{act({type:'seen',id:'science-'+lesson.id});if(canEnd())ending();else openMission(kind);});
  };
  cinematicPlayer=mountMission(app,kind,()=>state,action=>{
    const result=act(action);
    if (result.ok && ['garden-finish','scout-report'].includes(action.type)) explain();
    return result;
  },leave,explain,()=>canEnd()?ending():explain());
}
function openPower() {
  closePanel();destroyScene();cinematicPlayer?.stop();
  cinematicPlayer=mountPower(app,state,act,()=>{cinematicPlayer?.stop();cinematicPlayer=null;neiloMessage=defaultHint();renderGame();});
}
function showGuide() {
  const card=document.querySelector('#guide-card');
  if(!card)return;
  const text=nextStep(state).text;
  card.innerHTML='<p>'+escape(text)+'</p><button class="text-btn" data-action="repeat">Hear again ♫</button>';
  card.hidden=state.tutorial==='done';
  if(state.tutorial!=='done')audio.say(text);

}
function renderGame() {
  destroyScene();
  app.innerHTML = gameMarkup(state, neiloMessage || defaultHint());
  scene = createScene(document.querySelector('#room-canvas'), state, { onStep: () => audio.cue('step') });
  showGuide();
  const canvas = document.querySelector('#room-canvas');
  canvas.addEventListener('click', event => {
    if (currentPanel || walking) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width * 100;
    const y = (event.clientY - bounds.top) / bounds.height;
    if (y < .65) { audio.cue('tap'); return; }
    walkOnFloor(x, Math.max(460, Math.min(582, y * 625)));
  });
  canvas.addEventListener('keydown', event => {
    if (currentPanel || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const position = scene.getPosition();
    const x = position.x + (event.key === 'ArrowLeft' ? -8 : event.key === 'ArrowRight' ? 8 : 0);
    const y = position.y + (event.key === 'ArrowUp' ? -24 : event.key === 'ArrowDown' ? 24 : 0);
    walkOnFloor(x, y);
  });
}
function walkOnFloor(x, y) {
  const marker = document.querySelector('#floor-marker');
  marker.style.left = `${Math.max(12, Math.min(88, x))}%`;
  marker.style.top = `${Math.max(460, Math.min(582, y)) / 625 * 100}%`;
  marker.classList.remove('active');
  void marker.offsetWidth;
  marker.classList.add('active');
  scene.walk(x, () => {
    if(state.tutorial==='walk' && Math.abs(x-60)<8) {
      act({type:'tutorial-arrived'});neiloMessage=nextStep(state).text;renderGame();
    } else document.querySelector('#movement-status').textContent='Tap the floor to walk · Select a glowing object to explore';
  }, y);
}

function showPanel(id, keepFocus = false) {
  currentPanel = id;
  if (!keepFocus) previousFocus = document.activeElement;
  let title = '';
  let eyebrow = 'MARS RESEARCH BASE';
  let body = '';
  if(id==='power'){currentPanel=null;return openPower();}
  const toggles = ids => content.devices.filter(device => ids.includes(device.id)).map(device => `<div class="device"><div><b>${device.name} <span class="mono" style="color:var(--cyan);font-size:12px">${device.draw} power</span></b><small>${device.description}</small></div><button class="switch ${state.devices[device.id] ? 'on' : ''}" data-toggle="${device.id}" aria-pressed="${state.devices[device.id]}">${state.devices[device.id] ? 'ON' : 'OFF'}</button></div>`).join('');
  if (id === 'wake') {
    title = `Hello, ${escape(state.name)}.`;
    eyebrow = 'A NEW COMPANION';
    body = '<p class="personal-greeting">'+escape(state.name)+', I’m glad you found me.</p><div class="robot-face" style="margin:25px auto" aria-hidden="true"></div><p>“I’m NEILO. You’re the first visitor in a very long time.”</p><p>His face lights up. He knows the base, but he’ll need your help finding out what still works.</p><div class="actions">' + button('Can we reach my crew?', 'wake-crew', true) + button('What is this place?', 'wake-place') + '</div>';
  } else if (id === 'window') {
    title = 'Through Curiosity’s eyes';
    eyebrow = 'WINDOW · ROVER PHOTO ARCHIVE';
    body = '<figure style="margin:0"><img src="./assets/science/PIA21044.jpg" alt="Thin layers cross a sandstone outcrop in the Murray Buttes on Mars." width="1344" height="1200" style="display:block;width:100%;max-height:43vh;object-fit:contain;background:#130f0a;border-radius:12px"><figcaption style="font-size:.82em;margin:.55em 0">Curiosity · Murray Buttes · 8 September 2016<br>NASA/JPL-Caltech/MSSS · <a href="https://www.jpl.nasa.gov/images/pia21044-farewell-to-murray-buttes-image-4/" target="_blank" rel="noopener noreferrer">Original rover photo ↗</a></figcaption></figure><p>Can you spot the stripes? Long ago, wind piled up sand in layers here.</p><div class="actions">' + button('Back to exploring', 'close', true) + '</div>';
  } else if (id === 'power') {
    title = 'A little power. A good plan.';
    eyebrow = 'POWER CONSOLE';
    body = `<div class="power-summary"><span>Power in use</span><strong>${powerUsed(state)} / ${capacity}</strong></div><div class="device"><div><b>Essential life support</b><small>Always running · 2 power</small></div><span class="eyebrow">PROTECTED</span></div>${toggles(['lights', 'water', 'uplink'])}<div class="actions">${button('Hear the energy specialist', 'mentor-energy')}${button('Back to the room', 'close', true)}</div>`;
  } else if (id === 'water') {
    title = 'Water for the wait.';
    eyebrow = 'WATER UNIT';
    body = `<p>Prepare stored water before you tell the crew the base is ready. One cycle uses <b>2 battery units</b> and prepares <b>2 water packs</b>.</p><div class="power-summary"><span>Prepared water</span><strong>${state.water} / 5 goal</strong></div>${toggles(['water'])}<p>Stored water available for preparation: ${state.rawWater} packs.</p><div class="actions">${button(state.water >= 5 ? 'Water is prepared ✓' : 'Run a water cycle', 'run-water', true)}${button('Hear the water specialist', 'mentor-agriculture')}${button('Open power routing', 'open-power')}</div>`;
  } else if (id === 'comms') {
    const powered=state.devices.uplink, tuned=state.calibrated;
    const line=state.sent?'Your crew received the message.':!powered?'First, connect both radio plugs at the power console.':!tuned?'Tune the antenna until the two signals line up.':'The crew can hear us. Send the ready signal.';
    eyebrow='ORBIT LINK / '+(state.sent?'DELIVERED':!powered?'01 · POWER':!tuned?'02 · TUNE':'03 · TRANSMIT');
    title=state.sent?'Message delivered':!powered?'Wake the radio':!tuned?'Find the crew’s signal':'Call your crew';
    body='<div class="radio-face"><span class="orbit-track"></span><b>'+(!powered?'OFFLINE':tuned?'LINK ACTIVE':'SEARCHING')+'</b></div><p>'+line+'</p>';
    if(state.sent)body+=button('Go to the garden','mission-garden',true);
    else if(!powered)body+=button('Connect the radio','open-power',true);
    else if(!tuned)body+='<label class="tuner">Match channel <b>6</b><input id="channel" type="range" min="1" max="9" value="2" aria-label="Antenna channel"><output id="channel-read">Channel 2</output></label>'+button('Lock signal','calibrate',true);
    else body+=button('Send ready signal','send',true);
    if(state.battery<(tuned?3:1))body+=button('Recharge battery','recharge');
  } else if (id === 'archive') {
    const mentor = content.mentors[mentorTab];
    title = mentor.name;
    eyebrow = 'STATION RECORDING';
    body = `<div class="mentor"><div class="mentor-portrait ${mentor.portrait}" role="img" aria-label="Illustrated adult ${mentor.name}"></div><div><div class="eyebrow">${mentor.role}</div><p>“${mentor.text}”</p></div></div><div class="actions">${button('Play recording ♫', 'play-mentor', true)}${button('Back to my station', 'mentor-back')}</div>`;
  } else if (id === 'survey') {
    title='NEILO’s field notes';
    body='<p>The crew has a rover archive for us. Our garden plans come first.</p><div class="actions">'+button('Open field notes','mission-survey',true)+button('Back to the room','close')+'</div>';
  } else if (id === 'plants') {
    title = 'Something green.';
    body = '<p>The crew is ready to plan fresh crops with us. Send the first signal to open this planner.</p><div class="actions">'+button('Open garden planner','mission-garden',true)+button('Hear the food & water specialist','mentor-agriculture')+button('Back to exploring','close')+'</div>';
  } else if (id === 'journal' || id === 'complete') {
    title = id === 'complete' ? 'A small signal. A big step.' : 'Your journey, so far.';
    eyebrow = id === 'complete' ? 'CREW CONTACT · MESSAGE DELIVERED' : 'JOURNEY LOG';
    body = `${id === 'complete' ? '<div class="completion-icon">⌁ ↗</div><p>' + escape(memory(state)) + '</p>' : ''}${state.journal.length ? state.journal.map(item => `<div class="journal-item"><small>YOUR CHOICE · ${String(item.id).padStart(2, '0')}</small>${escape(item.text)}</div>`).join('') : '<p>Your first discovery is waiting in the arrival bay.</p>'}<div class="actions">${button('Keep exploring', 'close', true)}${id === 'complete' ? button('Try a different path', 'restart') : ''}</div>`;
  } else if (id === 'objectives') {
    title = 'Our way home';
    body = objectives(state).map(item => `<div class="objective ${item.done ? 'done' : ''}"><span class="check">${item.done ? '✓' : ''}</span>${item.label}</div>`).join('') + `<div class="actions">${button('Back to exploring', 'close', true)}</div>`;
  } else if (id === 'credits') {
    title = 'The people behind NEILO';
    body='<p>Concept and direction · Ahmed Barakat and the NEILO team.</p><p>Science: NASA, CSA, ESA and the RAD research team. Art and cinematics: AI-assisted. NEILO narration: Kokoro / Michael.</p><a class="btn" href="./credits.html" target="_blank" rel="noopener">Full credits & sources ↗</a><div class="actions">'+button('Back','close',true)+'</div>';
  } else if (id === 'menu') {
    title = 'Your adventure.';
    body = `<p>Your journey is saved in this browser when storage is available.</p>${button('Where am I?','story-map')}<div class="actions">${button('Continue exploring', 'close', true)}${button('Replay the opening', 'replay')}${button('Pause & recharge battery', 'recharge')}${button('Start again', 'restart')}${button('Main menu', 'home')}${button('Credits', 'credits')}${button('About this prototype', 'about')}</div>`;
  } else if (id === 'restart') {
    title = 'A new adventure?';
    body = `<p>This replaces the journey saved in this browser. You’ll return to the beginning and can try a different plan.</p><div class="actions">${button('Keep this journey', 'close', true)}${button('Start a new journey', 'confirm-restart')}</div>`;
  } else if (id === 'recharge') {
    title = 'A moment to recharge.';
    body = `<p>Let a short time pass while the base charger restores up to <b>3 battery units</b>. Battery capacity is 8.</p><p>This prototype uses simplified time and energy rules for trying out the game.</p><div class="actions">${button('Pause & recharge', 'run-recharge', true)}${button('Back to exploring', 'close')}</div>`;
  } else if (id === 'about') {
    title = 'A first look at NEILO.';
    eyebrow = 'CONCEPT PROTOTYPE';
    body='<p>You and NEILO bring a fictional Mars base back online. Try the equipment, grow food, and report what a real rover measured.</p><p>The archive contains NASA Curiosity / RAD measurements. Water packs, battery slots, radio channels and growing animations are teaching models.</p><p>Your name and progress stay in this browser. Art and story clips are AI-assisted; NEILO uses recorded Kokoro speech.</p><a class="btn" href="./credits.html" target="_blank" rel="noopener">See sources and production credits</a>';
  }
  if (['power','water'].includes(id)) {
    body = powerDisplay(state, blockedDevice) + body;
    if(id==='water')body=body.replace(toggles(['water']),'');
    if (id === 'water') body += '<div class="tank" aria-label="Prepared water"><i style="width:'+Math.min(100,state.water*20)+'%"></i></div>';
    body += '<div class="actions">'+button('Show me','show-me')+(state.battery<3?button('Charge battery','recharge'):'')+'</div>';
  }
  if (id === 'complete') body += '<div class="actions">'+button('Our first garden →','mission-garden',true)+'</div>';
  if(id==='journal' && canEnd())body+=button('View chapter ending','chapter-end',true);
  if (id === 'journal') body += '<div class="actions">'+(state.sent?button('Garden planner','mission-garden'): '')+(state.garden.complete?button('Field notes','mission-survey'):'')+'</div>';
  if (id === 'journal' || id === 'complete') body += '<div class="actions">'+lessons.filter(l=>state.seen.includes('science-'+l.id)||(l.id==='garden'&&state.garden.complete)||(l.id==='field'&&state.scout.sent)).map(l=>button('Explore the science · '+l.title,'science-'+l.id)).join('')+'</div>';
  const focusedAction = keepFocus ? document.activeElement?.getAttribute('data-toggle') : null;
  modalRoot.innerHTML = `<div class="overlay"><section class="dialog ${id === 'archive' ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-head"><div><div class="eyebrow">${eyebrow}</div><h2 id="dialog-title">${title}</h2></div><button class="close" data-action="close" aria-label="Close dialog">×</button></div>${body}<button class="text-btn panel-voice" data-action="read-panel">Hear a short guide ♫</button>${feedback ? `<div class="feedback ${feedback.ok ? '' : 'attention'}" role="status">${escape(feedback.text)}</div>` : ''}</section></div>`;
  const tuner=modalRoot.querySelector('#channel');if(tuner)tuner.oninput=()=>{modalRoot.querySelector('#channel-read').textContent=Number(tuner.value)===6?'Channel 6 · signals match':'Channel '+tuner.value;};
  const focusTarget = focusedAction ? modalRoot.querySelector(`[data-toggle="${focusedAction}"]`) : null;
  (focusTarget || modalRoot.querySelector('.close')).focus();
}
function closePanel() {
  modalRoot.innerHTML = '';
  currentPanel = null;
  blockedDevice = null;
  feedback = null;
  audio.stopVoice();
  if (previousFocus?.isConnected) previousFocus.focus();
  else app.querySelector('[data-action="journal"]')?.focus();
}
function updateAfterAction(action) {
  const result = act(action);
  if (action.type === 'toggle') blockedDevice = !result.ok && !state.devices[action.device] ? action.device : null;
  const panel = currentPanel;
  const lesson=lessons.find(l=>l.action===action.type);
  const explain=done=>{
    if(!result.ok || !lesson || state.seen.includes('science-'+lesson.id))return done();
    runScience(lesson,()=>{act({type:'seen',id:'science-'+lesson.id});done();});
  };
  if (result.ok && action.type === 'water') {
    closePanel();
    explain(()=>{renderGame();showPanel(panel);});
    return;
  }
  if (result.ok && (action.type === 'calibrate' || action.type === 'send')) {
    closePanel();
    audio.cue('success');
    runMovie(action.type === 'send' ? cinematics.signal : cinematics.crew, () => {
      explain(()=>{renderGame();showPanel(action.type === 'send' ? 'complete' : 'comms');});
      if (action.type === 'send') audio.cue('success');
    });
    return;
  }
  renderGame();
  showPanel(panel, true);
}

function visit(id) {
  if (walking || currentPanel) return;
  let reason=lockedReason(state,id);
  if(state.tutorial==='walk')reason='Tap the glowing circle first. I’ll wait for you there.';
  if(state.tutorial==='discover' && id!=='wake')reason='Follow the little blue light under the bench.';
  if(state.tutorial==='help' && !['wake'].includes(id))reason='Tap my picture below so you know where to find help.';
  if(reason){
    neiloMessage=reason;document.querySelector('#neilo-message').textContent=reason;audio.say(reason);
    const target=targetForRoom(state);app.querySelector('[data-hotspot="'+target+'"]')?.classList.add('hint-target');
    return;
  }
  const spot = content.rooms[state.room].hotspots.find(item => item.id === id) || { walkX: 85 };
  walking = true;
  document.querySelector('#scene').classList.add('walking');
  document.querySelector('#movement-status').textContent = 'On our way…';
  scene.walk(spot.walkX, () => {
    walking = false;
    if (id === 'control' || id === 'habitat') {
      const result = act({ type: 'move', room: id });
      renderGame();
      if (!result.ok) showPanel('wake');
      return;
    }
    if (id === 'wake') {
      act({ type: 'wake' });
      runMovie(cinematics.wake, () => { renderGame(); showPanel('wake'); });
      return;
    }
    document.querySelector('#scene').classList.remove('walking');
    document.querySelector('#movement-status').textContent = 'Tap the floor to walk · Select a glowing object to explore';
    feedback = null;
    if (id === 'power') {openPower();return;}
    if (id === 'plants' && state.sent) {openMission('garden');return;}
    if (id === 'survey' && state.garden.complete) {openMission('survey');return;}
    if (id === 'archive') mentorTab = 'systems';
    if (id === 'health') { mentorTab = 'health'; showPanel('archive'); audio.say(content.mentors.health.text, 'commander'); return; }
    showPanel(id);
    const spoken = { power: 'This console shares power between the devices. Shall we choose what to run first?', water: 'This water unit needs power and stored energy. Let’s prepare enough water for the wait.', comms: 'Your crew is above us. Let’s give the communication desk enough power to find their signal.', archive: content.mentors.systems.text, plants: 'A little growing corner. Food, light and water are connected. There is a specialist recording here.' };
    if(id==='window')audio.sayCue('window-view');
    else if(id==='archive')audio.say(spoken[id],'commander');
    else if(id==='comms')audio.sayCue(!state.devices.uplink?'radio-connect':!state.calibrated?'radio-tune':'radio-transmit');
    else if(spoken[id])audio.say(spoken[id]);
  });
}
document.addEventListener('click', event => {
  if (event.target.closest('button')) { audio.unlock(); audio.cue('tap'); }
  const hotspot = event.target.closest('[data-hotspot]');
  if (hotspot) return visit(hotspot.dataset.hotspot);
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) return updateAfterAction({ type: 'toggle', device: toggle.dataset.toggle });
  const mentor = event.target.closest('[data-mentor]');
  if (mentor) { mentorTab = mentor.dataset.mentor; feedback = null; return showPanel('archive', true); }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if(action==='back-base'){closePanel();renderGame();return;}
  if(action==='chapter-end'&&canEnd())return ending();
  if (action === 'mission-garden') return openMission('garden');
  if (action === 'mission-survey') return openMission('survey');
  if (action === 'music') {
    audio.unlock();audio.music.toggle();
    document.querySelectorAll('[data-action=music]').forEach(b=>{b.textContent=audio.music.enabled?'Music on ♫':'Music off';b.setAttribute('aria-pressed',audio.music.enabled);});
    return;
  }
  if (action.startsWith('science-')) {
    const lesson=lessons.find(l=>'science-'+l.id===action);
    if(lesson){closePanel();runScience(lesson,()=>{renderGame();showPanel('journal');});}
    return;
  }
  if (action === 'sound') {
    audio.toggle();
    const buttons = document.querySelectorAll('[data-action="sound"]');
    buttons.forEach(button => { button.textContent = audio.enabled ? '♫' : '♪'; button.setAttribute('aria-label', audio.enabled ? 'Mute sound' : 'Enable sound'); });
    return;
  }
  if (action === 'fullscreen') {
    const promise = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    promise?.catch(() => { neiloMessage = 'Your browser is already using the available play space.'; });
    return;
  }
  if (action === 'story-map') {closePanel();destroyScene();cinematicPlayer=playBriefing(app,()=>{cinematicPlayer=null;renderGame();});return;}
  if (action === 'tutorial-walk') return walkOnFloor(60,550);
  if (action === 'guide-done') { document.querySelector('#guide-card').hidden = true; audio.stopVoice(); return; }
  if (action === 'repeat') return audio.say(state.tutorial!=='done'?nextStep(state).text:(neiloMessage || defaultHint()));
  if (action === 'read-panel') {
    if(currentPanel==='archive')return audio.say(content.mentors[mentorTab].text,'commander');
    if(currentPanel==='comms')return audio.sayCue(!state.devices.uplink?'radio-connect':!state.calibrated?'radio-tune':'radio-transmit');
    const cue={wake:'greeting',window:'window-view',power:'plug',water:'water-help',survey:'field-open',plants:'garden',journal:'log-summary',complete:'first-signal',credits:'credits-summary',menu:'menu-summary',restart:'restart-summary',about:'about-summary',recharge:'recharge'}[currentPanel];
    return cue?audio.sayCue(cue):audio.say(nextStep(state).text);
  }
  if (action === 'play-mentor') return audio.say(content.mentors[mentorTab].text, 'commander');
  if (action === 'mentor-back') { feedback = null; return showPanel({ energy:'power', agriculture: state.room === 'habitat' ? 'water' : 'plants', systems:'comms', health:'window' }[mentorTab]); }
  if (action === 'home') { closePanel(); renderCover(); return; }
  if (action === 'watch-intro') { audio.unlock(); runMovie(cinematics.opening, renderCover); return; }

  if (action === 'close') return closePanel();
  if (action === 'confirm-restart') {
    closePanel(); state = freshState(); neiloMessage = ''; resetScenePositions(); persist(); renderCover(); return;
  }
  if (action === 'replay') { closePanel(); renderStory(); return; }
  if (action === 'suit') return suitPicker(state, id => {
    state.avatar=id; persist(); document.querySelector('.suit-open').textContent='Explorer · '+({classic:'Original',pilot:'Teal pilot',personal:'My suit'}[id]);
  });
  if (action === 'hint' || action === 'show-me') {
    if(state.tutorial==='help'){act({type:'tutorial-help'});renderGame();}
    const hint = guidance(state,currentPanel,blockedDevice);
    neiloMessage = hint.text;
    const target=(currentPanel ? modalRoot : app).querySelector(hint.selector);
    if(target){target.classList.remove('hint-target');void target.offsetWidth;target.classList.add('hint-target');target.focus();}
    document.querySelector('#neilo-message').textContent=hint.text;
    if(currentPanel){
      let note=modalRoot.querySelector('.hint-note');
      if(!note){note=document.createElement('p');note.className='hint-note';modalRoot.querySelector('.dialog-head').after(note);}
      note.textContent=hint.text;
    }
    announce(hint.text);audio.say(hint.text);return;
  }
  if (action === 'wake-crew' || action === 'wake-place') {
    neiloMessage = action === 'wake-crew' ? 'We can try the communication desk. First, let’s find out what the base needs. I’ll come with you.' : 'This was a research base. My old team left recordings to help future explorers. Let’s find them together.';
    closePanel(); renderGame(); audio.sayCue(action==='wake-crew'?'wake-crew':'wake-place'); return;
  }
  if (action === 'run-water') return updateAfterAction({ type: 'water' });
  if(action==='calibrate' && Number(modalRoot.querySelector('#channel')?.value)!==6){const read=modalRoot.querySelector('#channel-read');if(read)read.textContent='Not aligned yet. Slide to channel 6.';audio.cue('warning');return;}
  if (action === 'calibrate') return updateAfterAction({ type: 'calibrate' });
  if (action === 'send') return updateAfterAction({ type: 'send' });
  if (action === 'run-recharge') return updateAfterAction({ type: 'recharge' });
  if (action.startsWith('mentor-')) { mentorTab = action.slice(7); feedback = null; showPanel('archive'); audio.say(content.mentors[mentorTab].text, 'commander'); return; }
  if (action === 'open-power') return openPower();
  feedback = null;
  showPanel(action);
});
document.addEventListener('keydown', event => {
  if (!currentPanel) return;
  if (event.key === 'Escape') { event.preventDefault(); closePanel(); }
  if (event.key === 'Tab') {
    const focusable = [...modalRoot.querySelectorAll('button:not(:disabled),input,a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
renderCover();

// A quiet visual nudge when an explorer pauses, without advancing their task.
let lastInputAt=performance.now(),lastNudged='';
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{lastInputAt=performance.now();});
setInterval(()=>{
 if(document.hidden||cinematicPlayer||walking||performance.now()-lastInputAt<12000||!document.querySelector('.play-shell'))return;
 const h=guidance(state,currentPanel,blockedDevice),key=(currentPanel||state.room)+'|'+h.selector+'|'+h.text;
 if(lastNudged===key)return;lastNudged=key;
 const target=(currentPanel?modalRoot:app).querySelector(h.selector);target?.classList.add('hint-target');
 const line=document.querySelector('#neilo-message');if(line)line.textContent=h.text;
},1500);

import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const b=await chromium.launch({channel:'chrome'});
try{
 const p=await b.newPage();const requests=[];p.on('request',r=>{if(r.url().includes('/assets/audio/'))requests.push(r.url());});
 await p.addInitScript(()=>{window.players=[];const Original=Audio;window.Audio=class extends Original{constructor(...a){super(...a);players.push(this);}};window.deviceCalls=0;speechSynthesis.speak=()=>deviceCalls++;});
 await p.goto(process.env.NEILO_TEST_URL||'http://localhost:4176');
 await p.evaluate(async()=>{const {freshState,SAVE_KEY}=await import('/engine.js');const s=freshState('Lina');Object.assign(s,{started:true,awake:true,tutorial:'done',room:'control'});localStorage.setItem(SAVE_KEY,JSON.stringify(s));});
 await p.reload();await p.locator('.play-button').click();
 for(const [text,id]of [['Tap the glowing circle. Watch your explorer walk there.','walk'],['First, let’s connect a device at the power console.','power-help'],['The tray is too wet. Drain a little and try again.','too-wet'],['Hello, Lina. I’m NEILO. Let’s find a way to reach your crew, together.','greeting']]){
  await p.evaluate(async text=>{const {audio}=await import('/audio.js?v=voices-supplied-v1');audio.say(text);},text);
  await p.waitForFunction(id=>players.some(a=>a.currentSrc.includes('/michael/'+id+'.mp3')&&!a.paused&&a.currentTime>.05),id);
 }
 assert.equal(await p.evaluate(()=>deviceCalls),0);assert.ok(!requests.some(x=>x.includes('supplied-v1/wake')||x.includes('supplied-v1/first-signal')));
 const sources=await p.evaluate(async()=>{const {cinematics}=await import('/cinematics.js?v=voices-supplied-v1');return [cinematics.wake[1].audio,cinematics.signal[0].audio];});
 assert.ok(sources.every(x=>x.includes('/michael/')));
 console.log('PASS Michael actual playback across robot guidance/greeting and new robot cinematic tracks; no synthetic or Valf fallback.');
}finally{await b.close();}

import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage();
 await page.addInitScript(()=>{window.players=[];const A=Audio;window.Audio=class extends A{constructor(...args){super(...args);players.push(this);}};window.deviceCalls=0;speechSynthesis.speak=()=>deviceCalls++;});
 await page.goto(process.env.NEILO_TEST_URL||'http://localhost:4176');
 await page.locator('.play-button').click();await page.locator('[data-cinema=skip]').click();
 await page.waitForFunction(()=>players.some(a=>a.currentSrc.includes('recap-separated')&&!a.paused));
 for(let i=0;i<2;i++){await page.locator('[data-story-next]').click();await page.waitForFunction(i=>players.some(a=>a.currentSrc.includes(['recap-landed','recap-goal'][i])&&!a.paused),i);}
 const report=await page.evaluate(async()=>{
  const catalog=await (await fetch('/michael-phase.json')).json();
  const {audio}=await import('/audio.js?v=voices-supplied-v1');
  const results=[];
  for(const clip of catalog.clips){
   audio.sayCue(clip.id);
   const deadline=performance.now()+6000;
   while(performance.now()<deadline&&!players.some(a=>a.currentSrc.endsWith(clip.audio)&&!a.paused&&a.readyState>=2))await new Promise(r=>setTimeout(r,25));
   results.push({id:clip.id,ok:players.some(a=>a.currentSrc.endsWith(clip.audio)&&!a.paused&&a.readyState>=2)});
  }
  audio.stopVoice();return {results,deviceCalls,missing:audio.status.unrecordedRobotLines};
 });
 assert.ok(report.results.length>=46);assert.deepEqual(report.results.filter(x=>!x.ok),[]);assert.equal(report.deviceCalls,0);assert.deepEqual(report.missing,[]);
 console.log('PASS three recap cards plus all '+report.results.length+' supplemental Michael clips decode and play, with zero device TTS or missing cues.');
}finally{await browser.close();}

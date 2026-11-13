import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try {
 const p=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:4176');
 await p.evaluate(async()=>{const {freshState,SAVE_KEY}=await import('/engine.js');const s=freshState('Salma');Object.assign(s,{started:true,awake:true,sent:true,room:'habitat',seen:['guide-arrival','guide-companion']});localStorage.setItem(SAVE_KEY,JSON.stringify(s));});
 await p.reload();await p.locator('.play-button').click();await p.locator('[data-hotspot=plants]').click();
 const act=async(type,extra='')=>p.locator('[data-mission="'+type+'"]'+extra).click();
 await act('garden-plant','[data-crop=lettuce]');await act('garden-light');await act('garden-water');
 for(let i=0;i<4;i++)await act('garden-advance');
 await p.screenshot({path:'qa/garden-ready.png'});
 await p.reload();await p.locator('.play-button').click();await p.locator('[data-hotspot=plants]').click();
 await act('garden-harvest');await act('garden-next');await act('garden-plant','[data-crop=soy]');await act('garden-light');await act('garden-water');
 for(let i=0;i<10;i++)await act('garden-advance');
 await act('garden-harvest');await act('garden-cook');await act('garden-finish');
 await p.getByRole('heading',{name:'Your garden has a plan'}).waitFor();
 await p.locator('[data-sci=skip]').click();await act('next-mission');
 await act('scout-priority','[data-priority=evidence]');await act('scout-archive');
 await p.waitForFunction(()=>document.querySelector('.reading-label')?.textContent.includes('84'));
 await act('scout-missing','[data-value=zero]');assert.match(await p.locator('.mission-feedback').innerText(),/unavailable/);
 await act('scout-missing','[data-value=unknown]');await act('scout-study');
 await p.screenshot({path:'qa/field-evidence.png'});
 for(const [width,height] of [[390,844],[844,390],[360,640]]){
  await p.setViewportSize({width,height});await p.screenshot({path:'qa/field-'+width+'.png'});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await act('scout-report','[data-report=followup]');await p.locator('[data-sci=skip]').click();
 await act('scout-help');await p.locator('[data-exit]').click();
 await p.locator('[data-action=journal]').click();assert.match(await p.locator('.dialog').innerText(),/relay repair still waiting/);
 const m=await p.evaluate(async()=>{const {audio}=await import('/audio.js?v=voices-supplied-v1');return audio.music.status;});
 assert.equal(m.track,'interstellar-soft');assert.deepEqual(errors,[]);
 console.log('PASS garden crop growth, reload, harvest, cooking, lesson; survey real graph, missing-data recovery, delayed relay, lesson, mobile and music.');
}finally{await browser.close();}


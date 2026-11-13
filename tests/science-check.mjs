import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try{
 const p=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:4176');
 await p.screenshot({path:'qa/menu-science.png'});
 await p.locator('[data-action=music]').click();
 assert.equal(await p.locator('[data-action=music]').getAttribute('aria-pressed'),'false');
 await p.evaluate(async()=>{
 const {freshState,SAVE_KEY}=await import('/engine.js');const s=freshState('Mariam');Object.assign(s,{started:true,awake:true,room:'habitat',devices:{lights:false,water:true,uplink:false},seen:['guide-arrival','guide-companion']});localStorage.setItem(SAVE_KEY,JSON.stringify(s));
 });
 await p.reload();await p.locator('.play-button').click();
 await p.locator('[data-hotspot=water]').click();await p.getByRole('button',{name:'Run a water cycle',exact:true}).click();
 await p.getByRole('heading',{name:'You made the pump work'}).waitFor();
 assert.match(await p.locator('.science-caption').innerText(),/Mariam/);
 await p.locator('[data-sci=next]').click();
 await p.screenshot({path:'qa/science-sun.png'});
 await p.locator('[data-sci=pause]').click();assert.equal(await p.locator('.science-screen.paused').count(),1);
 await p.locator('[data-sci=pause]').click();
 await p.locator('[data-sci=next]').click();await p.locator('[data-sci=next]').click();await p.locator('[data-sci=next]').click();
 await p.locator('[data-choice="1"]').click();assert.match(await p.locator('.science-feedback').innerText(),/look again/);
 await p.locator('[data-choice="0"]').click();assert.match(await p.locator('.science-feedback').innerText(),/Mariam/);
 await p.locator('[data-sci=next]').click();await p.reload();await p.locator('.play-button').click();
 await p.locator('[data-action=journal]').click();await p.getByRole('button',{name:/Explore the science/}).click();
 await p.locator('[data-sci=skip]').click();await p.keyboard.press('Escape');
 await p.locator('[data-action=menu]').click();await p.getByRole('button',{name:'Replay the opening'}).click();
 await p.waitForFunction(()=>document.querySelector('video')?.readyState>=1);
 const duration=await p.locator('video').evaluate(v=>v.duration);
 await p.locator('[data-cinema=sound]').click(); // mute gives the video the timeline
 await p.locator('video').evaluate(v=>v.currentTime=v.duration-.2);
 await p.waitForFunction(()=>document.querySelector('video')?.src.includes('harness'));
 assert.equal(await p.locator('[data-cinema=buckle]').count(),1);
 await p.locator('[data-cinema=buckle]').click();await p.locator('[data-cinema=skip]').click();
 assert.deepEqual(errors,[]);console.log('PASS · named science reward, pause, retry, persistence and replay, music preference, actual video-end transition.');
}finally{await browser.close();}


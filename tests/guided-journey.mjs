import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try{
 const p=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:4176');await p.locator('#explorer-name').fill('Mariam');await p.locator('.play-button').click();
 await p.locator('[data-cinema=skip]').click();
 for(let i=0;i<3;i++)await p.locator('[data-story-next]').click();
 await p.locator('canvas[data-assets=ready]').waitFor();
 const spot=id=>p.locator('[data-hotspot="'+id+'"]');
 const action=id=>p.locator('[data-action="'+id+'"]');
 await spot('wake').click();assert.equal(await p.locator('.cinematic').count(),0);
 await p.screenshot({path:'qa/guided-arrival.png'});
 await action('tutorial-walk').click();await p.locator('.tutorial-target').waitFor({state:'detached'});
 await spot('wake').click();await p.locator('[data-cinema=skip]').click();
 await action('wake-crew').click();await action('hint').click();
 await spot('control').click();await spot('power').waitFor();
 await spot('habitat').click();assert.match(await p.locator('#neilo-message').innerText(),/power console/);
 await spot('power').click();await p.locator('[data-source]').click();await p.locator('[data-device=uplink]').click();
 await p.locator('[data-test]').click();assert.match(await p.locator('.power-game footer p').innerText(),/too much power/);
 await p.locator('[data-device=lights]').click();await p.locator('[data-test]').click();
 await p.screenshot({path:'qa/power-connections.png'});
 await p.locator('[data-follow]').click();
 await spot('habitat').click();await spot('plants').click();assert.match(await p.locator('#neilo-message').innerText(),/First restore power/);
 await spot('water').click();await action('open-power').click();
 await p.locator('[data-source]').click();await p.locator('[data-device=water]').click();await p.locator('[data-device=uplink]').click();await p.locator('[data-test]').click();await p.locator('[data-follow]').click();
 await spot('water').click();await action('run-water').click();await p.locator('[data-sci=skip]').click();
 await p.locator('[data-toggle=water]').click();await action('close').click();
 await spot('control').click();await spot('power').click();await p.locator('[data-source]').click();await p.locator('[data-device=uplink]').click();await p.locator('[data-test]').click();await p.locator('[data-follow]').click();
 await spot('comms').click();await action('calibrate').click();await p.locator('[data-cinema=skip]').click();
 await action('send').click();await p.locator('[data-cinema=skip]').click();await p.locator('[data-sci=skip]').click();
 await action('mission-garden').click();await p.getByRole('heading',{name:'A fresh addition'}).waitFor();
 await p.locator('[data-exit]').click();
 const music=await p.evaluate(async()=>{const {audio}=await import('/audio.js?v=voices-supplied-v1');return audio.music.status;});
 assert.equal(music.playing,true);
 for(const [width,height] of [[390,844],[360,640],[844,390],[768,1024],[1366,768]]){
 await p.setViewportSize({width,height});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1));}
 await p.reload();await p.locator('.play-button').click();assert.equal(await p.locator('.tutorial-target').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS normal entry, story recap, action-based tutorial, early-route guards, power-plan failure/recovery, water, crew, signal, garden unlock, saved progress, five viewports and Interstellar playback.');
}finally{await browser.close();}


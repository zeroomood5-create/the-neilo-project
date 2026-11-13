import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
try{
 const p=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.NEILO_TEST_URL||'http://localhost:4176');await p.locator('#explorer-name').fill('Mariam');await p.locator('.play-button').click();
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
 const workshop=()=>p.frameLocator('iframe[title="NEILO power wiring workshop"]');
 const wire=async(kind,x,y)=>{const f=workshop();const board=await f.locator('#board').boundingBox(),plug=await f.locator('.plug').nth(kind==='out'?0:1).boundingBox();await p.mouse.move(plug.x+plug.width/2,plug.y+plug.height/2);await p.mouse.down();await p.mouse.move(board.x+x/960*board.width,board.y+y/580*board.height,{steps:20});await p.mouse.up();await p.waitForTimeout(220);};
 await spot('power').click();await workshop().locator('#switch').click();assert.match(await workshop().locator('#result').innerText(),/loop is open/);
 await wire('out',645,205);await wire('return',645,266);await workshop().locator('#switch').click();await workshop().locator('#pump.running').waitFor();
 await p.screenshot({path:'qa/power-connections.png'});await workshop().locator('#continue').click();
 await spot('habitat').click();await spot('plants').click();assert.match(await p.locator('#neilo-message').innerText(),/First restore power/);
 await spot('water').click();await action('run-water').click();await p.locator('[data-sci=skip]').click();await action('close').click();
 await spot('control').click();await spot('power').click();await wire('out',645,429);await wire('return',645,490);await workshop().locator('#switch').click();await workshop().locator('#radio.transmitting').waitFor();
 await wire('out',470,320);assert.equal(await workshop().locator('#radio.transmitting').count(),0);await wire('out',645,429);await workshop().locator('#switch').click();await workshop().locator('#radio.transmitting').waitFor();await workshop().locator('#continue').click();
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
 console.log('PASS normal entry, story recap, action-based tutorial, early-route guards, open circuit, real wire dragging, post-radio disconnect/reconnect, water, crew, signal, garden unlock, saved progress, five viewports and Interstellar playback.');
}finally{await browser.close();}


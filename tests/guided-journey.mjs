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
 const quiz=async()=>{await p.locator('[data-sci=skip]').click();const next=p.locator('[data-sci=next]');assert.ok(await next.isDisabled());await p.locator('[data-choice="1"]').click();assert.ok(await next.isDisabled());await p.locator('[data-choice="0"]').click();await next.click();};
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
 await spot('water').click();await action('run-water').click();await quiz();await action('close').click();
 await spot('control').click();await spot('power').click();await wire('out',645,429);await wire('return',645,490);await workshop().locator('#switch').click();await workshop().locator('#radio.transmitting').waitFor();
 await wire('out',470,320);assert.equal(await workshop().locator('#radio.transmitting').count(),0);await wire('out',645,429);await workshop().locator('#switch').click();await workshop().locator('#radio.transmitting').waitFor();await workshop().locator('#continue').click();
 await spot('comms').click();await action('calibrate').click();assert.match(await p.locator('#channel-read').innerText(),/Not aligned/);await p.locator('#channel').focus();await p.keyboard.press('Home');for(let i=0;i<5;i++)await p.keyboard.press('ArrowRight');await action('calibrate').click();await p.locator('[data-cinema=skip]').click();
 await action('send').click();await p.locator('[data-cinema=skip]').click();await quiz();
 await action('mission-garden').click();await p.frameLocator('iframe[title="NEILO growing workshop"]').locator('#pack-lettuce').waitFor();
 const f=p.frameLocator('iframe[title="NEILO growing workshop"]');
 await f.locator('#pack-soy').press('Enter');await f.locator('#light').click();await f.locator('#water').focus();await p.keyboard.down(' ');await p.waitForTimeout(650);await p.keyboard.up(' ');await f.locator('#grow').click();
 await f.getByRole('heading',{name:'Harvest one plant at a time.'}).waitFor();
 for(let i=0;i<3;i++)await f.locator('[data-harvest="'+i+'"]').press('Enter');await f.locator('#cook').click();await f.locator('#next-mission').click();
 await quiz();await p.locator('[data-priority=evidence]').click();await p.locator('[data-mission=scout-archive]').click();await p.locator('.reading-label').filter({hasText:'Reading 1'}).waitFor();await p.locator('[data-value=zero]').click();assert.equal(await p.locator('[data-report]').count(),0);
 await p.locator('[data-value=unknown]').click();await p.locator('[data-mission=scout-help]').click();await p.locator('[data-mission=scout-study]').click();await p.locator('[data-report=followup]').click();
 await p.reload();await p.locator('.play-button').click();await quiz();await p.locator('.expedition-end').waitFor();
 await action('credits').click();assert.ok(await p.locator('a[href="./credits.html"]').isVisible());await action('close').first().click();await action('back-base').click();
 const music=await p.evaluate(async()=>{const {audio}=await import('/audio.js?v=voices-supplied-v1');return audio.music.status;});
 assert.equal(music.playing,true);
 for(const [width,height] of [[390,844],[360,640],[844,390],[768,1024],[1366,768]]){
 await p.setViewportSize({width,height});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1));}
 await p.reload();await p.locator('.play-button').click();assert.equal(await p.locator('.tutorial-target').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS normal entry, story recap, action-based tutorial, early-route guards, open circuit, real wire dragging, post-radio disconnect/reconnect, water, crew, signal, garden unlock, saved progress, soy harvest, wrong/right quizzes, interrupted final question, field report, ending, credits, five viewports and Interstellar playback.');
}finally{await browser.close();}


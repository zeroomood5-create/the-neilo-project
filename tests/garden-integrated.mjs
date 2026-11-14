import {createRequire} from 'node:module';import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const b=await chromium.launch({channel:'chrome'});
try{for(const crop of ['lettuce','soy']){
 const p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.NEILO_TEST_URL||'http://localhost:4176');
 await p.evaluate(async()=>{const {freshState,SAVE_KEY}=await import('/engine.js');const s=freshState('Lina');Object.assign(s,{started:true,awake:true,sent:true,powerChecked:true,tutorial:'done',room:'habitat',water:5});localStorage.setItem(SAVE_KEY,JSON.stringify(s));});
 await p.reload();await p.locator('.play-button').click();await p.locator('[data-hotspot=plants]').click();
 let f=p.frameLocator('iframe[title="NEILO growing workshop"]');
 await f.locator('#help').click();await f.locator('#pack-lettuce.attention').waitFor();
 await f.locator('#pack-'+crop).press('Enter');await f.locator('#help').click();await f.locator('#light.attention').waitFor();
 await f.locator('#light').click();await f.locator('#water').focus();await p.keyboard.down(' ');await p.waitForTimeout(650);await p.keyboard.up(' ');await f.locator('#grow').click();
 await f.getByRole('heading',{name:'Harvest one plant at a time.'}).waitFor();
 await f.locator('[data-harvest="0"]').press('Enter');await p.waitForTimeout(150);
 await p.reload();await p.locator('.play-button').click();await p.locator('[data-hotspot=plants]').click();f=p.frameLocator('iframe[title="NEILO growing workshop"]');
 await f.locator('#harvest-count').filter({hasText:'1 / 3'}).waitFor();
 await f.locator('[data-harvest="1"]').press('Enter');await f.locator('[data-harvest="2"]').press('Enter');
 if(crop==='soy')await f.locator('#cook').click();
 await f.locator('#science').waitFor({state:'visible'});await f.locator('#next-mission').waitFor({state:'visible'});
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('neilo-first-signal-v1')));assert.ok(saved.garden.complete);assert.deepEqual(saved.garden.workshop.picked,[true,true,true]);
 await f.locator('#next-mission').click();await p.locator('[data-sci=skip]').click();await p.locator('[data-choice="0"]').click();await p.locator('[data-sci=next]').click();await p.locator('.survey-screen').waitFor();
 assert.deepEqual(errors,[]);await p.close();console.log('PASS '+crop+' integrated help, crop conditions, per-plant reload, preparation, science and next mission.');
}}finally{await b.close();}

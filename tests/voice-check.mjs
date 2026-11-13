import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const origin=process.env.NEILO_TEST_URL || 'http://localhost:4173';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage();
  await page.addInitScript(()=>{
    window.__playedAudio=[];window.__deviceSpeech=[];
    const NativeAudio=window.Audio;
    window.Audio=class extends NativeAudio{constructor(...args){super(...args);window.__playedAudio.push(this)}};
    if(window.speechSynthesis){const speak=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{window.__deviceSpeech.push(u.text);return speak(u)}};
  });
  await page.goto(origin);
  const files=await page.evaluate(async()=>{
    const rows=await fetch('./voice-lines.json?v=supplied-v1').then(r=>r.json());
    return Promise.all(rows.map(async row=>{
      const response=await fetch(row.audio);const bytes=await response.arrayBuffer();
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
      const clip=new Audio(row.audio);
      const duration=await new Promise((resolve,reject)=>{clip.onloadedmetadata=()=>resolve(clip.duration);clip.onerror=reject});
      return {id:row.id,status:response.status,hash,expectedHash:row.sha256,duration,expectedDuration:row.duration,voice:row.voice};
    }));
  });
  assert.equal(files.length,13);
  for(const row of files){assert.equal(row.status,200);assert.equal(row.hash,row.expectedHash,row.id);assert.ok(Math.abs(row.duration-row.expectedDuration)<.1,row.id)}
  assert.equal(files.find(r=>r.id==='wake').voice,'Valf - Young & Energetic');
  assert.match(files.find(r=>r.id==='voyage').voice,/James/);
  await page.getByRole('button',{name:'Play adventure'}).click();
  await page.waitForFunction(()=>window.__playedAudio.some(a=>a.src.includes('/supplied-v1/voyage.mp3')&&!a.paused&&a.currentTime>.2));
  for(const id of ['harness','descent']){
    await page.locator('[data-cinema="next"]').click();
    await page.waitForFunction(id=>window.__playedAudio.some(a=>a.src.includes(`/supplied-v1/${id}.mp3`)&&!a.paused&&a.currentTime>.15),id);
  }
  assert.deepEqual(await page.evaluate(()=>window.__deviceSpeech),[],'Opening fell back to a device voice');
  await page.locator('[data-cinema="skip"]').click();
  await page.waitForFunction(()=>window.__playedAudio.some(a=>a.src.includes('/supplied-v1/guide-arrival.mp3')&&!a.paused&&a.currentTime>.15));
  await page.locator('[data-action="guide-done"]').click();
  await page.locator('canvas[data-assets="ready"]').waitFor();
  await page.getByRole('button',{name:'A little blue light',exact:true}).click();
  await page.locator('[data-cinema="next"]').click();
  await page.waitForFunction(()=>window.__playedAudio.some(a=>a.src.includes('/supplied-v1/wake.mp3')&&!a.paused&&a.currentTime>.2));
  console.log(`PASS · ${origin}: all 13 imported file hashes/durations; James opening without device fallback; Valf guide and greeting play.`);
}finally{await browser.close()}

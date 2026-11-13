import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const browser = await chromium.launch({ channel:'chrome', headless:true });
const page = await browser.newPage({ viewport:{ width:1440, height:900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('qa', { recursive:true });

async function skipScene() {
  await page.locator('[data-cinema="skip"]').click();
}
async function dismissGuide() {
  const button = page.locator('[data-action="guide-done"]');
  if (await button.isVisible()) await button.click();
}
async function assertSingleScreen() {
  assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), 'Gameplay scrolls vertically');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Gameplay scrolls horizontally');
  for (const selector of ['.resource-hud', '.play-bottom', '#scene']) {
    const bounds = await page.locator(selector).boundingBox();
    assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height <= await page.evaluate(() => innerHeight) + 1, `${selector} leaves the viewport`);
  }
}

try {
  await page.goto('http://localhost:4173');
  await page.screenshot({ path:'qa/main-menu.png' });
  await page.locator('#explorer-name').fill('Ahmed');
  await page.getByRole('button', { name:'Play adventure' }).click();
  await page.locator('.cinematic').waitFor();
  await page.screenshot({ path:'qa/intro-cinematic.png' });
  const sound = await page.evaluate(async () => (await import('/audio.js?v=voices-supplied-v1')).audio.status);
  assert.equal(sound.context, 'running');
  assert.equal((await page.request.get('http://localhost:4173/assets/audio/voyage.mp3')).status(), 200);
  const voice = await page.evaluate(async () => {
    const clip = new Audio('/assets/audio/voyage.mp3');
    await new Promise((resolve, reject) => { clip.onloadedmetadata = resolve; clip.onerror = reject; });
    return clip.duration;
  });
  assert.ok(voice > 5);
  await page.locator('[data-cinema="pause"]').click();
  assert.equal(await page.locator('.cinematic.paused').count(), 1);
  await page.locator('[data-cinema="pause"]').click();
  await skipScene();
  await dismissGuide();
  await page.locator('canvas[data-assets="ready"]').waitFor();
  await assertSingleScreen();
  const canvas = await page.locator('canvas').boundingBox();
  await page.mouse.click(canvas.x + canvas.width * .7, canvas.y + canvas.height * .85);
  await page.waitForFunction(() => Number(document.querySelector('canvas').dataset.position) > 69 && document.querySelector('canvas').dataset.motion === 'idle');
  await page.getByRole('button', { name:'A little blue light', exact:true }).click();
  await skipScene();
  await page.getByRole('button', { name:'Can we reach my crew?' }).click();
  await dismissGuide();
  await page.getByRole('button', { name:'Safety station', exact:true }).click();
  await page.locator('.mentor-portrait.health').waitFor();
  assert.equal(await page.locator('.mentor-portrait.health').count(), 1);
  await page.getByRole('button', { name:'Close dialog', exact:true }).click();
  await page.getByRole('button', { name:'Go to mission control' }).click();
  await page.getByRole('heading', { name:'Mission control', exact:true }).waitFor();
  await page.locator('canvas[data-assets="ready"]').waitFor();
  await page.screenshot({ path:'qa/control-desktop.png' });
  await page.getByRole('button', { name:'Power console', exact:true }).click();
  await page.getByRole('button', { name:'Hear the energy specialist' }).click();
  assert.equal(await page.locator('.mentor-portrait.energy').count(), 1);
  assert.equal(await page.locator('.mentor-tabs').count(), 0);
  await page.getByRole('button', { name:'Back to my station' }).click();
  await page.locator('[data-toggle="water"]').click();
  await page.locator('[data-toggle="uplink"]').click();
  assert.match(await page.locator('.feedback').innerText(), /isn’t enough power/);
  await page.getByRole('button', { name:'Close dialog', exact:true }).click();
  await page.getByRole('button', { name:'Water & habitat', exact:true }).click();
  await page.getByRole('button', { name:'Water unit', exact:true }).click();
  await page.getByRole('button', { name:'Hear the water specialist' }).click();
  assert.equal(await page.locator('.mentor-portrait.agriculture').count(), 1);
  await page.getByRole('button', { name:'Back to my station' }).click();
  await page.getByRole('button', { name:'Run a water cycle', exact:true }).click();
  await page.locator('[data-sci="skip"]').click();
  await page.locator('[data-toggle="water"]').click();
  await page.getByRole('button', { name:'Close dialog', exact:true }).click();
  await page.getByRole('button', { name:'Mission control', exact:true }).click();
  await page.getByRole('button', { name:'Power console', exact:true }).click();
  await page.locator('[data-toggle="lights"]').click();
  await page.locator('[data-toggle="uplink"]').click();
  await page.getByRole('button', { name:'Close dialog', exact:true }).click();
  await page.getByRole('button', { name:'Communication desk', exact:true }).click();
  await page.getByRole('button', { name:'Calibrate · 1 battery', exact:true }).click();
  await skipScene();
  await page.getByRole('button', { name:'Send signal · 3 battery', exact:true }).click();
  await skipScene();
  await page.locator('[data-sci=skip]').click();
  await page.getByRole('heading', { name:'A small signal. A big step.', exact:true }).waitFor();
  await page.getByRole('button', { name:'Keep exploring', exact:true }).click();
  await page.reload();
  await page.getByRole('button', { name:'Continue adventure' }).click();
  await page.getByRole('button', { name:'View mission goals' }).click();
  assert.equal(await page.locator('.objective.done').count(), 4);
  await page.keyboard.press('Escape');
  for (const [width, height] of [[390,844], [360,640], [844,390], [768,1024], [1366,768]]) {
    await page.setViewportSize({ width, height });
    await page.locator('canvas[data-assets="ready"]').waitFor();
    await assertSingleScreen();
    await page.screenshot({ path:`qa/game-${width}x${height}.png` });
  }
  await page.getByRole('button', { name:'Crew archive', exact:true }).click();
  await page.locator('.mentor-portrait.systems').waitFor();
  assert.equal(await page.locator('.mentor-portrait.systems').count(), 1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name:'Mute sound', exact:true }).click();
  assert.equal(await page.evaluate(async () => (await import('/audio.js?v=voices-supplied-v1')).audio.status.enabled), false);
  assert.deepEqual(errors, []);
  console.log('PASS · single-screen HUD, floor movement, cinematic pause/skip, recorded narration metadata, audio context/mute, four station mentors, completion, reload and five viewport sizes.');
} finally {
  await browser.close();
}

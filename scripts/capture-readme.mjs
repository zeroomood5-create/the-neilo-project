import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PACKAGE||'playwright');
const browser=await chromium.launch({channel:'chrome'});
const base='https://zeroomood5-create.github.io/the-neilo-project/';
await mkdir('docs/images',{recursive:true});
try {
 const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await p.goto(base);await p.locator('.mission-kicker').waitFor();
 await p.screenshot({path:'docs/images/first-signal.jpg',type:'jpeg',quality:86});
 async function checkpoint(stage){
  await p.evaluate(async stage=>{
   const {freshState,SAVE_KEY}=await import(new URL('./engine.js',location.href).href);
   const s=freshState('Lina');Object.assign(s,{started:true,awake:true,tutorial:'done',powerChecked:true,room:'control',avatar:'pilot'},stage);
   if(stage.garden)s.garden={...freshState().garden,...stage.garden};
   localStorage.setItem(SAVE_KEY,JSON.stringify(s));localStorage.setItem('neilo-audio','off');localStorage.setItem('neilo-music','off');
  },stage);await p.reload();await p.locator('.play-button').click();await p.locator('canvas[data-assets=ready]').waitFor();
 }
 await checkpoint({});await p.locator('[data-hotspot=power]').click();
 let f=p.frameLocator('iframe[title="NEILO power wiring workshop"]');await f.locator('#board').waitFor();
 for(const [i,y]of [[0,205],[1,266]]){const board=await f.locator('#board').boundingBox(),plug=await f.locator('.plug').nth(i).boundingBox();await p.mouse.move(plug.x+plug.width/2,plug.y+plug.height/2);await p.mouse.down();await p.mouse.move(board.x+645/960*board.width,board.y+y/580*board.height,{steps:25});await p.mouse.up();}
 await f.locator('#switch').click();await f.locator('#pump.running').waitFor();await p.mouse.move(10,10);await p.screenshot({path:'docs/images/power-workshop.jpg',type:'jpeg',quality:86});
 await checkpoint({sent:true,water:5,room:'habitat',garden:{crop:'lettuce',workshop:{version:1,crop:'lettuce',light:true,water:3,day:28,picked:[false,false,false],cooked:false}}});
 await p.locator('[data-hotspot=plants]').click();f=p.frameLocator('iframe[title="NEILO growing workshop"]');await f.getByRole('heading',{name:'Harvest one plant at a time.'}).waitFor();await p.screenshot({path:'docs/images/growing-workshop.jpg',type:'jpeg',quality:86});
 await checkpoint({sent:true,water:5,garden:{crop:'soy',complete:true,round:1,harvested:true,cooked:true}});
 await p.locator('[data-hotspot=survey]').click();await p.locator('[data-priority=base]').click();await p.locator('[data-mission=scout-archive]').click();await p.locator('.reading-label').filter({hasText:'84'}).waitFor();await p.screenshot({path:'docs/images/rover-evidence.jpg',type:'jpeg',quality:86});
 console.log('Captured four current public gameplay screenshots from documented demo checkpoints.');
}finally{await browser.close();}

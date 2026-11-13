// Slice generated artwork, align each pose to a shared canvas and preserve alpha.
const sharp = require(process.env.SHARP_PACKAGE || 'C:/Users/Tiger/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const input = path.resolve(__dirname, '../../output/game-assets/motion-v2/walk-atlas-source.png');
  const out = path.resolve(__dirname, '../dist/assets/motion');
  await fs.mkdir(out, { recursive:true });
  const meta = await sharp(input).metadata();
  const cells = [];
  for (let row=0; row<2; row++) for(let col=0; col<8; col++) {
    const left=Math.round(col*meta.width/8), top=Math.round(row*meta.height/2);
    const width=Math.round((col+1)*meta.width/8)-left, height=Math.round((row+1)*meta.height/2)-top;
    const {data,info}=await sharp(input).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    // Locate opaque character pixels, excluding faint antialiasing outside the silhouette.
    let x0=width,y0=height,x1=0,y1=0;
    for(let y=0;y<height;y++) for(let x=0;x<width;x++) if(data[(y*width+x)*4+3]>100){ x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y); }
    cells.push({row,col,data,info,box:{left:Math.max(0,x0-2),top:Math.max(0,y0-2),width:Math.min(width,x1+3)-Math.max(0,x0-2),height:Math.min(height,y1+3)-Math.max(0,y0-2)}});
  }
  for(const cell of cells){
    const h=cell.row===0?404:382;
    const resized=await sharp(cell.data,{raw:cell.info}).extract(cell.box).resize({height:h,width:236,fit:'inside'}).png().toBuffer();
    const m=await sharp(resized).metadata();
    await sharp({create:{width:256,height:448,channels:4,background:'#00000000'}}).composite([{input:resized,left:Math.round((256-m.width)/2),top:428-m.height}]).webp({quality:92,alphaQuality:100}).toFile(path.join(out,`${cell.row?'neilo':'explorer'}-${cell.col}.webp`));
  }
  console.log('Prepared 16 aligned transparent walk frames.');
})().catch(e=>{console.error(e);process.exit(1)});

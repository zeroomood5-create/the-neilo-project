// Each sprite uses the same scale and ground anchor across all nine poses.
export function atlasFrames(image) {
  const frames = [];
  if (Math.abs(image.naturalWidth/image.naturalHeight-1)>.18) throw Error('Expected a square suit sheet.');
  for (let i = 0; i < 9; i++) {
    const w=Math.floor(image.naturalWidth/3), h=Math.floor(image.naturalHeight/3);
    const cell=document.createElement('canvas'); cell.width=w; cell.height=h;
    const ctx=cell.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,Math.round(i%3*image.naturalWidth/3),Math.round(Math.floor(i/3)*image.naturalHeight/3),w,h,0,0,w,h);
    const pixels=ctx.getImageData(0,0,w,h).data;
    let left=w, right=-1, top=h, bottom=-1;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(pixels[(y*w+x)*4+3]>80) {
      left=Math.min(left,x); right=Math.max(right,x); top=Math.min(top,y); bottom=Math.max(bottom,y);
    }
    if(right<=left || bottom-top<h*.4 || (left===0 && right===w-1 && top===0 && bottom===h-1)) throw Error('The suit sheet needs nine isolated poses.');
    frames.push({cell,left,right,top,bottom});
  }
  const scale=400/Math.max(...frames.map(f=>f.bottom-f.top+1));
  return frames.map(f=>{
    const pose=document.createElement('canvas'); pose.width=420; pose.height=420;
    const w=(f.right-f.left+1)*scale, h=(f.bottom-f.top+1)*scale;
    pose.getContext('2d').drawImage(f.cell,f.left,f.top,f.right-f.left+1,f.bottom-f.top+1,(420-w)/2,419-h,w,h);
    return pose;
  });
}
export async function decodeSheet(url) {
  const image=new Image(); image.src=url; await image.decode(); return atlasFrames(image);
}
export function personalSheet() {
  try { return localStorage.getItem('neilo-suit-sheet'); } catch { return null; }
}
export async function saveSheet(data) {
  const image=new Image(); image.src=data; await image.decode(); atlasFrames(image);
  const c=document.createElement('canvas'); c.width=image.width; c.height=image.height;
  c.getContext('2d').drawImage(image,0,0);
  localStorage.setItem('neilo-suit-sheet',c.toDataURL('image/webp',.88));
}
export async function preparePortrait(file) {
  if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>10*1024*1024) throw Error('Choose a JPG, PNG or WebP under 10 MB.');
  const image=new Image(), url=URL.createObjectURL(file);
  try {
    image.src=url; await image.decode();
    const scale=Math.min(1,768/Math.max(image.width,image.height));
    const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(image.width*scale)); c.height=Math.max(1,Math.round(image.height*scale));
    c.getContext('2d').drawImage(image,0,0,c.width,c.height);
    return await new Promise(resolve=>c.toBlob(resolve,'image/png'));
  } finally { URL.revokeObjectURL(url); }
}

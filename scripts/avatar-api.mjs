import { readFile } from 'node:fs/promises';
const prompt = 'Use the portrait as appearance reference for an illustrated explorer and the second image as the pose and style template. Create a transparent 3 by 3 full-body sprite sheet. Nine evenly spaced cells. First pose standing, eight walking poses facing right. Keep the same hair, face, colorful space suit and proportions in every pose. Clear transparent gutters, no text, no shadow. Only the new explorer appears.';
let busy=false;
export async function avatarApi(req,res) {
  const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  const host=req.headers.host;
  const eligible=local && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host||'') && !!process.env.OPENAI_API_KEY;
  if(req.method==='GET') return reply(200,{available:eligible});
  if(req.method!=='POST' || !eligible || req.headers.origin!=='http://'+host) return reply(403,{error:'Photo generation needs a configured local preview.'});
  if(busy) return reply(429,{error:'Another suit is being drawn.'});
  busy=true;
  try {
    const chunks=[]; let size=0;
    for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024)return reply(413,{error:'Portrait too large.'});chunks.push(chunk);}
    const png=Buffer.concat(chunks);
    if(!png.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) return reply(400,{error:'A PNG portrait is required.'});
    const form=new FormData();
    form.set('model','gpt-image-1.5');form.set('size','1024x1024');form.set('background','transparent');form.set('prompt',prompt);
    form.append('image[]',new Blob([png],{type:'image/png'}),'portrait.png');
    form.append('image[]',new Blob([await readFile(new URL('../dist/assets/pilot-atlas.png',import.meta.url))],{type:'image/png'}),'poses.png');
    const result=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,signal:AbortSignal.timeout(180000)});
    if(!result.ok)return reply(502,{error:'Image service declined the request ('+result.status+'). You can use a ready explorer.'});
    const payload=await result.json(); if(!payload.data?.[0]?.b64_json)throw Error();
    reply(200,{image:'data:image/png;base64,'+payload.data[0].b64_json});
  } catch {reply(502,{error:'The image service could not finish this suit.'});} finally {busy=false;}
}

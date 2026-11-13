import { preparePortrait, saveSheet, decodeSheet, personalSheet } from './avatar.js';

export function suitPicker(state, select) {
  const dialog=document.createElement('dialog'); dialog.className='suit-dialog';
  dialog.innerHTML='<h2>Choose your explorer</h2><canvas width="210" height="210" aria-label="Full suit preview"></canvas><div class="suit-choices"><button value="classic">Original explorer</button><button value="pilot">Teal pilot</button></div><p class="generator-status" role="status"></p><section hidden><label>Portrait <input type="file" accept="image/png,image/jpeg,image/webp"></label><label><input type="checkbox"> With my grown-up, send this portrait to OpenAI to draw a suit.</label><button class="generate">Draw my explorer</button></section><div class="actions"><button class="btn primary use">Use this explorer</button><button class="btn cancel">Cancel</button></div>';
  document.body.append(dialog);dialog.showModal();
  const get=q=>dialog.querySelector(q), status=get('.generator-status'), canvas=get('canvas');
  let selected=state.avatar||'classic', sequence=0, timer, pendingData=null;
  const draw=async id=>{
    const version=++sequence; clearInterval(timer); selected=id;
    get('.use').disabled=true;
    const ctx=canvas.getContext('2d');
    try {
      let frames;
      if(id==='classic'){const img=new Image();img.src='./assets/explorer-idle.webp';await img.decode();frames=[img];}
      else frames=await decodeSheet(id==='pilot'?'./assets/pilot-atlas.png':pendingData||personalSheet());
      if(version!==sequence||!dialog.open)return;
      let n=0;
      const paint=()=>{const im=frames[n];const width=200*im.width/im.height;ctx.clearRect(0,0,210,210);ctx.drawImage(im,(210-width)/2,5,width,200);n=frames.length===1?0:1+n%8;};
      paint();if(frames.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(paint,150);
      get('.use').disabled=false;
    } catch { if(version===sequence)status.textContent='This suit could not be read. Choose another explorer.'; }
  };
  if(personalSheet()){const btn=document.createElement('button');btn.value='personal';btn.textContent='My saved suit';get('.suit-choices').append(btn);
    const forget=document.createElement('button');forget.textContent='Forget saved suit';
    forget.onclick=()=>{localStorage.removeItem('neilo-suit-sheet');if(state.avatar==='personal')select('classic');btn.remove();forget.remove();pendingData=null;draw('classic');};
    get('.actions').append(forget);}
  get('.suit-choices').onclick=e=>{if(e.target.value)draw(e.target.value)};
  get('.cancel').onclick=()=>dialog.close();
  get('.use').onclick=async()=>{try{if(selected==='personal'&&pendingData)await saveSheet(pendingData);select(selected);dialog.close();}catch{status.textContent='There is not enough browser storage for this suit.';}};
  dialog.onclose=()=>{sequence++;clearInterval(timer);dialog.remove();};
  get('.generate').onclick=async()=>{
    if(!get('[type=checkbox]').checked){status.textContent='Confirm with your grown-up first.';return;}
    const button=get('.generate');button.disabled=true;
    try{const data=await preparePortrait(get('[type=file]').files[0]);status.textContent='Drawing your full suit and walk cycle…';
      const response=await fetch('/api/avatar',{method:'POST',headers:{'Content-Type':'image/png'},body:data});
      const result=await response.json();if(!response.ok)throw Error(result.error);
      if(!dialog.open)return;pendingData=result.image;status.textContent='Preview your explorer before saving.';await draw('personal');
    }catch(e){status.textContent=e.message;}finally{button.disabled=false;}
  };
  fetch('/api/avatar').then(r=>r.json()).then(r=>{get('section').hidden=!r.available;status.textContent=r.available?'You can also draw a suit from a portrait.':'Photo generation is offline. Both ready explorers are playable.';}).catch(()=>status.textContent='Photo generation is offline. Both ready explorers are playable.');
  draw(selected);
}

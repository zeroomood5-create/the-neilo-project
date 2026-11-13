let context, bus, player;
let allowed=true, quiet=false;
try { allowed=localStorage.getItem('neilo-music')!=='off'; } catch {}
function gain() {
 if(bus)bus.gain.setTargetAtTime(allowed?(quiet?.12:.38):0,context.currentTime,.2);
}
function play() {
 if(!player || !allowed || document.hidden || context.state!=='running')return;
 player.play().catch(()=>{});
}
export const music={
 start(ctx,output) {
  if(player){play();return;}
  context=ctx;bus=ctx.createGain();bus.connect(output);
  player=new Audio(new URL('./assets/music/interstellar-soft.mp3',import.meta.url).href);
  player.loop=true;player.preload='auto';
  const source=ctx.createMediaElementSource(player);
  source.connect(bus);gain();play();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause();else play();});
 },
 duck(value){quiet=value;gain();},
 toggle(){allowed=!allowed;try{localStorage.setItem('neilo-music',allowed?'on':'off');}catch{}gain();if(allowed)play();else player?.pause();return allowed;},
 get enabled(){return allowed;},
 get status(){return {track:'interstellar-soft',playing:!!player&&!player.paused,gain:bus?.gain.value||0,ducked:quiet};}
};

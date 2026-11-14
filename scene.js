import { decodeSheet, personalSheet } from './avatar.js';
const width = 1000;
const height = 625;
const images = new Map();
const roomPositions = new Map();
const roomFiles = { arrival: 'arrival-bay.webp', control: 'mission-control.webp', habitat: 'water-habitat.webp' };

function loadImage(file) {
  if (!images.has(file)) {
    images.set(file, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { images.delete(file); reject(new Error(`Unable to load ${file}`)); };
      image.src = new URL(`./assets/${file}`, import.meta.url).href;
    }));
  }
  return images.get(file);
}

export function resetScenePositions() {
  roomPositions.clear();
}

export function createScene(canvas, state, options = {}) {
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  const previous = roomPositions.get(state.room);
  let position = previous?.position ?? 48;
  let direction = previous?.direction ?? 1;
  let target = position;
  let ground = previous?.ground ?? 562;
  let targetGround = ground;
  let nextStep = 0;
  let speed = 0;
  let companionX = previous?.companionX ?? position * 10 - direction * 95;
  let stopped = false;
  let ready = false;
  let lastTime = 0;
  let walkTime = 0;
  let animation;
  let onArrival;
  let artwork;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tintPolygon(points, color) {
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function deviceStates() {
    if (!state.devices.lights) {
      ctx.fillStyle = '#071c3555';
      ctx.fillRect(0, 0, width, height);
    }
    if (state.room === 'control') {
      const screen = [[614, 281], [763, 264], [761, 341], [605, 349]];
      tintPolygon(screen, state.devices.uplink ? '#6cecff12' : '#0b182ddb');
      if (state.sent) {
        ctx.save();
        ctx.shadowColor = '#8ee4ed';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#bbffeb';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('SIGNAL SENT', 632, 312);
        ctx.restore();
      }
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = state.devices[['lights', 'water', 'uplink'][i]] ? '#adf9ff' : '#26364c';
        ctx.beginPath();
        ctx.arc(99 + i * 25, 376, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (state.room === 'habitat') {
      tintPolygon([[235, 345], [366, 345], [366, 394], [235, 394]], state.devices.water ? '#8ee4ed20' : '#07182ac9');
      ctx.fillStyle = state.devices.water ? '#c1fbff' : '#a0b3c4';
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#133248'; ctx.fillRect(244,382,96,8);
      ctx.fillStyle = '#67eddb'; ctx.fillRect(244,382,96*Math.min(1,state.water/5),8);
      ctx.fillText(state.water >= 5 ? 'WATER READY' : state.devices.water ? 'UNIT READY' : 'UNIT PAUSED', 252, 376);
    }
  }

  function sprite(image, x, ground, spriteHeight, facing = 1, tilt = 0, baseline = 1) {
    const spriteWidth = spriteHeight * image.width / image.height;
    ctx.save();
    ctx.fillStyle = '#10233845';
    ctx.beginPath();
    ctx.ellipse(x, ground - 3, spriteHeight * .17, spriteHeight * .035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x, ground);
    ctx.scale(facing, 1);
    ctx.rotate(tilt);
    ctx.drawImage(image, -spriteWidth / 2, -spriteHeight * baseline, spriteWidth, spriteHeight);
    ctx.restore();
  }

  // Room, equipment indicators and emergency lighting stay fixed during one walk.
  // Paint them once; moving characters are the only per-frame drawing work.
  let roomPlate;
  function draw(time = performance.now()) {
    if (stopped || !ready) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
    lastTime = time;
    const distance = target - position;
    const distanceY = targetGround - ground;
    const remaining = Math.hypot(distance * 10, distanceY);
    let moving = remaining > .5;
    if (moving) {
      const desiredSpeed = Math.min(280, Math.sqrt(2*550*remaining));
      speed += (desiredSpeed-speed) * (1-Math.exp(-8*delta));
      const fraction = Math.min(1, speed * delta / remaining);
      position += distance * fraction;
      ground += distanceY * fraction;
      walkTime += remaining * fraction / 280;
      if (walkTime >= nextStep) { options.onStep?.(); nextStep = walkTime + .33; }
    }
    if (Math.hypot((target-position)*10,targetGround-ground) <= .5) {position=target;ground=targetGround;speed=0;}
    moving = Math.hypot((target - position) * 10, targetGround - ground) > .5;
    canvas.dataset.motion = moving ? 'walking' : 'idle';
    canvas.dataset.position = position.toFixed(2);
    if(!roomPlate){
    ctx.drawImage(artwork.room, 0, 0, width, height);
    if (!state.sent) {
      ctx.save();ctx.fillStyle=state.powerChecked?'#071a3338':'#04182c99';ctx.fillRect(0,0,width,height);ctx.restore();
      ctx.save();ctx.fillStyle='#eab66b';ctx.shadowColor='#eab66b';ctx.shadowBlur=9;
      for(let x=80;x<960;x+=100)ctx.fillRect(x,585,40,3);
      ctx.restore();
    }
    deviceStates();
    roomPlate=document.createElement("canvas");roomPlate.width=width;roomPlate.height=height;roomPlate.getContext("2d").drawImage(canvas,0,0);
    }else ctx.drawImage(roomPlate,0,0);
    const bounce = moving && !reducedMotion ? Math.sin(walkTime * Math.PI * 4) * 1.05 : 0;
    const frame = Math.floor(walkTime * 11) % 8;
    canvas.dataset.walkFrame = String(frame);
    const pose = moving && !reducedMotion ? artwork.childWalk[frame] : artwork.child;
    const scale = .82 + (ground - 460) / 122 * .18;
    if (!state.awake && state.room === 'arrival') {
      ctx.save();
      ctx.globalAlpha = .72;
      sprite(artwork.robot, 705, 390, 95, 1, -.08);
      ctx.restore();
    }
    sprite(pose, position * 10, ground + bounce, 250 * scale, direction, 0, moving && !reducedMotion && !artwork.custom ? 428/448 : 1);
    ctx.save();
    ctx.font='bold 13px sans-serif';ctx.textAlign='center';
    const badgeWidth=Math.min(190,ctx.measureText(state.name).width+18);
    ctx.fillStyle='#0a2033dd';ctx.fillRect(position*10-badgeWidth/2,ground+8,badgeWidth,20);
    ctx.fillStyle='#dcf9f3';ctx.fillText(state.name,position*10,ground+23,180);ctx.restore();
    if (state.awake) {
      const desiredCompanionX = Math.max(65, Math.min(935, position * 10 - direction * 95));
      companionX = reducedMotion ? desiredCompanionX : companionX + (desiredCompanionX-companionX)*(1-Math.exp(-12*Math.max(delta,.001)));
      const robotX = companionX;
      const following=Math.abs(desiredCompanionX-companionX)>2;
      const robotPose = (moving||following) && !reducedMotion ? artwork.robotWalk[moving?frame:Math.floor(time/95)%8] : artwork.robot;
      sprite(robotPose, robotX, ground + bounce * .55, 155 * scale, direction, 0, moving && !reducedMotion ? 428/448 : 1);
    }
    roomPositions.set(state.room, { position, direction, ground, companionX });
    if (Math.hypot((target - position) * 10, targetGround - ground) <= .5 && onArrival) {
      const callback = onArrival;
      onArrival = null;
      callback();
    }
    const companionMoving = state.awake && Math.abs(companionX-Math.max(65,Math.min(935,position*10-direction*95)))>.6;
    if (!stopped && (moving || companionMoving)) animation = requestAnimationFrame(draw);
  }

  ctx.fillStyle = '#152b40';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#aee9ef';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Opening the base…', width / 2, height / 2);
  ctx.textAlign = 'start';
  canvas.dataset.assets = 'loading';
  const sheet = state.avatar === 'pilot' ? './assets/pilot-atlas.png' : state.avatar === 'personal' ? personalSheet() : null;
  Promise.all([
    loadImage(roomFiles[state.room]), loadImage('explorer-idle.webp'),
    loadImage('neilo-companion-v2.webp'),
    Promise.all(Array.from({length:8}, (_,i) => loadImage(`motion/explorer-${i}.webp`))),
    Promise.all(Array.from({length:8}, (_,i) => loadImage(`motion/neilo-${i}.webp`))),
    sheet ? decodeSheet(sheet).catch(() => null) : null
  ]).then(([room, child, robot, childWalk, robotWalk, poses]) => {
    if (stopped) return;
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
    artwork = { room, child: poses?.[0] || child, robot, childWalk: poses?.slice(1) || childWalk, robotWalk, custom: !!poses };
    canvas.dataset.explorer = poses ? state.avatar : 'classic';
    ready = true;
    canvas.dataset.assets = 'ready';
    animation = requestAnimationFrame(draw);
  }).catch(() => {
    if (stopped) return;
    canvas.dataset.assets = 'error';
    ctx.fillStyle = '#152b40';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ecf1ed';
    ctx.font = '18px sans-serif';
    ctx.fillText('Room artwork could not load. You can still use the markers.', 100, 300);
    if (onArrival) { const callback = onArrival; onArrival = null; callback(); }
  });

  return {
    getPosition() { return { x:position, y:ground }; },
    walk(x, callback, y = 562) {
      target = Math.max(12, Math.min(88, x));
      targetGround = Math.max(460, Math.min(582, y));
      direction = Math.sign(target - position) || direction;
      onArrival = callback;
      lastTime = performance.now();
      if (reducedMotion) { position = target; ground = targetGround; }
      if (ready) { cancelAnimationFrame(animation); animation = requestAnimationFrame(draw); }
      else if (canvas.dataset.assets === 'error') { onArrival = null; callback(); }
    },
    destroy() { stopped = true; cancelAnimationFrame(animation); }
  };
}

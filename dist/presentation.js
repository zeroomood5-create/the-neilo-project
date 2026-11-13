import { nextStep, lockedReason, targetForRoom, build } from './progression.js';
import { content } from './content.js';
import { powerUsed, capacity, objectives } from './engine.js';
import { audio } from './audio.js?v=voices-supplied-v1';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);

export function stationState(id, state) {
  if (lockedReason(state,id)) return 'locked';
  if (id === 'comms') return state.sent ? 'complete' : state.devices.uplink ? 'active' : 'available';
  if (id === 'water') return state.water >= 5 ? 'complete' : state.devices.water ? 'active' : 'available';
  if (id === 'plants') return state.garden.complete ? 'complete' : state.sent ? 'active' : 'available';
  if (id === 'survey') return state.scout.sent ? 'complete' : state.garden.complete ? 'active' : 'available';
  if (id === 'power') return 'active';
  if (id === 'wake') return 'discover';
  return 'available';
}

export function menuMarkup(state) {
  return `<section class="mainmenu"><div class="menu-backdrop"></div><header><span class="brand">NEILO<i>✦</i></span><button class="glass-btn" data-action="sound">${audio.enabled ? 'Sound on ♫' : 'Sound off'}</button></header><img class="menu-neilo" src="./assets/neilo-companion-v2.webp" alt="Neilo waiting for his explorer"><div class="menu-title"><span class="eyebrow">${build}</span><h1>NEILO<span class="title-star">✦</span></h1><p class="menu-story">A quiet base. A little blue light.<br>Your friend is waiting.</p><form id="start-form"><label for="explorer-name">Who’s flying today?</label><input id="explorer-name" name="name" maxlength="24" placeholder="Your name" autocomplete="off" value="${state.started ? escape(state.name) : ''}"><button class="suit-open" type="button" data-action="suit">Choose explorer</button><button class="play-button" type="submit">${state.started ? 'Continue adventure' : 'Play adventure'} <span>▶</span></button></form><div class="menu-links">${state.started ? '<button data-action="replay">Watch the story</button><button data-action="restart">New adventure</button>' : '<button data-action="watch-intro">Watch the story</button>'}<button data-action="credits">Credits</button></div></div><footer><span>Tap to explore · Headphones welcome</span><button class="glass-btn" data-action="music" aria-pressed="${audio.music.enabled}">${audio.music.enabled ? 'Music on ♫' : 'Music off'}</button></footer></section>`;
}

export function gameMarkup(state, message) {
  const room = content.rooms[state.room];
  const spots = room.hotspots.filter(spot => spot.id !== 'wake' || !state.awake);
  if (state.room === 'arrival' && state.awake) spots.push({ id:'control', label:'Mission control', icon:'→', x:93, y:56 });
  const roomImage = { arrival:'arrival-bay.webp', control:'mission-control.webp', habitat:'water-habitat.webp' }[state.room];
  const current = nextStep(state).label;
  const power = powerUsed(state);
  return `<section class="play-shell"><header class="play-top"><div class="play-place"><span class="brand">NEILO<i>✦</i></span><div><small>MARS RESEARCH BASE</small><h1>${room.name}</h1></div></div><div class="resource-hud" aria-label="Shared supplies"><div title="Power in use"><span>ϟ</span><b>${power}/${capacity}</b><small>POWER</small></div><div title="Battery reserve"><span>▰</span><b>${state.battery}/8</b><small>BATTERY</small></div><div title="Prepared water"><span>◈</span><b>${state.water}/5</b><small>WATER</small></div></div><nav><button class="hud-button music-toggle" data-action="music" aria-label="Toggle music" aria-pressed="${audio.music.enabled}">♫</button><button class="hud-button" data-action="sound" aria-label="${audio.enabled ? 'Mute sound' : 'Enable sound'}">${audio.enabled ? '♫' : '♪'}</button><button class="hud-button" data-action="fullscreen" aria-label="Toggle fullscreen">⛶</button><button class="hud-button" data-action="menu" aria-label="Open adventure menu">☰</button></nav></header><div class="play-viewport" style="--room-art:url('./assets/${roomImage}')"><div class="scene" id="scene"><canvas id="room-canvas" tabindex="0" role="img" aria-label="${room.name}. Tap the floor to walk, use arrow keys, or select an object."></canvas><div class="objective-chip"><span>✦</span><p>${current}</p><button data-action="objectives" aria-label="View mission goals">⌄</button></div>${spots.map(spot => `<button class="hotspot ${targetForRoom(state)===spot.id?'next-station':''} ${spot.x > 85 ? 'edge-right' : spot.x < 15 ? 'edge-left' : ''}" style="left:${spot.x}%;top:${spot.y}%" data-hotspot="${spot.id}" data-state="${stationState(spot.id, state)}" title="${spot.label} · ${stationState(spot.id, state)}" aria-label="${spot.id === 'control' && state.room === 'arrival' ? 'Go to mission control' : spot.label}"><span class="station-icon" aria-hidden="true">${lockedReason(state,spot.id)?'⌑':spot.icon}</span>${stationState(spot.id,state) === 'complete' ? '<span class="station-check" aria-hidden="true">✓</span>' : ''}<span class="label">${spot.label}</span></button>`).join('')}${!state.awake && state.tutorial==='walk' ? '<button class="tutorial-target" data-action="tutorial-walk" aria-label="Walk to the glowing circle"><span>☝</span></button>' : ''}<div id="floor-marker" class="floor-marker" aria-hidden="true"></div><div id="movement-status" class="walk-instruction">Tap the floor to walk · Select a glowing object to explore</div><div class="scene-vignette"></div></div></div><footer class="play-bottom"><button class="companion-button" data-action="hint" aria-label="Ask NEILO for help"><span class="robot-face"></span><span>${state.awake ? 'NEILO' : 'EXPLORE'}</span></button><div class="companion-message"><small>${state.awake ? `${escape(state.name)} & NEILO` : 'YOUR ADVENTURE BEGINS'}</small><p id="neilo-message">${escape(message)}</p></div><div class="play-tools"><button class="hud-button" data-action="repeat" aria-label="Repeat spoken guidance">↻</button><button class="hud-button" data-action="journal" aria-label="Journey log">▤</button></div></footer><div id="guide-card" class="guide-card" hidden></div></section>`;
}

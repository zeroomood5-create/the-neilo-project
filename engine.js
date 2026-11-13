import { content } from './content.js';
import { freshGarden, freshScout, restoreCampaign, campaignAction } from './campaign-state.js';

export const SAVE_KEY = 'neilo-first-signal-v1';
export const capacity = 6;
export const essentialDraw = 2;

export function freshState(name = 'Explorer') {
  return { version: 1, tutorial: 'walk', powerChecked: false, garden: freshGarden(), scout: freshScout(), avatar: 'classic', firstJob: null, name: String(name).trim().slice(0, 24) || 'Explorer', started: false, awake: false, room: 'arrival', battery: 8, water: 3, rawWater: 4, turn: 0, devices: { lights: true, water: false, uplink: false }, calibrated: false, received: false, sent: false, seen: [], journal: [], nextEvent: 1 };
}

export function powerUsed(state) {
  return essentialDraw + content.devices.reduce((total, device) => total + (state.devices[device.id] ? device.draw : 0), 0);
}

export function objectives(state) {
  return [
    { label: 'Meet NEILO', done: state.awake },
    { label: 'Connect a device at the power console', done: state.powerChecked },
    { label: 'Prepare water for the wait', done: state.water >= 5 },
    { label: 'Calibrate the antenna', done: state.calibrated },
    { label: 'Send your first signal', done: state.sent },
    { label: 'Plan our first garden', done: state.garden.complete },
    { label: 'Send your field notes', done: state.scout.sent }
  ];
}

export function restoreState(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1 || typeof saved.name !== 'string') return freshState();
    const state = freshState(saved.name);
    Object.assign(state, restoreCampaign(saved));
    for (const key of ['started', 'awake', 'calibrated', 'received', 'sent']) state[key] = saved[key] === true;
    state.tutorial = ['walk','discover','help','done'].includes(saved.tutorial) ? saved.tutorial : state.awake ? 'done' : 'walk';
    state.powerChecked = saved.powerChecked===true || state.sent || state.calibrated || saved.firstJob==='water' || saved.firstJob==='radio' || saved.water>=5 || saved.devices?.water===true || saved.devices?.uplink===true;
    for (const key of ['battery', 'water', 'rawWater', 'turn', 'nextEvent']) {
      if (Number.isInteger(saved[key]) && saved[key] >= 0 && saved[key] <= 10000) state[key] = saved[key];
    }
    if (['pilot','personal'].includes(saved.avatar)) state.avatar = saved.avatar;
    if (['water','radio'].includes(saved.firstJob)) state.firstJob = saved.firstJob;
    state.battery = Math.min(state.battery, 8);
    state.water = Math.min(state.water, 7);
    state.rawWater = Math.min(state.rawWater, 4);
    state.room = Object.hasOwn(content.rooms, saved.room) ? saved.room : 'arrival';
    if (!state.awake) state.room = 'arrival';
    for (const device of content.devices) state.devices[device.id] = saved.devices?.[device.id] === true;
    if (powerUsed(state) > capacity) state.devices = { lights: false, water: false, uplink: false };
    state.seen = Array.isArray(saved.seen) ? saved.seen.filter(item => typeof item === 'string').slice(-30) : [];
    state.journal = Array.isArray(saved.journal) ? saved.journal.filter(item => typeof item?.text === 'string' && Number.isInteger(item.id)).slice(-40) : [];
    if (!state.firstJob) {
      const job = state.journal.find(item => /^You (prepared water|calibrated the antenna)/.test(item.text));
      if (job) state.firstJob = job.text.startsWith('You prepared') ? 'water' : 'radio';
    }
    state.nextEvent = Math.max(state.nextEvent, ...state.journal.map(item => item.id + 1));
    return state;
  } catch {
    return freshState();
  }
}

export function applyAction(previous, action) {
  const state = structuredClone(previous);
  const reject = (message) => ({ state: previous, ok: false, message });
  let message = '';
  let note = '';
  if (action.type === 'tutorial-arrived') {
    if (state.tutorial !== 'walk') return reject('You already know this step.');
    state.tutorial='discover';
  } else if (action.type === 'tutorial-help' || action.type === 'tutorial-skip') {
    state.tutorial=action.type==='tutorial-skip'?'done':state.awake?'done':state.tutorial;
  } else if (action.type === 'power-plan') {
    if (!state.awake) return reject('Find NEILO first.');
    if (!action.devices || ['lights','water','uplink'].some(id=>typeof action.devices[id]!=='boolean')) return reject('Choose a device to connect.');
    state.devices={...action.devices};
    if (powerUsed(state)>capacity) return reject('That plan asks for too much power. Disconnect a device, then test again.');
    if (!state.devices.water && !state.devices.uplink) return reject('Connect the pump or radio to test a useful plan.');
    state.powerChecked=true;
    message='Your connections work. '+(state.devices.water?'The pump is ready.':'The radio has power.')+' Now follow the next station light.';
    note='You tested a power plan and connected '+(state.devices.water?'the pump.':'the radio.');
  } else if (action.type.startsWith('garden-') || action.type.startsWith('scout-')) {
    const result = campaignAction(state,action);
    if (!result.ok) return reject(result.message);
    message=result.message;note=result.note;
  } else if (action.type === 'start') {
    if (state.started) return reject('Your adventure has already started.');
    state.started = true;
    state.name = String(action.name || 'Explorer').trim().slice(0, 24) || 'Explorer';
  } else if (action.type === 'wake') {
    if (state.awake) return reject('I’m right here!');
    state.awake = true;
    if (state.tutorial!=='done') state.tutorial='help';
    message = `Hello, ${state.name}. I’m NEILO. Let’s find a way to reach your crew, together.`;
    note = 'You woke NEILO. Your exploration has a new companion.';
  } else if (action.type === 'move') {
    if (!state.awake) return reject('That little blue light might be worth checking first.');
    if (!Object.hasOwn(content.rooms, action.room)) return reject('That room is unavailable.');
    if (action.room==='habitat' && !state.powerChecked) return reject('First test a connection at the power console.');
    state.room = action.room;
  } else if (action.type === 'toggle') {
    if (!state.awake) return reject('Meet NEILO before changing the base systems.');
    if (!content.devices.some(device => device.id === action.device)) return reject('Unknown device.');
    state.devices[action.device] = !state.devices[action.device];
    if (powerUsed(state) > capacity) return reject('There isn’t enough power for that combination. Try pausing another device first. Your current setup is still running.');
    if (state.devices.water || state.devices.uplink) state.powerChecked=true;
    const device = content.devices.find(item => item.id === action.device);
    message = `${device.name} ${state.devices[action.device] ? 'on' : 'off'}. ${capacity - powerUsed(state)} power available.`;
    note = `You switched ${device.name.toLowerCase()} ${state.devices[action.device] ? 'on' : 'off'}.`;
  } else if (action.type === 'water') {
    if (!state.powerChecked) return reject('Test the power connections first.');
    if (!state.devices.water) return reject('The water unit needs power. You can set its power here or at the control-room console.');
    if (state.water >= 5) return reject('You’ve already prepared water for the wait. Let’s save the remaining supplies.');
    if (state.rawWater < 2) return reject('This cycle needs more stored water.');
    if (state.battery < 2) return reject('The battery needs a recharge before we run this cycle.');
    state.firstJob ??= 'water';
    state.rawWater -= 2;
    state.water += 2;
    state.battery -= 2;
    state.turn += 1;
    message = 'You prepared 2 water packs using 2 battery units. We have water for the wait! Now we can pause this unit and use its power elsewhere.';
    note = 'You prepared water for the crew.';
  } else if (action.type === 'calibrate') {
    if (state.calibrated) return reject('The antenna is already calibrated.');
    if (!state.devices.uplink) return reject('The communication desk needs 4 power. What could we pause to make room?');
    if (state.battery < 1) return reject('Let’s recharge the battery before the antenna check.');
    state.firstJob ??= 'radio';
    state.calibrated = true;
    state.received = true;
    state.battery -= 1;
    state.turn += 1;
    message = 'A voice! Your crew is safe in orbit. They’re trying to reach you. We can prepare a reply as soon as the base is ready.';
    note = 'You calibrated the antenna and heard from your crew.';
  } else if (action.type === 'send') {
    if (state.sent) return reject('Your message is already on its way.');
    if (!state.devices.uplink || !state.calibrated) return reject('Power the communication desk and calibrate its antenna first.');
    if (state.water < 5) return reject('Let’s prepare water for the wait before sending our ready signal.');
    if (state.battery < 3) return reject('We need 3 battery units for the message. Let’s recharge.');
    state.battery -= 3;
    state.turn += 1;
    state.sent = true;
    message = 'Your message is sent. You brought the base back to life, and your crew can plan the next step with you.';
    note = 'You sent your first signal by balancing the needs of the whole base.';
  } else if (action.type === 'recharge') {
    if (!state.awake) return reject('Let’s meet the little robot first.');
    if (state.battery >= 8) return reject('The battery is already full.');
    state.battery = Math.min(8, state.battery + 3);
    state.turn += 1;
    message = 'A short time passes. The base charger adds 3 battery units, up to its capacity. Ready when you are.';
    note = 'You paused to recharge before continuing.';
  } else if (action.type === 'seen') {
    if (!state.seen.includes(action.id)) state.seen.push(action.id);
  } else {
    return reject('That action is unavailable.');
  }
  if (note) state.journal.push({ id: state.nextEvent++, text: note });
  state.journal = state.journal.slice(-40);
  return { state, ok: true, message };
}

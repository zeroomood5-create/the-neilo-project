import { powerUsed, capacity } from './engine.js';

export function guidance(s, panel, blockedDevice) {
  const spot = (id, text) => ({ selector: '[data-hotspot="'+id+'"]', text });
  const action = (id, text) => ({ selector: '[data-action="'+id+'"]', text });
  const toggle = (id, text) => ({ selector: '[data-toggle="'+id+'"]', text });
  if (panel === 'recharge') return action('run-recharge', 'Give the battery a turn on the charger.');
  if (panel === 'power' || panel === 'water' || panel === 'comms') {
    const device = blockedDevice || (panel === 'comms' || (panel === 'power' && s.water >= 5) ? 'uplink' : 'water');
    if (panel !== 'power' && device !== (panel === 'water' ? 'water' : 'uplink')) return action('open-power', 'Open power routing to see both devices.');
    if (!s.devices[device]) {
      const draw = device === 'water' ? 3 : 4;
      if (capacity-powerUsed(s) < draw) {
        if (panel !== 'power') return action('open-power','Open power routing. See which slots are already full.');
        const other = device === 'water' ? 'uplink' : 'water';
        if (s.devices[other]) return toggle(other,'Pause the other station to free its slots.');
        return toggle('lights','Pause the extra cabin lights. Life support stays on.');
      }
      return toggle(device,'There is room now. Switch on the '+(device === 'water' ? 'pump.' : 'radio.'));
    }
    if (panel === 'power') return action('close','Power is connected. Go back to the room.');
    if (panel === 'water' && s.water < 5 && s.battery >= 2) return action('run-water','The pump is humming. Start one water cycle and watch the tank fill.');
    if (panel === 'comms' && !s.calibrated && s.battery >= 1) return action('calibrate','The radio has power. Align the antenna to hear the crew.');
    if (panel === 'comms' && s.calibrated && s.water >= 5 && !s.sent && s.battery >= 3) return action('send','Water is ready and the antenna is aligned. Send your signal.');
    if (s.battery < (panel === 'water' ? 2 : s.calibrated ? 3 : 1)) return action('recharge','The battery needs a charge before the next job.');
    return action('close','Head back into the room. Your next job is at another station.');
  }
  if (s.sent && !s.garden.complete) return s.room === 'habitat' ? spot('plants','The growing corner is ready for our garden planner.') : s.room === 'arrival' ? spot('control','Take the door to Mission control, then Water & habitat.') : spot('habitat','Go to Water & habitat to find the growing corner.');
  if (s.garden.complete && !s.scout.sent) return s.room === 'control' ? spot('survey','The field-notes console is waiting for your plan.') : spot('control','Return to Mission control for our field notes.');
  if (s.scout.sent) return action('journal','Open your log to see what we did together.');
  if (!s.awake) return spot('wake','Follow the little blue light under the bench.');
  if (s.room === 'arrival') return spot('control','The door to Mission control is on the right.');
  if (s.water < 5) return s.room === 'habitat' ? spot('water','Find the water unit on the left.') : spot('habitat','Go through the door to Water & habitat.');
  return s.room === 'habitat' ? spot('control','Take the left door back to Mission control.') : spot('comms','Find the communication desk and check the radio.');
}

export function powerDisplay(state, blocked) {
  const slots = ['Life support','Life support'];
  for (const [id, label, count] of [['lights','Lights',1],['water','Pump',3],['uplink','Radio',4]]) {
    if (state.devices[id]) slots.push(...Array(count).fill(label));
  }
  while (slots.length < capacity) slots.push('Free');
  const needed = blocked === 'water' ? 3 : blocked === 'uplink' ? 4 : 1;
  return '<div class="power-slots" aria-label="Power allocation">'+slots.map(x=>'<span class="slot-'+x.split(' ')[0].toLowerCase()+'">'+x+'</span>').join('')+'</div>'+
    (blocked ? '<p class="shortfall">Needs '+needed+' slots · '+(capacity-powerUsed(state))+' free</p>' : '');
}

export function memory(state) {
  const first = state.firstJob;
  if (first === 'water') return state.name+', you filled the tank before we heard the crew. I remember the pump humming.';
  if (first === 'radio') return state.name+', you found the crew first. Then we got the water ready for the wait.';
  return state.name+', our water is ready and the crew can hear us.';
}

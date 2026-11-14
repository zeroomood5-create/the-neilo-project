// Michael replaces NEILO; crew recordings keep their original speakers.
let pack={clips:[]};
export const michaelReady=Promise.all(['michael-voice.json','michael-phase.json'].map(f=>fetch(new URL(f,import.meta.url),{cache:'no-cache'}).then(r=>r.json()).catch(()=>({clips:[]})))).then(packs=>{pack={clips:packs.flatMap(p=>p.clips)};});
export function michaelCue(id){return pack.clips.find(c=>c.id===id)||null;}
const clean=s=>String(s).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const rules=[
 ['garden-done',/three harvests collected.*science/],['radio-ready',/radio has power.*follow|radio is ready.*follow/],['power-help',/first test a connection/],
 ['log-summary',/open your log/],['field-open',/gathering evidence|evidence task is waiting|read the archive first/],['field-dash',/label the missing|missing data stays/],
 ['field-relay',/relay.*waits|waiting relay/],['report',/relay repaired|second piece of evidence|new site.*measurement/],
 ['plug',/release.*socket/],['choose-seed',/release the packet/],['weeks',/fast forwarding a simulation/],['care',/lettuce is in|tray needs its light/],['later',/door to mission control|door to water|back to mission control|already full|your next job/],
 ['greeting',/hello.*neilo/],['wake',/oh.*you are new/],['first-signal',/there it goes|message is sent|signal is on its way/],
 ['walk',/glowing circle|tap the floor to walk/],['find',/blue light|beneath the bench/],['helper',/tap my picture|tap me whenever|walk with you/],
 ['too-wet',/too wet|drain a little|drain some|drain.*more/],['choose-seed',/seed packet|packet.*tray|choose.*crop/],
 ['cooking',/animation represents boiling|short.*cooking time/],['cook',/soybeans harvested|harvest collected|boil.*before serving|three harvests.*boil/],
 ['harvest',/drag.*harvest|harvest.*collected.*next|harvest is ready|plant.*harvest.*plate|harvest [12] of 3/],
 ['garden-done',/three harvests collected|every plant separately/],['long-plan',/soybeans need more time|longer plan|stored meals cover/],
 ['weeks',/fast forwarding|simulation days|real plants take weeks/],['grow',/conditions are ready|start the training calendar|ready to try growing|run our calendar/],
 ['care',/grow light|tray light and water|seeds are in|seeds.*planted/],
 ['breaker',/plugs are in|both plugs.*connected|try the breaker|turn the breaker/],
 ['pump-ready',/pump has power|pump is ready|pump had.*power/],['radio-ready',/radio is ready|radio has power.*follow/],['plug',/matching socket|drag both plugs|connected one plug|match.*colour|connect.*other cable/],
 ['water-ready',/prepared 2 water|water.*ready.*pause|water for the wait.*pause/],
 ['recharge',/battery.*recharge|recharge.*battery|battery.*charge|battery.*units.*message/],
 ['antenna',/align the antenna|antenna.*calibrated|crew.*safe in orbit|a voice.*crew/],
 ['send',/send your signal|send.*ready signal|prepare.*reply/],['radio',/give the radio a turn|radio.*turn.*crew|communication desk.*signal/],
 ['missing',/missing.*unavailable|missing.*not zero|dash means|not available.*label/],['archive',/archive is open|device.*date.*unit/],['report',/report.*measurement|what.*know.*measurement/],
 ['pause-device',/pause the other|pause.*cabin lights|free.*slots|room now.*switch/],
 ['power-help',/power console.*first|first.*power console|start.*power console|test.*connections first/],['power',/connect a device at the power console/],
 ['water-help',/water cycle|watch the tank fill/],['water',/prepare water|water unit needs|power plan is ready/],
 ['garden',/growing corner|garden.*comes next/],['field',/field notes console|field notes come|garden.*saved.*notes/],['finish',/log remembers|base.*brought to life/],
 ['crew',/crew.*safe|crew.*orbit/],['later',/follow.*station|head back.*room|next.*another station|power routing/]
];
export function findMichael(text){
 const norm=clean(text),direct=pack.clips.find(c=>clean(c.text)===norm||(c.matchTexts||[]).some(t=>clean(t)===norm));
 const id=direct?.id||rules.find(([,pattern])=>pattern.test(norm))?.[0];
 return direct||pack.clips.find(c=>c.id===id)||null;
}

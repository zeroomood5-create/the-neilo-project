// Add one entry per implemented mission. Quantities in gameplay stay separate from source facts.
import { campaignLessons } from './campaign-lessons.js';
export const lessons = [
 ...campaignLessons,
 {
  id:'water', action:'water', title:'You made the pump work',
  personal:name=>name+', you used stored energy to prepare water for the crew.',
  source:{title:'NASA Space Place · What powers a spacecraft?',url:'https://spaceplace.nasa.gov/what-powers-a-spacecraft/en/'},
  scope:'The drawing shows an energy idea. Our water packs and battery units are game values.',
  frames:[
   {visual:'sun',title:'Start with a source',text:'Solar panels turn sunlight into electricity. Some spacecraft use sunlight to run their equipment.'},
   {visual:'battery',title:'Save some for later',text:'A battery stores energy. Spacecraft can use that stored energy when sunlight is unavailable.'},
   {visual:'pump',title:'Your pump had a job to do',text:'An electric motor transfers energy into motion. In our base, the pump uses part of the battery reserve.'}
  ],
  question:'When the solar panels are in shadow, what can provide stored energy?',choices:['The battery','An empty cable'],correct:0
 },
 {
  id:'power',action:'send', title:'You gave each system a turn',
  personal:name=>name+', your plan got water ready and a message to the crew.',
  source:{title:'NASA · Hubble electrical power',url:'https://science.nasa.gov/mission/hubble/observatory/design/electrical-power/'},
  scope:'Real equipment has measured power limits. Our six slots and device costs are a simplified game model.',
  frames:[
   {visual:'sun',title:'Electricity does useful jobs',text:'On Hubble, electricity powers instruments, computers, heaters and transmitters.'},
   {visual:'route',title:'Power is the rate of energy use',text:'Running more devices at once asks for more power. In our base, the pump and radio together exceed the supply limit.'},
   {visual:'swap',title:'Your plan shared the supply',text:'Pausing one job made room for the next. The battery reserve showed how much stored energy remained.'}
  ],
  question:'If two jobs exceed the supply limit, what could you try?',choices:['Run them one after the other','Switch both on again'],correct:0
 }
];

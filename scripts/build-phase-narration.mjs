import {lessons} from '../dist/lessons.js';
import fs from 'node:fs';
const lines=[];
function cue(id,text){lines.push({id,text})}
cue('recap-separated','A fault separated your safety capsule from the crew’s ship.');
cue('recap-landed','Your crew is still in orbit. Your capsule landed at the old base.');
cue('recap-goal','Emergency air and heat are on. The radio is off. Find a way to reach your crew.');
cue('discover','A little help can make a big difference.');
cue('quiz-yes','That’s right! You can use that idea on your next mission.');
cue('quiz-retry','Try again. Look at the picture, or hear the question once more.');
for (const l of lessons){
 cue('lesson-'+l.id+'-intro',l.id==='garden'?'You grew and picked a crop for the crew.':l.personal('Explorer').split(', ').slice(1).join(', ').replace(/^./,s=>s.toUpperCase()));
 l.frames.forEach((f,i)=>cue('lesson-'+l.id+'-'+(i+1),f.text));
 cue('lesson-'+l.id+'-question',l.question+' '+l.choices[0]+', or '+l.choices[1]+'?');
}
cue('wake-crew','We can reach your crew. First, find the power console with me.');
cue('wake-place','This was a research base. My team left recordings to help explorers like you.');
cue('window-view','Look through the window. This is a real picture of Mars.');
cue('survey-start','Let’s read a real rover record. Then tell the crew what the evidence shows.');
cue('end-demo','Our base is awake. Next time, we’ll step outside and explore Mars together. This is the end of our demo.');
cue('radio-connect','First, connect both radio plugs at the power console.');
cue('radio-tune','Tune the antenna until the two signals line up.');
cue('radio-transmit','The crew can hear us. Send the ready signal.');
cue('field-open','Open the rover archive. Look for a missing reading.');
cue('field-dash','A dash is not zero. What should we tell the crew?');
cue('field-relay','Repair the relay so the crew can receive your notes.');
cue('end-airlock','The crew heard you. The garden is growing. Next time, we step outside.');
cue('log-summary','Your journey log remembers the things you did.');
cue('menu-summary','Choose where to go next, or replay the story.');
cue('credits-summary','You reached the credits. Thank you for exploring Mars with us.');
cue('restart-summary','Start a new journey, or keep the one you saved.');
cue('about-summary','This is a playable demo. The base is imagined, but the rover readings come from Mars.');
cue('field-choose','The crew needs a radio relay and a rover report. Which job will you start with?');
cue('field-send','Tell the crew what you know. The next site still needs a measurement.');
cue('field-delivered','Your notes are ready for the next expedition.');
const old=JSON.parse(fs.readFileSync('production/MICHAEL_ROBOT_MANIFEST.json'));
fs.writeFileSync('production/PHASE_ONE_NARRATION.json',JSON.stringify({...old,lines},null,2)+'\n');

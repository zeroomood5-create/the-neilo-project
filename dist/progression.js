export const build = 'First Signal · A growing world';
export function nextStep(s) {
 if(!s.awake) return s.tutorial==='walk'?{id:'tutorial-walk',room:'arrival',label:'Walk to the light on the floor',text:'Tap the glowing circle. Watch your explorer walk there.'}:{id:'wake',room:'arrival',label:'Find the little blue light',text:'You made it. Tap the little blue light beneath the bench.'};
 if(s.tutorial==='help')return {id:'hint',room:s.room,label:'Meet your helper',text:'Tap my picture below. I’ll show you what to try next.'};
 if(!s.powerChecked)return {id:'power',room:'control',label:'1 · Bring power to a device',text:'First, let’s connect a device at the power console.'};
 if(s.water<5)return {id:'water',room:'habitat',label:'2 · Prepare water',text:'The power plan is ready. Now we can prepare water for the wait.'};
 if(!s.sent)return {id:'comms',room:'control',label:'3 · Reach the crew',text:'Water is ready. Give the radio a turn and reach the crew.'};
 if(!s.garden.complete)return {id:'plants',room:'habitat',label:'4 · Plan our garden',text:'The crew can hear us. Our next job is the growing corner.'};
 if(!s.scout.sent)return {id:'survey',room:'control',label:'5 · Prepare field notes',text:'Our garden plans are saved. Let’s open the field-notes console.'};
 return {id:'journal',room:s.room,label:'Your base, brought to life',text:'We did it together. Your log remembers our plans.'};
}
export function lockedReason(s,id) {
 if(id==='habitat'&&!s.powerChecked)return 'First connect a device at the power console. I’ll guide you there.';
 if(id==='plants'&&!s.sent)return 'First restore power, prepare water, then send the crew our signal. Your garden comes next.';
 if(id==='survey'&&!s.garden.complete)return 'Our field notes come after the garden plans.';
 if(id==='water'&&!s.powerChecked)return 'Start at the power console so this station can work.';
 if(id==='comms'&&s.powerChecked&&s.water<5)return 'First prepare water at the habitat station. Then we can reach the crew.';
 if(id==='comms'&&!s.powerChecked)return 'Start at the power console. Then we can give the radio its turn.';
 return '';
}
export function targetForRoom(s) {
 const step=nextStep(s);
 if(step.room===s.room)return step.id;
 if(s.room==='arrival')return 'control';
 return step.room==='habitat'?'habitat':'control';
}


import test from 'node:test';import assert from 'node:assert/strict';
import {freshState,applyAction,restoreState} from '../dist/engine.js';
for(const crop of ['lettuce','soy'])test('workshop '+crop+' persists separate harvests and finishes its approved plan',()=>{
 let s=freshState();s.sent=true;
 const snap={crop,light:true,water:3,day:crop==='soy'?65:28,picked:[true,false,false],cooked:false};
 let r=applyAction(s,{type:'garden-workshop-progress',snapshot:snap});assert.ok(r.ok);s=restoreState(JSON.stringify(r.state));
 assert.deepEqual(s.garden.workshop.picked,[true,false,false]);
 assert.equal(applyAction(s,{type:'garden-workshop-finish'}).ok,false);
 snap.picked=[true,true,true];s=applyAction(s,{type:'garden-workshop-progress',snapshot:snap}).state;
 if(crop==='soy'){assert.equal(applyAction(s,{type:'garden-workshop-finish'}).ok,false);snap.cooked=true;s=applyAction(s,{type:'garden-workshop-progress',snapshot:snap}).state;}
 r=applyAction(s,{type:'garden-workshop-finish'});assert.ok(r.ok);s=restoreState(JSON.stringify(r.state));assert.ok(s.garden.complete);
 assert.ok(applyAction(s,{type:'scout-priority',priority:'base'}).ok);
 assert.equal(applyAction(s,{type:'garden-workshop-progress',snapshot:{...snap,day:0}}).ok,false);
});
test('workshop rejects invalid growing and premature harvest without state mutation',()=>{
 const s=freshState();s.sent=true;
 for(const snapshot of [{crop:'soy',light:false,water:3,day:65,picked:[true,true,true],cooked:true},{crop:'lettuce',light:true,water:3,day:2,picked:[true,false,false],cooked:false}]){
 const r=applyAction(s,{type:'garden-workshop-progress',snapshot});assert.equal(r.ok,false);assert.equal(r.state,s);}
});

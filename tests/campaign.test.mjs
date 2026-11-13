import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,applyAction,restoreState} from '../dist/engine.js';
function run(state,type,fields={}){const r=applyAction(state,{type,...fields});assert.equal(r.ok,true,r.message);return r.state;}
function grow(s,crop){
 s=run(s,'garden-plant',{crop});s=run(s,'garden-light');s=run(s,'garden-water');
 const day=crop==='soy'?65:28;
 while(s.garden.day<day){
  if(s.garden.round===0&&s.garden.day===35&&!s.garden.reserve)s=run(s,'garden-reserve');
  s=run(s,'garden-advance');
 }
 s=run(s,'garden-harvest');
 if(crop==='soy')s=run(s,'garden-cook');
 return s;
}
test('old saves gain new missions without inventing completion',()=>{
 const s=freshState('Ali');delete s.garden;delete s.scout;
 const restored=restoreState(JSON.stringify(s));
 assert.equal(restored.garden.complete,false);assert.equal(restored.scout.sent,false);
 assert.equal(applyAction(restored,{type:'garden-plant',crop:'soy'}).ok,false);
});
for(const first of ['lettuce','soy'])test('garden '+first+' route, replan, save and idempotent harvest',()=>{
 let s=freshState('Salma');s.sent=true;
 s=run(s,'garden-plant',{crop:first});
 assert.equal(applyAction(s,{type:'garden-advance'}).state,s);
 s=run(s,'garden-replan');s=grow(s,first);
 assert.equal(applyAction(s,{type:'garden-harvest'}).state,s);
 s=restoreState(JSON.stringify(s));s=run(s,'garden-next');
 s=grow(s,'lettuce');assert.equal(applyAction(s,{type:'garden-finish'}).ok,false);
 s=run(s,'garden-replan');s=grow(s,'soy');s=run(s,'garden-finish');
 assert.equal(s.garden.firstCrop,first);assert.equal(s.garden.complete,true);
 assert.equal(applyAction(s,{type:'garden-finish'}).state,s);
});
for(const priority of ['base','evidence'])test('survey '+priority+' keeps missing data and report consistent',()=>{
 let s=freshState();s.sent=true;s.garden.complete=true;
 s=run(s,'scout-priority',{priority});s=run(s,'scout-archive');
 assert.equal(applyAction(s,{type:'scout-missing',value:'zero'}).state,s);
 s=run(s,'scout-missing',{value:'unknown'});
 assert.equal(applyAction(s,{type:'scout-report',report:'safe'}).ok,false);
 s=run(s,'scout-study');s=run(s,'scout-report',{report:'followup'});
 assert.equal(applyAction(s,{type:'scout-report',report:'followup'}).state,s);
 if(priority==='evidence'){assert.equal(s.scout.helped,false);s=run(s,'scout-help');}
 assert.equal(s.scout.helped,true);assert.equal(s.scout.turns,3);
});


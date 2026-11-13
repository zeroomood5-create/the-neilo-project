import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState} from '../dist/engine.js';
import {nextStep,lockedReason} from '../dist/progression.js';

test('chapter guidance cannot advance to crops or notes before their prerequisite',()=>{
 const s=freshState('Mariam');
 assert.equal(nextStep(s).id,'tutorial-walk');
 s.tutorial='discover';assert.equal(nextStep(s).id,'wake');
 s.awake=true;s.tutorial='help';assert.equal(nextStep(s).id,'hint');
 s.tutorial='done';assert.equal(nextStep(s).id,'power');
 assert.ok(lockedReason(s,'habitat'));
 s.powerChecked=true;assert.equal(nextStep(s).id,'water');
 assert.ok(lockedReason(s,'comms'));assert.ok(lockedReason(s,'plants'));
 s.water=5;assert.equal(nextStep(s).id,'comms');
 s.sent=true;assert.equal(nextStep(s).id,'plants');assert.equal(lockedReason(s,'plants'),'');
 assert.ok(lockedReason(s,'survey'));
 s.garden.complete=true;assert.equal(nextStep(s).id,'survey');assert.equal(lockedReason(s,'survey'),'');
 s.scout.sent=true;assert.equal(nextStep(s).id,'journal');
});

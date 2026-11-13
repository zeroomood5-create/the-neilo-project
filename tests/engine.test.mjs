import test from 'node:test';
import assert from 'node:assert/strict';
import { freshState, applyAction, restoreState, powerUsed, capacity } from '../dist/engine.js';

test('a connected-resource journey reaches the signal with real costs', () => {
  let state = freshState('Ahmed');
  const actions = [
    { type: 'start', name: 'Ahmed' }, { type: 'wake' },
    { type: 'toggle', device: 'water' }, { type: 'water' },
    { type: 'toggle', device: 'water' }, { type: 'toggle', device: 'lights' },
    { type: 'toggle', device: 'uplink' }, { type: 'calibrate' }, { type: 'send' }
  ];
  for (const action of actions) {
    const result = applyAction(state, action);
    assert.equal(result.ok, true, `${action.type}: ${result.message}`);
    state = result.state;
    assert.ok(powerUsed(state) <= capacity);
  }
  assert.equal(state.sent, true);
  assert.equal(state.water, 5);
  assert.equal(state.battery, 2);
  const repeated = applyAction(state, { type: 'send' });
  assert.equal(repeated.ok, false);
  assert.equal(repeated.state.battery, 2);
});

test('over-budget switching is atomic and keeps a recoverable state', () => {
  let state = applyAction(freshState(), { type: 'wake' }).state;
  state = applyAction(state, { type: 'toggle', device: 'water' }).state;
  const original = structuredClone(state);
  const result = applyAction(state, { type: 'toggle', device: 'uplink' });
  assert.equal(result.ok, false);
  assert.deepEqual(state, original);
  assert.deepEqual(result.state, original);
});

test('repeated device tasks cannot consume supplies or advance twice', () => {
  let state = applyAction(freshState(), { type: 'wake' }).state;
  state = applyAction(state, { type: 'toggle', device: 'water' }).state;
  state = applyAction(state, { type: 'water' }).state;
  const result = applyAction(state, { type: 'water' });
  assert.equal(result.ok, false);
  assert.deepEqual(result.state, state);
});

test('saved progress survives reload and invalid saves safely recover', () => {
  const state = applyAction(freshState('A < B'), { type: 'wake' }).state;
  assert.deepEqual(restoreState(JSON.stringify(state)), state);
  assert.deepEqual(restoreState('{bad'), freshState());
  const repaired = restoreState(JSON.stringify({ ...state, battery: -10, room: '__proto__', devices: { lights: true, water: true, uplink: true } }));
  assert.equal(repaired.room, 'arrival');
  assert.ok(repaired.battery >= 0);
  assert.ok(powerUsed(repaired) <= capacity);
});

test('a low-battery journey can recover without losing prepared resources', () => {
  const state = { ...freshState(), awake: true, battery: 0, water: 5 };
  const result = applyAction(state, { type: 'recharge' });
  assert.equal(result.state.battery, 3);
  assert.equal(result.state.water, 5);
});

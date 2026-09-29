import { calculateNextSM2State, recalculateSM2FromEvents } from './src/utils/sm2Engine.ts';
import assert from 'assert';

console.log('--- Testing SM-2 Engine Event Append-Only & Idempotency ---');

// Test 1: Single Event Calculation
const baseTime = '2026-09-29T10:00:00.000Z';
const state0 = { interval: 0, easeFactor: 2.5, repetitions: 0, nextReview: baseTime };

const stateGood = calculateNextSM2State(state0, 3, baseTime);
assert.strictEqual(stateGood.repetitions, 1);
assert.strictEqual(stateGood.interval, 1);
assert.strictEqual(stateGood.easeFactor, 2.5);
console.log('✓ Test 1 Passed: Initial Good rating sets interval=1, reps=1');

// Test 2: Out-Of-Order Event Timeline Recalculation
const eventsChronological = [
  { review_id: 'rev-1', uid: 'u1', card_id: 'c1', rating: 3, client_time: '2026-09-20T10:00:00.000Z', server_time: '2026-09-20T10:00:00.000Z' },
  { review_id: 'rev-2', uid: 'u1', card_id: 'c1', rating: 3, client_time: '2026-09-21T10:00:00.000Z', server_time: '2026-09-21T10:00:00.000Z' },
  { review_id: 'rev-3', uid: 'u1', card_id: 'c1', rating: 4, client_time: '2026-09-27T10:00:00.000Z', server_time: '2026-09-27T10:00:00.000Z' },
];

const eventsOutOfOrder = [
  eventsChronological[2], // Late sync event from device A
  eventsChronological[0],
  eventsChronological[1],
];

const computedChrono = recalculateSM2FromEvents(eventsChronological);
const computedOutOfOrder = recalculateSM2FromEvents(eventsOutOfOrder);

assert.strictEqual(computedChrono.interval, computedOutOfOrder.interval);
assert.strictEqual(computedChrono.easeFactor, computedOutOfOrder.easeFactor);
assert.strictEqual(computedChrono.repetitions, computedOutOfOrder.repetitions);
console.log('✓ Test 2 Passed: Out-of-order review events produce identical deterministic SM-2 state');

// Test 3: Undo Event Handling (is_undone)
const eventsWithUndo = eventsChronological.map(e => 
  e.review_id === 'rev-3' ? { ...e, is_undone: 1 } : e
);

const computedUndo = recalculateSM2FromEvents(eventsWithUndo);
const computedWithoutRev3 = recalculateSM2FromEvents([eventsChronological[0], eventsChronological[1]]);

assert.strictEqual(computedUndo.interval, computedWithoutRev3.interval);
assert.strictEqual(computedUndo.repetitions, computedWithoutRev3.repetitions);
console.log('✓ Test 3 Passed: Undone event is correctly excluded from SM-2 state recalculation');

console.log('🎉 ALL HẠNG MỤC 1 SM-2 TESTS PASSED PERFECTLY!');

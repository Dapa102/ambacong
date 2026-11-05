import assert from 'node:assert/strict';
import test from 'node:test';
import { NOISE, isAudible, movementNoise } from './noise-system.js';

const base = { moving: true, sprinting: false, crouching: false, hidden: false };
const origin = { x: 0, z: 0 };
const wall = [{ minX: -1, maxX: 1, minZ: -2.5, maxZ: -2 }];

test('movement noise follows stance', () => {
  assert.equal(movementNoise({ ...base, moving: false }), 0);
  assert.equal(movementNoise({ ...base, hidden: true }), 0);
  assert.equal(movementNoise({ ...base, crouching: true }), NOISE.crouch);
  assert.equal(movementNoise(base), NOISE.walk);
  assert.equal(movementNoise({ ...base, sprinting: true }), NOISE.sprint);
});

test('crouching nearby is silent, sprinting carries far', () => {
  assert.equal(isAudible({ x: 0, z: -3 }, origin, NOISE.crouch, []), false);
  assert.equal(isAudible({ x: 0, z: -8 }, origin, NOISE.sprint, []), true);
});

test('walls dampen sound', () => {
  assert.equal(isAudible({ x: 0, z: -8 }, origin, NOISE.sprint, wall), false);
  assert.equal(isAudible({ x: 0, z: -4 }, origin, NOISE.sprint, wall), true);
  assert.equal(isAudible({ x: 0, z: -4 }, origin, NOISE.walk, wall), false);
});

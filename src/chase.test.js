import assert from 'node:assert/strict';
import test from 'node:test';
import { moveToward } from './chase.js';

test('chaser moves toward target without overshooting', () => {
  const position = { x: 0, z: 0 };
  const target = { x: 3, z: 4 };

  assert.equal(moveToward(position, target, 1), 4);
  assert.deepEqual(position, { x: 0.6, z: 0.8 });
  assert.equal(moveToward(position, target, 10), 0);
  assert.deepEqual(position, target);
});

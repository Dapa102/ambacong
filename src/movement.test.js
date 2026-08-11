import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector2 } from 'three';
import { readMovement } from './movement.js';

test('movement direction stays normalized and opposite keys cancel', () => {
  const direction = new Vector2();

  readMovement(new Set(['KeyW', 'KeyD']), direction);
  assert.ok(Math.abs(direction.length() - 1) < 1e-12);
  assert.ok(direction.x > 0 && direction.y > 0);

  readMovement(new Set(['KeyW', 'KeyS']), direction);
  assert.deepEqual(direction.toArray(), [0, 0]);
});

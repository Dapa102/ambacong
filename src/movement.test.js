import assert from 'node:assert/strict';
import test from 'node:test';
import { Vector2 } from 'three';
import { readMovement, updateStamina } from './movement.js';

test('movement direction stays normalized and opposite keys cancel', () => {
  const direction = new Vector2();

  readMovement(new Set(['KeyW', 'KeyD']), direction);
  assert.ok(Math.abs(direction.length() - 1) < 1e-12);
  assert.ok(direction.x > 0 && direction.y > 0);

  readMovement(new Set(['KeyW', 'KeyS']), direction);
  assert.deepEqual(direction.toArray(), [0, 0]);
});

test('stamina drains and recovers within bounds', () => {
  assert.equal(updateStamina(100, 1, true, 20, 12), 80);
  assert.equal(updateStamina(5, 1, true, 20, 12), 0);
  assert.equal(updateStamina(95, 1, false, 20, 12), 100);
});

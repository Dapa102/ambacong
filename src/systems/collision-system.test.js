import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveCircle,
  clampBounds,
  segmentIntersectsBox,
  hasLineOfSight,
} from './collision-system.js';

test('resolveCircle pushes a point out of a collider box', () => {
  const point = { x: 0, z: 0 };
  const colliders = [{ minX: -0.3, maxX: 0.3, minZ: 0.2, maxZ: 0.6 }];
  resolveCircle(point, 0.4, colliders);
  assert.ok(point.z <= -0.2 + 1e-9, `point pushed out to ${point.z}`);
  assert.equal(point.x, 0);
});

test('resolveCircle keeps point outside when not touching', () => {
  const point = { x: 0, z: 0 };
  const colliders = [{ minX: 5, maxX: 6, minZ: 5, maxZ: 6 }];
  resolveCircle(point, 0.4, colliders);
  assert.deepEqual(point, { x: 0, z: 0 });
});

test('clampBounds keeps point inside limits', () => {
  const point = { x: 100, z: -100 };
  clampBounds(point, { minX: -10, maxX: 10, minZ: -17, maxZ: 28 }, 0.4);
  assert.equal(point.x, 10 - 0.4);
  assert.equal(point.z, -17 + 0.4);
});

test('segmentIntersectsBox detects crossing and misses', () => {
  const box = { minX: 0, maxX: 2, minZ: 0, maxZ: 2 };
  assert.equal(segmentIntersectsBox(-1, 1, 3, 1, box), true);
  assert.equal(segmentIntersectsBox(-1, 5, 3, 5, box), false);
  assert.equal(segmentIntersectsBox(1, -1, 1, 3, box), true);
});

test('hasLineOfSight blocked by collider between points', () => {
  const wall = [{ minX: -0.2, maxX: 0.2, minZ: -3, maxZ: 3 }];
  const a = { x: -4, z: 0 };
  const b = { x: 4, z: 0 };
  assert.equal(hasLineOfSight(a, b, wall), false);
  const open = [];
  assert.equal(hasLineOfSight(a, b, open), true);
});

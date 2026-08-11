import assert from 'node:assert/strict';
import test from 'node:test';
import { Object3D, PerspectiveCamera, Vector3 } from 'three';
import { aimForward } from './flashlight.js';

test('flashlight target stays on the camera center ray', () => {
  const camera = new PerspectiveCamera();
  const target = new Object3D();
  const direction = new Vector3();
  camera.position.set(1, 2, 3);
  camera.rotation.set(0.4, -0.7, 0);

  aimForward(camera, target, 14, direction);

  const targetDirection = target.position.clone().sub(camera.position).normalize();
  assert.ok(targetDirection.distanceTo(direction) < 1e-12);
  assert.ok(Math.abs(target.position.distanceTo(camera.position) - 14) < 1e-12);
});

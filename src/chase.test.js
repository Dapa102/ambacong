import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { moveToward } from './chase.js';
import { Pocong } from './entities/pocong.js';

test('chaser moves toward target without overshooting', () => {
  const position = { x: 0, z: 0 };
  const target = { x: 3, z: 4 };

  assert.equal(moveToward(position, target, 1), 4);
  assert.deepEqual(position, { x: 0.6, z: 0.8 });
  assert.equal(moveToward(position, target, 10), 0);
  assert.deepEqual(position, target);
});

test('changing patrol route resets stale waypoint index', () => {
  const pocong = new Pocong(new THREE.Object3D(), []);
  pocong.patrolIndex = 8;

  pocong.setPatrol([[0, 0]]);

  assert.equal(pocong.patrolIndex, 0);
});

test('visual detection honors crouching, walls, and flashlight range', () => {
  const pocong = new Pocong(new THREE.Object3D(), []);
  const player = {
    hidden: false,
    crouching: true,
    sprinting: false,
    position: new THREE.Vector3(0, 0, -8),
  };

  assert.equal(pocong.canSee(player, { playerFlashlightOn: false, aimingPocong: false }, 13), true);

  player.crouching = false;
  player.position.z = -10;
  pocong.colliders = [{ minX: -1, maxX: 1, minZ: -5, maxZ: -4 }];
  assert.equal(pocong.canSee(player, { playerFlashlightOn: true, aimingPocong: true }, 13), false);

  player.position.z = -15;
  pocong.colliders = [];
  assert.equal(pocong.canSee(player, { playerFlashlightOn: true, aimingPocong: true }, 13), true);
});

const calmPlayer = (z) => ({
  hidden: false,
  crouching: false,
  sprinting: false,
  position: new THREE.Vector3(0, 0, z),
});
const darkInfo = { playerFlashlightOn: false, aimingPocong: false };

test('sprinting behind pocong is heard, not seen: it investigates instead of chasing', () => {
  const pocong = new Pocong(new THREE.Object3D(), []);
  pocong.setPatrol([[0, -20]]);
  pocong.wake();
  const player = { ...calmPlayer(6), sprinting: true };

  assert.equal(pocong.canSee(player, darkInfo, 13), false);
  assert.equal(pocong.hear(player.position, 10), true);
  assert.equal(pocong.state, 'investigate');

  pocong.update(0.5, player, darkInfo);
  assert.ok(pocong.mesh.position.z > 0, 'moves toward the noise');
});

test('investigation gives up and returns to patrol', () => {
  const pocong = new Pocong(new THREE.Object3D(), []);
  pocong.setPatrol([[0, -20]]);
  pocong.wake();
  pocong.hear({ x: 0, z: 1 }, 5);
  const player = calmPlayer(30);

  for (let i = 0; i < 60; i += 1) pocong.update(0.25, player, darkInfo);
  assert.equal(pocong.state, 'patrol');
});

test('hiding during a chase makes pocong lose the target', () => {
  const pocong = new Pocong(new THREE.Object3D(), []);
  pocong.wake();
  const player = calmPlayer(-5);
  pocong.startChase(player);

  player.hidden = true;
  pocong.update(0.1, player, darkInfo);
  assert.equal(pocong.state, 'lost');
  assert.equal(pocong.isAttacking(player), false);
});

import * as THREE from 'three';
import { moveToward } from '../chase.js';
import { hasLineOfSight, resolveCircle } from '../systems/collision-system.js';

const SIGHT_RANGE = 13;
const SIGHT_RANGE_LIT = 18;
const SOUND_RANGE = 9;
const SIGHT_CONE = Math.cos((58 * Math.PI) / 180);
const CHASE_SPEED = 3.8;
const PATROL_SPEED = 1.7;
const ATTACK_DISTANCE = 2.0;
const LOST_DURATION = 7;
const CHASE_LINGER = 16;

export class Pocong {
  constructor(mesh, colliders) {
    this.mesh = mesh;
    this.colliders = colliders;
    this.state = 'dormant';
    this.patrolPoints = [];
    this.patrolIndex = 0;
    this.lastKnown = null;
    this.phase = 0;
    this.timer = 0;
    this.chaseRemaining = 0;
    this.facing = new THREE.Vector3(0, 0, -1);
    this.basePosition = mesh.position.clone();
    this.lastStepPhase = 0;
    this.onStep = null;
  }

  setPatrol(points) {
    this.patrolPoints = points.map(([x, z]) => new THREE.Vector3(x, 0, z));
    this.patrolIndex = 0;
  }

  wake() {
    if (this.state !== 'dormant') return;
    this.state = this.patrolPoints.length ? 'patrol' : 'idle';
    this.mesh.visible = true;
  }

  isActive() {
    return this.state !== 'dormant';
  }

  distanceTo(point) {
    const pos = this.mesh.position;
    return Math.hypot(pos.x - point.x, pos.z - point.z);
  }

  canSee(player, info, range) {
    if (player.hidden) return false;
    const distance = this.distanceTo(player.position);
    const sightRange = info.playerFlashlightOn && info.aimingPocong ? SIGHT_RANGE_LIT : range;
    if (distance > sightRange) return false;
    if (player.sprinting && distance <= SOUND_RANGE) return true;
    if (player.crouching && distance < 4) return true;
    if (!hasLineOfSight(this.mesh.position, player.position, this.colliders)) return false;
    const toPlayer = new THREE.Vector3()
      .subVectors(player.position, this.mesh.position)
      .setY(0)
      .normalize();
    const facing = this.facing.clone().setY(0);
    if (facing.lengthSq() < 1e-6) return true;
    facing.normalize();
    return toPlayer.dot(facing) > SIGHT_CONE;
  }

  lookAtPlayer(player) {
    this.facing.subVectors(player.position, this.mesh.position).setY(0);
  }

  update(delta, player, info) {
    this.phase += delta;
    const pos = this.mesh.position;

    if (this.state === 'dormant' || this.state === 'idle') {
      this.checkDetect(player, info);
      this.animate(pos);
      return;
    }

    if (this.state === 'patrol') {
      if (this.patrolPoints.length) {
        const target = this.patrolPoints[this.patrolIndex];
        this.facing.subVectors(target, pos).setY(0);
        const remaining = moveToward(pos, target, PATROL_SPEED * delta);
        resolveCircle(pos, 0.36, this.colliders);
        if (remaining === 0) this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
      }
      this.checkDetect(player, info);
    } else if (this.state === 'chase') {
      this.lastKnown = player.position.clone();
      this.facing.subVectors(player.position, pos).setY(0);
      this.chaseRemaining = moveToward(pos, player.position, CHASE_SPEED * delta);
      resolveCircle(pos, 0.36, this.colliders);
      this.timer += delta;
      if (this.timer > CHASE_LINGER && this.chaseRemaining > 9) {
        this.state = 'lost';
        this.timer = 0;
      }
      if (this.canSee(player, info, SIGHT_RANGE)) this.timer = 0;
    } else if (this.state === 'lost') {
      this.timer += delta;
      const anchor = this.lastKnown ?? pos;
      this.facing.subVectors(anchor, pos).setY(0);
      const remaining = moveToward(pos, anchor, PATROL_SPEED * delta);
      resolveCircle(pos, 0.36, this.colliders);
      if (remaining === 0) this.timer += delta;
      if (this.timer > LOST_DURATION) {
        this.state = this.patrolPoints.length ? 'patrol' : 'idle';
        this.timer = 0;
      }
      this.checkDetect(player, info);
    }

    this.animate(pos);
  }

  animate(pos) {
    const hopAmp = this.state === 'chase' ? 0.6 : 0.45;
    const hopFreq = this.state === 'chase' ? 2.6 : 1.8;
    const theta = this.phase * hopFreq * Math.PI * 2;
    pos.y = ((1 - Math.cos(theta)) / 2) * hopAmp;
    const stretch = 1 + 0.12 * Math.sin(theta / 2);
    this.mesh.scale.set(1 + (1 - stretch) * 0.5, stretch, 1 + (1 - stretch) * 0.5);
    const look = this.facing.clone();
    if (look.lengthSq() > 1e-6) {
      this.mesh.rotation.y = Math.atan2(look.x, look.z);
    }
    this.mesh.visible = this.state !== 'dormant';

    // Trigger step sound saat land (theta cross 0 or 2π)
    const currentCycle = Math.floor(this.phase * hopFreq);
    if (currentCycle > this.lastStepPhase && this.onStep && this.state !== 'dormant') {
      this.onStep();
      this.lastStepPhase = currentCycle;
    }
  }

  checkDetect(player, info) {
    if (player.hidden) return;
    if (this.canSee(player, info, SIGHT_RANGE)) this.startChase(player);
  }

  startChase(player) {
    this.state = 'chase';
    this.timer = 0;
    this.lastKnown = player.position.clone();
  }

  isAttacking(player) {
    return (
      this.state === 'chase' &&
      !player.hidden &&
      this.distanceTo(player.position) <= ATTACK_DISTANCE
    );
  }

  groundReset() {
    this.state = 'dormant';
    this.mesh.visible = false;
    this.mesh.position.copy(this.basePosition);
    this.mesh.scale.set(1, 1, 1);
    this.timer = 0;
  }
}

import * as THREE from 'three';
import { updateStamina } from '../movement.js';
import { resolveCircle, clampBounds } from '../systems/collision-system.js';

export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3();
    this.yaw = Math.PI;
    this.pitch = 0;
    this.stamina = 100;
    this.sprinting = false;
    this.crouching = false;
    this.hidden = false;
    this.hiddenSpot = null;
    this.radius = 0.34;
    this.speed = 3.6;
    this.sprintSpeed = 6.4;
    this.crouchSpeed = 2.0;
    this.hiddenEyeY = 1.25;
    this.crouchEyeY = 1.35;
    this.eyeY = 1.7;
  }

  move(delta, keys, colliders, bounds) {
    if (this.hidden) {
      this.sprinting = false;
      return;
    }
    this.crouching = keys.has('ControlLeft') || keys.has('ControlRight');
    const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    this.sprinting = keys.has('ShiftLeft') && !this.crouching && forward > 0 && this.stamina > 0;
    const speed = this.crouching
      ? this.crouchSpeed
      : this.sprinting
        ? this.sprintSpeed
        : this.speed;
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const dirX = -sin * forward + cos * strafe;
    const dirZ = -cos * forward - sin * strafe;
    const length = Math.hypot(dirX, dirZ);
    if (length > 0) {
      this.position.x += (dirX / length) * speed * delta;
      this.position.z += (dirZ / length) * speed * delta;
    }
    this.stamina = updateStamina(this.stamina, delta, this.sprinting, 22, 13);
    resolveCircle(this.position, this.radius, colliders);
    clampBounds(this.position, bounds, this.radius);
  }

  look(deltaX, deltaY, sensitivity = 0.0022) {
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;
    this.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.pitch));
  }

  applyView() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    const y = this.hidden ? this.hiddenEyeY : this.crouching ? this.crouchEyeY : this.eyeY;
    this.camera.position.set(this.position.x, y, this.position.z);
  }

  enterHide(spot) {
    this.hidden = true;
    this.hiddenSpot = spot;
  }

  exitHide() {
    this.hidden = false;
    this.hiddenSpot = null;
  }

  teleport(x, z, yaw = this.yaw) {
    this.position.set(x, this.eyeY, z);
    this.yaw = yaw;
  }
}

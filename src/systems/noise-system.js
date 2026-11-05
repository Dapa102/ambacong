// Noise system: seberapa jauh suara pemain terdengar oleh pocong.
// Radius dalam satuan dunia; dinding di antara sumber dan pendengar meredam suara.
import { hasLineOfSight } from './collision-system.js';

export const NOISE = {
  crouch: 1.5,
  walk: 5,
  sprint: 10,
  pickup: 4,
  hide: 6,
};

// ponytail: satu dinding atau lebih dihitung sama (×0.5). Kalau butuh lebih realistis, hitung jumlah collider yang dilewati.
export const WALL_DAMPING = 0.5;

/**
 * Radius suara dari gerakan pemain.
 * @param {{moving: boolean, sprinting: boolean, crouching: boolean, hidden: boolean}} player
 * @returns {number}
 */
export const movementNoise = (player) => {
  if (player.hidden || !player.moving) return 0;
  if (player.sprinting) return NOISE.sprint;
  if (player.crouching) return NOISE.crouch;
  return NOISE.walk;
};

/**
 * Apakah suara dengan radius tertentu dari `source` terdengar di `listener`.
 * @param {{x: number, z: number}} source
 * @param {{x: number, z: number}} listener
 * @param {number} radius
 * @param {Array} colliders
 * @returns {boolean}
 */
export const isAudible = (source, listener, radius, colliders) => {
  if (radius <= 0) return false;
  const distance = Math.hypot(source.x - listener.x, source.z - listener.z);
  if (distance > radius) return false;
  if (hasLineOfSight(source, listener, colliders)) return true;
  return distance <= radius * WALL_DAMPING;
};

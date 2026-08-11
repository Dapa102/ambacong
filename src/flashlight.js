export const aimForward = (camera, flashlight, distance, direction) => {
  flashlight.position.set(0, 0, 0);
  camera.getWorldDirection(direction);
  camera.getWorldPosition(flashlight.target.position);
  flashlight.target.position.addScaledVector(direction, distance);
};

export const drainBattery = (battery, delta, rate) => Math.max(0, battery - delta * rate);

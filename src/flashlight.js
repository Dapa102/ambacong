export const aimForward = (camera, target, distance, direction) => {
  camera.getWorldDirection(direction);
  camera.getWorldPosition(target.position);
  target.position.addScaledVector(direction, distance);
};

export const drainBattery = (battery, delta, rate) => Math.max(0, battery - delta * rate);

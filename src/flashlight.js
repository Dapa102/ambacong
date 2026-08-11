export const aimForward = (camera, target, distance, direction) => {
  camera.getWorldDirection(direction);
  camera.getWorldPosition(target.position);
  target.position.addScaledVector(direction, distance);
};

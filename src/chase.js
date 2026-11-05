export const moveToward = (position, target, maxStep) => {
  const x = target.x - position.x;
  const z = target.z - position.z;
  const distance = Math.hypot(x, z);
  if (distance === 0) return 0;

  const step = Math.min(maxStep, distance);
  position.x += (x / distance) * step;
  position.z += (z / distance) * step;
  return distance - step;
};

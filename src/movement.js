export const readMovement = (keys, target) =>
  target
    .set(
      Number(keys.has('KeyD')) - Number(keys.has('KeyA')),
      Number(keys.has('KeyW')) - Number(keys.has('KeyS'))
    )
    .normalize();

export const updateStamina = (stamina, delta, sprinting, drainRate, recoveryRate) =>
  Math.min(100, Math.max(0, stamina + delta * (sprinting ? -drainRate : recoveryRate)));

export const readMovement = (keys, target) =>
  target
    .set(
      Number(keys.has('KeyD')) - Number(keys.has('KeyA')),
      Number(keys.has('KeyW')) - Number(keys.has('KeyS'))
    )
    .normalize();

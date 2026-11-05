import * as THREE from 'three';

const SOFT_MATERIALS = new Set([
  'linen',
  'blood',
  'neonTube',
  'bedSheet',
  'pocongCloth',
  'pocongDirt',
  'pocongEye',
  'laptopScreen',
  'laptop',
  'paper',
  'glass',
  'curtain',
]);

export const buildColliders = (root) => {
  root.updateMatrixWorld(true);
  const colliders = [];
  const box = new THREE.Box3();

  const visit = (object) => {
    if (object.isMesh) {
      if (object.geometry.type !== 'BoxGeometry') return;
      const material = Array.isArray(object.material) ? object.material[0] : object.material;
      if (material?.name && SOFT_MATERIALS.has(material.name)) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      box.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);
      const width = box.max.x - box.min.x;
      const depth = box.max.z - box.min.z;
      const height = box.max.y - box.min.y;
      if (height < 0.3) return;
      if (Math.max(width, depth) < 0.4 && height < 1.6) return;
      colliders.push({
        minX: box.min.x,
        maxX: box.max.x,
        minZ: box.min.z,
        maxZ: box.max.z,
      });
    }
    for (const child of object.children) visit(child);
  };

  for (const child of root.children) visit(child);
  return colliders;
};

export const resolveCircle = (point, radius, colliders, iterations = 2) => {
  for (let pass = 0; pass < iterations; pass += 1) {
    for (const box of colliders) {
      const cx = Math.max(box.minX, Math.min(point.x, box.maxX));
      const cz = Math.max(box.minZ, Math.min(point.z, box.maxZ));
      let dx = point.x - cx;
      let dz = point.z - cz;
      const distanceSquared = dx * dx + dz * dz;
      if (distanceSquared >= radius * radius) continue;
      if (distanceSquared > 1e-9) {
        const distance = Math.sqrt(distanceSquared);
        const push = radius - distance;
        dx /= distance;
        dz /= distance;
        point.x += dx * push;
        point.z += dz * push;
      } else {
        const left = point.x - box.minX;
        const right = box.maxX - point.x;
        const top = point.z - box.minZ;
        const bottom = box.maxZ - point.z;
        const nearest = Math.min(left, right, top, bottom);
        if (nearest === left) point.x = box.minX - radius;
        else if (nearest === right) point.x = box.maxX + radius;
        else if (nearest === top) point.z = box.minZ - radius;
        else point.z = box.maxZ + radius;
      }
    }
  }
  return point;
};

export const clampBounds = (point, bounds, radius = 0) => {
  if (!bounds) return point;
  point.x = Math.max(bounds.minX + radius, Math.min(bounds.maxX - radius, point.x));
  point.z = Math.max(bounds.minZ + radius, Math.min(bounds.maxZ - radius, point.z));
  return point;
};

export const segmentIntersectsBox = (ax, az, bx, bz, box) => {
  const dx = bx - ax;
  const dz = bz - az;
  let tMin = 0;
  let tMax = 1;
  for (const [origin, delta, low, high] of [
    [ax, dx, box.minX, box.maxX],
    [az, dz, box.minZ, box.maxZ],
  ]) {
    if (Math.abs(delta) < 1e-9) {
      if (origin < low || origin > high) return false;
      continue;
    }
    let t1 = (low - origin) / delta;
    let t2 = (high - origin) / delta;
    if (t1 > t2) {
      const swap = t1;
      t1 = t2;
      t2 = swap;
    }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
};

export const hasLineOfSight = (a, b, colliders) => {
  for (const box of colliders) {
    if (segmentIntersectsBox(a.x, a.z, b.x, b.z, box)) return false;
  }
  return true;
};

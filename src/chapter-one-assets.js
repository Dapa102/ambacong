import * as THREE from 'three';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const planeGeometry = new THREE.PlaneGeometry(1, 1);

// Tekstur prosedural memakai UV dalam satuan meter (lihat worldUvGeometry), jadi
// `worldSize` = lebar area dunia yang ditutup satu salinan tekstur.
const makeCanvasTexture = (size, draw, worldSize) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / worldSize, 1 / worldSize);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

const speckle = (context, size, count, alpha) => {
  for (let i = 0; i < count; i += 1) {
    const grey = 180 + Math.random() * 75;
    context.fillStyle = `rgba(${grey},${grey},${grey},${alpha})`;
    context.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }
};

// Bercak lembut yang bisa diulang (tile) tanpa jahitan: digambar juga di sisi seberang.
const blotch = (context, size, x, y, radius, color) => {
  for (const dx of [-size, 0, size]) {
    for (const dy of [-size, 0, size]) {
      const gradient = context.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(x + dx - radius, y + dy - radius, radius * 2, radius * 2);
    }
  }
};

const scatterBlotches = (context, size, count, minRadius, extraRadius, color) => {
  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + Math.random() * extraRadius;
    blotch(context, size, Math.random() * size, Math.random() * size, radius, color);
  }
};

// Rembesan air: garis vertikal tipis yang memudar ke bawah.
const drips = (context, size, count, color) => {
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * size;
    const length = size * (0.2 + Math.random() * 0.6);
    const width = 2 + Math.random() * 7;
    const gradient = context.createLinearGradient(0, 0, 0, length);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(x, 0, width, length);
  }
};

const textureGenerators = {
  floor(context, size) {
    const tiles = 4;
    const step = size / tiles;
    for (let tx = 0; tx < tiles; tx += 1) {
      for (let ty = 0; ty < tiles; ty += 1) {
        const tone = 104 + Math.random() * 22;
        context.fillStyle = `rgb(${tone},${tone + 2},${tone - 4})`;
        context.fillRect(tx * step, ty * step, step, step);
      }
    }
    speckle(context, size, 2600, 0.05);
    scatterBlotches(context, size, 18, 20, 70, 'rgba(10,8,6,0.28)');
    // Retak halus.
    context.strokeStyle = 'rgba(8,8,10,0.55)';
    context.lineWidth = 1.2;
    for (let i = 0; i < 7; i += 1) {
      let x = Math.random() * size;
      let y = Math.random() * size;
      context.beginPath();
      context.moveTo(x, y);
      for (let j = 0; j < 5; j += 1) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        context.lineTo(x, y);
      }
      context.stroke();
    }
    // Nat ubin (paling gelap, jadi paling dalam di bump map).
    context.strokeStyle = '#2a2a2a';
    context.lineWidth = 5;
    for (let i = 0; i <= tiles; i += 1) {
      context.beginPath();
      context.moveTo(i * step, 0);
      context.lineTo(i * step, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, i * step);
      context.lineTo(size, i * step);
      context.stroke();
    }
  },
  wall(context, size, tone = 1) {
    context.fillStyle = `rgb(${Math.round(0x7f * tone)},${Math.round(0x89 * tone)},${Math.round(0x78 * tone)})`;
    context.fillRect(0, 0, size, size);
    scatterBlotches(context, size, 20, 30, 110, 'rgba(255,255,240,0.05)');
    scatterBlotches(context, size, 20, 30, 110, 'rgba(20,24,16,0.12)');
    speckle(context, size, 3500, 0.05);
    drips(context, size, 26, 'rgba(38,32,18,0.22)');
    // Cat mengelupas.
    for (let i = 0; i < 10; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      context.fillStyle = 'rgba(30,30,26,0.35)';
      context.beginPath();
      const rx = 4 + Math.random() * 14;
      const ry = 2 + Math.random() * 8;
      context.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  },
  ceiling(context, size) {
    context.fillStyle = '#55575a';
    context.fillRect(0, 0, size, size);
    speckle(context, size, 2000, 0.06);
    scatterBlotches(context, size, 14, 30, 90, 'rgba(48,36,16,0.25)');
    // Panel plafon.
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.lineWidth = 3;
    context.strokeRect(0, 0, size, size);
    context.beginPath();
    context.moveTo(size / 2, 0);
    context.lineTo(size / 2, size);
    context.moveTo(0, size / 2);
    context.lineTo(size, size / 2);
    context.stroke();
  },
  asphalt(context, size) {
    context.fillStyle = '#161616';
    context.fillRect(0, 0, size, size);
    speckle(context, size, 6000, 0.07);
    scatterBlotches(context, size, 10, 40, 120, 'rgba(0,0,0,0.3)');
    context.strokeStyle = 'rgba(0,0,0,0.5)';
    context.lineWidth = 2;
    for (let i = 0; i < 6; i += 1) {
      context.beginPath();
      context.moveTo(Math.random() * size, 0);
      context.lineTo(Math.random() * size, size);
      context.stroke();
    }
  },
};

const createMaterials = () => {
  const standard = (color, options = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0.04, ...options });
  const textured = (color, generator, worldSize, options = {}) => {
    const { resolution = 1024, bump = 1.2, ...rest } = options;
    const material = standard(color, rest);
    material.map = makeCanvasTexture(resolution, generator, worldSize);
    material.bumpMap = material.map;
    material.bumpScale = bump;
    material.userData.worldUv = true;
    return material;
  };
  return {
    asphalt: textured(0x191919, textureGenerators.asphalt, 4, { resolution: 512 }),
    battery: standard(0x2f6b9a, { emissive: 0x06263a, roughness: 0.5, metalness: 0.4 }),
    bedSheet: standard(0xb8b0a0, { roughness: 0.95 }),
    blood: standard(0x4b0505, { roughness: 0.6 }),
    chair: standard(0x8c8577, { roughness: 0.85 }),
    ceiling: textured(0x6a6c70, textureGenerators.ceiling, 2.4, { resolution: 512 }),
    concrete: textured(0x585a54, textureGenerators.wall, 3, { resolution: 512 }),
    desk: standard(0x4c3326, { roughness: 0.8, metalness: 0.1 }),
    dirt: standard(0x2d211c, { roughness: 1 }),
    door: standard(0x5a1715, { roughness: 0.7, metalness: 0.15 }),
    doorTrim: standard(0x241715, { roughness: 0.8 }),
    glass: standard(0xbfd5d2, { roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.35 }),
    floor: textured(0x8a8a8e, textureGenerators.floor, 2.4, { roughness: 0.78, bump: 2 }),
    hospitalTube: standard(0xfff4dd, { emissive: 0xffdfaa, emissiveIntensity: 1.4, roughness: 0.35 }),
    key: standard(0xd6a800, { emissive: 0x664400, roughness: 0.4, metalness: 0.7 }),
    lampGlow: standard(0xffd08a, { emissive: 0xff8a2a, emissiveIntensity: 2, roughness: 0.25 }),
    laptop: standard(0x111117, { emissive: 0x02020a, roughness: 0.4, metalness: 0.5 }),
    laptopScreen: standard(0x1f493b, { emissive: 0x133025, roughness: 0.3 }),
    linen: standard(0xc2c0b3, { roughness: 0.98 }),
    metal: standard(0x77756f, { roughness: 0.45, metalness: 0.7 }),
    neonTube: standard(0xb6ffd0, { emissive: 0x62c778, roughness: 0.4 }),
    paper: standard(0xd0c5a8, { roughness: 0.9 }),
    porcelain: standard(0xf0ede5, { roughness: 0.32, metalness: 0.02 }),
    pocongCloth: standard(0x8b0000, { roughness: 0.85 }),
    pocongDirt: standard(0x211612, { roughness: 1 }),
    pocongEye: standard(0x050505, { roughness: 0.3 }),
    plastic: standard(0x9d9a88, { roughness: 0.7 }),
    roadBlock: standard(0x8f6b23, { roughness: 0.85 }),
    rust: standard(0x7a3b20, { roughness: 0.8, metalness: 0.4 }),
    tile: standard(0xaab4af, { roughness: 0.72 }),
    wall: textured(0x7f8978, textureGenerators.wall, 3),
    wallDark: textured(0x4b5148, (c, s) => textureGenerators.wall(c, s, 0.62), 3),
    window: standard(0x142328, { emissive: 0x05090a, roughness: 0.18, metalness: 0.45 }),
    wood: standard(0x5a3d2e, { roughness: 0.8 }),
  };
};

// Geometri dengan UV dalam meter supaya tekstur tidak tertarik saat mesh di-scale.
// Di-cache per ukuran; material tanpa `userData.worldUv` tetap memakai geometri bersama.
const worldUvCache = new Map();
const worldUvGeometry = (kind, sx, sy, sz = 1) => {
  const key = `${kind}:${sx.toFixed(2)}:${sy.toFixed(2)}:${sz.toFixed(2)}`;
  if (worldUvCache.has(key)) return worldUvCache.get(key);
  const geometry = kind === 'box' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.PlaneGeometry(1, 1);
  const uv = geometry.attributes.uv;
  // Urutan face BoxGeometry: +x, -x, +y, -y, +z, -z (4 vertex per face).
  const faceSize =
    kind === 'box'
      ? [
          [sz, sy],
          [sz, sy],
          [sx, sz],
          [sx, sz],
          [sx, sy],
          [sx, sy],
        ]
      : [[sx, sy]];
  for (let i = 0; i < uv.count; i += 1) {
    const [u, v] = faceSize[Math.floor(i / 4)];
    uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  }
  worldUvCache.set(key, geometry);
  return geometry;
};

const box = (material, position, scale) => {
  const geometry = material.userData.worldUv ? worldUvGeometry('box', ...scale) : boxGeometry;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return mesh;
};

const floorPlane = (material, position, scale) => {
  const geometry = material.userData.worldUv
    ? worldUvGeometry('plane', scale[0], scale[1])
    : planeGeometry;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
};

const wallPanel = (material, position, scale) => {
  const geometry = material.userData.worldUv
    ? worldUvGeometry('plane', scale[0], scale[1])
    : planeGeometry;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale, 1);
  return mesh;
};

const makeInteractable = (group, data) => {
  group.userData = { ...group.userData, ...data };
  return group;
};

const createDoor = (
  materials,
  position,
  label,
  action = 'door',
  prompt = 'Buka pintu',
  rotationY = 0,
  requires = null
) => {
  const door = new THREE.Group();
  door.name = label;
  door.position.set(...position);
  door.rotation.y = rotationY;
  makeInteractable(door, { action, prompt, ...(requires ? { requires } : {}) });

  door.add(box(materials.doorTrim, [0, 1.35, -0.03], [2.35, 2.8, 0.08]));
  door.add(box(materials.door, [0, 1.25, 0], [1.9, 2.45, 0.12]));
  door.add(box(materials.rust, [-0.35, 1.95, 0.08], [0.42, 0.16, 0.03]));
  door.add(box(materials.rust, [0.4, 0.72, 0.08], [0.55, 0.12, 0.03]));
  door.add(box(materials.metal, [0.72, 1.15, 0.11], [0.12, 0.12, 0.08]));

  return door;
};

const createRustyKey = (materials, position) => {
  const key = new THREE.Group();
  key.name = 'rusty-key';
  key.position.set(...position);
  makeInteractable(key, {
    action: 'key',
    itemId: 'key-janitor',
    itemName: 'Kunci Janitor',
    prompt: 'Ambil kunci janitor',
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 12), materials.key);
  ring.rotation.x = Math.PI / 2;
  key.add(ring);
  key.add(box(materials.key, [0.22, 0, 0], [0.42, 0.05, 0.05]));
  key.add(box(materials.key, [0.4, -0.05, 0], [0.08, 0.14, 0.05]));
  key.add(box(materials.key, [0.52, -0.04, 0], [0.08, 0.11, 0.05]));
  key.add(box(materials.rust, [0.18, 0.03, 0.03], [0.12, 0.02, 0.02]));

  return key;
};

const createPickup = (materials, position, itemId, itemName, material) => {
  const pickup = new THREE.Group();
  pickup.name = itemId;
  pickup.position.set(...position);
  makeInteractable(pickup, {
    action: 'pickup',
    itemId,
    itemName,
    prompt: `Ambil ${itemName.toLowerCase()}`,
  });

  pickup.add(box(material, [0, 0, 0], [0.28, 0.16, 0.16]));
  pickup.add(box(materials.metal, [0.18, 0, 0], [0.06, 0.11, 0.11]));
  pickup.add(box(materials.metal, [-0.18, 0, 0], [0.04, 0.1, 0.1]));
  return pickup;
};

const createBed = (materials, position, rotationY = 0, isHidingSpot = false) => {
  const bed = new THREE.Group();
  bed.name = isHidingSpot ? 'bed-hiding-spot' : 'hospital-bed';
  bed.position.set(...position);
  bed.rotation.y = rotationY;
  if (isHidingSpot) {
    makeInteractable(bed, {
      action: 'hide',
      prompt: 'Ngumpet di kolong ranjang',
      hideName: 'kolong ranjang',
      cameraPosition: [-0.6, 0.22, 0.55],
    });
  }

  bed.add(box(materials.metal, [0, 0.55, 0], [1.2, 0.12, 2.1]));
  bed.add(box(materials.linen, [0, 0.66, 0.05], [1.05, 0.12, 1.75]));
  bed.add(box(materials.linen, [0, 0.82, -0.65], [0.82, 0.16, 0.38]));
  for (const x of [-0.52, 0.52]) {
    for (const z of [-0.9, 0.9]) {
      bed.add(box(materials.metal, [x, 0.25, z], [0.07, 0.5, 0.07]));
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), materials.rust);
      wheel.position.set(x, 0.08, z);
      bed.add(wheel);
    }
  }
  bed.add(box(materials.metal, [-0.61, 0.98, 0.1], [0.05, 0.42, 1.15]));
  bed.add(box(materials.metal, [0.61, 0.98, 0.1], [0.05, 0.42, 1.15]));
  bed.add(box(materials.metal, [0, 1.02, 0.98], [1.2, 0.65, 0.06]));
  bed.add(box(materials.blood, [-0.28, 0.75, 0.25], [0.34, 0.02, 0.18]));

  return bed;
};

const createLocker = (materials, position, rotationY = 0) => {
  const locker = new THREE.Group();
  locker.name = 'locker-hiding-spot';
  locker.position.set(...position);
  locker.rotation.y = rotationY;
  makeInteractable(locker, {
    action: 'hide',
    prompt: 'Ngumpet di locker',
    hideName: 'locker',
    cameraPosition: [-1.1, 0.35, 0],
  });

  locker.add(box(materials.metal, [0, 1, 0], [0.78, 2, 0.52]));
  locker.add(box(materials.wallDark, [0, 1.06, 0.28], [0.72, 1.78, 0.04]));
  locker.add(box(materials.rust, [-0.18, 1.45, 0.31], [0.12, 0.16, 0.03]));
  locker.add(box(materials.rust, [0.2, 0.58, 0.31], [0.18, 0.12, 0.03]));
  locker.add(box(materials.metal, [0.22, 1, 0.34], [0.06, 0.18, 0.04]));

  return locker;
};

const createIvStand = (materials, position) => {
  const stand = new THREE.Group();
  stand.name = 'iv-stand';
  stand.position.set(...position);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.65, 8), materials.metal);
  pole.position.y = 0.85;
  stand.add(pole);
  stand.add(box(materials.metal, [0, 1.68, 0], [0.55, 0.035, 0.035]));
  stand.add(box(materials.plastic, [-0.18, 1.35, 0], [0.16, 0.28, 0.06]));
  stand.add(box(materials.metal, [0, 0.05, 0], [0.72, 0.04, 0.04]));
  stand.add(box(materials.metal, [0, 0.05, 0], [0.04, 0.04, 0.72]));

  return stand;
};

const createMedicalCart = (materials, position, rotationY = 0) => {
  const cart = new THREE.Group();
  cart.position.set(...position);
  cart.rotation.y = rotationY;
  for (const y of [0.3, 0.82]) {
    cart.add(box(materials.metal, [0, y, 0], [1, 0.06, 0.55]));
  }
  for (const x of [-0.45, 0.45]) {
    for (const z of [-0.22, 0.22]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), materials.metal);
      post.position.set(x, 0.55, z);
      cart.add(post);
      const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), materials.rust);
      wheel.position.set(x, 0.1, z);
      cart.add(wheel);
    }
  }
  cart.add(box(materials.paper, [-0.2, 0.87, 0], [0.32, 0.03, 0.22]));
  cart.add(box(materials.battery, [0.25, 0.9, 0], [0.18, 0.12, 0.16]));
  return cart;
};

const createHospitalCabinet = (materials, position, rotationY = 0) => {
  const cabinet = new THREE.Group();
  cabinet.position.set(...position);
  cabinet.rotation.y = rotationY;
  cabinet.add(box(materials.metal, [0, 1, 0], [1.25, 2, 0.42]));
  cabinet.add(box(materials.wallDark, [0, 1, 0.23], [1.12, 1.86, 0.04]));
  cabinet.add(box(materials.glass, [-0.29, 1.12, 0.27], [0.5, 1.45, 0.025]));
  cabinet.add(box(materials.glass, [0.29, 1.12, 0.27], [0.5, 1.45, 0.025]));
  for (const y of [0.5, 0.95, 1.4]) {
    cabinet.add(box(materials.metal, [0, y, 0.28], [1.05, 0.035, 0.035]));
  }
  cabinet.add(box(materials.metal, [-0.06, 1.05, 0.32], [0.035, 0.28, 0.035]));
  cabinet.add(box(materials.metal, [0.06, 1.05, 0.32], [0.035, 0.28, 0.035]));
  return cabinet;
};

const createPrivacyScreen = (materials, position, rotationY = 0) => {
  const screen = new THREE.Group();
  screen.position.set(...position);
  screen.rotation.y = rotationY;
  for (const x of [-0.78, 0.78]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.85, 6), materials.metal);
    pole.position.set(x, 1, 0);
    screen.add(pole);
  }
  screen.add(box(materials.metal, [0, 1.9, 0], [1.65, 0.04, 0.04]));
  screen.add(wallPanel(materials.linen, [0, 1.15, 0.01], [1.48, 1.35]));
  const back = wallPanel(materials.linen, [0, 1.15, -0.01], [1.48, 1.35]);
  back.rotation.y = Math.PI;
  screen.add(back);
  return screen;
};

const createPlasticChair = (materials, position, rotationY = 0) => {
  const chair = new THREE.Group();
  chair.name = 'plastic-chair';
  chair.position.set(...position);
  chair.rotation.y = rotationY;

  chair.add(box(materials.plastic, [0, 0.55, 0], [0.62, 0.12, 0.55]));
  chair.add(box(materials.plastic, [0, 1, 0.22], [0.62, 0.82, 0.1]));
  for (const x of [-0.25, 0.25]) {
    for (const z of [-0.18, 0.18]) {
      chair.add(box(materials.metal, [x, 0.25, z], [0.06, 0.5, 0.06]));
    }
  }

  return chair;
};

const createFuseBox = (materials, position, rotationY = 0) => {
  const fuseBox = new THREE.Group();
  fuseBox.name = 'fuse-box';
  fuseBox.position.set(...position);
  fuseBox.rotation.y = rotationY;
  makeInteractable(fuseBox, {
    action: 'inspect',
    prompt: 'Periksa fuse box',
    message: 'Fuse box mati. Ada bekas terbakar dan bau kabel gosong.',
  });

  fuseBox.add(box(materials.metal, [0, 1.25, 0], [0.68, 0.88, 0.12]));
  fuseBox.add(box(materials.wallDark, [0, 1.35, 0.08], [0.5, 0.2, 0.04]));
  fuseBox.add(box(materials.rust, [-0.18, 0.98, 0.08], [0.18, 0.14, 0.04]));
  fuseBox.add(box(materials.rust, [0.16, 1.05, 0.08], [0.14, 0.22, 0.04]));

  return fuseBox;
};

const createDeskCounter = (materials, position) => {
  const counter = new THREE.Group();
  counter.name = 'reception-desk';
  counter.position.set(...position);

  counter.add(box(materials.wood, [0, 0.9, 0], [2.6, 1.8, 0.6]));
  counter.add(box(materials.desk, [0, 1.78, 0], [2.7, 0.12, 0.7]));
  counter.add(box(materials.paper, [-0.7, 1.5, 0.36], [0.5, 0.02, 0.02]));
  counter.add(createFuseBoxVisual(materials, [1.1, 1.5, 0.36]));
  counter.add(box(materials.laptop, [0, 2.02, 0], [0.82, 0.48, 0.08]));
  counter.add(box(materials.laptopScreen, [0, 2.02, -0.05], [0.68, 0.34, 0.02]));
  counter.add(box(materials.metal, [0, 1.82, 0], [0.08, 0.34, 0.08]));

  return counter;
};

const createFuseBoxVisual = (materials, position) => {
  const fuse = new THREE.Group();
  fuse.position.set(...position);
  fuse.add(box(materials.rust, [0, 0, 0], [0.2, 0.14, 0.04]));
  fuse.add(box(materials.metal, [0, -0.1, 0], [0.16, 0.02, 0.05]));
  return fuse;
};

const createShelf = (materials, position, rotationY = 0) => {
  const shelf = new THREE.Group();
  shelf.name = 'shelf';
  shelf.position.set(...position);
  shelf.rotation.y = rotationY;

  for (const y of [0.3, 1.0, 1.7]) {
    shelf.add(box(materials.wood, [0, y, 0], [1.6, 0.06, 0.4]));
  }
  for (const x of [-0.78, 0.78]) {
    shelf.add(box(materials.metal, [x, 1.0, 0], [0.05, 2, 0.4]));
  }
  shelf.add(box(materials.paper, [-0.4, 1.15, 0.22], [0.22, 0.28, 0.02]));
  shelf.add(box(materials.paper, [0.3, 1.45, 0.22], [0.18, 0.24, 0.02]));

  return shelf;
};

const createNeonLight = (materials, position, intensity = 2) => {
  const lightGroup = new THREE.Group();
  lightGroup.name = 'neon-light';
  lightGroup.position.set(...position);

  lightGroup.add(box(materials.metal, [0, 0, 0], [1.3, 0.06, 0.18]));
  lightGroup.add(box(materials.hospitalTube, [0, -0.05, 0], [1.08, 0.04, 0.04]));

  const pointLight = new THREE.PointLight(0xfff1d6, intensity, 8.5, 1);
  pointLight.position.set(0, -0.35, 0);
  pointLight.userData.baseIntensity = intensity;
  lightGroup.add(pointLight);

  return { lightGroup, pointLight };
};

const createCourtyardLamp = (materials, position) => {
  const lamp = new THREE.Group();
  lamp.name = 'courtyard-lamp';
  lamp.position.set(...position);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.22, 10), materials.concrete);
  base.position.y = 0.11;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 3.45, 10), materials.metal);
  pole.position.y = 1.9;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.25, 10), materials.metal);
  shade.position.set(0.28, 3.48, 0);
  shade.rotation.z = Math.PI;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), materials.lampGlow);
  bulb.position.set(0.28, 3.35, 0);
  lamp.add(base, pole, box(materials.metal, [0.14, 3.58, 0], [0.42, 0.08, 0.08]), shade, bulb);

  const light = new THREE.PointLight(0xffb45e, 2.1, 9, 2);
  light.position.set(0.28, 3.3, 0);
  lamp.add(light);
  return lamp;
};

const createTree = (materials, position, scale = 1) => {
  const tree = new THREE.Group();
  tree.name = 'tree';
  tree.position.set(...position);

  // Trunk (batang pohon)
  const trunkGeometry = new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 2.8 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeometry, materials.wood);
  trunk.position.y = 1.4 * scale;
  tree.add(trunk);

  // Foliage (daun - 3 layer sphere untuk variasi)
  const foliageGeometry = new THREE.SphereGeometry(0.85 * scale, 8, 7);
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a3d1a,
    roughness: 0.95,
  });

  const foliageBottom = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliageBottom.position.y = 2.5 * scale;
  foliageBottom.scale.set(1.2, 0.9, 1.2);
  tree.add(foliageBottom);

  const foliageMiddle = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliageMiddle.position.y = 3.1 * scale;
  foliageMiddle.scale.set(1, 1, 1);
  tree.add(foliageMiddle);

  const foliageTop = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliageTop.position.y = 3.6 * scale;
  foliageTop.scale.set(0.7, 0.8, 0.7);
  tree.add(foliageTop);

  return tree;
};

const createGround = (materials, position, size) => {
  const ground = new THREE.Group();
  ground.name = 'ground-patch';
  ground.position.set(...position);

  // Tanah utama
  const groundPlane = floorPlane(materials.dirt, [0, 0.005, 0], size);
  ground.add(groundPlane);

  // Tambah rumput-rumput kecil (simple box untuk performa)
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d4a2d,
    roughness: 1,
  });

  const grassCount = Math.floor((size[0] * size[1]) / 8);
  for (let i = 0; i < grassCount; i += 1) {
    const grassBlade = box(
      grassMaterial,
      [
        (Math.random() - 0.5) * size[0] * 0.9,
        0.08,
        (Math.random() - 0.5) * size[1] * 0.9,
      ],
      [0.04, 0.16, 0.02]
    );
    grassBlade.rotation.y = Math.random() * Math.PI * 2;
    ground.add(grassBlade);
  }

  return ground;
};

const createFence = (materials, position, width, label, action = 'fence', prompt = 'Periksa pagar') => {
  const fence = new THREE.Group();
  fence.name = label;
  fence.position.set(...position);

  makeInteractable(fence, { action, prompt });

  // Fence posts
  const postCount = Math.ceil(width / 2.5) + 1;
  const postSpacing = width / (postCount - 1);

  for (let i = 0; i < postCount; i += 1) {
    const xPos = -width / 2 + i * postSpacing;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6),
      materials.wood
    );
    post.position.set(xPos, 1.1, 0);
    fence.add(post);
  }

  // Horizontal rails
  for (const y of [0.6, 1.1, 1.6]) {
    const rail = box(materials.wood, [0, y, 0], [width + 0.2, 0.12, 0.12]);
    fence.add(rail);
  }

  // Wire mesh (kawat pagar)
  const wireMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6,
  });

  const wireMesh = box(wireMaterial, [0, 1.1, 0], [width, 1.4, 0.02]);
  fence.add(wireMesh);

  return fence;
};

const createBoardedWindow = (materials, position, size = [2.15, 1.18]) => {
  const boarded = new THREE.Group();
  boarded.name = 'boarded-window';
  boarded.position.set(...position);

  // Window frame
  boarded.add(wallPanel(materials.window, [0, 0, 0], size));
  boarded.add(box(materials.metal, [0, 0, 0.02], [0.055, size[1], 0.035]));
  boarded.add(box(materials.metal, [0, 0, 0.02], [size[0], 0.055, 0.035]));

  // Wooden boards diagonal
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.9,
  });

  for (let i = 0; i < 3; i += 1) {
    const board = box(boardMaterial, [0, -size[1] / 3 + i * (size[1] / 3), 0.05], [size[0] * 1.1, 0.18, 0.08]);
    board.rotation.z = (Math.PI / 12) * (i % 2 === 0 ? 1 : -1);
    boarded.add(board);
  }

  return boarded;
};

const createBloodStain = (materials, position, size = [0.4, 0.2]) => {
  const stain = wallPanel(materials.blood, position, size);
  stain.name = 'blood-stain';
  return stain;
};

const createSign = (text, position, scale = [3, 0.75]) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#17191c';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#d6c98f';
  context.lineWidth = 8;
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  context.fillStyle = '#f0e7bd';
  context.font = '700 54px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sign.position.set(...position);
  sign.scale.set(...scale, 1);
  return sign;
};

const createPocong = (materials, position, imageUrl) => {
  const pocong = new THREE.Group();
  pocong.name = 'pocong-merah';
  pocong.position.set(...position);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.2, 5, 9), materials.pocongCloth);
  body.position.y = 1.02;
  pocong.add(body);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 10), materials.pocongCloth);
  hood.position.set(0, 1.82, 0);
  hood.scale.set(0.88, 1.08, 0.8);
  pocong.add(hood);

  const texture = new THREE.TextureLoader().load(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.64),
    new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, side: THREE.DoubleSide })
  );
  face.position.set(0, 1.78, -0.36);
  face.scale.z = -1;
  pocong.add(face);

  // Mata merah menyala (glow effect)
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 10, 8),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.5,
    })
  );
  leftEye.position.set(-0.11, 1.82, -0.32);
  pocong.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.set(0.11, 1.82, -0.32);
  pocong.add(rightEye);

  // Point lights untuk mata menyala
  const leftEyeLight = new THREE.PointLight(0xff0000, 0.8, 1.2);
  leftEyeLight.position.set(-0.11, 1.82, -0.28);
  pocong.add(leftEyeLight);

  const rightEyeLight = new THREE.PointLight(0xff0000, 0.8, 1.2);
  rightEyeLight.position.set(0.11, 1.82, -0.28);
  pocong.add(rightEyeLight);

  const topTie = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 7), materials.pocongCloth);
  topTie.position.y = 2.23;
  pocong.add(topTie);
  pocong.add(box(materials.pocongDirt, [-0.18, 1.12, -0.37], [0.28, 0.09, 0.025]));
  pocong.add(box(materials.pocongDirt, [0.18, 0.55, -0.36], [0.22, 0.11, 0.025]));

  return pocong;
};

const createKostRoom = (materials) => {
  const group = new THREE.Group();
  const interactables = [];
  const ROOM_X = 7;
  const ROOM_Z_TOP = 7;
  const ROOM_Z_BOTTOM = -6;

  group.add(floorPlane(materials.floor, [0, 0, 0.5], [14, 13]));
  group.add(box(materials.wallDark, [0, 1.5, ROOM_Z_TOP], [14, 3, 0.18]));
  group.add(box(materials.wallDark, [0, 1.5, ROOM_Z_BOTTOM], [14, 3, 0.18]));
  group.add(box(materials.wall, [-ROOM_X, 1.5, 0.5], [0.18, 3, 13]));
  group.add(box(materials.wall, [ROOM_X, 1.5, 0.5], [0.18, 3, 13]));
  group.add(box(materials.ceiling, [0, 3.05, 0.5], [14, 0.08, 13]));

  wallRowX(materials, group, -1.2, ROOM_Z_BOTTOM, ROOM_Z_TOP, [
    [1.5, 3.0],
    [-4.1, -2.1],
  ]);
  group.add(box(materials.wall, [-4.1, 1.5, 0], [6.0, 3.1, 0.3]));

  group.add(box(materials.doorTrim, [-1.2, 2.9, 2.25], [0.24, 0.2, 1.6]));
  group.add(box(materials.doorTrim, [-1.2, 1.45, 1.5], [0.24, 2.9, 0.12]));
  group.add(box(materials.doorTrim, [-1.2, 1.45, 3], [0.24, 2.9, 0.12]));
  group.add(box(materials.doorTrim, [-1.2, 0.035, 2.25], [0.34, 0.07, 1.5]));
  group.add(box(materials.doorTrim, [-1.2, 2.92, -3.1], [2.0, 0.16, 0.28]));
  group.add(box(materials.doorTrim, [-1.2, 1.5, -4.1], [0.18, 3, 0.1]));
  group.add(box(materials.doorTrim, [-1.2, 1.5, -2.1], [0.18, 3, 0.1]));

  group.add(box(materials.tile, [-4.1, 0.025, 3.5], [5.55, 0.05, 6.65]));
  group.add(box(materials.tile, [-6.88, 1.05, 3.5], [0.04, 2.1, 6.65]));
  group.add(box(materials.tile, [-4.1, 1.05, 6.88], [5.55, 2.1, 0.04]));

  const toilet = new THREE.Group();
  toilet.name = 'kost-toilet';
  toilet.position.set(-5.9, 0, 1.15);
  toilet.add(box(materials.porcelain, [-0.48, 0.72, 0], [0.38, 0.8, 0.72]));
  toilet.add(box(materials.porcelain, [-0.48, 1.14, 0], [0.44, 0.08, 0.76]));
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.4, 0.42, 16),
    materials.porcelain
  );
  bowl.position.set(0, 0.3, 0);
  bowl.scale.z = 0.82;
  toilet.add(bowl);
  const seat = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.055, 8, 20), materials.plastic);
  seat.position.set(0.08, 0.53, 0);
  seat.rotation.x = Math.PI / 2;
  seat.scale.set(1.15, 0.84, 1);
  toilet.add(seat);
  toilet.add(box(materials.metal, [-0.3, 1.18, 0.28], [0.09, 0.03, 0.05]));
  group.add(toilet);

  const vanity = new THREE.Group();
  vanity.name = 'kost-vanity';
  vanity.position.set(-6.15, 0, 3.75);
  vanity.add(box(materials.wood, [0, 0.42, 0], [0.92, 0.78, 1.5]));
  vanity.add(box(materials.tile, [0, 0.86, 0], [1.02, 0.1, 1.62]));
  vanity.add(box(materials.porcelain, [0.12, 0.93, 0], [0.58, 0.1, 0.82]));
  vanity.add(box(materials.dirt, [0.15, 0.98, 0], [0.38, 0.02, 0.58]));
  vanity.add(box(materials.metal, [0.38, 1.16, 0], [0.05, 0.36, 0.05]));
  vanity.add(box(materials.metal, [0.28, 1.33, 0], [0.25, 0.05, 0.05]));
  vanity.add(box(materials.glass, [-0.5, 1.75, 0], [0.04, 1.1, 1.35]));
  vanity.add(box(materials.metal, [-0.46, 0.48, 0], [0.04, 0.16, 0.22]));
  group.add(vanity);

  const shower = new THREE.Group();
  shower.name = 'kost-shower';
  shower.position.set(-2.5, 0, 5.35);
  shower.add(box(materials.porcelain, [0, 0.08, 0], [1.8, 0.16, 2.5]));
  shower.add(box(materials.dirt, [0.45, 0.18, 0.75], [0.16, 0.02, 0.16]));
  shower.add(box(materials.glass, [-0.88, 1.12, 0], [0.04, 2.15, 2.5]));
  shower.add(box(materials.glass, [0.65, 1.12, -1.23], [0.45, 2.15, 0.04]));
  shower.add(box(materials.glass, [-0.73, 1.12, -1.23], [0.3, 2.15, 0.04]));
  shower.add(box(materials.metal, [0.68, 1.36, 1.12], [0.05, 1.25, 0.05]));
  shower.add(box(materials.metal, [0.5, 1.95, 1.12], [0.4, 0.05, 0.05]));
  const showerHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.19, 0.06, 14),
    materials.metal
  );
  showerHead.position.set(0.3, 1.9, 1.12);
  showerHead.rotation.z = Math.PI / 2;
  shower.add(showerHead);
  group.add(shower);

  const towelRack = new THREE.Group();
  towelRack.name = 'kost-towel-rack';
  towelRack.position.set(-4, 1.25, 0.18);
  towelRack.add(box(materials.metal, [0, 0, 0], [1.25, 0.05, 0.05]));
  towelRack.add(box(materials.metal, [-0.58, 0, -0.08], [0.05, 0.05, 0.18]));
  towelRack.add(box(materials.metal, [0.58, 0, -0.08], [0.05, 0.05, 0.18]));
  towelRack.add(box(materials.linen, [0.18, -0.38, -0.03], [0.72, 0.72, 0.04]));
  group.add(towelRack);
  const bathHinge = new THREE.Group();
  bathHinge.name = 'bathroom-door-hinge';
  bathHinge.position.set(-1.2, 0, 1.55);
  bathHinge.rotation.y = -Math.PI / 2;
  const bathDoor = new THREE.Group();
  bathDoor.name = 'bathroom-door';
  makeInteractable(bathDoor, {
    action: 'bathroom-door',
    prompt: 'Buka pintu kamar mandi',
  });
  bathDoor.add(box(materials.wood, [0.7, 1.42, 0], [1.4, 2.78, 0.1]));
  bathDoor.add(box(materials.doorTrim, [0.7, 0.72, -0.065], [1.12, 0.82, 0.025]));
  bathDoor.add(box(materials.doorTrim, [0.7, 1.62, -0.065], [1.12, 0.62, 0.025]));
  for (const y of [2.05, 2.18, 2.31]) {
    bathDoor.add(box(materials.wallDark, [0.7, y, -0.065], [0.72, 0.045, 0.025]));
  }
  const outsideKnob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), materials.metal);
  outsideKnob.position.set(1.16, 1.08, -0.11);
  bathDoor.add(outsideKnob);
  const insideKnob = outsideKnob.clone();
  insideKnob.position.z = 0.11;
  bathDoor.add(insideKnob);
  bathHinge.add(bathDoor);
  group.add(bathHinge);
  interactables.push(bathDoor);

  const kitchen = new THREE.Group();
  kitchen.name = 'kost-kitchen';
  kitchen.position.set(-6.25, 0, -3);
  kitchen.add(box(materials.wood, [0, 0.45, 0], [0.9, 0.9, 4.4]));
  kitchen.add(box(materials.desk, [0, 0.95, 0], [1.05, 0.1, 4.6]));
  kitchen.add(box(materials.metal, [0, 1.02, -1.2], [0.82, 0.04, 0.72]));
  kitchen.add(box(materials.dirt, [0, 1.02, 0.85], [0.7, 0.04, 0.7]));
  kitchen.add(box(materials.metal, [0.28, 1.24, 0.85], [0.05, 0.44, 0.05]));
  kitchen.add(box(materials.metal, [0.28, 1.43, 0.72], [0.05, 0.05, 0.3]));
  for (const z of [-1.55, -0.5, 0.55, 1.55]) {
    kitchen.add(box(materials.metal, [0.48, 0.62, z], [0.04, 0.06, 0.42]));
  }
  group.add(kitchen);

  const fridge = new THREE.Group();
  fridge.name = 'kost-fridge';
  fridge.position.set(-2, 0, -5.15);
  fridge.add(box(materials.metal, [0, 1.1, 0], [1.1, 2.2, 1]));
  fridge.add(box(materials.wallDark, [0.57, 1.1, 0], [0.05, 2.05, 0.9]));
  fridge.add(box(materials.metal, [0.62, 1.25, -0.28], [0.04, 0.55, 0.05]));
  fridge.add(box(materials.wallDark, [0.6, 1.72, 0], [0.06, 0.04, 0.9]));
  group.add(fridge);

  wall(materials, group, 0.35, -1.5, 2.9, 0.2);
  wall(materials, group, 5.25, -1.5, 3.7, 0.2);
  group.add(box(materials.doorTrim, [2.6, 2.92, -1.5], [1.8, 0.16, 0.28]));
  group.add(box(materials.doorTrim, [1.8, 1.5, -1.5], [0.18, 3, 0.1]));
  group.add(box(materials.doorTrim, [3.4, 1.5, -1.5], [0.18, 3, 0.1]));

  const bed = new THREE.Group();
  bed.name = 'kost-bed';
  bed.position.set(5.15, 0, 1.1);
  bed.rotation.y = -Math.PI / 2;
  bed.add(box(materials.wood, [0, 0.3, 0], [1.55, 0.38, 2.5]));
  bed.add(box(materials.linen, [0, 0.58, 0], [1.42, 0.25, 2.32]));
  bed.add(box(materials.bedSheet, [0, 0.73, 0.38], [1.45, 0.06, 1.35]));
  bed.add(box(materials.linen, [0, 0.76, -0.78], [0.9, 0.18, 0.42]));
  bed.add(box(materials.wood, [0, 0.82, -1.18], [1.6, 1.3, 0.12]));

  const lemari = new THREE.Group();
  lemari.name = 'kost-lemari';
  lemari.position.set(6.4, 0, 3.75);
  lemari.add(box(materials.wood, [0, 1.05, 0], [0.9, 2.1, 1.8]));
  lemari.add(box(materials.wood, [0, 2.14, 0], [1, 0.08, 1.9]));
  lemari.add(box(materials.wood, [0, 0.05, 0], [1, 0.1, 1.9]));
  lemari.add(box(materials.wood, [-0.48, 1.05, 0.44], [0.04, 2, 0.86]));
  lemari.add(box(materials.wood, [-0.48, 1.05, -0.44], [0.04, 2, 0.86]));
  lemari.add(box(materials.metal, [-0.52, 1.2, 0.38], [0.05, 0.2, 0.05]));
  lemari.add(box(materials.metal, [-0.52, 1.2, -0.38], [0.05, 0.2, 0.05]));
  group.add(lemari);

  const desk = new THREE.Group();
  desk.name = 'kost-meja-belajar';
  desk.position.set(3.7, 0, 6.15);
  desk.add(box(materials.desk, [0, 0.86, -0.08], [2.8, 0.14, 1.35]));
  desk.add(box(materials.wood, [-1.28, 0.43, 0], [0.12, 0.86, 1.12]));
  desk.add(box(materials.wood, [1.05, 0.43, 0], [0.55, 0.78, 1.1]));
  desk.add(box(materials.wood, [0, 0.48, 0.55], [2.45, 0.64, 0.06]));
  for (const y of [0.22, 0.46, 0.7]) {
    desk.add(box(materials.desk, [1.05, y, -0.57], [0.49, 0.2, 0.04]));
    desk.add(box(materials.metal, [1.05, y, -0.61], [0.16, 0.03, 0.03]));
  }
  const chair = new THREE.Group();
  chair.name = 'kost-desk-chair';
  chair.position.set(3.7, 0, 5.05);
  chair.rotation.y = Math.PI;
  chair.add(box(materials.plastic, [0, 0.56, 0], [0.72, 0.12, 0.68]));
  chair.add(box(materials.plastic, [0, 1, 0.31], [0.72, 0.82, 0.12]));
  chair.add(box(materials.metal, [-0.38, 0.76, 0], [0.05, 0.38, 0.05]));
  chair.add(box(materials.metal, [0.38, 0.76, 0], [0.05, 0.38, 0.05]));
  chair.add(box(materials.plastic, [-0.38, 0.95, 0], [0.1, 0.06, 0.55]));
  chair.add(box(materials.plastic, [0.38, 0.95, 0], [0.1, 0.06, 0.55]));
  const chairStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.42, 8),
    materials.metal
  );
  chairStem.position.y = 0.3;
  chair.add(chairStem);
  chair.add(box(materials.metal, [0, 0.09, 0], [0.85, 0.06, 0.08]));
  const chairBase = box(materials.metal, [0, 0.09, 0], [0.85, 0.06, 0.08]);
  chairBase.rotation.y = Math.PI / 2;
  chair.add(chairBase);

  const computer = new THREE.Group();
  computer.name = 'computer-horror-news';
  computer.position.set(3.7, 0.93, 6.1);
  makeInteractable(computer, {
    action: 'prologue-laptop',
    prompt: 'Baca berita di komputer',
  });
  computer.add(box(materials.laptop, [0, 0.48, 0], [0.98, 0.68, 0.12]));
  computer.add(box(materials.laptopScreen, [0, 0.48, -0.07], [0.84, 0.54, 0.025]));
  computer.add(box(materials.metal, [0, 0.13, 0], [0.12, 0.25, 0.12]));
  computer.add(box(materials.metal, [0, 0.02, 0], [0.5, 0.04, 0.3]));
  computer.add(box(materials.laptop, [0, 0.03, -0.45], [0.72, 0.05, 0.25]));
  computer.add(box(materials.laptop, [0.55, 0.04, -0.44], [0.16, 0.06, 0.24]));

  const phone = new THREE.Group();
  phone.name = 'phone-call';
  phone.position.set(2.55, 0.93, 6.08);
  makeInteractable(phone, {
    action: 'prologue-phone',
    prompt: 'Angkat telepon teman',
  });
  phone.add(box(materials.metal, [0, 0.02, 0.1], [0.38, 0.04, 0.3]));
  phone.add(box(materials.metal, [0, 0.15, 0.08], [0.06, 0.28, 0.06]));
  phone.add(box(materials.laptop, [0, 0.27, 0], [0.3, 0.54, 0.06]));
  phone.add(box(materials.laptopScreen, [0, 0.27, -0.035], [0.24, 0.42, 0.015]));
  phone.add(box(materials.metal, [0, 0.46, -0.045], [0.09, 0.02, 0.01]));
  phone.add(box(materials.neonTube, [0, 0.08, -0.045], [0.08, 0.015, 0.01]));
  group.add(box(materials.wood, [3.7, 1.75, 6.68], [2.4, 0.12, 0.28]));
  group.add(box(materials.paper, [3.15, 1.96, 6.52], [0.38, 0.48, 0.04]));

  const door = createDoor(
    materials,
    [0, 0, ROOM_Z_TOP - 0.12],
    'kost-door',
    'prologue-leave',
    'Pergi ke rumah sakit'
  );

  const sofa = new THREE.Group();
  sofa.name = 'kost-sofa';
  sofa.position.set(0.7, 0, -3.8);
  sofa.rotation.y = Math.PI / 2;
  sofa.add(box(materials.wood, [0, 0.32, 0], [2.6, 0.5, 1.0]));
  sofa.add(box(materials.wood, [0, 0.8, -0.36], [2.6, 0.85, 0.28]));
  for (const sx of [-0.84, 0, 0.84]) {
    sofa.add(box(materials.plastic, [sx, 0.52, 0], [0.74, 0.12, 0.86]));
  }
  sofa.add(box(materials.wood, [-1.3, 0.45, 0], [0.22, 0.6, 0.9]));
  sofa.add(box(materials.wood, [1.3, 0.45, 0], [0.22, 0.6, 0.9]));
  for (const [lx, lz] of [
    [-1.12, 0.42],
    [1.12, 0.42],
    [-1.12, -0.42],
    [1.12, -0.42],
  ]) {
    sofa.add(box(materials.wood, [lx, 0.05, lz], [0.08, 0.1, 0.08]));
  }
  group.add(sofa);
  group.add(box(materials.chair, [3.25, 0.025, -3.8], [4.5, 0.03, 3.3]));

  const coffeeTable = new THREE.Group();
  coffeeTable.name = 'kost-coffee-table';
  coffeeTable.position.set(3.35, 0, -3.8);
  coffeeTable.add(box(materials.desk, [0, 0.48, 0], [1.5, 0.1, 0.75]));
  coffeeTable.add(box(materials.wood, [0, 0.24, 0], [0.42, 0.48, 0.42]));
  coffeeTable.add(box(materials.paper, [-0.28, 0.55, 0.05], [0.42, 0.02, 0.3]));
  group.add(coffeeTable);

  const tvScreenOff = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.4 });
  const tvScreenOn = new THREE.MeshStandardMaterial({
    color: 0xcfe8ff,
    emissive: 0xbfe4ff,
    emissiveIntensity: 1.4,
    roughness: 0.3,
  });
  const tv = new THREE.Group();
  tv.name = 'kost-tv';
  tv.position.set(6.2, 0, -3.6);
  tv.rotation.y = -Math.PI / 2;
  tv.add(box(materials.desk, [0, 0.4, 0], [1.7, 0.72, 0.5]));
  tv.add(box(materials.wood, [0, 0.78, 0], [1.8, 0.08, 0.56]));
  tv.add(box(materials.metal, [-0.42, 0.42, 0.27], [0.08, 0.14, 0.03]));
  tv.add(box(materials.metal, [0.42, 0.42, 0.27], [0.08, 0.14, 0.03]));
  tv.add(box(materials.metal, [0, 0.88, 0], [0.55, 0.06, 0.25]));
  tv.add(box(materials.metal, [0, 1.02, 0], [0.1, 0.28, 0.1]));
  tv.add(box(materials.metal, [0, 1.25, 0], [1.5, 0.9, 0.14]));
  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.78, 0.03), tvScreenOff);
  tvScreen.position.set(0, 1.25, 0.075);
  const tvGlow = new THREE.PointLight(0xaadcff, 0, 6);
  tvGlow.position.set(0, 1.25, 1.0);
  tv.add(tvScreen);
  tv.add(tvGlow);
  makeInteractable(tv, {
    action: 'tv-toggle',
    prompt: 'Nyalakan TV',
  });
  tv.userData.screen = tvScreen;
  tv.userData.onMat = tvScreenOn;
  tv.userData.offMat = tvScreenOff;
  tv.userData.glow = tvGlow;
  group.add(tv);
  interactables.push(tv);

  const lampBulbMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff4e0,
    emissive: 0xffd9a8,
    emissiveIntensity: 0,
    roughness: 0.35,
    metalness: 0.1,
  });
  const createRoomLamp = (position, intensity, distance) => {
    const fixture = new THREE.Group();
    fixture.name = 'kost-ceiling-lamp';
    fixture.position.set(...position);
    fixture.add(box(materials.metal, [0, 0.06, 0], [0.04, 0.18, 0.04]));
    fixture.add(box(materials.metal, [0, -0.14, 0], [0.55, 0.1, 0.3]));
    fixture.add(box(lampBulbMaterial, [0, -0.24, 0], [0.36, 0.12, 0.22]));
    const light = new THREE.PointLight(0xffe2b8, 0, distance, 1);
    light.position.set(0, -0.26, 0);
    light.userData.baseIntensity = intensity;
    fixture.add(light);
    return { fixture, light };
  };
  const roomLamps = [
    createRoomLamp([3.4, 2.96, 2.8], 5.2, 11),
    createRoomLamp([3.2, 2.96, -3.7], 5, 11),
    createRoomLamp([-4.2, 2.96, -3], 4.4, 10),
    createRoomLamp([-4.1, 2.96, 3.5], 4.2, 10),
  ];
  group.add(...roomLamps.map(({ fixture }) => fixture));

  group.add(bed, desk, chair, computer, phone, door);
  interactables.push(computer, phone, door);

  return {
    group,
    interactables,
    lamps: roomLamps.map(({ light }) => light),
    lampBulb: lampBulbMaterial,
    spawn: new THREE.Vector3(3.7, 1.7, 2.8),
    bounds: { minX: -6.5, maxX: 6.5, minZ: -5.5, maxZ: 6.5 },
  };
};

const WALL_Y = 1.5;

const wall = (materials, group, x, z, lenX, lenZ, material = materials.wall) => {
  group.add(box(material, [x, WALL_Y, z], [lenX, 3, lenZ]));
};

const solidSpans = (start, end, gaps) => {
  const spans = [];
  let cursor = start;
  for (const [g1, g2] of gaps.sort((a, b) => a[0] - b[0])) {
    if (g1 > cursor + 0.15) spans.push([(cursor + g1) / 2, g1 - cursor]);
    cursor = Math.max(cursor, g2);
  }
  if (end - cursor > 0.15) spans.push([(cursor + end) / 2, end - cursor]);
  return spans;
};

const wallRowX = (materials, group, x, zStart, zEnd, gaps, material) => {
  for (const [centerZ, lenZ] of solidSpans(zStart, zEnd, gaps)) {
    wall(materials, group, x, centerZ, 0.2, lenZ, material);
  }
};

const shell = (materials, group, zTop, zBottom) => {
  const xLen = 28.1;
  const zLen = zTop - zBottom;
  const centerZ = (zTop + zBottom) / 2;
  group.add(floorPlane(materials.floor, [0, 0, centerZ], [xLen, zLen]));
  group.add(box(materials.ceiling, [0, 3.05, centerZ], [xLen, 0.08, zLen]));
  wall(materials, group, -14.05, centerZ, 0.2, zLen, materials.wallDark);
  wall(materials, group, 14.05, centerZ, 0.2, zLen, materials.wallDark);
};

const buildHospital = (materials, pocongImageUrl) => {
  const group = new THREE.Group();
  const interactables = [];
  const flickerLights = [];

  const COURT_Z = 22;
  const F1 = { topZ: 16, bottomZ: -17 };
  const F2 = { topZ: -29.5, bottomZ: -58 };
  const corridorLightZs = [14, 9, 4, -1, -6, -11, -15, -32, -37, -42, -47, -52, -57];

  shell(materials, group, F1.topZ, F1.bottomZ);
  shell(materials, group, F2.topZ, F2.bottomZ);

  for (const [centerX, lenX] of solidSpans(-14, 14, [[-13.6, -11.2]])) {
    wall(materials, group, centerX, F1.topZ, lenX, 0.2, materials.wallDark);
  }
  for (const [centerX, lenX] of solidSpans(-14, 14, [[-1.35, 1.35]])) {
    wall(materials, group, centerX, F1.bottomZ, lenX, 0.2, materials.wallDark);
  }
  wall(materials, group, 0, F2.topZ, 28.1, 0.2, materials.wallDark);
  wall(materials, group, 0, F2.bottomZ, 28.1, 0.2, materials.wallDark);

  wallRowX(materials, group, -4.05, F1.topZ, F1.bottomZ, [
    [10.6, 13.4],
    [0.6, 3.4],
    [-3.4, -0.6],
    [-13.4, -10.6],
  ]);
  wallRowX(materials, group, 4.05, F1.topZ, F1.bottomZ, [
    [10.6, 13.4],
    [0.6, 3.4],
    [-3.4, -0.6],
    [-13.4, -10.6],
  ]);
  wallRowX(materials, group, -4.05, F2.topZ, F2.bottomZ, [
    [-50.4, -47.6],
    [-37.4, -34.6],
  ]);
  wallRowX(materials, group, 4.05, F2.topZ, F2.bottomZ, [
    [-57.4, -54.6],
    [-50.4, -47.6],
    [-37.4, -34.6],
  ]);

  wall(materials, group, -9.05, 8.05, 10.05, 0.2);
  wall(materials, group, 9.05, 8.05, 10.05, 0.2);
  wall(materials, group, -9.05, 0.05, 10.05, 0.2);
  wall(materials, group, 9.05, 0.05, 10.05, 0.2);
  wall(materials, group, -9.05, -8.05, 10.05, 0.2);
  wall(materials, group, 9.05, -8.05, 10.05, 0.2);
  wall(materials, group, -9.05, -44.05, 10.05, 0.2);
  wall(materials, group, 9.05, -44.05, 10.05, 0.2);

  for (const [centerZ, length] of [
    [-0.5, 33],
    [-43.75, 28.5],
  ]) {
    for (const x of [-3.91, 3.91]) {
      group.add(box(materials.tile, [x, 0.12, centerZ], [0.04, 0.22, length]));
      group.add(box(materials.roadBlock, [x, 1.08, centerZ], [0.035, 0.1, length]));
    }
  }
  for (const z of [8.05, 0.05, -8.05, -44.05]) {
    for (const x of [-9.05, 9.05]) {
      for (const offset of [-0.12, 0.12]) {
        group.add(box(materials.tile, [x, 0.12, z + offset], [9.75, 0.22, 0.035]));
      }
    }
  }
  for (const z of [12, 4, -4, -12, -33, -41, -49, -57]) {
    group.add(box(materials.concrete, [0, 2.88, z], [8, 0.12, 0.22]));
  }
  for (const z of corridorLightZs) {
    group.add(box(materials.metal, [2.8, 2.98, z], [1.15, 0.035, 0.65]));
  }

  const entrance = createDoor(
    materials,
    [-12.4, 0, F1.topZ + 0.15],
    'side-entry',
    'side-entry',
    'Masuk lewat pintu samping'
  );
  const exitDoor = createDoor(
    materials,
    [0, 0, F1.bottomZ - 0.15],
    'exit-door',
    'exit',
    'Buka pintu keluar',
    0,
    'key-janitor'
  );
  const stairsUp = createDoor(
    materials,
    [4.15, 0, -12.3],
    'stairs-up',
    'stairs-up',
    'Naik ke lantai 2',
    Math.PI
  );
  const stairsDown = createDoor(
    materials,
    [4.15, 0, -55.5],
    'stairs-down',
    'stairs-down',
    'Turun ke lantai 1',
    Math.PI
  );

  group.add(entrance, exitDoor, stairsUp, stairsDown);
  group.add(
    createSign('PINTU SAMPING', [-12.4, 2.55, 16.4]),
    createSign('KELUAR', [0, 2.55, -16.5]),
    createSign('TANGGA', [4.15, 2.55, -12]),
    createSign('TANGGA', [4.15, 2.55, -55.2]),
    createSign('ARSIP', [-3.85, 2.55, -49])
  );
  for (const [label, x, z] of [
    ['RUANG TUNGGU', -3.78, 12],
    ['ADMINISTRASI', 3.78, 12],
    ['RUANG PERIKSA', -3.78, 2],
    ['JANITOR', 3.78, 2],
    ['BANGSAL PASIEN', -3.78, -2],
    ['RUANG OPERASI', 3.78, -2],
    ['GUDANG', -3.78, -12],
    ['PERAWATAN A', -3.78, -36],
    ['PERAWATAN B', 3.78, -36],
    ['RUANG ISOLASI', 3.78, -49],
  ]) {
    group.add(createSign(label, [x, 2.48, z], [1.55, 0.32]));
  }
  interactables.push(entrance, exitDoor, stairsUp, stairsDown);

  // Courtyard exterior environment - expanded horror atmosphere
  // Tanah lebih luas dengan dead leaves
  group.add(createGround(materials, [-10, 0, COURT_Z + 4], [10, 10]));
  group.add(createGround(materials, [10, 0, COURT_Z + 4], [10, 10]));
  group.add(createGround(materials, [0, 0, COURT_Z + 8], [16, 6]));
  group.add(createGround(materials, [-12, 0, COURT_Z - 1], [6, 8]));
  group.add(createGround(materials, [12, 0, COURT_Z - 1], [6, 8]));

  // Perbanyak pohon - forest feel
  group.add(createTree(materials, [-11, 0, COURT_Z + 6], 1.2));
  group.add(createTree(materials, [-8, 0, COURT_Z + 2], 0.95));
  group.add(createTree(materials, [-5, 0, COURT_Z + 8], 1.05));
  group.add(createTree(materials, [-3, 0, COURT_Z + 1], 0.85));
  group.add(createTree(materials, [3, 0, COURT_Z + 7.5], 1.1));
  group.add(createTree(materials, [5, 0, COURT_Z + 2.5], 0.9));
  group.add(createTree(materials, [8, 0, COURT_Z + 5], 1));
  group.add(createTree(materials, [11, 0, COURT_Z + 1], 1.15));
  group.add(createTree(materials, [-13, 0, COURT_Z - 2], 1.3));
  group.add(createTree(materials, [13, 0, COURT_Z - 1.5], 1.25));
  group.add(createTree(materials, [0, 0, COURT_Z + 10], 0.95));
  group.add(createTree(materials, [-7, 0, COURT_Z + 9.5], 1.08));
  group.add(createTree(materials, [6, 0, COURT_Z + 9], 1.02));

  // Dead/bare trees untuk variasi horror
  for (const [x, z, scale] of [
    [-9.5, COURT_Z + 5, 0.8],
    [9, COURT_Z + 8, 0.75],
    [-4, COURT_Z + 11, 0.7],
  ]) {
    const bareTree = createTree(materials, [x, 0, z], scale);
    // Remove foliage untuk dead tree effect
    bareTree.children = bareTree.children.filter((c) => c.geometry?.type === 'CylinderGeometry');
    group.add(bareTree);
  }

  // Pagar interaktif yang menghalangi jalan masuk utama
  const mainGate = createFence(
    materials,
    [0, 0, COURT_Z + 3.5],
    14,
    'main-gate-fence',
    'main-gate',
    'Periksa pagar'
  );
  group.add(mainGate);
  interactables.push(mainGate);

  group.add(floorPlane(materials.asphalt, [0, 0.01, COURT_Z], [18, 12]));
  group.add(floorPlane(materials.concrete, [-12.4, 0.02, COURT_Z], [3.4, 12]));
  group.add(box(materials.roadBlock, [-2.4, 0.45, COURT_Z - 2.6], [3.4, 0.32, 0.28]));
  group.add(box(materials.roadBlock, [2.4, 0.45, COURT_Z - 2.6], [3.4, 0.32, 0.28]));
  group.add(box(materials.metal, [-4.2, 0.9, COURT_Z - 2.6], [0.18, 1.8, 0.18]));
  group.add(box(materials.metal, [4.2, 0.9, COURT_Z - 2.6], [0.18, 1.8, 0.18]));

  group.add(wallPanel(materials.wallDark, [0, 4.62, 16.12], [28, 3.1]));
  group.add(box(materials.concrete, [0, 3.08, 16.1], [28.4, 0.2, 0.42]));
  group.add(box(materials.concrete, [0, 6.2, 16.1], [28.7, 0.24, 0.5]));
  group.add(box(materials.concrete, [-13.65, 3.1, 16.1], [0.42, 6.2, 0.48]));
  group.add(box(materials.concrete, [13.65, 3.1, 16.1], [0.42, 6.2, 0.48]));
  group.add(createSign('RS KARTINI', [0, 5.72, 16.42], [7, 1.15]));

  // Windows - some boarded up untuk horror
  for (const [y, xs] of [
    [1.62, [-8.5, -4.5, -0.5, 3.5, 7.5, 11.5]],
    [4.55, [-10, -6, -2, 2, 6, 10]],
  ]) {
    for (const x of xs) {
      // Beberapa window di-board up (30%)
      if (Math.abs(x + 8.5) < 0.1 || Math.abs(x - 7.5) < 0.1 || Math.abs(x + 10) < 0.1 || Math.abs(x - 10) < 0.1) {
        group.add(createBoardedWindow(materials, [x, y, 16.26]));
      } else {
        group.add(wallPanel(materials.window, [x, y, 16.26], [2.15, 1.18]));
        group.add(box(materials.metal, [x, y, 16.29], [0.055, 1.18, 0.035]));
        group.add(box(materials.metal, [x, y, 16.29], [2.15, 0.055, 0.035]));
      }
    }
  }

  // Blood stains di dinding facade
  group.add(createBloodStain(materials, [-7, 2.8, 16.32], [0.6, 0.8]));
  group.add(createBloodStain(materials, [4, 3.5, 16.32], [0.4, 0.5]));
  group.add(createBloodStain(materials, [9, 1.8, 16.32], [0.5, 0.6]));

  group.add(box(materials.concrete, [-12.4, 3.16, 18], [3.7, 0.18, 4]));
  for (const x of [-13.75, -11.05]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 3.05, 10), materials.metal);
    column.position.set(x, 1.55, 19.65);
    group.add(column);
  }
  for (const x of [-4, 0, 4]) {
    group.add(box(materials.tile, [x, 0.035, 24.5], [0.08, 0.03, 4]));
  }
  for (const [x, z] of [
    [-8.1, 19.2],
    [8.1, 19.2],
    [-8.1, 25.2],
    [8.1, 25.2],
  ]) {
    group.add(createCourtyardLamp(materials, [x, 0, z]));
  }

  const key = createRustyKey(materials, [-9, 0.78, -50.5]);
  const batteryOne = createPickup(
    materials,
    [-9.2, 0.52, 4],
    'battery',
    'Baterai',
    materials.battery
  );
  const batteryTwo = createPickup(
    materials,
    [8.8, 0.52, -37.5],
    'battery',
    'Baterai',
    materials.battery
  );
  const note = createPickup(
    materials,
    [-9, 0.72, -37.5],
    'medical-note',
    'Catatan Medis',
    materials.paper
  );
  const enemy = createPocong(materials, [-10.5, 0, -5], pocongImageUrl);
  enemy.visible = false;

  group.add(key, batteryOne, batteryTwo, note, enemy);
  interactables.push(key, batteryOne, batteryTwo, note);

  const lobbyCounter = createDeskCounter(materials, [-0.4, 0, 11.3]);
  group.add(lobbyCounter);

  const sideEntryLight = new THREE.PointLight(0xffd29a, 1.4, 9);
  sideEntryLight.position.set(-12.4, 2.4, 18);
  group.add(sideEntryLight);

  group.add(createBed(materials, [-10.5, 0, -5], 0, true));
  group.add(createBed(materials, [-10, 0, 5.2], 0));
  group.add(createBed(materials, [8.9, 0, -2.6], Math.PI / 2));
  group.add(createBed(materials, [-10.5, 0, -36], Math.PI));
  group.add(createBed(materials, [10, 0, -36], Math.PI));
  group.add(createLocker(materials, [-5.6, 0, -4.6], Math.PI / 2));
  group.add(createLocker(materials, [6, 0, 4.8], -Math.PI / 2));
  group.add(createLocker(materials, [5.8, 0, -36.4], -Math.PI / 2));
  group.add(createBed(materials, [9.7, 0, -50.5], -Math.PI / 2, true));
  group.add(createShelf(materials, [-6.4, 0, -10.5], Math.PI / 2));
  group.add(createShelf(materials, [6.4, 0, 6.5]));
  group.add(createShelf(materials, [-11.8, 0, -54.5], Math.PI / 2));
  group.add(createShelf(materials, [-8.2, 0, -56.2]));
  group.add(createIvStand(materials, [-10.5, 0, -6.6]));
  group.add(createIvStand(materials, [-10.8, 0, 3.8]));
  group.add(createIvStand(materials, [7.4, 0, -0.8]));
  group.add(createIvStand(materials, [10.8, 0, -37.5]));
  group.add(createIvStand(materials, [8.8, 0, -47.5]));
  group.add(createMedicalCart(materials, [-7.2, 0, 5.5], 0.2));
  group.add(createMedicalCart(materials, [7.3, 0, -5.3], -0.3));
  group.add(createMedicalCart(materials, [7.4, 0, -39], Math.PI / 2));
  group.add(createHospitalCabinet(materials, [-13.45, 0, 3.2], Math.PI / 2));
  group.add(createHospitalCabinet(materials, [13.45, 0, -5.3], -Math.PI / 2));
  group.add(createHospitalCabinet(materials, [-13.45, 0, -34], Math.PI / 2));
  group.add(createHospitalCabinet(materials, [13.45, 0, -39], -Math.PI / 2));
  group.add(createHospitalCabinet(materials, [13.45, 0, -52.5], -Math.PI / 2));
  group.add(createPrivacyScreen(materials, [-8.7, 0, 5.2], Math.PI / 2));
  group.add(createPrivacyScreen(materials, [8.9, 0, -4], 0));
  group.add(createPrivacyScreen(materials, [-9, 0, -36], 0));
  group.add(createPrivacyScreen(materials, [8.3, 0, -50.5], Math.PI / 2));

  const examinationRoom = new THREE.Group();
  examinationRoom.name = 'examination-room-details';
  examinationRoom.add(box(materials.desk, [-6.3, 0.82, 0.75], [2.35, 0.12, 0.82]));
  for (const x of [-7.3, -5.3]) {
    examinationRoom.add(box(materials.metal, [x, 0.4, 0.75], [0.08, 0.8, 0.62]));
  }
  examinationRoom.add(box(materials.metal, [-6.3, 1.3, 0.68], [0.9, 0.58, 0.08]));
  examinationRoom.add(box(materials.laptopScreen, [-6.3, 1.3, 0.63], [0.78, 0.46, 0.025]));
  examinationRoom.add(box(materials.metal, [-6.3, 0.94, 0.68], [0.12, 0.18, 0.12]));
  examinationRoom.add(box(materials.laptop, [-6.3, 0.91, 1.02], [0.72, 0.04, 0.25]));
  examinationRoom.add(createPlasticChair(materials, [-6.3, 0, 1.75], Math.PI));

  examinationRoom.add(box(materials.porcelain, [-13.42, 0.88, 6.55], [0.78, 0.18, 1.15]));
  examinationRoom.add(box(materials.dirt, [-13.36, 0.98, 6.55], [0.42, 0.02, 0.7]));
  examinationRoom.add(box(materials.metal, [-13.1, 1.22, 6.55], [0.06, 0.48, 0.06]));
  examinationRoom.add(box(materials.metal, [-12.96, 1.43, 6.55], [0.28, 0.06, 0.06]));

  examinationRoom.add(box(materials.paper, [-6.25, 1.72, 7.91], [1.35, 1.48, 0.035]));
  examinationRoom.add(box(materials.blood, [-6.25, 1.82, 7.88], [0.34, 0.82, 0.025]));
  examinationRoom.add(box(materials.doorTrim, [-6.25, 1.18, 7.87], [0.72, 0.06, 0.025]));

  const examLamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.32, 0.16, 14),
    materials.hospitalTube
  );
  examLamp.position.set(-11.7, 2.05, 4.8);
  examinationRoom.add(box(materials.metal, [-12.35, 1.02, 4.8], [0.07, 2.04, 0.07]));
  examinationRoom.add(box(materials.metal, [-12.02, 2.12, 4.8], [0.7, 0.07, 0.07]));
  examinationRoom.add(examLamp);
  const examLight = new THREE.PointLight(0xfff1d6, 0.7, 3.5, 1);
  examLight.position.set(-11.7, 1.9, 4.8);
  examinationRoom.add(examLight);
  group.add(examinationRoom);

  const administrationRoom = new THREE.Group();
  administrationRoom.name = 'administration-room-details';
  const administrationCounter = createDeskCounter(materials, [9, 0, 9.25]);
  administrationCounter.name = 'administration-counter';
  administrationRoom.add(administrationCounter);
  for (const x of [7.7, 9, 10.3]) {
    administrationRoom.add(createPlasticChair(materials, [x, 0, 11.2]));
  }
  for (const z of [10, 13.5]) {
    administrationRoom.add(createHospitalCabinet(materials, [13.45, 0, z], -Math.PI / 2));
  }
  administrationRoom.add(box(materials.plastic, [10.05, 1.94, 9.25], [0.5, 0.24, 0.38]));
  administrationRoom.add(box(materials.paper, [10.05, 2.08, 9.25], [0.35, 0.025, 0.24]));
  administrationRoom.add(box(materials.wood, [9, 1.72, 15.91], [3.8, 1.15, 0.08]));
  for (const [x, y] of [
    [7.9, 1.8],
    [9, 1.55],
    [10.1, 1.85],
  ]) {
    administrationRoom.add(box(materials.paper, [x, y, 15.86], [0.7, 0.45, 0.025]));
  }
  group.add(administrationRoom);

  const patientWard = new THREE.Group();
  patientWard.name = 'patient-ward-details';
  patientWard.add(createBed(materials, [-7, 0, -5]));
  patientWard.add(createIvStand(materials, [-7, 0, -6.65]));
  patientWard.add(createPrivacyScreen(materials, [-8.75, 0, -5], Math.PI / 2));
  for (const x of [-10.5, -7]) {
    patientWard.add(box(materials.metal, [x, 1.85, -7.9], [1.45, 0.42, 0.06]));
    patientWard.add(box(materials.battery, [x - 0.28, 1.85, -7.85], [0.12, 0.12, 0.035]));
    patientWard.add(box(materials.blood, [x + 0.28, 1.85, -7.85], [0.12, 0.12, 0.035]));
    patientWard.add(box(materials.wood, [x + 0.82, 0.4, -6.25], [0.52, 0.8, 0.58]));
    patientWard.add(box(materials.desk, [x + 0.82, 0.83, -6.25], [0.58, 0.08, 0.64]));
  }
  patientWard.add(createPlasticChair(materials, [-12.55, 0, -1.2], Math.PI));
  const oxygenCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.19, 1.15, 12),
    materials.metal
  );
  oxygenCylinder.position.set(-13.25, 0.58, -2.3);
  patientWard.add(oxygenCylinder);
  patientWard.add(box(materials.battery, [-13.25, 1.22, -2.3], [0.18, 0.16, 0.18]));
  group.add(patientWard);

  const waitingRoom = new THREE.Group();
  waitingRoom.name = 'waiting-room-details';
  for (const [x, z, rotation] of [
    [-13.15, 10, -Math.PI / 2],
    [-13.15, 12, -Math.PI / 2],
    [-13.15, 14, -Math.PI / 2],
    [-10, 15.15, 0],
    [-8.8, 15.15, 0],
    [-7.6, 15.15, 0],
  ]) {
    waitingRoom.add(createPlasticChair(materials, [x, 0, z], rotation));
  }
  waitingRoom.add(floorPlane(materials.dirt, [-9.7, 0.015, 12.2], [3.2, 2.35]));
  waitingRoom.add(box(materials.wood, [-9.7, 0.52, 12.2], [1.35, 0.08, 0.75]));
  waitingRoom.add(box(materials.wood, [-9.7, 0.27, 12.2], [0.5, 0.5, 0.34]));
  waitingRoom.add(box(materials.paper, [-9.95, 0.58, 12.16], [0.36, 0.025, 0.24]));
  waitingRoom.add(box(materials.paper, [-9.48, 0.59, 12.28], [0.3, 0.025, 0.2]));

  waitingRoom.add(box(materials.wood, [-10.5, 1.72, 8.2], [3.8, 1.15, 0.08]));
  for (const [x, y] of [
    [-11.65, 1.83],
    [-10.65, 1.55],
    [-9.55, 1.88],
  ]) {
    waitingRoom.add(box(materials.paper, [x, y, 8.25], [0.65, 0.42, 0.025]));
  }

  waitingRoom.add(box(materials.plastic, [-5.35, 0.64, 14.75], [0.58, 1.28, 0.52]));
  const waterJug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.55, 12), materials.glass);
  waterJug.position.set(-5.35, 1.55, 14.75);
  waitingRoom.add(waterJug);
  waitingRoom.add(box(materials.metal, [-5.35, 1.02, 14.42], [0.08, 0.08, 0.2]));
  waitingRoom.add(box(materials.battery, [-5.22, 0.88, 14.46], [0.08, 0.08, 0.08]));
  waitingRoom.add(box(materials.blood, [-5.48, 0.88, 14.46], [0.08, 0.08, 0.08]));

  const clock = new THREE.Group();
  clock.position.set(-6.2, 2.15, 8.2);
  clock.add(new THREE.Mesh(new THREE.CircleGeometry(0.31, 18), materials.paper));
  clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 18), materials.metal));
  clock.add(box(materials.doorTrim, [0, 0.07, 0.025], [0.025, 0.22, 0.02]));
  clock.add(box(materials.doorTrim, [0.08, -0.02, 0.03], [0.17, 0.025, 0.02]));
  waitingRoom.add(clock);

  const trashBin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.55, 10), materials.metal);
  trashBin.position.set(-5.3, 0.28, 9);
  waitingRoom.add(trashBin);
  group.add(waitingRoom);

  group.add(createPlasticChair(materials, [-10.2, 0, -37.5], 0.5));
  group.add(createFuseBox(materials, [4.8, 0, 6.2], -Math.PI / 2));

  for (const child of group.children) {
    if (child.userData.action === 'hide' || child.userData.action === 'inspect') {
      interactables.push(child);
    }
  }

  for (const [x, z, intensity] of [
    ...corridorLightZs.map((z) => [0, z, 2.2]),
    ...[4, -4, -12].flatMap((z) => [
      [-9, z, 2.8],
      [9, z, 2.8],
    ]),
    [-9, 10, 2.4],
    [-9, 14, 2.4],
    [9, 12, 2.8],
    [-9, -36, 2.8],
    [9, -36, 2.8],
    [-9, -50, 2.8],
    [9, -50, 2.8],
  ]) {
    const { lightGroup } = createNeonLight(materials, [x, 2.92, z], intensity);
    group.add(lightGroup);
  }

  const rooms = [
    { name: 'Halaman Rumah Sakit', floor: 1, minX: -14, maxX: 14, minZ: 16, maxZ: 28 },
    { name: 'Lobby', floor: 1, minX: -4, maxX: 4, minZ: 8, maxZ: 16 },
    { name: 'Ruang Tunggu', floor: 1, minX: -14, maxX: -4, minZ: 8, maxZ: 16 },
    { name: 'Ruang Administrasi', floor: 1, minX: 4, maxX: 14, minZ: 8, maxZ: 16 },
    { name: 'Ruang Periksa', floor: 1, minX: -14, maxX: -4, minZ: 0, maxZ: 8 },
    { name: 'Ruang Janitor', floor: 1, minX: 4, maxX: 14, minZ: 0, maxZ: 8 },
    { name: 'Bangsal Pasien', floor: 1, minX: -14, maxX: -4, minZ: -8, maxZ: 0 },
    { name: 'Ruang Operasi', floor: 1, minX: 4, maxX: 14, minZ: -8, maxZ: 0 },
    { name: 'Gudang', floor: 1, minX: -14, maxX: -4, minZ: -17, maxZ: -8 },
    { name: 'Pintu Keluar Utama', floor: 1, minX: -4, maxX: 4, minZ: -17, maxZ: -8 },
    { name: 'Tangga Darurat', floor: 1, minX: 4, maxX: 14, minZ: -17, maxZ: -8 },
    { name: 'Lantai 2 - Koridor', floor: 2, minX: -4, maxX: 4, minZ: -58, maxZ: -30 },
    { name: 'Lantai 2 - Arsip', floor: 2, minX: -14, maxX: -4, minZ: -58, maxZ: -44 },
    { name: 'Lantai 2 - Ruang Isolasi', floor: 2, minX: 4, maxX: 14, minZ: -58, maxZ: -44 },
    { name: 'Lantai 2 - Perawatan A', floor: 2, minX: -14, maxX: -4, minZ: -44, maxZ: -30 },
    { name: 'Lantai 2 - Perawatan B', floor: 2, minX: 4, maxX: 14, minZ: -44, maxZ: -30 },
    { name: 'Tangga Lantai 2', floor: 2, minX: 4, maxX: 14, minZ: -58, maxZ: -50 },
  ];

  return {
    enemy,
    flickerLights,
    group,
    interactables,
    rooms,
    boundsByFloor: {
      1: { minX: -14.5, maxX: 14.5, minZ: -17.5, maxZ: 28 },
      2: { minX: -14.5, maxX: 14.5, minZ: -59, maxZ: -29 },
    },
    spawn: new THREE.Vector3(0, 1.7, 23),
    insideSpawn: new THREE.Vector3(0, 1.7, 11),
    floorTwoSpawn: new THREE.Vector3(0, 1.7, -49),
    floorOneStairSpawn: new THREE.Vector3(0, 1.7, -12),
  };
};

export const createChapterScenes = (scene, pocongImageUrl) => {
  const materials = createMaterials();
  const prologue = createKostRoom(materials);
  const hospital = buildHospital(materials, pocongImageUrl);

  prologue.group.visible = false;
  hospital.group.visible = false;
  scene.add(prologue.group, hospital.group);

  return {
    enemy: hospital.enemy,
    flickerLights: hospital.flickerLights,
    groups: { prologue: prologue.group, hospital: hospital.group },
    interactables: [...prologue.interactables, ...hospital.interactables],
    prologue,
    hospital: {
      boundsByFloor: hospital.boundsByFloor,
      rooms: hospital.rooms,
      spawn: hospital.spawn,
      insideSpawn: hospital.insideSpawn,
      floorTwoSpawn: hospital.floorTwoSpawn,
      floorOneStairSpawn: hospital.floorOneStairSpawn,
    },
  };
};

export const updateHospitalEffects = (flickerLights, elapsedTime) => {
  for (let index = 0; index < flickerLights.length; index += 1) {
    const light = flickerLights[index];
    const pulse = Math.sin(elapsedTime * (7 + index * 1.3)) > 0.86 ? 0.35 : 1;
    const unstable = Math.sin(elapsedTime * (19 + index)) > 0.96 ? 0.15 : 1;
    light.intensity = light.userData.baseIntensity * pulse * unstable;
  }
};

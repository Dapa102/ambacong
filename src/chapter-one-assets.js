import * as THREE from 'three';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const planeGeometry = new THREE.PlaneGeometry(1, 1);

const makeCanvasTexture = (size, draw, repeat) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const speckle = (context, size, count, alpha) => {
  for (let i = 0; i < count; i += 1) {
    const grey = 180 + Math.random() * 75;
    context.fillStyle = `rgba(${grey},${grey},${grey},${alpha})`;
    context.fillRect(Math.random() * size, Math.random() * size, 1.5, 1.5);
  }
};

const textureGenerators = {
  floor(context, size) {
    context.fillStyle = '#2e2e33';
    context.fillRect(0, 0, size, size);
    const tiles = 4;
    const step = size / tiles;
    context.strokeStyle = '#24242a';
    context.lineWidth = 2;
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
    speckle(context, size, 700, 0.05);
    context.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 26; i += 1) {
      context.beginPath();
      context.arc(Math.random() * size, Math.random() * size, 6 + Math.random() * 14, 0, Math.PI * 2);
      context.fill();
    }
  },
  wall(context, size, tone = 1) {
    context.fillStyle = `rgb(${Math.round(0x7f * tone)},${Math.round(0x89 * tone)},${Math.round(0x78 * tone)})`;
    context.fillRect(0, 0, size, size);
    speckle(context, size, 1400, 0.06);
    context.fillStyle = 'rgba(24,27,20,0.16)';
    for (let i = 0; i < 5; i += 1) {
      const y = Math.random() * size;
      context.fillRect(0, y, size, 6 + Math.random() * 22);
    }
    context.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 12; i += 1) {
      context.beginPath();
      context.arc(Math.random() * size, Math.random() * size, 8 + Math.random() * 18, 0, Math.PI * 2);
      context.fill();
    }
  },
  ceiling(context, size) {
    context.fillStyle = '#202226';
    context.fillRect(0, 0, size, size);
    speckle(context, size, 1000, 0.07);
    context.fillStyle = 'rgba(0,0,0,0.22)';
    for (let i = 0; i < 8; i += 1) {
      const y = Math.random() * size;
      context.fillRect(0, y, size, 4 + Math.random() * 10);
    }
  },
  asphalt(context, size) {
    context.fillStyle = '#141414';
    context.fillRect(0, 0, size, size);
    speckle(context, size, 2000, 0.08);
    context.strokeStyle = 'rgba(0,0,0,0.45)';
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
  const textured = (color, generator, repeat, options = {}) => {
    const material = standard(color, options);
    material.map = makeCanvasTexture(512, generator, repeat);
    return material;
  };
  return {
    asphalt: textured(0x191919, textureGenerators.asphalt, 6),
    battery: standard(0x2f6b9a, { emissive: 0x06263a, roughness: 0.5, metalness: 0.4 }),
    bedSheet: standard(0xb8b0a0, { roughness: 0.95 }),
    blood: standard(0x4b0505, { roughness: 0.6 }),
    chair: standard(0x8c8577, { roughness: 0.85 }),
    ceiling: textured(0x25272a, textureGenerators.ceiling, 6),
    concrete: standard(0x585a54, { map: makeCanvasTexture(512, textureGenerators.wall, 8) }),
    desk: standard(0x4c3326, { roughness: 0.8, metalness: 0.1 }),
    dirt: standard(0x2d211c, { roughness: 1 }),
    door: standard(0x5a1715, { roughness: 0.7, metalness: 0.15 }),
    doorTrim: standard(0x241715, { roughness: 0.8 }),
    glass: standard(0xbfd5d2, { roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.35 }),
    floor: textured(0x343438, textureGenerators.floor, 8),
    key: standard(0xd6a800, { emissive: 0x664400, roughness: 0.4, metalness: 0.7 }),
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
    wall: textured(0x7f8978, textureGenerators.wall, 6),
    wallDark: textured(0x4b5148, (c, s) => textureGenerators.wall(c, s, 0.62), 6),
    wood: standard(0x5a3d2e, { roughness: 0.8 }),
  };
};

const box = (material, position, scale) => {
  const mesh = new THREE.Mesh(boxGeometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return mesh;
};

const floorPlane = (material, position, scale) => {
  const mesh = new THREE.Mesh(planeGeometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.x = -Math.PI / 2;
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
    }
  }
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

const createNeonLight = (materials, position) => {
  const lightGroup = new THREE.Group();
  lightGroup.name = 'neon-light';
  lightGroup.position.set(...position);

  lightGroup.add(box(materials.metal, [0, 0, 0], [1.3, 0.06, 0.18]));
  lightGroup.add(box(materials.neonTube, [0, -0.05, 0], [1.08, 0.04, 0.04]));

  const pointLight = new THREE.PointLight(0x90ee90, 0.5, 7);
  pointLight.position.set(0, -0.35, 0);
  pointLight.userData.baseIntensity = 0.5;
  lightGroup.add(pointLight);

  return { lightGroup, pointLight };
};

const createSign = (text, position) => {
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
  sign.scale.set(3, 0.75, 1);
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
    color: 0xffffff,
    emissive: 0xffffff,
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
    const light = new THREE.PointLight(0xfff1d6, 0, distance, 1);
    light.position.set(0, -0.26, 0);
    light.userData.baseIntensity = intensity;
    fixture.add(light);
    return { fixture, light };
  };
  const roomLamps = [
    createRoomLamp([3.4, 2.96, 2.8], 2.4, 9),
    createRoomLamp([3.2, 2.96, -3.7], 2.3, 9),
    createRoomLamp([-4.2, 2.96, -3], 2.1, 8),
    createRoomLamp([-4.1, 2.96, 3.5], 2, 8),
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
    [11, 13],
    [1, 3],
    [-3, -1],
    [-13, -11],
  ]);
  wallRowX(materials, group, 4.05, F1.topZ, F1.bottomZ, [
    [11, 13],
    [1, 3],
    [-3, -1],
    [-13, -11],
  ]);
  wallRowX(materials, group, -4.05, F2.topZ, F2.bottomZ, [
    [-50, -48],
    [-37, -35],
  ]);
  wallRowX(materials, group, 4.05, F2.topZ, F2.bottomZ, [
    [-57, -55],
    [-50, -48],
    [-37, -35],
  ]);

  wall(materials, group, -9.05, 8.05, 10.05, 0.2);
  wall(materials, group, 9.05, 8.05, 10.05, 0.2);
  wall(materials, group, -9.05, 0.05, 10.05, 0.2);
  wall(materials, group, 9.05, 0.05, 10.05, 0.2);
  wall(materials, group, -9.05, -8.05, 10.05, 0.2);
  wall(materials, group, 9.05, -8.05, 10.05, 0.2);
  wall(materials, group, -9.05, -44.05, 10.05, 0.2);
  wall(materials, group, 9.05, -44.05, 10.05, 0.2);

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
  interactables.push(entrance, exitDoor, stairsUp, stairsDown);

  group.add(floorPlane(materials.asphalt, [0, 0.01, COURT_Z], [18, 12]));
  group.add(box(materials.roadBlock, [-2.4, 0.45, COURT_Z - 2.6], [3.4, 0.32, 0.28]));
  group.add(box(materials.roadBlock, [2.4, 0.45, COURT_Z - 2.6], [3.4, 0.32, 0.28]));
  group.add(box(materials.metal, [-4.2, 0.9, COURT_Z - 2.6], [0.18, 1.8, 0.18]));
  group.add(box(materials.metal, [4.2, 0.9, COURT_Z - 2.6], [0.18, 1.8, 0.18]));

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
  group.add(createBed(materials, [8.9, 0, -2.6], Math.PI / 2));
  group.add(createBed(materials, [-10.5, 0, -36], Math.PI));
  group.add(createLocker(materials, [-5.6, 0, -4.6], Math.PI / 2));
  group.add(createLocker(materials, [6, 0, 4.8], -Math.PI / 2));
  group.add(createLocker(materials, [5.8, 0, -36.4], -Math.PI / 2));
  group.add(createBed(materials, [9.7, 0, -50.5], -Math.PI / 2, true));
  group.add(createShelf(materials, [-6.4, 0, -10.5], Math.PI / 2));
  group.add(createShelf(materials, [6.4, 0, 6.5]));
  group.add(createIvStand(materials, [-10.5, 0, -6.6]));
  group.add(createIvStand(materials, [7.4, 0, -0.8]));
  group.add(createIvStand(materials, [8.8, 0, -47.5]));
  group.add(createPlasticChair(materials, [-10.4, 0, 12.4], 0.3));
  group.add(createPlasticChair(materials, [-9.4, 0, 12.2], -0.2));
  group.add(createPlasticChair(materials, [-10.2, 0, -37.5], 0.5));
  group.add(createFuseBox(materials, [4.8, 0, 6.2], -Math.PI / 2));

  for (const child of group.children) {
    if (child.userData.action === 'hide' || child.userData.action === 'inspect') {
      interactables.push(child);
    }
  }

  for (const [x, z] of [
    [0, 12],
    [0, 4],
    [0, -4],
    [0, -12],
    [-9, 4],
    [9, 4],
    [0, -33],
    [0, -41],
    [0, -49],
  ]) {
    const { lightGroup, pointLight } = createNeonLight(materials, [x, 2.92, z]);
    group.add(lightGroup);
    flickerLights.push(pointLight);
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

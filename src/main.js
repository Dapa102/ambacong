import * as THREE from 'three';
import { createChapterScenes, updateHospitalEffects } from './chapter-one-assets.js';
import ambacongFaceUrl from '../assets/ambacong.png';
import { InputSystem } from './core/input-system.js';
import { StateMachine } from './core/state-machine.js';
import { SaveSystem, SAVE_SLOT } from './systems/save-system.js';
import { AudioSystem } from './systems/audio-system.js';
import { buildColliders } from './systems/collision-system.js';
import { NOISE, movementNoise } from './systems/noise-system.js';
import { createPostProcessing } from './systems/post-processing.js';
import { InventorySystem, ITEM_CATALOG } from './systems/inventory-system.js';
import { Player } from './entities/player.js';
import { Pocong } from './entities/pocong.js';
import { drainBattery, aimForward } from './flashlight.js';
import { advanceProgress } from './progress.js';
import { initMenu, showMenu, hideMenu, setContinueEnabled } from './ui/menu.js';
import { hud } from './ui/hud.js';
import * as overlays from './ui/overlays.js';
import { initMapUi, openMap, closeMap, isMapOpen, renderMap } from './ui/map-ui.js';
import {
  initInventoryUi,
  openInventory,
  closeInventory,
  isInventoryOpen,
  tryUseSelected,
} from './ui/inventory-ui.js';

const INTERACT_DISTANCE = 3.4;
const INTERACT_CROUCH_DISTANCE = 2.6;

const NEWS_BODY = [
  'Pagi ini, warga dihebohkan dengan kabar dari Rumah Sakit Puri Jiwa yang telah ditutup sejak 12 tahun lalu. Berikut rangkuman kejadian:',
  '',
  '1. Penampakan perawat tak berwajah yang berjalan di lorong bangsal pada malam hari.',
  '2. Empat korban jiwa ditemukan di Ruang Isolasi dengan luka aneh, bukan akibat penyakit.',
  '3. Beberapa orang yang nekat masuk ke dalamnya pada malam hari tidak pernah ditemukan lagi.',
  '',
  'Pihak berwenang menutup akses jalan utama. Warga sekitar mengaku masih mendengar jeritan dan suara kain berkibar dari dalam gedung.',
].join('\n');

const PHONE_DIALOG = [
  { speaker: 'Raka', text: 'Bro! Lo bangun? Gue baru baca berita gila.' },
  { speaker: 'Kamu', text: 'Hah? Kenapa? Lagi santai nih.' },
  { speaker: 'Raka', text: 'Rumah sakit Puri Jiwa di utara itu. Masih ingat gak?' },
  { speaker: 'Kamu', text: 'Tau dong. Rumah sakit yang ditinggalkan itu.' },
  { speaker: 'Raka', text: 'Iya. Banyak yang ilang di sana bro. Jangan deket-deket.' },
  { speaker: 'Kamu', text: 'Santai. Gue justru penasaran. Malam ini gue ke sana.' },
  { speaker: 'Raka', text: 'LO GILA?! Jangan bro! Gue gak mau kehilangan lo!' },
  { speaker: 'Kamu', text: 'Tenang. Gue cuma lihat-lihat. Habis itu langsung cabut.' },
  { speaker: 'Raka', text: 'Sialan lo... Hati-hati. Serius. KALAU ADA APA-APA, CABUT!' },
];

const MEDICAL_NOTE_BODY = [
  'CATATAN MEDIS — PASIEN 27',
  'Ruang Isolasi, sayap timur.',
  '',
  '"Pasien dalam keadaan tenang, namun tiap malam sekitar pukul 00.00 ia berbisik: JANGAN BUKA PINTU SETELAH TENGAH MALAM...',
  '',
  'Satu minggu kemudian pasien ditemukan hilang. Di ranjang hanya tersisa kain putih kotor. Perawat yang berjaga juga tak ditemukan."',
  '',
  'Catatan terakhir bertuliskan: "Dia tidak sendirian."',
].join('\n');

const FUSE_MESSAGE =
  'Fuse box mati total. Ada bekas terbakar dan bau kabel gosong. Mungkin ini alasan lampu sering mati.';

const PATROLS = {
  1: [
    [0, -12],
    [2, -6],
    [-4, -6],
    [-6, -4],
    [-6, 2],
    [-9, 4.5],
    [-8, 12],
    [0, 12],
    [8, 12],
    [9, 4.5],
    [6, -2],
    [6, -6],
    [10, -12],
    [0, -12],
  ],
  2: [
    [0, -44],
    [-9, -51],
    [-9, -37],
    [0, -37],
    [9, -37],
    [9, -51],
    [0, -49.5],
    [0, -44],
  ],
};

const FLOOR_ONE = 1;
const FLOOR_TWO = 2;

let hospitalVisible = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Anti-aliasing ditangani MSAA di render target post-processing.
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

// Renderer software (headless test, VM tanpa GPU) memakai preset ringan.
const detectLowQuality = () => {
  // ponytail: override kualitas lewat URL (?quality=high|low) sampai ada menu Settings (F6).
  const override = new URLSearchParams(location.search).get('quality');
  if (override) return override === 'low';
  try {
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const device = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : '';
    return /swiftshader|llvmpipe|softpipe|software/.test(device);
  } catch {
    return true;
  }
};
const lowQuality = detectLowQuality();
const shadowEnabled = !lowQuality;
const moonShadowSize = lowQuality ? 512 : 1024;
const flashlightCastsShadow = !lowQuality;
renderer.shadowMap.enabled = shadowEnabled;
renderer.shadowMap.type = lowQuality ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.FogExp2(0x070a0f, 0.03);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
scene.add(camera);
const postFx = createPostProcessing(renderer, scene, camera, {
  bloom: !lowQuality,
  msaa: !lowQuality,
});

const ambientLight = new THREE.AmbientLight(0x2a3450, 1.35);
const hemisphereLight = new THREE.HemisphereLight(0x131a26, 0x241a12, 0.35);
const moonLight = new THREE.DirectionalLight(0x9fb4d8, 0.65);
moonLight.position.set(24, 36, 40);
moonLight.castShadow = shadowEnabled;
moonLight.shadow.mapSize.set(moonShadowSize, moonShadowSize);
moonLight.shadow.camera.near = 1;
moonLight.shadow.camera.far = 140;
moonLight.shadow.bias = -0.0006;
scene.add(ambientLight, hemisphereLight, moonLight);
const backLight = new THREE.DirectionalLight(0x3a4a5a, 0.35);
backLight.position.set(-20, 10, -50);
scene.add(backLight);

let kostLamps = [];
let kostLampBulb = null;
let tvOn = false;

const applyLighting = () => {
  const hospitalMode = hospitalVisible;
  const lampOn = !hospitalMode;
  ambientLight.intensity = hospitalMode ? 0.5 : 0.75;
  hemisphereLight.intensity = hospitalMode ? 0.22 : 0.32;
  moonLight.intensity = hospitalMode ? 0.7 : 0.22;
  backLight.intensity = hospitalMode ? 0.35 : 0.18;
  for (const lamp of kostLamps) {
    lamp.intensity = lampOn ? lamp.userData.baseIntensity : 0;
  }
  if (kostLampBulb) kostLampBulb.emissiveIntensity = lampOn ? 1.5 : 0;
};
applyLighting();

const flashlight = new THREE.SpotLight(0xc8d6ff, 0, 52, (36 * Math.PI) / 180, 0.55, 1.1);
flashlight.castShadow = flashlightCastsShadow;
flashlight.shadow.mapSize.set(512, 512);
flashlight.shadow.bias = -0.0006;
flashlight.shadow.camera.near = 0.2;
flashlight.shadow.camera.far = 30;
scene.add(flashlight);
scene.add(flashlight.target);

const chapters = createChapterScenes(scene, ambacongFaceUrl);
scene.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});
const { groups, hospital, prologue, flickerLights } = chapters;
const enemy = chapters.enemy;
kostLamps = chapters.prologue.lamps;
kostLampBulb = chapters.prologue.lampBulb;
applyLighting();

let prologueColliders = buildColliders(prologue.group);
const hospitalColliders = buildColliders(groups.hospital);

const player = new Player(camera);
const input = new InputSystem();
const state = new StateMachine('menu');
const saveSystem = new SaveSystem();
const audio = new AudioSystem();
const inventory = new InventorySystem();
const pocong = new Pocong(enemy, hospitalColliders);
pocong.setPatrol(PATROLS[FLOOR_ONE]);

// Ghost step sound dengan volume based distance
pocong.onStep = () => {
  const distance = pocong.distanceTo(player.position);
  const maxHearRange = 25;
  if (distance > maxHearRange) return;
  const volume = Math.max(0.1, 1 - distance / maxHearRange);
  audio.play('ghostStep', volume * 0.7);
};

let storyPhase = 'wake';
let storyProgress = 'start';
let currentFloor = FLOOR_ONE;
let activeColliders = prologueColliders;
let activeBounds = prologue.bounds;
let playerFloor = FLOOR_ONE;
let flashlightOn = true;
let flashlightBattery = 100;
let playTime = 0;
let elapsed = 0;
let pocongWoken = false;
let intelligibleClear = false;
let unlockedExit = false;

const completedObjectives = new Set();
const collectedItems = new Set();
const triggeredEvents = new Set();
const openedDoors = new Set();

const activeGroup = () => (hospitalVisible ? groups.hospital : prologue.group);

const keyRefFor = (group, itemId) => {
  const x = Math.round(group.position.x);
  const z = Math.round(group.position.z);
  return `${itemId}@${x}_${z}`;
};

const setPhase = (phase, objective) => {
  storyPhase = phase;
  if (objective) hud.setObjective(objective);
};

const findInteractable = (object) => {
  const group = activeGroup();
  let node = object;
  while (node && node !== scene) {
    if (node.userData && node.userData.action) {
      let parent = node.parent;
      while (parent && parent !== scene) {
        if (parent === group) return node;
        parent = parent.parent;
      }
      return null;
    }
    node = node.parent;
  }
  return null;
};

const rayTarget = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(),
  0,
  INTERACT_DISTANCE
);
const lookDir = new THREE.Vector3();
const cameraForward = new THREE.Vector3();

const raycastInteractable = () => {
  camera.getWorldDirection(lookDir);
  rayTarget.set(camera.position, lookDir);
  rayTarget.camera = camera;
  const range = player.crouching ? INTERACT_CROUCH_DISTANCE : INTERACT_DISTANCE;
  rayTarget.far = range;
  const hits = rayTarget.intersectObjects(scene.children, true);
  for (const hit of hits) {
    const interactable = findInteractable(hit.object);
    if (interactable) {
      return { group: interactable, data: interactable.userData, distance: hit.distance };
    }
  }
  return null;
};

const switchToHospital = () => {
  prologue.group.visible = false;
  groups.hospital.visible = true;
  hospitalVisible = true;
  activeColliders = hospitalColliders;
  playerFloor = currentFloor === FLOOR_TWO ? FLOOR_TWO : FLOOR_ONE;
  applyLighting();
};

const switchToPrologue = () => {
  groups.hospital.visible = false;
  prologue.group.visible = true;
  hospitalVisible = false;
  activeColliders = prologueColliders;
  activeBounds = prologue.bounds;
  playerFloor = FLOOR_ONE;
  applyLighting();
};

const refreshFloor = () => {
  if (!hospitalVisible) {
    playerFloor = FLOOR_ONE;
    return;
  }
  playerFloor = player.position.z >= -24 ? FLOOR_ONE : FLOOR_TWO;
};

const updateArea = () => {
  refreshFloor();
  currentFloor = playerFloor;
  activeBounds = hospitalVisible ? hospital.boundsByFloor[playerFloor] : prologue.bounds;
};

const currentRoomName = () => {
  const rooms = hospitalVisible ? hospital.rooms : [];
  for (const room of rooms) {
    if (room.floor !== playerFloor) continue;
    if (
      player.position.x >= room.minX &&
      player.position.x <= room.maxX &&
      player.position.z >= room.minZ &&
      player.position.z <= room.maxZ
    ) {
      return room.name;
    }
  }
  return hospitalVisible ? 'Rumah Sakit' : 'Kamar Kost';
};

const setPocongFloor = (floor) => {
  pocong.setPatrol(PATROLS[floor]);
  if (pocongWoken) pocong.wake();
  const spawn =
    floor === FLOOR_TWO ? new THREE.Vector3(8.9, 0, -52) : new THREE.Vector3(-10.5, 0, -5);
  enemy.position.copy(spawn);
  enemy.position.y = 0;
};

const wakePocong = () => {
  if (pocongWoken) return;
  pocongWoken = true;
  pocong.wake();
  audio.startLoop('ghostNear', 0.4);
  hud.setObjective('Pocong muncul! Jangan ketahuan. Segera cari jalan keluar!');
};

const updateGhostAudio = () => {
  if (!pocongWoken) return;
  const distance = enemy.position.distanceTo(player.position);
  const volume = Math.max(0, Math.min(1, 1 - distance / 26)) * 0.9;
  audio.setLoopVolume('ghostNear', volume);
};

const makeNoise = (radius) => {
  if (pocongWoken && hospitalVisible) pocong.hear(player.position, radius);
};

const playerInfo = () => ({
  playerFlashlightOn: flashlightOn,
  aimingPocong: aimingAtPocong(),
});

const aimingAtPocong = () => {
  if (!pocongWoken) return false;
  camera.getWorldDirection(cameraForward);
  const toEnemy = new THREE.Vector3().subVectors(enemy.position, camera.position).normalize();
  const dot = cameraForward.dot(toEnemy);
  return dot > 0.965 && camera.position.distanceTo(enemy.position) < 24;
};

const saveGameState = () => ({
  currentChapter: 1,
  chapterName: 'Rumah Sakit Tua',
  schemaVersion: 1,
  phase: storyPhase,
  floor: currentFloor,
  position: { x: player.position.x, y: player.position.y, z: player.position.z },
  yaw: player.yaw,
  pitch: player.pitch,
  health: 3,
  stamina: player.stamina,
  flashlightBattery,
  flashlightOn,
  inventory: [...inventory.items],
  completedObjectives: [...completedObjectives],
  collectedItems: [...collectedItems],
  openedDoors: [...openedDoors],
  triggeredEvents: [...triggeredEvents],
  playTime,
  progress: storyProgress,
  pocongWoken,
  unlockedExit,
  tvOn,
  createdAt: saveSystem.createdAt ?? Date.now(),
  timestamp: Date.now(),
  hospitalVisible,
});

const attemptSave = async () => {
  const ok = await saveSystem.save(SAVE_SLOT, saveGameState());
  return ok;
};

const applyGameState = async (data) => {
  if (!data) return false;

  inventory.restore(data.inventory ?? []);
  completedObjectives.clear();
  collectedItems.clear();
  openedDoors.clear();
  triggeredEvents.clear();
  for (const id of data.completedObjectives ?? []) completedObjectives.add(id);
  for (const id of data.collectedItems ?? []) collectedItems.add(id);
  for (const id of data.openedDoors ?? []) openedDoors.add(id);
  for (const id of data.triggeredEvents ?? []) triggeredEvents.add(id);

  storyPhase = data.phase ?? 'wake';
  storyProgress = data.progress ?? 'start';
  currentFloor = data.floor ?? FLOOR_ONE;
  playerFloor = currentFloor;
  player.stamina = data.stamina ?? 100;
  flashlightBattery = data.flashlightBattery ?? 100;
  flashlightOn = data.flashlightOn ?? true;
  playTime = data.playTime ?? 0;
  unlockedExit = Boolean(data.unlockedExit);
  pocongWoken = Boolean(data.pocongWoken);
  tvOn = Boolean(data.tvOn);
  applyTvState();

  for (const item of chapters.interactables) {
    if (item.userData.itemId) {
      const itemId = item.userData.itemId;
      const wasCollected = collectedItems.has(keyRefFor(item, itemId));
      const uniqueItemOwned = itemId !== 'battery' && inventory.has(itemId);
      item.visible = !(wasCollected || uniqueItemOwned);
    }
  }

  if (data.hospitalVisible) {
    hospitalVisible = true;
  } else {
    hospitalVisible = false;
  }
  if (hospitalVisible) {
    prologue.group.visible = false;
    groups.hospital.visible = true;
    activeColliders = hospitalColliders;
    playerFloor = currentFloor;
  } else {
    groups.hospital.visible = false;
    prologue.group.visible = true;
    activeColliders = prologueColliders;
  }
  applyLighting();

  player.teleport(data.position.x, data.position.z, data.yaw ?? player.yaw);
  player.pitch = data.pitch ?? 0;
  player.position.y = data.position.y ?? 1.7;

  pocong.setPatrol(PATROLS[currentFloor]);
  if (pocongWoken) {
    pocong.wake();
    enemy.position.set(-10.5, 0, currentFloor === FLOOR_TWO ? -47 : -5);
    audio.startLoop('ghostNear', 0.4);
  } else {
    pocong.groundReset();
  }

  updateArea();
  applyDoorStates();
  return true;
};

const objectiveForPhase = () => {
  switch (storyPhase) {
    case 'wake':
      return 'Bangun tidur. Ada sesuatu di komputermu. Periksa.';
    case 'laptop':
      return 'Beritanya mengerikan. Teleponmu berdering... Angkat.';
    case 'phone':
      return 'Raka sudah memperingatkanmu. Keluar dari kamar dan pergilah.';
    case 'outside':
      return 'Malam hari. Akses jalan ditutup — cari jalan masuk yang lain.';
    case 'inside':
      return pocongWoken
        ? 'Pocong terbangun! Jangan ketahuan. Cari jalan keluar!'
        : 'Naik ke lantai 2. Cari Kunci Janitor di ruang arsip.';
    case 'complete':
      return 'Kamu berhasil keluar. Chapter 1 selesai.';
    default:
      return '';
  }
};

const showDialog = (lines, onDone) => {
  overlays.showDialog(lines, () => {
    if (onDone) onDone();
  });
};

const handlePrologueLaptop = () => {
  overlays.showNews(
    'Rumah Sakit Puri Jiwa — Ditutup Setelah Penampakan dan Korban Jiwa',
    NEWS_BODY,
    () => {
      if (!triggeredEvents.has('news-read')) {
        triggeredEvents.add('news-read');
        setPhase('laptop', 'Beritanya mengerikan. Teleponmu berdering... Angkat.');
        audio.startLoop('phoneRing', 0.6);
        attemptSave();
      }
    }
  );
};

const handleProloguePhone = () => {
  audio.stop('phoneRing');
  audio.play('phonePickup');
  if (!triggeredEvents.has('phone-answered')) {
    triggeredEvents.add('phone-answered');
    setPhase('phone', 'Raka sudah memperingatkanmu. Keluar dari kamar dan pergilah.');
  }
  showDialog(PHONE_DIALOG);
};

const leaveKost = async () => {
  if (storyPhase === 'outside' || storyPhase === 'inside') return;
  if (!triggeredEvents.has('phone-answered')) {
    showDialog([
      {
        speaker: '',
        text: 'Kamu belum bisa keluar. Teleponmu masih berdering di atas meja — angkat dulu.',
      },
    ]);
    return;
  }
  overlays.showLoading('Berjalan menuju rumah sakit...');
  await sleep(700);
  switchToHospital();
  player.teleport(hospital.spawn.x, hospital.spawn.z, 0);
  currentFloor = FLOOR_ONE;
  refreshFloor();
  updateArea();
  setPhase('outside', 'Malam hari. Akses jalan ditutup — cari jalan masuk yang lain.');
  audio.startLoop('bgm', 0.5);
  overlays.hideLoading();
  attemptSave();
};

const handleMainGate = () => {
  if (storyPhase !== 'outside') return;
  if (triggeredEvents.has('gate-checked')) return;

  triggeredEvents.add('gate-checked');
  showDialog([
    {
      speaker: '',
      text: 'Jalan masuknya sudah ditutup nih, aku harus cari jalan lain.',
    },
  ]);
  hud.setObjective('Cari jalan masuk lain. Periksa pintu samping rumah sakit.');
  attemptSave();
};

const enterHospital = async () => {
  if (storyPhase !== 'outside') return;
  overlays.showLoading('Masuk ke dalam...');
  await sleep(500);
  player.teleport(hospital.insideSpawn.x, hospital.insideSpawn.z);
  currentFloor = FLOOR_ONE;
  setPhase('inside', 'Naik ke lantai 2. Cari Kunci Janitor di ruang arsip.');
  updateArea();
  overlays.hideLoading();
  attemptSave();
};

const goToFloorTwo = () => {
  player.teleport(hospital.floorTwoSpawn.x, hospital.floorTwoSpawn.z);
  currentFloor = FLOOR_TWO;
  refreshFloor();
  updateArea();
  setPocongFloor(FLOOR_TWO);
  hud.setObjective(
    pocongWoken
      ? 'Pocong ikut naik! Jangan ketahuan.'
      : 'Lantai 2 rumah sakit. Jelajahi dengan hati-hati.'
  );
  attemptSave();
};

const goToFloorOne = () => {
  player.teleport(hospital.floorOneStairSpawn.x, hospital.floorOneStairSpawn.z);
  currentFloor = FLOOR_ONE;
  refreshFloor();
  updateArea();
  setPocongFloor(FLOOR_ONE);
  hud.setObjective('Kembali ke lantai 1. Cari jalan keluar!');
  attemptSave();
};

const tryExit = async () => {
  if (!inventory.has('key-janitor')) {
    showDialog([
      { speaker: '', text: 'Pintu terkunci dari dalam. Butuh: Kunci Janitor.' },
    ]);
    return;
  }
  storyProgress = advanceProgress(storyProgress, 'door');
  unlockedExit = true;
  audio.stop('ghostNear');
  audio.stop('bgm');
  setPhase('complete');
  input.exitLock();
  input.clear();
  overlays.showComplete(
    `Kamu berhasil keluar dari Rumah Sakit Puri Jiwa. Kain putih itu masih berkibar di kegelapan...\n\nSelamat menyelesaikan Chapter 1! Chapter 2 (Kuburan) segera hadir.`,
    () => {
      mainMenu();
    }
  );
  attemptSave();
};

const pickItem = async (item) => {
  const target = item.data;
  const added = inventory.add(target.itemId);
  if (!added) {
    showDialog([{ speaker: '', text: 'Inventory penuh.' }]);
    return;
  }
  const keyRef = keyRefFor(item.group, target.itemId);
  collectedItems.add(keyRef);
  item.group.visible = false;
  audio.play('pickup');
  makeNoise(NOISE.pickup);
  if (target.itemId === 'battery') {
    showDialog([
      {
        speaker: '',
        text: `Baterai disimpan di inventory (${inventory.count('battery')} buah). Buka dengan [Tab] untuk memakainya.`,
      },
    ]);
  } else if (target.itemId === 'medical-note') {
    overlays.showNote('Catatan Medis — Pasien 27', MEDICAL_NOTE_BODY);
  }
  attemptSave();
};

const pickKey = async (item) => {
  if (collectedItems.has(keyRefFor(item.group, item.data.itemId))) return;
  storyProgress = advanceProgress(storyProgress, 'key');
  const keyRef = keyRefFor(item.group, item.data.itemId);
  collectedItems.add(keyRef);
  inventory.add('key-janitor');
  item.group.visible = false;
  audio.play('pickup');
  audio.play('ghostNear', 0.9);
  setPhase('inside');
  wakePocong();
  showDialog([
    {
      speaker: '',
      text: 'Ditemukan: Kunci Janitor! Tepat saat kunci itu menyentuh tanganmu, suara kain berkibar terdengar dari lorong...',
    },
    { speaker: '', text: 'SESEORANG ATAU SESUATU TELAH BERGERAK. LARI KE PINTU KELUAR!' },
  ]);
  attemptSave();
};

const hideIn = (target) => {
  const spot = new THREE.Vector3();
  target.group.getWorldPosition(spot);
  const offset =
    target.data.hideName === 'locker'
      ? new THREE.Vector3(0, 0.38, 1.0)
      : new THREE.Vector3(0, 0.22, 1.05);
  player.hiddenCam = spot.clone().add(offset);
  makeNoise(NOISE.hide);
  player.enterHide(target.data.hideName ?? 'spot');
  hud.setHidden(`Diam! Kamu ngumpet di ${target.data.hideName}. [E] untuk keluar.`);
};

const exitHide = () => {
  player.exitHide();
  hud.setHidden('');
  player.teleport(player.position.x, player.position.z);
};

const inspect = (target) => {
  overlays.showNote('Fuse Box', target.data.message ?? FUSE_MESSAGE);
};

const applyTvState = () => {
  const tv = prologue.group.getObjectByName('kost-tv');
  if (!tv) return;
  const screen = tv.userData.screen;
  const glow = tv.userData.glow;
  if (screen) screen.material = tvOn ? tv.userData.onMat : tv.userData.offMat;
  if (glow) glow.intensity = tvOn ? 1.1 : 0;
};

const toggleTv = () => {
  tvOn = !tvOn;
  applyTvState();
  audio.play('pickup');
  attemptSave();
};

const applyDoorStates = () => {
  const hinge = prologue.group.getObjectByName('bathroom-door-hinge');
  if (hinge) {
    hinge.rotation.y = openedDoors.has('bathroom-door') ? -Math.PI : -Math.PI / 2;
  }
  prologueColliders = buildColliders(prologue.group);
  if (!hospitalVisible) activeColliders = prologueColliders;
};

const toggleBathroomDoor = () => {
  const open = openedDoors.has('bathroom-door');
  if (open) {
    openedDoors.delete('bathroom-door');
  } else {
    openedDoors.add('bathroom-door');
  }
  applyDoorStates();
  audio.play('pickup');
  attemptSave();
};

const handleInteractable = async (item) => {
  const action = item.data.action;
  if (action === 'prologue-laptop') handlePrologueLaptop();
  else if (action === 'prologue-phone') handleProloguePhone();
  else if (action === 'prologue-leave') await leaveKost();
  else if (action === 'main-gate') handleMainGate();
  else if (action === 'side-entry') await enterHospital();
  else if (action === 'stairs-up') goToFloorTwo();
  else if (action === 'stairs-down') goToFloorOne();
  else if (action === 'key') await pickKey(item);
  else if (action === 'pickup') await pickItem(item);
  else if (action === 'hide') hideIn(item);
  else if (action === 'inspect') inspect(item);
  else if (action === 'door') await tryExit();
  else if (action === 'exit') await tryExit();
  else if (action === 'bathroom-door') toggleBathroomDoor();
  else if (action === 'tv-toggle') toggleTv();
};

const resetPrologueState = () => {
  storyProgress = 'start';
  storyPhase = 'wake';
  currentFloor = FLOOR_ONE;
  playTime = 0;
  unlockedExit = false;
  triggeredEvents.clear();
  collectedItems.clear();
  completedObjectives.clear();
  openedDoors.clear();
  inventory.restore([]);
  flashlightBattery = 100;
  flashlightOn = true;
  tvOn = false;
  applyTvState();
  applyLighting();
  applyDoorStates();
  player.stamina = 100;
  player.exitHide();
  player.hiddenCam = null;
  switchToPrologue();
  player.teleport(prologue.spawn.x, prologue.spawn.z, Math.PI);
  setPhase('wake', 'Bangun tidur. Ada sesuatu di komputermu. Periksa.');
  audio.stop('ghostNear');
  audio.stop('bgm');
  pocongWoken = false;
  pocong.groundReset();
  pocong.setPatrol(PATROLS[FLOOR_ONE]);
  enemy.visible = false;
  for (const item of chapters.interactables) {
    item.visible = true;
  }
};

const newGame = async () => {
  await saveSystem.clear(SAVE_SLOT);
  resetPrologueState();
  hideMenu();
  startPlaying();
};

const continueGame = async () => {
  const data = await saveSystem.load(SAVE_SLOT);
  if (!data) {
    setContinueEnabled(false);
    return;
  }
  overlays.showLoading('Memuat save...');
  await applyGameState(data);
  overlays.hideLoading();
  hideMenu();
  startPlaying();
};

const exitGame = () => {
  const closed = window.close();
  if (!closed) {
    overlays.showDialog([
      {
        speaker: '',
        text: 'Exit tidak bisa dilakukan lewat browser. Tutup tab ini untuk keluar game.',
      },
    ]);
  }
};

const mainMenu = () => {
  state.set('menu');
  document.body.classList.remove('playing');
  input.exitLock();
  input.clear();
  audio.stopAll();
  hideMenu();
  showMenu();
  const confirmHasSave = () => saveSystem.hasSave(SAVE_SLOT).then((has) => setContinueEnabled(has));
  confirmHasSave();
  overlays.hideLoading();
};

const startPlaying = () => {
  document.body.classList.add('playing');
  hud.setObjective(objectiveForPhase());
  state.set('playing');
  input.blocked = false;
  input.clear();
  input.requestLock(renderer.domElement);
};

const pauseGame = () => {
  if (state.state === 'playing' && !intelligibleClear) {
    state.set('paused');
    input.exitLock();
    overlays.showPause();
  }
};

const resumeGame = () => {
  overlays.hidePause();
  state.set('playing');
  input.blocked = false;
  input.clear();
  input.requestLock(renderer.domElement);
};

const pauseMenuExit = () => {
  overlays.hidePause();
  mainMenu();
};

const triggerGameOver = () => {
  audio.stop('ghostNear');
  audio.stop('bgm');
  input.exitLock();
  input.clear();
  state.set('gameover');
  overlays.showGameOver(
    'Kain itu melompat lebih cepat darimu. Tangan dingin menahammu... sebelum semuanya gelap, kamu melihat wajah putih di balik kain itu.',
    async () => {
      const data = await saveSystem.load(SAVE_SLOT);
      if (data) {
        overlays.showLoading('Mencoba lagi...');
        await applyGameState(data);
        overlays.hideLoading();
        startPlaying();
      } else {
        newGame();
      }
    },
    () => mainMenu()
  );
};

const enterPress = () => {
  if (isInventoryOpen()) {
    const used = tryUseSelected(inventory.items);
    if (used) audio.play('pickup');
    return;
  }
};

const resumeInput = () => {
  intelligibleClear = false;
  input.blocked = false;
  input.clear();
  input.requestLock(renderer.domElement);
  state.set('playing');
};

const useInventoryItem = (itemId) => {
  if (itemId === 'battery' && inventory.count('battery') > 0) {
    if (flashlightBattery >= 100) {
      showDialog([{ speaker: '', text: 'Baterai senter sudah penuh.' }]);
      return false;
    }
    inventory.remove('battery');
    flashlightBattery = Math.min(100, flashlightBattery + 40);
    audio.play('pickup');
    closeInventory();
    resumeInput();
    hud.setFlashlight(flashlightBattery, flashlightOn);
    return true;
  }
  if (itemId === 'key-janitor' || itemId === 'medical-note') {
    overlays.showDialog([{ speaker: '', text: inventory.info(itemId).description }]);
    return false;
  }
  return false;
};

const toggleInventory = () => {
  if (isInventoryOpen()) {
    closeInventory();
    resumeInput();
  } else {
    audio.play('inventory');
    openInventory(inventory.items, ITEM_CATALOG);
    intelligibleClear = true;
    input.exitLock();
    input.clear();
    input.blocked = true;
    state.set('paused');
  }
  hud.setInventory(inventory.items, ITEM_CATALOG);
};

const toggleMap = () => {
  if (isMapOpen()) {
    closeMap();
    resumeInput();
  } else {
    renderMapState();
    openMap();
    intelligibleClear = true;
    input.exitLock();
    input.clear();
    input.blocked = true;
    state.set('paused');
  }
};

const renderMapState = () => {
  const markers =
    playerFloor === FLOOR_ONE
      ? [
          { type: 'exit', x: 0, z: -17 },
          { type: 'stairs', x: 4.15, z: -12.3 },
        ]
      : [
          { type: 'stairs', x: 4.15, z: -55.5 },
          ...(inventory.has('key-janitor') ? [] : [{ type: 'key', x: -9, z: -50.5 }]),
        ];
  renderMap({
    rooms: hospital.rooms,
    floor: playerFloor,
    player,
    pocong: null,
    markers,
    visibleMarker: currentRoomName(),
  });
};

const updatePrompt = () => {
  const item = raycastInteractable();
  if (item) {
    const action = item.data.action;

    // Objective gating - hide prompts sebelum waktunya
    if (action === 'prologue-phone' && storyPhase === 'wake') {
      hud.setPrompt('');
      return;
    }
    if (action === 'prologue-leave' && !triggeredEvents.has('phone-answered')) {
      hud.setPrompt('');
      return;
    }
    if (action === 'main-gate' && storyPhase !== 'outside') {
      hud.setPrompt('');
      return;
    }
    if (action === 'side-entry' && !triggeredEvents.has('gate-checked')) {
      hud.setPrompt('');
      return;
    }

    let prompt = item.data.prompt;
    if (action === 'bathroom-door') {
      prompt = openedDoors.has('bathroom-door')
        ? 'Tutup pintu kamar mandi'
        : 'Buka pintu kamar mandi';
    }
    if (action === 'tv-toggle') {
      prompt = tvOn ? 'Matikan TV' : 'Nyalakan TV';
    }
    if (item.data.requires && !inventory.has(item.data.requires)) {
      const info = ITEM_CATALOG[item.data.requires];
      prompt = `${prompt} — Butuh: ${info ? info.name : item.data.requires}`;
    }
    hud.setPrompt(prompt);
  } else if (!player.hidden) {
    hud.setPrompt('');
  }
};

const handleKey = (code, pressed) => {
  if (!pressed) return;
  if (state.state !== 'playing' && state.state !== 'paused') return;

  if (overlays.isDialogOpen()) {
    if (code === 'Enter' || code === 'Escape') {
      overlays.getDialogAdvanceHandler()({ stopPropagation() {}, target: null });
    }
    return;
  }

  if (isInventoryOpen()) {
    if (code === 'Tab') toggleInventory();
    else if (code === 'Enter') enterPress();
    return;
  }

  if (isMapOpen()) {
    if (code === 'KeyM') toggleMap();
    return;
  }

  if (state.state === 'paused') {
    return;
  }

  if (code === 'KeyE') {
    if (player.hidden) exitHide();
    else handleInteractable(raycastInteractable() ?? {});
  } else if (code === 'KeyF') {
    flashlightOn = !flashlightOn;
    if (!flashlightOn) hud.setFlashlight(flashlightBattery, false);
  } else if (code === 'KeyM') {
    toggleMap();
  } else if (code === 'Tab') {
    toggleInventory();
  } else if (code === 'Escape') {
    pauseGame();
  }
};

const update = (delta) => {
  elapsed += delta;
  playTime += delta;

  const mouse = input.consumeMouseDelta();
  if (input.locked) {
    player.look(mouse.x, mouse.y);
  }

  player.move(delta, input.keys, activeColliders, activeBounds);
  player.applyView();

  if (player.hidden && player.hiddenCam) {
    player.position.y = 0;
    camera.position.copy(player.hiddenCam);
  }

  updateArea();

  if (flashlightOn) {
    flashlightBattery = drainBattery(flashlightBattery, delta, 1.2);
    if (flashlightBattery <= 0) {
      flashlightBattery = 0;
      flashlightOn = false;
    }
  }
  flashlight.visible = flashlightOn;
  flashlight.intensity = flashlightOn ? 4.2 : 0;
  if (flashlightOn) {
    aimForward(camera, flashlight, 16, cameraForward);
    flashlight.position.copy(camera.position);
  } else {
    flashlight.position.set(0, -50, 0);
  }

  if (pocongWoken && hospitalVisible) {
    pocong.hear(player.position, movementNoise(player));
    pocong.update(delta, player, playerInfo());
    if (pocong.isAttacking(player)) {
      triggerGameOver();
      return;
    }
  }

  updateGhostAudio();
  updateHospitalEffects(flickerLights, elapsed);
  updateHud();
  updatePrompt();
};

const updateHud = () => {
  hud.setFlashlight(flashlightBattery, flashlightOn);
  hud.setStamina(player.stamina);
  hud.setInventory(inventory.items, ITEM_CATALOG);
  hud.setObjective(objectiveForPhase());
  if (player.hidden) {
    hud.setHidden(`Diam! Kamu ngumpet di ${player.hiddenSpot}. [E] untuk keluar.`);
  } else {
    hud.setHidden('');
  }
};

const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (state.state === 'playing') {
    const blocked = input.blocked || overlays.isOverlayOpen() || isInventoryOpen() || isMapOpen();
    if (!blocked) {
      update(delta);
    }
  }

  postFx.render(clock.elapsedTime);
};

const bootstrap = async () => {
  initMenu({
    onContinue: () => continueGame(),
    onNewGame: () => newGame(),
    onChapterSelect: (chapter) => {
      if (chapter === 1) newGame();
    },
    onExit: () => exitGame(),
  });
  overlays.initOverlays({
    onResume: () => resumeGame(),
    onSave: () => {
      attemptSave().then((ok) => {
        showDialog([{ speaker: '', text: ok ? 'Progress disimpan.' : 'Gagal menyimpan.' }]);
      });
    },
    onPauseExit: () => pauseMenuExit(),
    onRetry: () => {},
    onGameOverMenu: () => {},
    onCompleteMenu: () => {},
  });
  initMapUi();
  initInventoryUi({ onUseItem: useInventoryItem, onCloseInventory: () => {} });

  const hasSave = await saveSystem.hasSave(SAVE_SLOT);
  setContinueEnabled(hasSave);

  input.bindLock(renderer.domElement);
  input.onKey = handleKey;
  input.onPointerLockChange = (locked) => {
    if (!locked && state.state === 'playing' && !intelligibleClear && !overlays.isOverlayOpen()) {
      pauseGame();
    }
  };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    postFx.setSize(window.innerWidth, window.innerHeight);
  });

  showMenu();
  animate();

  if (import.meta.env.DEV) {
    window.__ambacong = {
      newGame: () => newGame(),
      state: () => state.state,
      phase: () => storyPhase,
      floor: () => currentFloor,
      pos: () => ({ x: player.position.x, y: player.position.y, z: player.position.z }),
      area: () => currentRoomName(),
      objective: () => objectiveForPhase(),
      has: (id) => inventory.has(id),
      lampOn: () =>
        kostLamps.length === 4 && kostLamps.every((lamp) => lamp.intensity > 0),
      tvOn: () => tvOn,
      countBattery: () => inventory.count('battery'),
      hidden: () => player.hidden,
      doorOpen: (id) => openedDoors.has(id),
      pocongVisible: () => enemy.visible,
      pocongState: () => pocong.state,
      dialogOpen: () => overlays.isDialogOpen(),
      newsOpen: () => !document.getElementById('news-screen').hidden,
      completeOpen: () => !document.getElementById('complete-screen').hidden,
      mapOpen: () => isMapOpen(),
      invOpen: () => isInventoryOpen(),
      teleport: async (x, z, yaw, pitch = 0) => {
        player.teleport(x, z, yaw);
        player.pitch = pitch;
        player.applyView();
        refreshFloor();
        updateArea();
        await sleep(50);
      },
      interact: async () => {
        const hit = raycastInteractable();
        if (hit) await handleInteractable(hit);
      },
      aimAt: async (x, z, tx, tz, ty = 0.7) => {
        player.teleport(x, z, 0);
        const dx = tx - x;
        const dz = tz - z;
        player.yaw = Math.atan2(-dx, -dz);
        player.pitch = -Math.atan2(1.7 - ty, Math.hypot(dx, dz));
        player.applyView();
        refreshFloor();
        updateArea();
        await sleep(60);
      },
      pressKey: async (code) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code }));
        await sleep(60);
        window.dispatchEvent(new KeyboardEvent('keyup', { code }));
      },
    };
    const autotest = new URLSearchParams(location.search).get('autotest');
    if (autotest === 'ch1') {
      const { runAutotest } = await import('./dev/autotest.js');
      setTimeout(() => {
        runAutotest(window.__ambacong).catch((error) => {
          console.error('[AUTOTEST] CRASH', error);
        });
      }, 400);
    }
  }
};

bootstrap();

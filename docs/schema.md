# Dokumen Skema Data - Ambacong

## 1. Game State Schema

Skema ini menyimpan status permainan saat ini, termasuk posisi pemain, health, item yang dikumpulkan, dan progres chapter.

```typescript
interface GameState {
  currentChapter: number;           // 1-3
  playerPosition: {
    x: number;
    y: number;
    z: number;
  };
  playerRotation: {
    x: number;                      // Pitch (atas-bawah)
    y: number;                      // Yaw (kiri-kanan)
  };
  health: number;                   // 1-3 (hit points)
  stamina: number;                  // 0-100 (persentase)
  flashlightBattery: number;        // 0-100 (persentase)
  flashlightOn: boolean;            // Status senter menyala/mati
  inventory: InventoryItem[];       // Maksimal 6 item
  completedObjectives: string[];    // ID objective yang sudah selesai
  unlockedDoors: string[];          // ID pintu yang sudah terbuka
  collectedItems: string[];         // ID semua item yang pernah diambil
  triggeredEvents: string[];        // ID event one-shot yang sudah terjadi
  playTime: number;                 // Total waktu bermain dalam detik
  difficulty: 'normal' | 'hard';    // Tingkat kesulitan
  timestamp: number;                // Unix timestamp saat save
}
```

## 2. Save Data Schema (IndexedDB)

Struktur database IndexedDB untuk menyimpan progres, pengaturan, dan achievement di sisi klien.

```typescript
// Nama Database: 'ambacong_db'
// Versi: 1

// === Object Store: 'saves' ===
// keyPath: 'slot'
interface SaveSlot {
  slot: number;                     // 1, 2, atau 3
  gameState: GameState;             // Data state permainan
  chapterName: string;              // Nama chapter saat save (untuk tampilan)
  screenshotDataUrl?: string;       // Screenshot base64 saat save (opsional)
  createdAt: number;                // Unix timestamp pertama kali dibuat
  updatedAt: number;                // Unix timestamp terakhir di-update
}

// === Object Store: 'settings' ===
// keyPath: 'id' (selalu 'config')
interface SettingsStore {
  id: 'config';
  settings: SettingsSchema;
}

// === Object Store: 'achievements' ===
// keyPath: 'id'
interface AchievementStore {
  id: string;                       // ID achievement (misal: 'survive_first_encounter')
  unlockedAt: number;               // Unix timestamp saat didapatkan
}
```

### Operasi IndexedDB

```javascript
// Inisialisasi database
const dbRequest = indexedDB.open('ambacong_db', 1);

dbRequest.onupgradeneeded = (event) => {
  const db = event.target.result;

  // Object store untuk save slots
  if (!db.objectStoreNames.contains('saves')) {
    db.createObjectStore('saves', { keyPath: 'slot' });
  }

  // Object store untuk settings
  if (!db.objectStoreNames.contains('settings')) {
    db.createObjectStore('settings', { keyPath: 'id' });
  }

  // Object store untuk achievements
  if (!db.objectStoreNames.contains('achievements')) {
    db.createObjectStore('achievements', { keyPath: 'id' });
  }
};
```

## 3. Level/Scene Data Schema

Digunakan untuk memuat konfigurasi awal dari setiap chapter atau level.

```typescript
interface SceneData {
  id: string;                       // Contoh: 'chapter-1-hospital'
  name: string;                     // Contoh: 'Rumah Sakit Tua'
  config: {
    lighting: {
      ambientColor: string;         // Hex color (contoh: '#1A1A2E')
      ambientIntensity: number;     // 0.0 - 1.0
    };
    fog: {
      enabled: boolean;
      color: string;                // Hex color
      near: number;                 // Jarak mulai fog (meter)
      far: number;                  // Jarak fog penuh (meter)
    };
    ambientAudioId: string;         // ID audio ambient default
    skyColor: string;               // Warna langit/background
  };

  // Titik spawn entitas
  spawnPoints: {
    player: {
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number };
    };
    pocong: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      patrolRoute: Array<{ x: number; z: number }>;
      variant: 'normal' | 'boss';
    }>;
    items: Array<{
      itemId: string;               // Referensi ke InventoryItem.id
      position: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
    }>;
  };

  // Zona pemicu event
  triggerZones: Array<{
    id: string;
    type: 'box' | 'sphere';
    bounds: {
      // Untuk box:
      minX?: number; maxX?: number;
      minY?: number; maxY?: number;
      minZ?: number; maxZ?: number;
      // Untuk sphere:
      centerX?: number; centerY?: number; centerZ?: number;
      radius?: number;
    };
    eventId: string;                // ID event yang di-trigger
    oneShot: boolean;               // Hanya trigger sekali?
  }>;

  // Objek yang bisa diinteraksi
  interactables: InteractableEntity[];

  // Geometry collision (simplified)
  collisionMeshes: Array<{
    modelPath: string;              // Path ke collision mesh (invisible)
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }>;

  // Hiding spots
  hidingSpots: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    type: 'locker' | 'bed' | 'bush' | 'barrel';
    enterAnimation: string;
    exitAnimation: string;
  }>;

  // Objectives chapter ini
  objectives: Array<{
    id: string;
    description: string;            // Contoh: 'Temukan kunci ruang janitor'
    isRequired: boolean;            // Wajib untuk progress?
    order: number;                  // Urutan tampil di UI
  }>;
}
```

## 4. Entity Schema

Skema dasar untuk berbagai entitas dalam game.

```typescript
// === Base Entity ===
interface BaseEntity {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  modelPath: string;                // Path ke file GLB/GLTF
}

// === Player Entity ===
interface PlayerEntity extends BaseEntity {
  health: number;                   // 1-3 HP
  maxHealth: number;                // 3
  stamina: number;                  // 0-100
  maxStamina: number;               // 100
  staminaDrainRate: number;         // Per detik saat sprint (default: 20)
  staminaRegenRate: number;         // Per detik saat tidak sprint (default: 15)
  walkSpeed: number;                // Meter per detik (default: 3.0)
  sprintSpeed: number;              // Meter per detik (default: 5.5)
  crouchSpeed: number;              // Meter per detik (default: 1.5)
  isCrouching: boolean;
  isRunning: boolean;
  soundRadius: {
    walking: number;                // Radius suara saat jalan (default: 5m)
    running: number;                // Radius suara saat lari (default: 12m)
    crouching: number;              // Radius suara saat crouch (default: 2m)
  };
}

// === Pocong Entity ===
interface PocongEntity extends BaseEntity {
  variant: 'normal' | 'boss';
  state: PocongState;
  patrolRoute: Array<{ x: number; z: number }>;
  currentWaypointIndex: number;
  detectionConfig: {
    sightRange: number;             // Jarak penglihatan (default: 12m)
    sightAngle: number;             // Sudut cone penglihatan (default: 90°)
    hearingRange: number;           // Jarak pendengaran (default: 10m)
    flashlightBonus: number;        // Bonus sight range jika kena senter (default: 1.5x)
  };
  speedConfig: {
    patrol: number;                 // Default: 1.5 m/s
    chase: number;                  // Default: 4.0 m/s
    lost: number;                   // Default: 2.0 m/s
  };
  alertTimer: number;               // Waktu konfirmasi sebelum chase (default: 1.5s)
  lostTimer: number;                // Waktu mencari sebelum kembali patrol (default: 10s)
  lastKnownPlayerPosition?: { x: number; z: number };
}

type PocongState = 'idle' | 'patrol' | 'alert' | 'chase' | 'attack' | 'lost' | 'peek';

// === Interactable Entity ===
interface InteractableEntity extends BaseEntity {
  type: 'door' | 'drawer' | 'switch' | 'note' | 'pickup' | 'hiding_spot';
  interactionPrompt: string;        // Contoh: 'Tekan E untuk membuka'
  isLocked?: boolean;               // Untuk pintu/laci
  requiredItemId?: string;          // ID item yang dibutuhkan (misal: kunci)
  isOpen?: boolean;                 // Status terbuka/tertutup
  content?: string;                 // Teks untuk note
  itemId?: string;                  // ID item yang diberikan saat diambil (pickup)
  soundOnInteract?: string;         // ID audio saat diinteraksi
  animationOnInteract?: string;     // Nama animasi saat diinteraksi
}
```

## 5. Inventory Item Schema

Mendefinisikan properti item yang dapat dikumpulkan dan disimpan di inventaris pemain.

```typescript
interface InventoryItem {
  id: string;                       // ID unik (contoh: 'key-janitor')
  name: string;                     // Nama tampil (contoh: 'Kunci Janitor')
  type: 'key' | 'consumable' | 'quest' | 'tool';
  description: string;              // Deskripsi item untuk UI
  icon: string;                     // Path ke icon asset
  usable: boolean;                  // Bisa digunakan dari inventory?
  stackable: boolean;               // Bisa di-stack?
  quantity: number;                  // Jumlah (default: 1)
  maxStack: number;                 // Maks stack (default: 1, battery: 5)
  droppable: boolean;               // Bisa dibuang? (quest item = false)
  useEffect?: {
    type: 'heal' | 'battery' | 'unlock' | 'ritual';
    value?: number;                 // Nilai efek (misal: heal 1 HP, battery +30%)
    targetId?: string;              // ID target (misal: ID pintu untuk unlock)
  };
  chapter: number;                  // Chapter di mana item ini muncul (1-3)
}
```

### Contoh Data Item

```json
[
  {
    "id": "flashlight",
    "name": "Senter",
    "type": "tool",
    "description": "Senter tua yang masih berfungsi. Menerangi jalan di kegelapan.",
    "icon": "assets/icons/flashlight.png",
    "usable": false,
    "stackable": false,
    "quantity": 1,
    "maxStack": 1,
    "droppable": false,
    "chapter": 1
  },
  {
    "id": "battery",
    "name": "Baterai",
    "type": "consumable",
    "description": "Baterai cadangan untuk senter. Mengisi ulang 30% daya.",
    "icon": "assets/icons/battery.png",
    "usable": true,
    "stackable": true,
    "quantity": 1,
    "maxStack": 5,
    "droppable": true,
    "useEffect": { "type": "battery", "value": 30 },
    "chapter": 1
  },
  {
    "id": "key-janitor",
    "name": "Kunci Janitor",
    "type": "key",
    "description": "Kunci ruangan janitor. Tertulis 'Gudang - Lt.1' di gantungannya.",
    "icon": "assets/icons/key.png",
    "usable": true,
    "stackable": false,
    "quantity": 1,
    "maxStack": 1,
    "droppable": false,
    "useEffect": { "type": "unlock", "targetId": "door-janitor" },
    "chapter": 1
  },
  {
    "id": "bandage",
    "name": "Perban",
    "type": "consumable",
    "description": "Perban bekas tapi masih bisa dipakai. Memulihkan 1 HP.",
    "icon": "assets/icons/bandage.png",
    "usable": true,
    "stackable": true,
    "quantity": 1,
    "maxStack": 3,
    "droppable": true,
    "useEffect": { "type": "heal", "value": 1 },
    "chapter": 1
  }
]
```

## 6. AI Behavior Schema

Skema dan konfigurasi yang mengatur perilaku musuh (Pocong).

```typescript
interface AIBehavior {
  entityId: string;                 // ID pocong entity

  stateMachine: {
    currentState: PocongState;
    previousState: PocongState;
    stateTimer: number;             // Waktu di state saat ini (detik)

    transitions: Array<{
      from: PocongState;
      to: PocongState;
      condition: TransitionCondition;
      priority: number;             // Prioritas lebih tinggi di-cek duluan
    }>;
  };

  stateConfig: Record<PocongState, {
    speed: number;                  // Kecepatan gerak (m/s)
    detectionRange: number;         // Range deteksi aktif (meter)
    sightAngle: number;             // Sudut cone penglihatan (derajat)
    animation: string;              // Nama animasi yang dimainkan
    soundId?: string;               // ID suara yang dimainkan
    soundInterval?: number;         // Interval pemutaran suara (detik)
    duration?: number;              // Durasi maksimal state sebelum auto-transisi
    canDetectPlayer: boolean;       // Apakah bisa mendeteksi player di state ini?
  }>;
}

// Kondisi transisi antar state
type TransitionCondition =
  | { type: 'player_in_sight_range' }       // Pemain terlihat dalam cone
  | { type: 'player_in_hearing_range' }     // Pemain terdengar (sprint)
  | { type: 'player_out_of_range' }         // Pemain di luar semua range
  | { type: 'player_distance_less_than'; value: number }  // Jarak < N meter
  | { type: 'timer_expired'; duration: number }            // Timer habis
  | { type: 'reached_waypoint' }            // Sampai di waypoint patrol
  | { type: 'player_hiding' }              // Pemain di hiding spot
  | { type: 'attack_animation_complete' }  // Animasi serang selesai
  ;
```

### Contoh Konfigurasi State

```json
{
  "idle": {
    "speed": 0,
    "detectionRange": 8,
    "sightAngle": 90,
    "animation": "pocong-idle",
    "soundId": "sfx-pocong-breath",
    "soundInterval": 5,
    "duration": 3,
    "canDetectPlayer": true
  },
  "patrol": {
    "speed": 1.5,
    "detectionRange": 12,
    "sightAngle": 90,
    "animation": "pocong-hop",
    "soundId": "sfx-pocong-hop",
    "soundInterval": 0.8,
    "duration": null,
    "canDetectPlayer": true
  },
  "alert": {
    "speed": 0,
    "detectionRange": 15,
    "sightAngle": 120,
    "animation": "pocong-alert",
    "soundId": "sfx-pocong-alert",
    "soundInterval": null,
    "duration": 1.5,
    "canDetectPlayer": true
  },
  "chase": {
    "speed": 4.0,
    "detectionRange": 20,
    "sightAngle": 180,
    "animation": "pocong-chase",
    "soundId": "sfx-pocong-chase",
    "soundInterval": 0.5,
    "duration": null,
    "canDetectPlayer": true
  },
  "attack": {
    "speed": 0,
    "detectionRange": 2,
    "sightAngle": 360,
    "animation": "pocong-attack",
    "soundId": "sfx-pocong-scream",
    "soundInterval": null,
    "duration": 1.0,
    "canDetectPlayer": false
  },
  "lost": {
    "speed": 2.0,
    "detectionRange": 10,
    "sightAngle": 360,
    "animation": "pocong-lost",
    "soundId": "sfx-pocong-search",
    "soundInterval": 3,
    "duration": 10,
    "canDetectPlayer": true
  }
}
```

## 7. Audio Config Schema

Skema untuk meregistrasi aset suara dan perilakunya di ruang 3D.

```typescript
interface AudioEntry {
  id: string;                       // ID unik (contoh: 'ambient-wind')
  file: string;                     // Path ke file audio
  type: 'ambient' | 'sfx' | 'music' | 'voice';
  volume: number;                   // 0.0 - 1.0 (volume default)
  loop: boolean;                    // Putar berulang?
  spatial: boolean;                 // Gunakan 3D panner? (Web Audio API)
  falloff?: {
    refDistance: number;             // Jarak volume penuh (meter)
    maxDistance: number;             // Jarak volume 0 (meter)
    rolloffFactor: number;          // Kecepatan penurunan volume
    distanceModel: 'linear' | 'exponential' | 'inverse';
  };
  channel: 'master' | 'music' | 'sfx' | 'ambient'; // Routing volume
}

// Profil audio per chapter
interface ChapterAudioProfile {
  chapterId: string;
  ambientTracks: string[];          // ID ambient yang dimainkan bersamaan
  musicTrack: string;               // ID musik background
  chaseMusicTrack: string;          // ID musik saat dikejar
  safeMusicTrack?: string;          // ID musik di safe zone (opsional)
}
```

### Contoh Audio Config

```json
[
  {
    "id": "ambient-drip",
    "file": "assets/audio/ambient/drip.ogg",
    "type": "ambient",
    "volume": 0.4,
    "loop": true,
    "spatial": true,
    "falloff": {
      "refDistance": 1,
      "maxDistance": 15,
      "rolloffFactor": 1.5,
      "distanceModel": "exponential"
    },
    "channel": "ambient"
  },
  {
    "id": "sfx-pocong-hop",
    "file": "assets/audio/sfx/pocong-hop.ogg",
    "type": "sfx",
    "volume": 0.7,
    "loop": false,
    "spatial": true,
    "falloff": {
      "refDistance": 2,
      "maxDistance": 25,
      "rolloffFactor": 1.5,
      "distanceModel": "exponential"
    },
    "channel": "sfx"
  },
  {
    "id": "music-tension",
    "file": "assets/audio/music/tension-loop.ogg",
    "type": "music",
    "volume": 0.3,
    "loop": true,
    "spatial": false,
    "channel": "music"
  }
]
```

## 8. Event System Schema

Sistem event untuk mengontrol jalannya game, cutscene, jumpscare, dan progresi chapter.

```typescript
interface GameEvent {
  id: string;                       // ID unik (contoh: 'ch1-first-pocong')
  type: EventTriggerType;
  condition?: EventCondition;       // Kondisi tambahan
  actions: EventAction[];           // Aksi yang dijalankan (bisa multiple)
  oneShot: boolean;                 // Hanya trigger sekali?
  hasTriggered: boolean;            // Status sudah pernah trigger?
  delay?: number;                   // Delay sebelum aksi dijalankan (detik)
  chapter: number;                  // Chapter di mana event ini aktif
}

type EventTriggerType =
  | 'proximity'                     // Pemain masuk ke trigger zone
  | 'interact'                      // Pemain berinteraksi dengan objek
  | 'timer'                         // Setelah waktu tertentu
  | 'item'                          // Pemain menggunakan item tertentu
  | 'objective_complete'            // Objective tertentu selesai
  ;

interface EventCondition {
  type: 'has_item' | 'objective_done' | 'health_below' | 'chapter_is';
  value: string | number;           // ID item, ID objective, atau nilai angka
}

interface EventAction {
  type: EventActionType;
  payload: Record<string, any>;     // Data spesifik per tipe aksi
}

type EventActionType =
  | 'playSound'                     // { soundId: string, position?: Vector3 }
  | 'showText'                      // { text: string, duration: number }
  | 'spawnPocong'                   // { pocongId: string, position: Vector3 }
  | 'jumpscare'                     // { animationId: string, soundId: string, duration: number }
  | 'unlockDoor'                    // { doorId: string }
  | 'giveItem'                      // { itemId: string }
  | 'removeItem'                    // { itemId: string }
  | 'changeChapter'                 // { chapterId: number }
  | 'completeObjective'             // { objectiveId: string }
  | 'cameraShake'                   // { intensity: number, duration: number }
  | 'fadeScreen'                    // { color: string, duration: number, direction: 'in'|'out' }
  | 'showNote'                      // { title: string, content: string }
  | 'teleportPlayer'               // { position: Vector3 }
  ;
```

### Contoh Event Data

```json
[
  {
    "id": "ch1-first-pocong-appear",
    "type": "proximity",
    "condition": { "type": "objective_done", "value": "restore-power" },
    "actions": [
      { "type": "fadeScreen", "payload": { "color": "#000000", "duration": 0.5, "direction": "in" } },
      { "type": "spawnPocong", "payload": { "pocongId": "pocong-hospital-1", "position": { "x": 10, "y": 0, "z": -5 } } },
      { "type": "playSound", "payload": { "soundId": "sfx-pocong-scream" } },
      { "type": "cameraShake", "payload": { "intensity": 0.2, "duration": 1.0 } },
      { "type": "fadeScreen", "payload": { "color": "#000000", "duration": 1.0, "direction": "out" } }
    ],
    "oneShot": true,
    "hasTriggered": false,
    "delay": 0.5,
    "chapter": 1
  },
  {
    "id": "ch1-find-note-patient",
    "type": "interact",
    "condition": null,
    "actions": [
      { "type": "showNote", "payload": { "title": "Catatan Pasien #247", "content": "Aku mendengar suara lompatan di lorong setiap malam. Perawat bilang tidak ada siapa-siapa. Tapi aku tahu ada sesuatu di sana... kode pintu gudang: 4721" } },
      { "type": "playSound", "payload": { "soundId": "sfx-paper-rustle" } }
    ],
    "oneShot": true,
    "hasTriggered": false,
    "chapter": 1
  }
]
```

## 9. Settings Schema

Konfigurasi pengaturan opsi bagi pemain. Disimpan di IndexedDB object store `settings`.

```typescript
interface SettingsSchema {
  audio: {
    master: number;                 // 0.0 - 1.0 (default: 0.8)
    music: number;                  // 0.0 - 1.0 (default: 0.6)
    sfx: number;                    // 0.0 - 1.0 (default: 0.8)
    ambient: number;                // 0.0 - 1.0 (default: 0.7)
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';  // Default: 'medium'
    shadows: boolean;               // Default: true
    fov: number;                    // 60-110 (default: 75)
    pixelRatio: number;             // 1-2 (default: min(devicePixelRatio, 2))
    fog: boolean;                   // Default: true
  };
  controls: {
    mouseSensitivity: number;       // 0.1 - 2.0 (default: 1.0)
    invertY: boolean;               // Default: false
  };
  accessibility: {
    subtitles: boolean;             // Default: true
    brightnessAdjust: number;       // -0.5 to 0.5 (default: 0)
    screenShake: boolean;           // Default: true
  };
  language: 'id' | 'en';           // Default: 'id' (Bahasa Indonesia)
}
```

### Default Settings

```json
{
  "audio": {
    "master": 0.8,
    "music": 0.6,
    "sfx": 0.8,
    "ambient": 0.7
  },
  "graphics": {
    "quality": "medium",
    "shadows": true,
    "fov": 75,
    "pixelRatio": 1,
    "fog": true
  },
  "controls": {
    "mouseSensitivity": 1.0,
    "invertY": false
  },
  "accessibility": {
    "subtitles": true,
    "brightnessAdjust": 0,
    "screenShake": true
  },
  "language": "id"
}
```

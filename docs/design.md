# Dokumen Desain Game & UI - Ambacong

## 1. Arahan Seni (Art Direction)

Game ini mengusung estetika **Low-poly 3D horror**. Atmosfer yang dibangun sangat gelap, mencekam, dan memanfaatkan pencahayaan minim. Setting environment menggunakan elemen khas Indonesia, mencakup arsitektur lokal (rumah panggung, bangunan kolonial), vegetasi tropis (pohon beringin, bambu, sawah), serta ornamen-ornamen khas nusantara (ukiran, batik motif, kaligrafi di mushola).

**Prinsip Visual:**
- Dominasi gelap — mayoritas layar gelap, pencahayaan fokus pada area kecil
- Low-poly dengan detail strategis — detail tinggi pada objek interaktif, low-poly pada environment jauh
- Warna desaturated — mengurangi saturasi warna untuk kesan horor dan tua
- Fog/kabut — membatasi jarak pandang, menambah misteri
- Particle effects — debu melayang, kunang-kunang, asap tipis

## 2. Palet Warna

### Umum (Seluruh Game)
| Elemen | Warna | Hex |
|--------|-------|-----|
| Background utama | Hitam pekat | `#0A0A0A` |
| Fog/kabut | Abu-abu gelap | `#1A1A2E` |
| Aksen bahaya | Merah darah | `#8B0000` |
| Highlight interaktif | Kuning redup | `#B8860B` |
| Teks UI | Putih pucat | `#D4D4D4` |

### Chapter 1 — Rumah Sakit
| Elemen | Warna | Hex |
|--------|-------|-----|
| Dinding | Putih kusam kehijauan | `#C8D5B9` |
| Lantai | Abu-abu kotor | `#4A4A4A` |
| Bercak karat/darah | Coklat kemerahan | `#8B4513` |
| Lampu neon | Hijau rumah sakit | `#90EE90` (flicker) |

### Chapter 2 — Kuburan
| Elemen | Warna | Hex |
|--------|-------|-----|
| Tanah | Coklat gelap | `#3E2723` |
| Rumput/lumut | Hijau gelap | `#1B4332` |
| Nisan | Putih pucat | `#9E9E9E` |
| Cahaya bulan | Biru pucat | `#B0C4DE` |

### Chapter 3 — Pedesaan
| Elemen | Warna | Hex |
|--------|-------|-----|
| Kayu rumah | Coklat kayu tua | `#5D4037` |
| Sawah malam | Hijau sangat gelap | `#0D3B0D` |
| Lampu minyak | Kuning hangat redup | `#FFB74D` (glow) |
| Langit malam | Biru gelap | `#0D1B2A` |

## 3. Desain Karakter Pocong

### Deskripsi Visual
Pocong mengenakan kain kafan putih yang kusam dan kotor. Wajah pucat kehijauan dengan mata hitam kosong tanpa pupil. Mulut terbuka lebar seakan menjerit tanpa suara. Tubuh terbungkus kain dari kepala hingga kaki dengan ikatan di atas kepala. Bergerak dengan cara melompat-lompat.

### Animation States

| State | Deskripsi Animasi | Kecepatan |
|-------|-------------------|-----------|
| `idle` | Diam berdiri, tubuh sedikit bergoyang maju-mundur, kain kafan bergerak pelan | 0 m/s |
| `hop` | Lompat-lompat pelan saat berpatroli, mendarat dengan sedikit impact | 1.5 m/s |
| `chase` | Lompat cepat dan agresif mengejar pemain, pose condong ke depan | 4.0 m/s |
| `attack` | Jumpscare close-up ke wajah pemain, mulut terbuka lebar, mata menyala | 0 m/s |
| `lost` | Berhenti, menoleh kiri-kanan mencari pemain, lalu berbalik pelan | 2.0 m/s |

### Variasi Pocong per Chapter
- **Pocong Rumah Sakit**: Kain kafan penuh bercak darah, gelang identitas rumah sakit masih terpasang
- **Pocong Kuburan**: Kain kafan kotor oleh tanah liat dan lumut, aroma tanah basah (implied via audio)
- **Pocong Pedesaan (Boss)**: Ukuran tubuh 1.5x lebih besar, aura gelap berupa partikel asap hitam, kain kafan sangat compang-camping, mata bercahaya merah redup

## 4. Desain Environment per Chapter

### Chapter 1: Rumah Sakit Tua
- **Koridor panjang gelap** — lantai keramik retak, langit-langit bocor (tetesan air), lampu neon berkedip sporadis
- **Bangsal pasien** — ranjang besi berkarat berserakan, tirai robek, infus tiang jatuh
- **Ruang operasi** — meja operasi berlumuran (karat/darah kering), instrumen berserakan, lampu operasi mati
- **Tangga darurat** — gelap total, hanya mengandalkan senter, suara langkah menggema
- **Ruang tunggu** — kursi plastik berantakan, majalah tua, TV statis (noise visual dan audio)
- **Ruang janitor** — tersembunyi, berisi fuse box dan kunci

### Chapter 2: Kuburan
- **Jalan setapak berlumpur** — becek, jejak kaki muncul (player footsteps visual)
- **Nisan tua miring** — batu nisan retak, tulisan pudar, beberapa terbuka (tanah terangkat)
- **Pohon beringin raksasa** — akar terjuntai, daun lebat menghalangi cahaya bulan
- **Mushola tua** — bangunan kecil rusak, masih ada lilin menyala (aman sementara?)
- **Area pemakaman baru** — tanah merah masih segar, bunga layu, bau tanah basah (implied)
- **Gerbang keluar** — pintu besi besar dengan 4 lubang untuk pusaka

### Chapter 3: Pedesaan
- **Rumah kayu tradisional** — rumah panggung, tangga kayu berderit, interior gelap
- **Sawah malam hari** — padi menguning di kegelapan, suara jangkrik, kunang-kunang
- **Warung pinggir jalan** — meja dan kursi kosong, makanan basi, radio statis
- **Jembatan kayu reyot** — berderit, beberapa papan hilang (jangan sampai jatuh)
- **Sumur tua** — dalam dan gelap, suara aneh dari bawah
- **Rumah dukun** — di ujung desa, penuh sesajen, lilin, dan simbol-simbol ritual

## 5. UI/HUD Layout

### In-Game HUD

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                                                  │
│                                                  │
│                       ·                          │  ← Crosshair (tengah)
│                                                  │
│                                                  │
│              [Tekan E untuk membuka]              │  ← Interaction Prompt
│                                                  │
│  ┌───────┐                         ┌───────────┐ │
│  │ ♥♥♥   │                         │ 🔦 ████░░│ │  ← Health (kiri) & Battery (kanan)
│  │ ████░░│                         └───────────┘ │  ← Stamina bar
│  └───────┘                                       │
│           ┌──┬──┬──┬──┬──┬──┐                    │
│           │  │  │  │  │  │  │                     │  ← Inventory (6 slots, toggle)
│           └──┴──┴──┴──┴──┴──┘                    │
└──────────────────────────────────────────────────┘
```

### Desain UI Elements
- **Health**: 3 ikon hati merah, hilang satu per hit. Saat 1 HP tersisa, ikon berkedip
- **Stamina Bar**: Bar kuning horizontal, berkurang saat sprint, terisi saat diam/jalan
- **Flashlight Battery**: Ikon senter + bar biru, berkedip kuning saat < 15%
- **Inventory Grid**: 6 slot kotak, border putih tipis, ikon item di dalam. Slot aktif = border kuning
- **Crosshair**: Titik putih kecil (3px), berubah jadi ikon tangan saat ada interactable
- **Interaction Prompt**: Teks putih dengan background hitam semi-transparan, fade in/out
- **Chapter Title**: Font besar, fade in pelan (2 detik), tahan 3 detik, fade out

### Menu Screens
- **Main Menu**: Background 3D gelap (environment rumah sakit), judul game dengan efek glitch, tombol: Mulai Baru / Lanjutkan / Muat / Pengaturan / Kredit
- **Pause Menu**: Background game blur, overlay hitam 70%, tombol: Lanjutkan / Simpan / Pengaturan / Keluar
- **Game Over**: Layar merah gelap, teks "KAMU MATI", opsi: Coba Lagi / Menu Utama
- **Loading Screen**: Background hitam, progress bar, tips horror (rotasi acak)

## 6. Desain Suara (Sound Design)

### Ambient Sounds
| Suara | Chapter | Loop | Spatial |
|-------|---------|------|---------|
| Tetesan air | Rumah Sakit | Ya | Ya |
| Neon berkedip (buzz) | Rumah Sakit | Ya | Ya |
| Angin berhembus | Kuburan, Pedesaan | Ya | Tidak |
| Jangkrik | Kuburan, Pedesaan | Ya | Tidak |
| Derit pintu | Semua | Tidak | Ya |
| Langkah kaki pemain | Semua | Tidak | Tidak |
| TV statis | Rumah Sakit | Ya | Ya |

### Pocong SFX
| Suara | Trigger | Keterangan |
|-------|---------|------------|
| Gedebuk lompat | Setiap lompatan pocong | Berat, menggema |
| Nafas serak | Idle & patrol | Pelan, creepy |
| Jeritan melengking | Attack/jumpscare | Tajam, volume tinggi |
| Suara tulang retak | Chase (kadang-kadang) | Subtle, random |

### Music
- **Ambient drone**: Nada rendah konstan, membuat gelisah (minor key, dissonant)
- **Tension build-up**: Saat pocong alert, musik mulai naik intensitas (strings crescendo)
- **Chase theme**: Tempo cepat, perkusi berat, membuat panik
- **Safe zone**: Nada tenang, tapi tetap uneasy (piano pelan, minor)
- **Jumpscare stinger**: 0.5 detik suara tajam (brass hit + noise burst)

### Spatial Audio Rules
- Semua suara pocong menggunakan 3D panner (Web Audio API)
- `refDistance`: 2 meter (volume penuh)
- `maxDistance`: 25 meter (tidak terdengar)
- `rolloffFactor`: 1.5 (exponential falloff)
- Pemain bisa mendeteksi arah pocong dari suara (kiri/kanan/depan/belakang)

## 7. Desain Pencahayaan

### Flashlight (Senter Pemain)
- **Tipe**: SpotLight (cone)
- **Jangkauan**: 15 meter
- **Angle**: 35 derajat (cone angle)
- **Penumbra**: 0.5 (soft edge)
- **Warna**: Putih kekuningan `#FFF5E0`
- **Intensitas**: Berkurang seiring battery (100% = full, 0% = mati)
- **Flicker**: Saat battery < 15%, senter berkedip random (intensity oscillation)
- **Shadow**: Cast dynamic shadow

### Moonlight (Outdoor Chapters)
- **Tipe**: DirectionalLight
- **Warna**: Biru pucat `#B0C4DE`
- **Intensitas**: 0.15 (sangat redup)
- **Shadow**: Cast shadow lembut

### Environment Lights
| Chapter | Tipe Cahaya | Warna | Behavior |
|---------|------------|-------|----------|
| Rumah Sakit | Neon (PointLight) | Hijau pucat `#90EE90` | Flicker random, beberapa mati total |
| Kuburan | Lilin (PointLight) | Oranye hangat `#FF8C00` | Flicker pelan (simulasi api), radius kecil |
| Pedesaan | Lampu minyak (PointLight) | Kuning hangat `#FFB74D` | Glow stabil, radius sedang |

### Shadow Configuration
- **Dynamic shadow**: Hanya dari flashlight pemain (performance)
- **Baked shadow**: Environment shadow di-bake ke texture
- **Shadow map resolution**: 1024x1024 (balance kualitas & performa)
- **Shadow bias**: 0.0001 (mengurangi shadow acne)

## 8. Kamera & Kontrol

### First-Person Camera
| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| FOV (Field of View) | 75° default | 60° saat crouch |
| Near Plane | 0.1 | Jarak render minimum |
| Far Plane | 100 | Jarak render maksimum |
| Tinggi kamera (berdiri) | 1.7m | Eye-level |
| Tinggi kamera (crouch) | 1.0m | 40% lebih rendah |

### Mouse Controls
- **Sensitivity**: 0.1 - 2.0 (default 1.0), adjustable di settings
- **Invert Y**: Opsional (default: off)
- **Pointer Lock**: Aktif saat bermain, lepas saat pause/menu

### Camera Effects
| Efek | Trigger | Parameter |
|------|---------|-----------|
| Head Bob | Jalan & lari | Amplitude 0.05m (jalan), 0.1m (lari), freq 8Hz |
| Camera Shake | Jumpscare, serangan pocong | Amplitude 0.15m, durasi 0.5 detik, decay |
| FOV Shift | Sprint | FOV naik ke 80° (efek speed) |
| Vignette | HP rendah (1 HP) | Pinggir layar menggelap |
| Red Flash | Terkena damage | Overlay merah 0.3 detik |
| Blur | Pause menu | Gaussian blur background |

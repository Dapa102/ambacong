# Aturan & Konvensi Proyek - Ambacong

## 1. Standar Kode

- **Bahasa**: JavaScript (ESNext) dengan ES Modules
- **Strict Mode**: Semua file harus menggunakan `'use strict'` atau ES Modules (otomatis strict)
- **Deklarasi variabel**: Gunakan `const` secara default, `let` jika perlu reassign. **Dilarang** menggunakan `var`
- **Formatting**: Gunakan Prettier dengan konfigurasi project (2 space indent, single quote, semicolons)
- **Linting**: ESLint dengan aturan recommended + aturan custom project
- **Async**: Gunakan `async/await` daripada callback chains atau `.then()` chains panjang
- **Error Handling**: Semua operasi async harus memiliki `try/catch`. Tidak boleh ada error yang diabaikan tanpa logging

## 2. Konvensi Penamaan

| Elemen | Format | Contoh |
|--------|--------|--------|
| Variabel & Fungsi | `camelCase` | `playerHealth`, `updateStamina()` |
| Class & Constructor | `PascalCase` | `PocongAI`, `SceneManager` |
| File & Folder | `kebab-case` | `scene-manager.js`, `audio-system/` |
| Konstanta | `UPPER_SNAKE_CASE` | `MAX_HEALTH`, `DEFAULT_FOV` |
| Event Names | `kebab-case` | `player-died`, `chapter-loaded` |
| Asset Files | `kebab-case` | `pocong-model.glb`, `ambient-hospital.ogg` |
| CSS Classes | `kebab-case` | `health-bar`, `inventory-slot` |

## 3. Struktur Folder Proyek

```
ambacong/
├── docs/                  # Dokumentasi proyek
│   ├── rules.md
│   ├── architecture.md
│   ├── brd.md
│   ├── prd.md
│   ├── design.md
│   └── schema.md
├── public/                # File statis yang disalin apa adanya
├── src/                   # Source code utama
│   ├── main.js            # Entry point
│   ├── core/              # Sistem inti
│   │   ├── game-loop.js
│   │   ├── state-machine.js
│   │   ├── event-bus.js
│   │   └── input-system.js
│   ├── scenes/            # Scene/chapter managers
│   │   ├── scene-manager.js
│   │   ├── hospital.js
│   │   ├── graveyard.js
│   │   └── village.js
│   ├── entities/          # Entitas game
│   │   ├── player.js
│   │   ├── pocong.js
│   │   └── interactable.js
│   ├── systems/           # Sistem pendukung
│   │   ├── renderer.js
│   │   ├── audio-system.js
│   │   ├── physics.js
│   │   ├── ai-system.js
│   │   ├── inventory-system.js
│   │   ├── save-system.js
│   │   └── flashlight.js
│   ├── ui/                # Komponen UI/HUD
│   │   ├── hud.js
│   │   ├── menu.js
│   │   ├── loading-screen.js
│   │   └── inventory-ui.js
│   ├── data/              # Data statis (level config, item data)
│   │   ├── chapters/
│   │   ├── items.json
│   │   └── audio-config.json
│   ├── utils/             # Fungsi utilitas
│   │   ├── math-utils.js
│   │   ├── dom-utils.js
│   │   └── debug.js
│   └── styles/            # CSS
│       ├── main.css
│       ├── hud.css
│       └── menu.css
├── assets/                # Asset game
│   ├── models/            # Model 3D (GLTF/GLB)
│   ├── textures/          # Texture (PNG/WebP)
│   ├── audio/             # Audio (OGG/MP3)
│   │   ├── ambient/
│   │   ├── sfx/
│   │   └── music/
│   └── fonts/             # Web fonts
├── vite.config.js         # Konfigurasi Vite
├── index.html             # Entry HTML Vite
├── package.json
├── eslint.config.js
├── .prettierrc
├── .nvmrc
└── .gitignore
```

## 4. Git Workflow

### Branching Strategy
- `main` — branch produksi, selalu stabil
- `dev` — branch pengembangan utama
- `feature/*` — branch fitur baru (contoh: `feature/pocong-ai`)
- `bugfix/*` — branch perbaikan bug
- `hotfix/*` — perbaikan kritis langsung dari `main`

### Commit Message Format (Conventional Commits)
```
<tipe>(<scope>): <deskripsi singkat>

[body opsional]
```

**Tipe yang digunakan:**
| Tipe | Deskripsi |
|------|-----------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Refactor tanpa ubah fungsionalitas |
| `style` | Perubahan formatting/styling |
| `docs` | Perubahan dokumentasi |
| `perf` | Optimasi performa |
| `test` | Penambahan/perbaikan test |
| `chore` | Maintenance (dependency, config) |
| `asset` | Penambahan/perubahan asset game |

**Contoh:**
```
feat(ai): tambah patrol behavior untuk pocong
fix(audio): spatial audio tidak berfungsi di Firefox
asset(models): tambah model pocong chapter 1
```

### Pull Request
- Setiap PR harus di-review minimal 1 orang (jika tim > 1)
- PR harus memiliki deskripsi yang jelas
- Semua checklist code review harus dipenuhi sebelum merge

## 5. Code Review Checklist

- [ ] Kode mengikuti konvensi penamaan project
- [ ] Tidak ada `console.log` yang tersisa (kecuali di debug mode)
- [ ] Error handling sudah tepat
- [ ] Performance budget tidak dilanggar (cek FPS)
- [ ] Tidak ada memory leak (dispose Three.js objects)
- [ ] JSDoc ditambahkan untuk fungsi/class baru
- [ ] Asset sesuai spesifikasi (ukuran, format)
- [ ] Cross-browser tested (Chrome, Firefox, Edge minimum)

## 6. Asset Pipeline

### Model 3D
- **Format**: GLTF/GLB (standar Three.js)
- **Polygon count**: Low-poly (target < 5.000 tri per objek environment, < 2.000 tri per karakter)
- **Naming**: `<nama>-<tipe>.glb` (contoh: `pocong-base.glb`, `hospital-bed.glb`)

### Texture
- **Format**: PNG (transparan) atau WebP (opaque)
- **Resolusi maksimal**: 1024x1024 pixel (environment), 512x512 pixel (props kecil)
- **Color space**: sRGB untuk diffuse, Linear untuk normal map
- **Naming**: `<objek>-<tipe>.png` (contoh: `wall-diffuse.png`, `floor-normal.png`)

### Audio
- **Format**: OGG (utama) + MP3 (fallback)
- **Sample rate**: 44.1kHz
- **Bit depth**: 16-bit
- **Loudness**: Normalisasi ke -14 LUFS
- **Naming**: `<kategori>-<nama>.ogg` (contoh: `ambient-wind.ogg`, `sfx-pocong-jump.ogg`)

## 7. Performance Budget

| Metrik | Target |
|--------|--------|
| FPS | 60 preferred, rata-rata >= 45 FPS, 1% low >= 30 FPS |
| Draw Calls | Maksimal 100 per frame |
| Texture Memory | Maksimal 128MB |
| Geometry Memory | Maksimal 64MB |
| Vertical Slice Asset Transfer | Maksimal 30MB compressed |
| Total Asset Transfer | Maksimal 100MB compressed |
| Critical Initial Transfer | Maksimal 8MB compressed |
| Initial Load Time | < 10 detik pada cold cache dan koneksi 10 Mbps |
| Blocking Area Load | Maksimal 4MB compressed dan < 5 detik pada koneksi 10 Mbps |
| RAM Usage | < 512MB |

**Profil uji:** 1920x1080, quality preset `medium`, Chrome versi terbaru, CPU 4-core, RAM 8GB, dan integrated GPU dengan WebGL 2. Catat model CPU/GPU pada setiap laporan benchmark. Kunci satu perangkat referensi setelah benchmark vertical slice pertama.

### Aturan Optimasi
- Gunakan instanced rendering untuk objek berulang (nisan, pohon, dll)
- Texture atlas untuk material serupa
- LOD (Level of Detail) untuk objek jauh
- Frustum culling dan occlusion culling
- Object pooling untuk entitas dinamis
- Dispose semua resource Three.js yang tidak dipakai (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`)

## 8. Browser Support

| Browser | Versi Minimum |
|---------|---------------|
| Google Chrome | 111+ |
| Mozilla Firefox | 114+ |
| Microsoft Edge | 111+ |
| Safari | 16.4+ |

### Syarat Teknis Browser
- WebGL 2.0 support
- Web Audio API support
- IndexedDB support
- Pointer Lock API support
- ES Modules support

## 9. Dependency Rules

- **Minimal dependencies** — hanya gunakan library yang benar-benar dibutuhkan
- Setiap dependency baru harus di-review (ukuran bundle, maintenance status, lisensi)
- **Dependencies utama yang diizinkan**:
  - `three` — 3D rendering engine
  - `vite` — bundler & dev server (dev dependency)
- **Dilarang** menambahkan framework UI (React, Vue, dll) — gunakan vanilla DOM manipulation
- Commit `package-lock.json` dan gunakan `npm ci` untuk instalasi reproducible
- Upgrade dependency dilakukan secara sadar melalui pull request terpisah

## 10. Testing

### Checklist Manual per Chapter
- [ ] Pemain dapat bergerak dengan mulus (WASD + mouse look)
- [ ] Flashlight menyala/mati dengan benar
- [ ] Battery drain berfungsi dan tampil di HUD
- [ ] Stamina berkurang saat sprint dan recovery saat diam
- [ ] Pocong berpatroli sesuai rute
- [ ] Pocong mendeteksi pemain dalam radius yang benar
- [ ] Pocong mengejar pemain saat terdeteksi
- [ ] Hiding spots berfungsi (pocong kehilangan target)
- [ ] Item dapat diambil dan masuk inventory
- [ ] Puzzle dapat diselesaikan
- [ ] Save/Load berfungsi (IndexedDB)
- [ ] Audio spatial terdengar dari arah yang benar
- [ ] Jumpscare trigger berfungsi
- [ ] Tidak ada crash atau freeze selama playthrough penuh
- [ ] FPS stabil di atas 30 FPS

### Performance Testing
- Uji di Chrome DevTools Performance tab
- Monitor memory usage (tidak boleh terus naik / memory leak)
- Gunakan profil uji dan perangkat referensi dari Performance Budget

## 11. Dokumentasi

- **JSDoc wajib** untuk semua class, fungsi publik, dan method penting
- **Format JSDoc**:
```javascript
/**
 * Memperbarui posisi pocong berdasarkan state AI saat ini.
 * @param {number} deltaTime - Waktu sejak frame terakhir (dalam detik)
 * @param {THREE.Vector3} playerPosition - Posisi pemain saat ini
 * @returns {void}
 */
updatePosition(deltaTime, playerPosition) { ... }
```
- **README.md** harus selalu up-to-date dengan instruksi setup dan development
- Setiap sistem baru harus memiliki komentar penjelasan di bagian atas file

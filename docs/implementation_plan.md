# Rencana Implementasi Proyek - Ambacong

Dokumen ini merangkum alur fase pengerjaan vertical slice Chapter 1. Setiap fase wajib diakhiri dengan pengujian sebelum lanjut ke fase berikutnya.

## Fase 1: Setup & Core Engine (Pondasi)
Fokus: Sistem berjalan, rendering dasar, state machine.
- [x] Inisialisasi Vite + Three.js
- [x] Setup folder struktur
- [ ] Buat `GameLoop` (fixed vs variable timestep)
- [ ] Buat `StateMachine` (Init -> Menu -> Play -> Pause -> Game Over)
- [ ] Setup `SceneManager` dasar (load scene kosong)
- [ ] Setup `EventBus` (Pub/Sub pattern)

**Pengujian Fase 1:**
- Render cube berputar tanpa lag.
- State pindah (tekan tombol -> ganti state).
- EventBus bisa kirim dan tangkap pesan.
- **Kriteria lulus**: Tidak ada error console atau frame stall; baseline FPS dicatat untuk perbandingan fase berikutnya.

## Fase 2: Player Controller & Environment Dasar
Fokus: Pergerakan, kamera First-Person, fisika dasar.
- [ ] Buat `Player` class (posisi, rotasi, kamera POV)
- [ ] Implementasi Input WASD + Mouse Look (Pointer Lock API)
- [ ] Implementasi head bobbing dan sprint/crouch modifier
- [ ] Buat sistem fisika custom (Raycasting lantai/dinding + AABB)
- [ ] Render environment kotak sederhana untuk test jalan

**Pengujian Fase 2:**
- Jalan keliling kotak (WASD).
- Kamera responsif tanpa stutter (Mouse Look).
- Tidak nembus tembok (Collision aktif).
- Kecepatan berubah saat sprint/crouch.
- **Kriteria lulus**: Kontrol mulus, bounding box tidak bocor.

## Fase 3: Core Mechanics & UI/HUD
Fokus: Interaksi, sistem vital (health/stamina), UI.
- [ ] Sistem Stamina (drain saat lari, regen saat diam/jalan)
- [ ] Sistem Senter (on/off, battery drain)
- [ ] `Interactable` entity base class (Raycast ke depan kamera)
- [ ] UI HUD update (Health bar, Stamina bar, Battery bar overlay)
- [ ] Inventory dasar (simpan dan pakai item baterai)

**Pengujian Fase 3:**
- Sprint menguras stamina bar di UI.
- Senter bisa nyala/mati, cahaya berefek pada mesh, baterai turun.
- Crosshair berubah saat arahkan ke kubus interactable.
- Pencet 'E' hapus item dan masuk inventory.
- **Kriteria lulus**: Data logic sinkron 100% dengan tampilan HUD.

## Fase 4: AI Pocong & Audio System
Fokus: Musuh, pathfinding sederhana, deteksi, dan spatial audio.
- [ ] Setup `AudioSystem` (Web Audio API, spatial panner)
- [ ] Load model statis pengganti pocong (kapsul merah/putih)
- [ ] Implementasi State Machine AI (Idle -> Patrol -> Alert -> Chase -> Attack/Lost)
- [ ] Implementasi waypoint graph + A* untuk patrol dan chase di lorong
- [ ] Deteksi via Raycast (Cone vision) dan radius jarak suara
- [ ] Implementasi Hiding System (`hiding_spot` -> player hidden -> AI masuk `lost`)
- [ ] Tambahkan efek suara ke entitas (nafas pocong, suara langkah)

**Pengujian Fase 4:**
- Pocong patroli antar titik.
- Pocong mengejar pemain melewati waypoint tanpa menembus dinding.
- Lari dekat pocong memicu state `chase`.
- Jarak < 2 meter memicu `attack` dan mengurangi health.
- Masuk hiding spot saat dikejar memicu state `lost`.
- Senter ke arah pocong meningkatkan jarak deteksi.
- Suara pocong makin keras saat dia dekat, pindah kiri/kanan sesuai posisi 3D.
- **Kriteria lulus**: Loop patrol-detect-chase-attack/lost berjalan tanpa pocong menembus dinding; audio spatial 3D valid.

## Fase 5: Save System & Level Loading
Fokus: Persistensi data dan pemuatan aset Chapter 1.
- [ ] Implementasi `SaveSystem` via IndexedDB
- [ ] Simpan `schemaVersion` dan tangani save dengan versi tidak didukung
- [ ] Auto-save state saat trigger tertentu
- [ ] `AssetManager` (GLTFLoader, load model rumah sakit)
- [ ] Setup map Chapter 1 dengan trigger zone

**Pengujian Fase 5:**
- Main 5 menit, pungut item, posisi pindah -> Save -> Reload page.
- Setelah reload, posisi dan inventory harus persis sama.
- Save dengan versi lama dimigrasikan atau ditolak dengan pesan jelas tanpa crash.
- Pindah zona memicu loading aset tanpa crash.
- **Kriteria lulus**: IndexedDB baca/tulis sukses, tidak ada memory leak saat ganti model.

## Fase 6: Polish, Puzzle & Jumpscare (Vertical Slice Finalisasi)
Fokus: Konten, horror feel, tuning.
- [ ] Tambahkan logic Puzzle Chapter 1 (kode, kunci pintu)
- [ ] Implementasi Event System untuk Jumpscare (camera shake, stinger audio)
- [ ] Menu utama, Pause screen, Game Over screen (mati ditangkap pocong)
- [ ] Lighting & Fog tuning (suasana mencekam)

**Pengujian Fase 6:**
- Playthrough penuh Chapter 1 (Start -> Cari Item -> Dikejar -> Buka Pintu Keluar).
- Uji limit memory browser.
- Uji FPS drop.
- **Kriteria lulus**: Chapter 1 tamat tanpa bug pemblokir, performa memenuhi budget (aturan `rules.md`).

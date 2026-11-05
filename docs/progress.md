# Progres Pengembangan Ambacong

Snapshot: 12 Agustus 2026. Status saat ini: **vertical slice Chapter 1 lengkap dengan runtime suite 36 cek**.

## Alur yang Sudah Bisa Dimainkan

1. Pemain bangun di kamar kost, membaca berita horror di komputer, menerima telepon peringatan dari Raka.
2. Keluar kost dan berjalan ke Rumah Sakit Puri Jiwa; akses jalan utama ditutup, pemain masuk lewat celah pintu samping (interaksi `E`).
3. Jelajahi 2 lantai rumah sakit (17 ruang): lobby, tunggu, administrasi, periksa, janitor, bangsal, operasi, gudang, pintu keluar utama, tangga darurat, koridor, arsip, isolasi, perawatan A/B, tangga lantai 2.
4. Kumpulkan baterai senter lalu naik ke lantai 2 untuk mencari kunci janitor di ruang arsip.
5. Ambil kunci (pocong bangun), baterai kedua, dan catatan medis, lalu turun lagi.
6. Buka pintu keluar dengan kunci → layar Chapter Complete → kembali ke menu utama.
7. Jika tertangkap pocong, layar Game Over dan permainan dapat diulang.
8. Progress tersimpan otomatis; tombol Lanjut di menu memuat save (IndexedDB + fallback localStorage).

## Fitur yang Sudah Ada

- Arsitektur modular: `src/core` (input, state, physics, collision), `src/entities` (player, pocong), `src/systems` (save, audio, collision, inventory, rng, trigger), `src/ui` (menu, hud, overlays, map, inventory) — `main.js` mengorkestrasi.
- Rumah sakit dua lantai dibangun prosedural (`chapter-one-assets.js`) dengan collider AABB dan peta otomatis.
- Kamera first-person dengan mouse look dan pointer lock; gerak `WASD` ternormalisasi.
- Sprint `Shift` dengan stamina, drain, recovery, dan kondisi lelah.
- Interaksi raycast `/` crosshair memakai `E`: buka pintu, ambil item, hide di kolong/loker, baca catatan.
- Senter `F` mengarah ke crosshair, baterai habis; baterai cadangan dipakai dari inventory.
- Inventory (`Tab`) + HUD: objektif, prompt interaksi, baterai, stamina, status sembunyi, quick item.
- Map (`M`) menampilkan ruang sesuai lantai aktif + posisi pemain + pintu keluar.
- Pocong punya patrol per lantai, deteksi dengan senter, pengejaran, dan kondisi Game Over.
- Menu utama, pilih chapter, pause, save, Game Over, dan Chapter Complete screen.
- Dialog, berita, dan catatan medis dalam bentuk overlay teks.
- Flash flicker di rumah sakit.

## Kontrol

| Input | Fungsi |
| --- | --- |
| Klik tombol mulai | Masuk ke permainan |
| Mouse | Melihat sekeliling |
| `WASD` | Bergerak |
| `Shift` | Sprint |
| `E` | Interaksi (pintu, item, hide) |
| `F` | Senter on/off |
| `Tab` | Inventory |
| `M` | Peta |
| `Esc` | Pause / lepas pointer lock |
| `Enter`/`Esc` | Lanjut dialog |

## Status per Fase

| Fase | Status | Cakupan saat ini |
| --- | --- | --- |
| Setup dan pondasi | Sebagian | Vite, Three.js, render loop, lint, format, build. State machine per lantai; belum ada SceneManager/EventBus umum. |
| Player dan environment | Sebagian | First-person, graybox→rumah sakit 2 lantai, collider AABB, batas lantai, sprint, crouch, hide. Belum ada head bob untuk semua gerak. |
| Core mechanics dan HUD | Sebagian | Interaksi, stamina, senter + baterai pickup, inventory, objektif, peta, prompt. Belum ada health system. |
| AI dan audio | Sebagian | Pocong: patrol per lantai, deteksi senter, kejar, tangkap. Audio: pickup, ghostNear, BGM. Belum ada pathfinding/pintu-progress pada AI. |
| Save dan level loading | Sebagian | Auto-save IndexedDB + fallback; resume dari menu. Belum ada chapter 2+. |
| Konten dan polish | Sebagian | Prologue→Chapter 1 lengkap; puzzle kunci-pintu, dialog, berita, catatan, jumpscare-lite (pocong bangun). Belum ada Chapter 2, aset final, tuning performa. |

## Verifikasi Otomatis

Unit test (`npm test`) melindungi logika: urutan kunci sebelum pintu, gerak diagonal, stamina 0–100, pocong mengejar, arah senter, baterai senter.

Runtime test browser end-to-end (`npm run test:runtime`, headless Chrome + SwiftShader, tanpa dependency tambahan) menjalankan 36 cek dari menu sampai Chapter Complete:

- Alur penuh: new game → prologue (empat lampu tetap nyala, komputer/telepon) → keluar kost → halaman rumah sakit → masuk pintu samping → lobby → peta/inventory toggle → baterai 1 → hide/keluar loker → naik lantai 2 → kunci janitor (pocong bangun) → baterai 2 → turun lantai 1 → pintu keluar (butuh kunci) → Chapter Complete → kembali ke menu. Cek tambahan: pintu kost terkunci sebelum telepon diangkat (dialog peringatan), dan pintu kamar mandi bisa dibuka/tutup.
- Memvalidasi state, fase cerita, nama ruang, pickup, physics gerak, dan fase lantai.
- Driver dev: `src/dev/autotest.js`, diaktifkan via `?autotest=ch1`; hook DEV `window.__ambacong` di `main.js`.

Tiga bug nyata ditemukan dan diperbaiki oleh runtime test: `raycaster.camera` tidak diset (Sprite.raycast crash), `pickKey` membaca `item.userData.itemId` yang salah (harus `item.data.itemId`), dan offset aimed test pada item kecil.

Perintah: `npm test`, `npm run test:runtime`, `npm run lint`, `npm run format:check`, `npm run build`.

## Langkah Berikutnya

1. Health system + mekanik ketahuan (hipotesis: kejar penuh saat tertangkap).
2. Pathfinding untuk pocong dan perilaku pintu.
3. Audio langkah, ambience, suara pocong yang lebih kaya.
4. Aset final menggantikan placeholder dan prerender prolog.
5. Chapter 2 dan polish performa (code-splitting chunk > 500 kB).

## Polish Terbaru (12 Agustus 2026 — sesi ini)

- **Grafik HD**: renderer beralih ke `MeshStandardMaterial` + ACES Filmic tone mapping, exposure 1.15, shadow map PCF soft (bulan + senter). Tekstur prosedural canvas untuk lantai (ubin), dinding, plafon, aspal, dan beton.
- **Map tidak lagi spoiler**: marker item (kunci) dan posisi pocong dihapus dari peta; hanya ruang aktif + pintu keluar yang tampil. Legenda ikut diperbaiki.
- **Prompt item wajib**: pintu keluar punya `requires: key-janitor`; prompt interaksi menampilkan "— Butuh: Kunci Janitor" jika item belum ada. Dialog kunci pintu ikut disebutkan nama itemnya.
- **Nama area tidak ditampilkan**: label ruangan (sprite 3D di kamar kost & rumah sakit) dan teks area di HUD dihapus total — tidak lagi mengganggu pandangan. Nama ruang tetap terlihat di peta.
- **Lighting per lokasi**: empat lampu langit-langit hangat selalu menyala di kamar tidur, ruang TV, dapur, dan kamar mandi; rumah sakit tetap gelap dan butuh senter.
- **Bug senter diperbaiki**: intensity senter selalu 0 sehingga cahaya senter tidak pernah tampil; kini nyala 2.4 saat `F` aktif.
- **Detail kamar kost**: kursi diperbaiki arahnya (sebelumnya `rotationY=Math.PI`, backrest menempel meja), meja diberi kaki (sebelumnya mengambang), telepon dipindah ke atas meja (sebelumnya menggantung di tepi meja).

## Toast "Objektif Baru": banner muncul saat objektif berubah (pocong bangun, ganti lantai, dsb.), faded setelah 4.2 detik.
- **Vignette**: lapisan radial-gradient gelap di tepi layar untuk atmosfer horror.
- **Lampu kost permanen**: setiap ruangan memiliki fitting, bohlam emissive, dan point light sendiri. Lampu selalu menyala selama pemain berada di kost; saklar dan state save lampu dihapus.
- **Kamar mandi & dapur di kost**: kost dibagi jadi kamar + kamar mandi (barat utara: kloset, wastafel) + dapur (barat selatan: meja masak, kompor, kulkas, rak bumbu) dengan dinding partisi berdinding pintu masuk tiap ruang. Ranjang dipindah ke sisi timur.

## Update Terbaru (12 Agustus 2026 — sesi ini)

- **Gerbang telepon (wajib dulu)**: pemain tidak bisa keluar kost sebelum mengangkat telepon Raka. Prompt/pintu keluar ("Pergi ke rumah sakit") baru muncul setelah dialog telepon selesai (`phone-answered`); jika `E` ditekan lebih dulu muncul dialog "Teleponmu masih berdering..." dan fase tidak berubah.
- **Pintu kamar mandi bisa dibuka**: pintu kamar mandi kini interaktif (`E` toggle buka/tutup, prompt dinamis "Buka/Tutup pintu kamar mandi"). Engsel di tepi ambang; saat terbuka panel menywing masuk ke dalam kamar mandi dan collider AABB dibangun ulang (`buildColliders`) sehingga ruangan bisa dimasuki. State pintu tersimpan di save (`openedDoors`) dan disinkron ulang saat load.
- **Senter lebih terang**: intensity 2.4 → 3.2, jarak cahaya 42 → 52 satuan.
- **Runtime test diperluas**: 31 → 36 cek (tutup pintu kost sebelum telepon, dismiss dialog terkunci, buka/tutup pintu kamar mandi). Semua lolos: 36/36.
- **Muka pocong pakai `assets/ambacong.png`**: tekstur muka kini benar-benar termuat — sebelumnya URL string `/assets/ambacong.png` (404, `public/` kosong sehingga tekstur gagal load). Fix: import aset lewat Vite (`import ambacongFaceUrl from '../assets/ambacong.png'`) lalu diteruskan ke `createPocong`. Plane muka diberi `side: DoubleSide` + `scale.z = -1` agar tampil dari arah hadap pocong tanpa mirror; gambar menu juga diarahkan ke src relatif supaya ikut dibundel Vite.
- **Pocong loncat-loncat**: gerak hop diganti dari bob halus (amplitudo 0.16) menjadi loncatan nyata — siklus `(1-cos θ)/2` dengan amplitudo 0.6 (chase) / 0.45 (patrol), frekuensi hop 2.6/s saat mengejar. Ditambah squash-and-stretch vertikal (body memanjang di puncak, mengecil di lantai) supaya kesan "melompat mirip pocong" lebih hidup. `groundReset` ikut mereset skala.
- **Semua SFX terpakai (3/3) memang direferensikan** — tapi ternyata tidak pernah berbunyi: path `/assets/audio/...` root-absolute 404 (public/ kosong), error ditelan `.catch`. Fix: seluruh audio (3 SFX + BGM) di-import via Vite di `audio-system.js` (`ambil-barang.wav`→pickup, `buka-inventori.wav`→inventory, `suara-hantu-dekat.wav`→ghostNear loop, `backsound-game.wav`→bgm) sehingga ikut ter-bundle.
- **Catatan kinerja**: `backsound-game.wav` berukuran 98.9 MB (PCM 24-bit 48kHz, tidak terkompresi) → bikin bundle dist ~100 MB. Perlu dikonversi ke format terkompresi (ogg/mp3/opus) di langkah polish kedepan.

## Konversi Audio Terkompresi (12 Agustus 2026 — sesi ini)

- `backsound-game.wav` 98.9 MB (PCM 24-bit) → **`backsound-game.ogg` 5.5 MB** (Vorbis q5), durasi 360s dipertahankan (audio-system.js import `.ogg`).
- `suara-hantu-dekat.wav` 2.1 MB → **`suara-hantu-dekat.ogg` 74 KB** (Vorbis q4) — turun ~28×.
- File `.wav` lama dihapus; dua SFX kecil tetap `.wav` (13.8 KB dan 32.2 KB, tidak signifikan).
- Bundle dist turun dari ~100 MB jadi **~5.8 MB** audio. Semua cek lolos: lint, unit 14/14, runtime 36/36.

## Tata Ruang Kost Baru: Kamar Tidur + Ruang Tamu (12 Agustus 2026 — sesi ini)

- **Kamar mandi & dapur terpisah lebih tegas**: divider ditebalkan (0.3) + frame pintu (header & jamb) tiap entri; entri kamar mandi dilebarin 1.5, entri dapur dilebarin 2.0. Toilet (pedestal, tank, seat ring, flush) & wastafel (kolom, basin, faucet, cermin glass) dibangun ulang dengan material `porcelain`.
- **Kamar khusus player (kamar tidur)** di sisi timur-utara: kasur, **lemari** (carcass + 2 pintu + gagang), meja belajar, kursi kantor, komputer desktop, dan telepon.
- **Ruang tamu** di sisi timur-selatan: **sofa 3 dudukan + backrest + armrest**, meja TV, dan **TV yang bisa ON/OFF** (`E`; prompt dinamis "Nyalakan/Matikan TV") — layar menyala emissive biru + glow light saat on, mati hitam saat off. State TV ikut tersimpan di save.
- Pembatas kamar tidur/ruang tamu di z=-1.5 dengan bukaan pintu ber-frame (x 1.8..3.4). Aliran: kamar tidur → ruang tamu → (timur) TV & sofa, (barat) dapur; kamar mandi tetap di barat-utara.
- Runtime suite kini berisi **36 cek** setelah interaksi saklar lampu dihapus. Unit 16/16 dan lint tetap lolos.

## Environment Luar Rumah Sakit & Model Pocong Baru (13 Agustus 2026 — sesi ini)

- **Model Pocong dengan Mata Merah Menyala**: tekstur wajah dari `assets/ambacong.png` kini dilengkapi dengan mata merah emissive (intensity 2.5) + point lights merah di posisi mata untuk efek glow yang lebih nyata dan menakutkan.
- **Area Courtyard Diperkaya**: halaman rumah sakit kini memiliki 3 patch tanah dengan rumput-rumput kecil acak yang tersebar, menciptakan suasana luar yang lebih natural dan realistis.
- **6 Pohon dengan Variasi**: pohon-pohon (batang kayu + 3 layer foliage hijau gelap) ditanam di sekitar courtyard dengan ukuran bervariasi (scale 0.85–1.2) untuk variasi visual dan kedalaman scene.
- **Pagar Interaktif di Jalan Utama**: pagar kayu dengan posts, horizontal rails, dan wire mesh dipasang di depan rumah sakit. Saat pemain mendekati dan berinteraksi (`E`), muncul dialog "Jalan masuknya sudah ditutup nih, aku harus cari jalan lain" dan objektif berubah menjadi "Cari jalan masuk lain. Periksa pintu samping rumah sakit."
- **Trigger Event Gate-Checked**: interaksi pagar hanya terjadi sekali per playthrough; event `gate-checked` dicatat di save untuk mencegah dialog berulang.
- Semua test lolos: lint, unit 16/16, build berhasil (bundle 606 KB).

## Audio Baru & Environment Expansion (13 Agustus 2026 — sesi berikutnya)

- **Audio Files Baru Terimplementasi**: 3 sound effect baru ditambahkan ke `assets/audio/sfx/`:
  - `langkah-hantu.wav` (17.5 KB) — suara langkah pocong saat hop, volume based distance (max 25 unit range)
  - `telpon-bunyi.ogg` (18 KB, compressed dari 992 KB wav) — ring tone telepon di prologue, loop saat fase laptop
  - `suara-angkat-telpon.wav` (27.4 KB) — sound effect saat player angkat telepon
- **Phone Interaction Enhanced**: telepon ring loop mulai setelah baca news, stop + play pickup sound saat angkat. Audio system diperluas untuk handle 3 sound baru (phoneRing set loop true).
- **Ghost Step Sound**: pocong sekarang play step sound setiap hop cycle (callback `onStep`), volume berkurang sesuai jarak player (fade dari 25 unit).
- **Courtyard Dramatically Expanded**: 13 pohon hidup + 3 dead/bare trees (no foliage) tersebar di halaman. Tanah diperluas 5 patch ground untuk forest feel yang lebih natural.
- **Building Horror Details**: 
  - 4 boarded windows (papan diagonal di window facade)
  - 3 blood stain di dinding luar rumah sakit
  - Helper functions: `createBoardedWindow`, `createBloodStain`
- **Struktur Audio Dirapikan**: semua SFX dipindah ke `assets/audio/sfx/`, music di `assets/audio/music/`.
- Lint pass, build 607.5 KB bundle, audio total ~6.9 MB (compressed).

## Gameplay Balance & Objective Gating (13 Agustus 2026 — sesi lanjut)

- **Pocong Chase Speed Tuning**: 4.4 → 3.8 (lebih lambat dari player sprint 6.4, player bisa kabur lebih mudah)
- **Flashlight Drain Slower**: 2.4%/s → 1.2%/s (battery awet ~83 detik vs ~42 detik sebelumnya)
- **Hospital Lighting Brighter**: 
  - Koridor: 1.4 → 2.2 intensity
  - Side rooms: 2.0 → 2.8 intensity
  - Tunggu/lobby: 1.6 → 2.4 intensity
  - Ruangan tidak terlalu gelap, player bisa navigasi lebih nyaman
- **Objective Gating Strict**: 
  - Telepon tidak bisa diinteraksi sebelum baca news (fase wake)
  - Pintu kost terkunci sampai telepon diangkat
  - Pagar tidak bisa diperiksa sampai fase outside
  - Pintu samping tidak muncul prompt sebelum pagar diperiksa (`gate-checked`)
  - Prompt hilang total untuk interaksi prematur (tidak ada hint)
- Semua perubahan tested: lint pass, build 607.6 KB.

## F1 Pendengaran & Investigasi Pocong (5 November 2026)

- **Noise system** (`src/systems/noise-system.js`): radius suara pemain — crouch 1.5, jalan 5, sprint 10, diam/sembunyi 0. Aksi juga bersuara: ambil item 4, masuk tempat sembunyi 6. Dinding di antara sumber dan pocong memotong radius jadi setengah.
- **Penglihatan dipisah dari pendengaran**: `canSee()` kini murni visual (cone 58° + line of sight + jarak). Jalan pintas lama dihapus (sprint ≤ 9 atau crouch < 4 langsung terdeteksi).
- **State `investigate`**: pocong yang mendengar suara datang ke sumbernya (2.4/s), menengok kiri-kanan, lalu kembali patrol setelah ±9 detik. Chase hanya terjadi kalau pemain terlihat. Saat chase, suara pemain tetap memperpanjang pengejaran.
- **Fix sembunyi saat dikejar**: dulu pocong berdiri di depan loker tanpa batas waktu. Sekarang ia langsung masuk `lost`, mencari di posisi terakhir, lalu pergi.
- Hook DEV baru: `window.__ambacong.pocongState()`.
- Verifikasi: unit 22/22 (6 test baru), lint lolos, build lolos, runtime 36/36.

## V1 Kualitas Visual 3D (5 November 2026)

- **Post-processing** (`src/systems/post-processing.js`, addon bawaan `three`): bloom untuk neon, bohlam, dan mata pocong; film grain bergerak; chromatic aberration tipis di tepi layar; color grading dingin (saturasi 85%, bayangan kebiruan). Anti-aliasing pindah ke MSAA 4× di render target.
- **Fix tekstur tertarik**: semua dinding/lantai memakai satu `BoxGeometry` 1×1×1 yang di-scale, jadi tekstur ikut melar (garis horizontal di dinding). Sekarang material bertekstur memakai geometri dengan UV dalam meter (`worldUvGeometry`, di-cache per ukuran), sehingga skala tekstur sama di semua permukaan.
- **Tekstur prosedural baru** (1024px untuk dinding/lantai): dinding dengan bercak, rembesan air vertikal, dan cat mengelupas; lantai ubin dengan variasi warna per ubin, noda, retak, dan nat; plafon berpanel. Semua material bertekstur memakai bump map dari tekstur yang sama.
- **Fix lantai hitam**: warna material gelap dikali tekstur gelap membuat lantai nyaris hitam walau disenter. Nada sekarang diatur dari tekstur.
- **Lampu kost** lebih terang dan hangat (intensitas ~2×, jangkauan 10–11). Exposure 1.15 → 1.3.
- **Preset kualitas**: renderer software otomatis memakai preset ringan (tanpa bloom, MSAA, dan shadow). Override lewat URL: `?quality=high` atau `?quality=low`.
- Bundle JS 608 → 632 KB. Verifikasi: unit 22/22, lint lolos, build lolos, runtime 36/36.

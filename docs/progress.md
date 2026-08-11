# Progres Pengembangan Ambacong

Snapshot: 11 Agustus 2026. Status saat ini: **prototype gameplay graybox sudah dapat dimainkan; vertical slice Chapter 1 belum selesai**.

## Alur yang Sudah Bisa Dimainkan

1. Pemain masuk ke arena first-person.
2. Pemain mencari dan mengambil kunci.
3. Pocong muncul lalu mengejar pemain.
4. Pemain membuka pintu keluar untuk menyelesaikan demo.
5. Jika tertangkap, layar Game Over muncul dan permainan dapat diulang.

## Fitur yang Sudah Ada

- Arena graybox 3D dengan lantai, dinding, fog, dan pencahayaan dasar.
- Kamera first-person dengan mouse look dan pointer lock.
- Gerak `WASD` dengan kecepatan diagonal yang dinormalisasi.
- Sprint memakai `Shift`, lengkap dengan stamina, drain, recovery, dan kondisi lelah.
- Interaksi berbasis crosshair dan raycast memakai `E`.
- Urutan progres kunci lalu pintu; pintu tetap terkunci tanpa kunci.
- Pocong placeholder muncul setelah kunci diambil, mengejar pemain, dan memicu Game Over.
- Senter memakai `F`, mengarah tepat ke crosshair, memiliki baterai, dan mati saat baterai habis.
- HUD teks untuk objektif, prompt interaksi, baterai senter, dan stamina.
- Tampilan menyesuaikan ukuran jendela.

## Kontrol

| Input | Fungsi |
| --- | --- |
| Klik tombol mulai | Masuk ke permainan |
| Mouse | Melihat sekeliling |
| `WASD` | Bergerak |
| `Shift` | Sprint |
| `E` | Mengambil kunci atau membuka pintu |
| `F` | Menyalakan atau mematikan senter |
| `Esc` | Melepas pointer lock |

## Status per Fase

| Fase | Status | Cakupan saat ini |
| --- | --- | --- |
| Setup dan pondasi | Sebagian | Vite, Three.js, render loop, lint, format, dan build tersedia. Belum ada `SceneManager`, `EventBus`, atau state machine umum. |
| Player dan environment | Sebagian | First-person, graybox, batas arena, dan sprint tersedia. Belum ada crouch, head bob, atau collision objek berbasis raycast/AABB. |
| Core mechanics dan HUD | Sebagian | Interaksi, stamina, senter, baterai, objektif, dan prompt tersedia. Belum ada health, inventory umum, atau battery pickup. |
| AI dan audio | Awal | Pocong hanya mengejar langsung dan menangkap pemain. Patrol, deteksi, pathfinding, hiding, dan audio belum ada. |
| Save dan level loading | Belum dimulai | IndexedDB, auto-save, model rumah sakit, dan loading level belum dibuat. |
| Konten dan polish | Awal | Loop kunci-pintu, start screen, Game Over, dan fog dasar tersedia. Puzzle penuh, jumpscare, pause, aset final, serta tuning performa belum ada. |

## Verifikasi Otomatis

Enam unit test melindungi logika berikut:

- Urutan kunci sebelum pintu.
- Gerak diagonal tetap konsisten.
- Stamina tidak keluar dari rentang 0–100.
- Pocong tidak melewati posisi target saat mengejar.
- Arah senter mengikuti titik tengah kamera.
- Baterai senter berhenti pada nol.

Pemeriksaan proyek tersedia melalui `npm test`, `npm run lint`, `npm run format:check`, dan `npm run build`. Pengujian browser end-to-end belum tersedia.

## Langkah Berikutnya

Prioritas berikutnya: **collision dinding/objek minimal berbasis raycast atau AABB**. Ini menutup kekurangan utama controller sebelum arena diubah menjadi lorong rumah sakit dan AI diberi patrol/pathfinding.

Setelah collision stabil:

1. Bentuk graybox lorong Chapter 1.
2. Tambahkan patrol dan deteksi sederhana untuk pocong.
3. Tambahkan audio langkah, ambience, dan suara pocong.
4. Ganti placeholder dengan aset level serta model final.
5. Tambahkan save setelah alur Chapter 1 sudah stabil.

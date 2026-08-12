# Progres Pengembangan Ambacong

Snapshot: 12 Agustus 2026. Status saat ini: **vertical slice Chapter 1 lengkap dan lolos verifikasi otomatis browser end-to-end (31/31 cek)**.

## Alur yang Sudah Bisa Dimainkan

1. Pemain bangun di kamar kost, membaca berita horror di laptop, menerima telepon peringatan dari Raka.
2. Keluar kost dan berjalan ke Rumah Sakit Puri Jiwa; akses jalan utama ditutup, pemain masuk lewat celah pintu samping (interaksi `E`).
3. Jelajahi 2 lantai rumah sakit (17 ruang): lobby, tunggu, administrasi, periksa, janitor, bangsal, operasi, gudang, pintu keluar utama, tangga darurat, koridor, arsip, isolasi, perawatan A/B, tangga lantai 2.
4. Kumpulkan baterai senter dan kunci janitor (pocong bangun + mengejar setelah kunci diambil).
5. Naik ke lantai 2, ambil baterai kedua dan catatan medis, lalu turun lagi.
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

Runtime test browser end-to-end (`npm run test:runtime`, headless Chrome + SwiftShader, tanpa dependency tambahan) menjalankan 31 cek dari menu sampai Chapter Complete:

- Alur penuh: new game → prologue (lampu/saklar toggle, laptop/telepon) → keluar kost → halaman rumah sakit → masuk pintu samping → lobby → peta/inventory toggle → baterai 1 → kunci janitor (pocong bangun) → hide/keluar loker → naik lantai 2 → baterai 2 → turun lantai 1 → pintu keluar (butuh kunci) → Chapter Complete → kembali ke menu.
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
- **Lighting per lokasi**: kamar kost terang (lampu langit-langit hangat + ambient dinaikkan); rumah sakit gelap (ambient/moon diturunkan, neon flicker tetap, butuh senter).
- **Bug senter diperbaiki**: intensity senter selalu 0 sehingga cahaya senter tidak pernah tampil; kini nyala 2.4 saat `F` aktif.
- **Detail kamar kost**: kursi diperbaiki arahnya (sebelumnya `rotationY=Math.PI`, backrest menempel meja), meja diberi kaki (sebelumnya mengambang), telepon dipindah ke atas meja (sebelumnya menggantung di tepi meja).

## Toast "Objektif Baru": banner muncul saat objektif berubah (pocong bangun, ganti lantai, dsb.), faded setelah 4.2 detik.
- **Vignette**: lapisan radial-gradient gelap di tepi layar untuk atmosfer horror.
- **Saklar lampu kost + lampu langit-langit**: lampu kamar kost kini hidup lewat saklar di dinding dekat pintu (`E` untuk toggle; prompt dinamis "Nyalakan/Matikan lampu"). Di langit-langit ada fitting lampu kasat mata (kabel, tudung, bohlam) — bohlam menyala (emissive) dan cahaya menerangi seluruh ruangan saat saklar on. Awal game lampu mati (kost gelap, senter membantu), state lampu ikut tersimpan di save.
- **Kamar mandi & dapur di kost**: kost dibagi jadi kamar + kamar mandi (barat utara: kloset, wastafel) + dapur (barat selatan: meja masak, kompor, kulkas, rak bumbu) dengan dinding partisi berdinding pintu masuk tiap ruang. Ranjang dipindah ke sisi timur.
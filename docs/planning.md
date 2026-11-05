# Planning Pengembangan Ambacong

Dibuat: 5 November 2026. Dokumen ini adalah urutan kerja aktif. Roadmap jangka panjang tetap di [prd.md](prd.md) dan [brd.md](brd.md).

## Arah

**Bikin Chapter 1 benar-benar seram, lalu rilis demo web ke pemain sungguhan.** Chapter 2/3 dan migrasi ke game engine ditunda sampai demo terbukti diminati.

Alasannya: alur Chapter 1 sudah lengkap dan tertest (36 cek runtime), tapi loop ketegangannya masih datar. Pocong cuma melihat atau langsung mengejar, tertangkap langsung Game Over, dan audionya belum memberi arah. Satu chapter yang seram dan bisa dimainkan streamer lebih berharga daripada tiga chapter biasa.

## Cara Kerja

- Satu fitur = satu branch dari `main` terbaru (lihat [AGENTS.md](../AGENTS.md)).
- Agent tidak melakukan commit. Setelah fitur selesai dan lolos verifikasi, maintainer yang commit dan merge.
- Setelah fitur di-merge, centang statusnya di bawah dan catat ringkasannya di [progress.md](progress.md).

## Fase 1 — Loop Ketegangan Chapter 1

### F1. Pendengaran & investigasi pocong — `feature/pocong-hearing`

- [ ] Status

**Kondisi sekarang:** di [pocong.js](../src/entities/pocong.js) `canSee()`, pemain yang sprint dalam radius 9 atau crouch dalam radius 4 langsung memicu chase. Tidak ada tahap curiga.

**Cakupan:**
- Tingkat suara pemain: diam 0, jalan ~5, sprint ~10, crouch ~1.5 (sesuai PRD: crouch -70%).
- Suara dari aksi: buka/tutup pintu, ambil item.
- State baru `investigate`: pocong mendengar suara, lalu bergerak ke sumbernya, menengok sebentar, lalu kembali patrol. Chase hanya terjadi kalau pemain *terlihat* (cone + line of sight).
- Logika suara murni (radius dan atenuasi lewat dinding) diletakkan di modul tanpa Three.js supaya bisa di-unit test.

**Di luar cakupan:** pathfinding navmesh (dikerjakan nanti kalau pocong sering nyangkut).

**Selesai bila:**
- Unit test: crouch di jarak 3 tidak terdengar, sprint di jarak 8 terdengar, suara di balik dinding teredam.
- Main manual: jalan pelan melewati pocong yang membelakangi aman, sprint memancing dia datang.
- Runtime test 36/36 tetap lolos.

### F2. Health 3 HP & efek damage — `feature/health-system`

- [ ] Status

**Cakupan:**
- 3 HP (PRD). Saat tertangkap: -1 HP, layar memerah, kamera bergetar, pemain dipindah ke checkpoint lantai aktif (area tangga), pocong masuk state `lost`.
- 1 HP: vignette lebih gelap dan heartbeat. Heartbeat dibuat dengan Web Audio (oscillator) kalau aset belum ada.
- 0 HP: Game Over (layar yang sudah ada).
- HP masuk HUD dan save.

**Selesai bila:**
- Unit test: HP berkurang, minimal 0, Game Over di 0.
- Runtime test ditambah cek "tertangkap sekali, masih hidup".

### F3. Jumpscare tertangkap — `feature/jumpscare`

- [ ] Status

**Cakupan:**
- Saat tertangkap: kamera di-snap ke wajah pocong (~0,8 detik), SFX teriakan, lalu efek dari F2.
- Versi lebih panjang untuk hit terakhir sebelum Game Over.
- Scripted scare saat kunci diambil (pocong bangun) dibuat lebih tegas.

**Butuh aset:** SFX jumpscare/teriakan (`sfx-jumpscare.ogg`).

**Selesai bila:** jumpscare tidak bisa di-spam (ada cooldown), dan input terkunci selama animasi.

### F4. Audio posisional & ambience — `feature/positional-audio`

- [ ] Status

**Cakupan:**
- `AudioListener` di kamera. Langkah dan suara pocong memakai `THREE.PositionalAudio` supaya arah kiri/kanan dan depan/belakang terdengar.
- Ambience per lokasi: kost (hening, jam dinding), luar (angin, jangkrik), rumah sakit (dengung, tetesan air).
- Langkah kaki pemain: jalan, sprint, crouch dengan volume berbeda (selaras dengan F1).

**Butuh aset:** `ambient-hospital.ogg`, `ambient-outside.ogg`, `sfx-footstep-*.ogg`.

**Selesai bila:** dengan headphone, posisi pocong bisa ditebak tanpa melihat, dan total aset audio tetap di bawah budget di [rules.md](rules.md).

### F5. Puzzle fuse box — `feature/fuse-box-puzzle`

- [ ] Status

**Kondisi sekarang:** fuse box sudah ada di [chapter-one-assets.js](../src/chapter-one-assets.js) tapi hanya menampilkan catatan.

**Cakupan:**
- Item `fuse` disembunyikan di gudang.
- Pasang fuse ke fuse box: lampu lantai 1 menyala, dan pintu keluar butuh listrik plus kunci janitor.
- Lampu menyala menjadi momen pocong muncul di lantai 1 (sesuai PRD: "pocong muncul setelah listrik menyala").
- Objektif, dialog, dan autotest disesuaikan.

**Di luar cakupan:** panel kode dari dokumen medis (kandidat F5b kalau waktu masih ada).

**Selesai bila:** runtime test diperbarui untuk alur baru dan lolos semua.

### F6. Settings audio & brightness — `feature/settings`

- [ ] Status

**Cakupan:** slider Master/SFX/BGM dan brightness di menu pause dan menu utama, disimpan di localStorage. Ini penting untuk streamer yang perlu mengatur level audio.

## Fase 2 — Rilis Demo

### R1. Demo web di itch.io — `release/itch-demo`

- [ ] Status

**Cakupan:**
- `base: './'` di Vite supaya build jalan di subpath itch.io.
- Code-splitting untuk chunk > 500 kB.
- Layar Chapter Complete: link form feedback dan ajakan follow.
- Cek performa terhadap budget di [rules.md](rules.md).
- Bahan halaman itch: screenshot, GIF pendek, deskripsi singkat (Indonesia + Inggris).

**Selesai bila:** build ZIP bisa dimainkan dari itch.io (Chrome dan Firefox) dari menu sampai Chapter Complete.

Setelah rilis: kumpulkan feedback 1–2 minggu, lalu tentukan prioritas Fase 3 berdasarkan bagian yang membuat pemain takut dan bagian yang membuat mereka bosan.

## Fase 3 — Pondasi untuk Chapter 2

### P1. Data level keluar dari kode — `refactor/level-data`

- [ ] Status

Ruangan, item, spawn, patrol, dan dialog Chapter 1 dipindah ke modul data di `src/data/chapters/`. Builder geometri cukup membaca data tersebut. Target: Chapter 2 bisa dibuat dengan menulis data baru, bukan menyalin 1.600 baris kode.

### P2. Pecah `main.js` — `refactor/split-main`

- [ ] Status

[main.js](../src/main.js) (±1.240 baris) dipecah per scene (prolog, rumah sakit) dan per alur interaksi. Perilaku tidak berubah: runtime test harus lolos sebelum dan sesudah refactor.

### P3. Sinkronkan dokumen — `docs/sync-prd`

- [ ] Status

Alur Chapter 1 di [prd.md](prd.md) masih menyebut pemain "terbangun di rumah sakit", padahal yang dibuat adalah prolog kost dan telepon Raka. Struktur folder di [rules.md](rules.md) juga belum sama dengan kode.

## Ditunda

- Chapter 2 (Kuburan) dan Chapter 3 (Pedesaan): mulai setelah Fase 3.
- Migrasi ke Godot/Unity: hanya jika demo diminati dan target rilisnya Steam/konsol.
- Pathfinding navmesh: hanya jika F1 memperlihatkan pocong sering nyangkut.

## Keputusan yang Perlu dari Maintainer

1. **Aset audio** (jumpscare, ambience, langkah): dibuat atau dicari sendiri, atau sementara pakai placeholder sintetis Web Audio?
2. **Form feedback** untuk R1: Google Form, Tally, atau komentar itch.io saja?
3. **Urutan:** usulannya F1 → F2 → F3 → F4 → F5 → F6. F4 bisa didahulukan kalau aset audio sudah siap.

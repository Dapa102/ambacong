# Product Requirements Document (PRD) - Ambacong

## 1. Daftar Fitur (Prioritas MoSCoW)

### Must Have (MVP)
- **First-person movement**: Mendukung kontrol WASD dan mouse look.
- **Pocong AI**: State machine dasar (patrol, detect, chase).
- **3 Chapter Cerita**: Lingkungan yang progresif.
- **Flashlight dengan battery system**: Senter sebagai sumber cahaya yang bisa habis baterainya.
- **Stamina System**: Pemain hanya bisa berlari (sprint) dalam durasi terbatas.
- **Inventory System**: Slot terbatas (maksimal 6 item) untuk menyimpan kunci atau item puzzle.
- **Save/Load System**: Menggunakan IndexedDB, menyediakan 3 save slots.
- **Health System**: Pemain akan Game Over jika terkena serangan 3 kali.
- **Pause Menu & Settings**: Opsi dasar untuk melanjutkan, menyimpan, dan keluar.
- **Loading Screen**: Transisi antar chapter.

### Should Have
- **Jump Scares**: Event ter-script di titik-titik tertentu.
- **Environmental Storytelling**: Catatan, dokumen, atau petunjuk visual (clues).
- **Multiple Ending**: 2-3 variasi ending berdasarkan pilihan atau keberhasilan pemain.
- **Sound Settings**: Kontrol volume (Master, SFX, BGM).
- **Tutorial/Intro Chapter**: Bagian awal yang mengajarkan mekanik dasar.

### Could Have
- **Achievement System**: Pencapaian untuk aksi tertentu.
- **Collectibles**: Item rahasia yang tidak wajib diambil.
- **Accessibility Options**: Subtitle, penyesuaian brightness.
- **Statistics**: Mencatat waktu bermain dan persentase item ditemukan.

### Won't Have (MVP)
- Multiplayer / Co-op
- VR Support
- Mobile Support (touch controls)
- Level Editor

## 2. User Stories

1. Sebagai **pemain**, saya ingin **dapat bergerak dan melihat sekeliling dengan mulus**, sehingga **saya merasa immersif dalam dunia game**.
2. Sebagai **pemain**, saya ingin **menggunakan senter**, sehingga **saya bisa melihat di area yang gelap**.
3. Sebagai **pemain**, saya ingin **mengetahui sisa baterai senter**, sehingga **saya bisa mengatur penggunaannya**.
4. Sebagai **pemain**, saya ingin **bisa bersembunyi**, sehingga **saya dapat menghindari kejaran pocong**.
5. Sebagai **pemain**, saya ingin **mengumpulkan item (kunci/clue)**, sehingga **saya bisa menyelesaikan puzzle dan membuka area baru**.
6. Sebagai **pemain**, saya ingin **menyimpan progres permainan**, sehingga **saya tidak perlu mengulang dari awal saat bermain lagi**.
7. Sebagai **pemain**, saya ingin **mendengar efek suara langkah atau rintihan pocong**, sehingga **saya bisa mendeteksi kehadirannya dari kejauhan**.
8. Sebagai **pemain**, saya ingin **mengetahui seberapa banyak stamina yang tersisa**, sehingga **saya tahu kapan harus berlari atau berjalan**.
9. Sebagai **pemain**, saya ingin **mengakses menu pause**, sehingga **saya bisa mengubah pengaturan suara atau keluar dari game kapan saja**.
10. Sebagai **pemain**, saya ingin **membaca catatan-catatan yang tersebar**, sehingga **saya bisa memahami cerita latar (lore) dari game ini**.

## 3. Detail Mekanik Gameplay

### Movement & Controls
- WASD untuk bergerak, Shift untuk berlari (sprint), Ctrl untuk menunduk (crouch)
- Mouse untuk mengarahkan pandangan
- E untuk interaksi dengan objek
- F untuk menyalakan/mematikan senter
- Tab untuk membuka inventory

### Flashlight Mechanics
- Battery drain rate konstan saat senter menyala
- Pemain dapat menemukan baterai tambahan sebagai loot
- Pocong akan lebih cepat mendeteksi pemain (sight range meningkat) jika senter diarahkan langsung ke mereka
- Senter berkedip (flicker) saat baterai hampir habis (di bawah 15%)
- Tanpa senter, visibility pemain sangat terbatas (hanya ambient light)

### Stealth & Detection
- Pocong memiliki radius penglihatan (sight range) berbentuk cone dan radius pendengaran (sound radius)
- Berlari menghasilkan suara lebih keras daripada berjalan atau menunduk
- Hiding spots (misal: kolong tempat tidur, lemari, semak-semak) membuat pemain tidak terdeteksi
- Crouch mengurangi sound radius pemain sebesar 70%
- Senter menyala meningkatkan kemungkinan deteksi visual

### Puzzle Design per Chapter
- **Chapter 1**: Mencari fuse box untuk menghidupkan listrik, menemukan kunci ruangan janitor, memasukkan kode dari dokumen medis
- **Chapter 2**: Menemukan 4 pusaka di nisan tertentu berdasarkan petunjuk jurnal, menyusun simbol di gerbang
- **Chapter 3**: Mengumpulkan bahan sesajen (kemenyan, bunga, kain putih), mencocokkan simbol ritual di 4 titik desa

### Combat/Survival
- **Tidak ada senjata** — pemain bertahan hidup melalui menghindar (evasion) dan bersembunyi (stealth)
- Jika tertangkap pocong, pemain kehilangan 1 HP dan di-teleport ke posisi aman terdekat
- Saat health rendah (1 HP), efek visual berubah (layar lebih gelap, heartbeat terdengar)

### Inventory Management
- Grid/slot system, pemain hanya bisa membawa 6 item
- Jika penuh, pemain harus menukar atau membuang item
- Item quest tidak bisa dibuang
- Item consumable (baterai, perban) bisa digunakan langsung dari inventory

### Health & Damage System
- Pemain memiliki 3 Health Points (HP)
- Saat ditangkap/diserang pocong, pemain kehilangan 1 HP
- Efek damage: layar memudar merah, camera shake, heartbeat SFX
- 3 hit = Game Over (cutscene pocong jumpscare)
- Tidak ada regenerasi HP otomatis (hanya via item perban — jika ditemukan)

## 4. Breakdown per Chapter

### Chapter 1: Rumah Sakit Tua
- **Lokasi**: Lorong dan bangsal rumah sakit terbengkalai
- **Cerita**: Pemain terbangun di rumah sakit tua yang sudah ditinggalkan. Tidak ingat bagaimana bisa sampai di sana. Harus mencari jalan keluar.
- **Objectives**: Menghidupkan listrik lantai dasar, membuka pintu keluar utama
- **Puzzle**: Mencari fuse box, menemukan kunci ruangan janitor, memasukkan kode dari dokumen yang tersebar
- **Encounter**: Perkenalan pertama dengan pocong (tutorial stealth), pocong muncul setelah listrik menyala
- **Items**: Senter, baterai x2, kunci janitor, fuse, dokumen kode, perban
- **Estimated Playtime**: 15-20 menit

### Chapter 2: Kuburan
- **Lokasi**: Area pemakaman umum yang luas (open area) dengan pohon-pohon besar
- **Cerita**: Setelah keluar dari rumah sakit, pemain menemukan diri di kuburan tua. Gerbang keluar terkunci dengan segel mistis.
- **Objectives**: Menemukan 4 pusaka yang tersebar di kuburan tertentu untuk membuka gerbang
- **Puzzle**: Mencari nisan dengan nama tertentu berdasarkan petunjuk di jurnal, menyusun pusaka di altar
- **Encounter**: Multiple pocong yang berpatroli, membutuhkan manajemen stamina dan stealth yang baik
- **Items**: Baterai x3, jurnal petunjuk, 4 pusaka, perban
- **Estimated Playtime**: 20-25 menit

### Chapter 3: Pedesaan
- **Lokasi**: Desa sunyi dengan rumah-rumah tradisional
- **Cerita**: Pemain sampai di desa yang ditinggalkan penduduknya. Di ujung desa ada rumah dukun yang konon bisa menghentikan kutukan pocong.
- **Objectives**: Mencapai rumah dukun di ujung desa untuk melakukan ritual pengusiran
- **Puzzle**: Mencocokkan simbol-simbol ritual di 4 titik desa, mengumpulkan bahan sesajen
- **Encounter**: Boss pocong (lebih agresif, lebih cepat, teleportasi jarak dekat, lebih sensitif terhadap cahaya/suara)
- **Items**: Baterai x3, bahan sesajen (kemenyan, bunga, kain putih, air suci), catatan ritual
- **Estimated Playtime**: 25-30 menit

## 5. Persyaratan Non-Fungsional

| Aspek | Requirement |
|-------|-------------|
| Performance | Target 60 FPS pada spesifikasi mid-range device |
| Loading Time | Maksimal 10 detik per pergantian chapter atau initial load |
| Browser Support | Chrome 90+, Firefox 88+, Edge 90+ |
| Memory | Penggunaan RAM di bawah 512MB |
| Storage | Total ukuran assets di bawah 100MB |
| Responsiveness | Input latency < 16ms |
| Accessibility | Pointer Lock API, fullscreen mode |
| Save Data | Persistent via IndexedDB, 3 save slots |

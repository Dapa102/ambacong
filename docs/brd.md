# Business Requirements Document (BRD) - Ambacong

## 1. Ringkasan Proyek
Ambacong adalah game horror 3D first-person berbasis web browser yang mengangkat tema folklore dan urban legend Indonesia, dengan pocong sebagai ancaman utama. Game ini menggabungkan elemen survival, exploration, dan puzzle dalam suasana yang mencekam.

## 2. Latar Belakang
Terdapat kekurangan game horror bertema Indonesia yang berkualitas di platform web browser. Game dengan tema lokal seringkali hanya tersedia di platform PC (Steam) atau mobile, sehingga ada peluang pasar yang besar untuk game indie horror yang mudah diakses (tanpa instalasi) langsung melalui browser.

## 3. Target Audiens
- Penggemar genre horror (usia 17+)
- Gamer asal Indonesia yang mencari game dengan tema lokal
- Penggemar folklore dan urban legend
- Casual browser gamers yang mencari pengalaman bermain yang singkat namun berkesan

## 4. Tujuan Bisnis
- **Portfolio Showcase**: Menunjukkan kemampuan teknis dalam pengembangan game 3D berbasis web (Three.js).
- **Building Community**: Membangun komunitas pemain dan penggemar game indie lokal.
- **Potensi Monetisasi**: Membuka peluang pendapatan melalui iklan (ads), penjualan chapter premium (DLC), atau merchandise di masa depan.

## 5. Metrik Keberhasilan
- Jumlah pemain unik (Unique Players) dan Daily Active Users (DAU).
- Rata-rata waktu bermain per sesi (Average Session Duration).
- Tingkat penyelesaian game (Completion Rate).
- Rating, ulasan, dan feedback dari pemain.
- Tingkat penyebaran (share/viralitas) di media sosial.

## 6. Ruang Lingkup MVP (Vertical Slice)
- Terdiri dari Chapter 1 (Rumah Sakit Tua) sebagai playable demo.
- Mode Singleplayer only.
- Basic save system menggunakan IndexedDB.
- Core horror mechanics: movement, flashlight, stealth, dan inventory sederhana.
- Rilis awal untuk platform Desktop browser.

## 7. Ruang Lingkup Pengembangan Lanjut
- Chapter 2 (Kuburan) dan Chapter 3 (Pedesaan) untuk rilis v1.0.
- Penambahan chapter baru atau DLC.
- Mode Endless atau Time Attack.
- Sistem Achievement dan Leaderboard.
- Porting ke perangkat Mobile (Touch Controls).
- Lokalisasi bahasa lain (English).
- **Migrasi ke Game Engine (Unity/Godot)** untuk rilis native PC/Konsol (Detail lihat `next_development.md`).

## 8. Batasan & Risiko
- **Limitasi Browser**: Keterbatasan dalam penggunaan Memory dan GPU rendering dibandingkan dengan native app.
- **Tim**: Pengembangan dilakukan oleh tim kecil atau solo developer, sehingga resource terbatas.
- **Timeline**: Risiko keterlambatan rilis karena kompleksitas 3D web development.

## 9. Analisis Kompetitor
- **Slenderman Browser Games**: Mekanik serupa, namun Ambacong menawarkan tema lokal yang unik.
- **SCP Games**: Fokus pada lore dan eksplorasi, Ambacong akan lebih fokus pada survival dan puzzle.
- **Game Horror Indonesia Lainnya (seperti DreadOut atau Pamali)**: Ambacong memiliki keunggulan berupa aksesibilitas langsung di browser tanpa instalasi.

## 10. Model Monetisasi
- **Fase Awal (Vertical Slice)**: Sepenuhnya gratis (Free-to-Play) untuk membangun basis pemain.
- **Fase Monetisasi**: Implementasi iklan yang tidak mengganggu, donasi, atau akses berbayar untuk premium chapter/konten kosmetik.

## 11. Timeline Rencana
- **Fase Vertical Slice (3 Bulan)**: Core gameplay, AI pocong, level design Chapter 1, dan basic UI.
- **Fase Konten v1.0**: Chapter 2, Chapter 3, multiple pocong, boss, dan ending.
- **Fase Polish (1 Bulan)**: Audio balancing, bug fixing, optimasi performa, dan visual enhancement.
- **Fase Launch & Feedback (1 Bulan)**: Rilis versi 1.0, marketing, dan iterasi berdasarkan feedback pemain.

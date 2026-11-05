# Perencanaan Migrasi ke Game Engine (Fase Masa Depan)

Dokumen ini merangkum kebutuhan dan transisi jika Ambacong dipindahkan dari Web Browser (Three.js) ke Dedicated Game Engine (Unity, Unreal Engine, atau Godot) di masa depan.

**Penting:** Saat ini, fokus utama adalah vertical slice Chapter 1 berbasis Web Browser. Dokumen ini hanya sebagai pedoman arsitektur agar perpindahan nantinya lebih mudah.

## 1. Kenapa Migrasi ke Engine?
- **Performa Visual**: Dukungan lighting realistis (Global Illumination, Raytracing).
- **Audio Lanjutan**: Reverb, occlusion (suara teredam tembok), dan integrasi middleware (FMOD/Wwise).
- **Physics Engine**: Ragdoll, soft-body physics, deteksi benturan (collision) yang lebih presisi.
- **Rilis Multi-Platform**: Memudahkan rilis ke Steam (PC), PlayStation, Xbox, atau Android/iOS native.

## 2. Pilihan Game Engine
- **Godot Engine**: Paling mirip filosofinya dengan web (node-based). Ringan, open-source. Sangat direkomendasikan jika ingin migrasi bertahap.
- **Unity**: Komunitas besar, banyak aset horor di Asset Store, cocok untuk 3D indie.
- **Unreal Engine 5**: Jika target akhirnya adalah grafis AAA (Nanite & Lumen). Terlalu berat untuk low-poly, kecuali mengubah art direction.

## 3. Apa Saja yang Harus Disiapkan (Dari Sekarang)?

Meskipun kita membuat versi Web, ada beberapa hal yang harus dilakukan agar migrasinya gampang:

### A. Pemisahan Logika (Decoupling)
Pisahkan *Game Logic* (Aturan) dari *Renderer* (Tampilan).
- **Baik**: `if (pocong.isNear(player)) { eventBus.emit('jumpscare') }`
- **Buruk**: `if (pocong.mesh.position.distanceTo(camera.position) < 2) { showJumpscare() }`
*Alasan: Saat pindah ke Unity, kita tinggal mengganti komponen Renderer, sementara state machine (otak) game tetap punya alur pikir yang sama.*

### B. Standardisasi Format Aset
- **3D Model**: Selalu gunakan format `.glb` / `.gltf` atau `.fbx` source-nya.
- **Tekstur**: Simpan *source file* resolusi tinggi (4K/2K) di luar repository web (di cloud/drive). Versi web di-downscale ke 1K. Nanti saat masuk Unity, kita pakai resolusi tinggi.
- **Audio**: Simpan *source* berformat `.wav` tanpa kompresi. (Versi web pakai `.ogg` yang sudah dikompres).

### C. Data Eksternal (JSON)
Semua konfigurasi level, posisi spawn, dan dialog harus berbasis file JSON murni.
*Alasan: Unity, Unreal, dan Godot semuanya bisa membaca JSON. Jadi kita tidak perlu menyusun ulang posisi musuh di map dari awal.*

## 4. Tantangan Migrasi Nantinya
1. **Scripting Ulang**: Semua JavaScript harus ditulis ulang (C# untuk Unity, GDScript untuk Godot, C++ untuk Unreal).
2. **Material Setup**: Material Three.js harus di-setting ulang menggunakan shader bawaan engine tersebut.
3. **Save System**: Ganti IndexedDB dengan native File I/O bawaan OS.

## 5. Kesimpulan
Selama struktur kode kita rapi (mengikuti `architecture.md` dengan Event Bus dan State Machine), proses migrasi logika tidak akan mengulang dari nol, melainkan hanya translasi sintaks bahasa pemrograman.

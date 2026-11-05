# AGENTS.md

Aturan untuk AI agent (Claude Code, Cursor, dll) yang bekerja di repo Ambacong.

## Konteks

- Game horror first-person berbasis browser: Three.js + Vite, vanilla JS, tanpa framework UI.
- Urutan kerja aktif ada di [docs/planning.md](docs/planning.md). Kerjakan fitur sesuai urutan di sana kecuali maintainer meminta lain.
- Konvensi kode, penamaan, dan performance budget ada di [docs/rules.md](docs/rules.md). Prinsip kerja ada di `.cursor/rules/`.

## Branch

- **Setiap fitur dikerjakan di branch baru** yang dibuat dari `main` terbaru, dengan nama sesuai planning: `feature/*`, `bugfix/*`, `refactor/*`, `docs/*`, `release/*`.
- Sebelum membuat branch, cek `git status`. Kalau masih ada perubahan dari fitur sebelumnya yang belum di-commit, **berhenti dan tanya maintainer**. Jangan membawa perubahan lama ke branch baru.
- Satu branch untuk satu fitur. Jangan mencampur fitur lain atau refactor yang tidak diminta.

## Commit — Dilakukan Maintainer

- **Agent tidak boleh `git commit`, `git push`, merge, atau rebase.** Maintainer yang commit sendiri.
- Agent boleh: membuat dan pindah branch, `git status`, `git diff`, `git log`.
- Jangan `git add` kecuali diminta.
- **Setiap kali selesai membuat perubahan file**, sekecil apa pun (termasuk perbaikan kecil, revisi, atau dokumen), akhiri balasan dengan perintah git siap jalan (`git add <file spesifik>` + `git commit -m "<Conventional Commits>"`), tanpa penjelasan tambahan. Hanya tambahkan file milik perubahan itu. Jangan pakai `git add .` atau `-A`. Kalau perubahannya mencakup beberapa hal yang berbeda, beri satu blok perintah per commit.

## Setiap Perubahan Selesai

Sebelum menyatakan selesai, jalankan verifikasi:

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run test:runtime   # jika perubahan menyentuh gameplay, interaksi, atau alur
```

Lalu berhenti dan laporkan ke maintainer:

1. **Ringkasan:** apa yang berubah dan alasannya.
2. **File yang berubah:** daftar file (sesuai `git status`).
3. **Hasil verifikasi:** lolos atau gagal per perintah. Kalau ada yang gagal, tampilkan outputnya dan jangan sebut fitur selesai.
4. **Cara cek manual:** langkah singkat untuk dicoba di `npm run dev`.
5. **Usulan pesan commit** dalam format Conventional Commits (`feat(ai): ...`), siap disalin.

Selain itu, perbarui status fitur di [docs/planning.md](docs/planning.md) dan tambahkan catatan di [docs/progress.md](docs/progress.md) dalam perubahan yang sama.

## Logika Gameplay

- Logika yang bisa dites (perhitungan suara, HP, state AI) ditaruh di modul tanpa dependensi DOM/WebGL dan diberi unit test (`node --test`).
- Kalau alur Chapter 1 berubah, perbarui `src/dev/autotest.js` supaya runtime test tetap mencakup alur penuh.

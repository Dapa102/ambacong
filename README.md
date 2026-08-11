# Ambacong

Game horror 3D first-person berbasis browser dengan tema folklore Indonesia. Vertical slice saat ini berfokus pada Chapter 1: Rumah Sakit Tua.

## Tech Stack

- Three.js
- Vite
- Web Audio API
- IndexedDB

## Requirements

- Node.js 24 direkomendasikan melalui `.nvmrc`
- Node.js `^20.19.0 || ^22.13.0 || >=24`

## Setup

```bash
nvm use
npm ci
npm run dev
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — pemeriksaan ESLint
- `npm run format` — formatting Prettier
- `npm run format:check` — pemeriksaan formatting

## Dokumentasi

- [BRD](docs/brd.md)
- [PRD](docs/prd.md)
- [Arsitektur](docs/architecture.md)
- [Desain](docs/design.md)
- [Rencana implementasi](docs/implementation_plan.md)
- [Aturan proyek](docs/rules.md)
- [Skema data](docs/schema.md)

## Roadmap

- [x] Setup proyek
- [ ] Vertical slice Chapter 1
- [ ] Chapter 2 dan Chapter 3
- [ ] Rilis v1.0

Save game tersimpan lokal di browser melalui IndexedDB. Save tidak berpindah otomatis ke browser atau perangkat lain.

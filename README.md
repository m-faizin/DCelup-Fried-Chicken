## Struktur Project

```
D-Celup-Fried-Chicken/
├── docs/
│   └── schema.sql
|
├── src/
│   ├── components/
│   │   ├── dashboard/ (Komponen grafik dan ringkasan)
│   │   ├── forms/ (Formulir inventaris dan penjualan)
│   │   ├── layout/ (Struktur tata letak utama/AppShell)
│   │   ├── reports/ (Komponen cetak PDF)
│   │   └── UI/ (Kumpulan komponen dasar seperti Button, Input, dll)
│   ├── hooks/
│   │   ├── use-auth.tsx
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── api/ (Logika pemanggilan API)
│   │   ├── data/ (Data mock dan definisi TypeScript/types)
│   │   └── utils.ts
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── app.hq.index.tsx
│   │   ├── app.hq.products.tsx
│   │   ├── app.outlet.sales.tsx
│   │   └── ... (Rute-rute lainnya)
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   └── styles.css
├── .gitignore
├── bun.lock
├── bunfig.toml
├── components.json
├── eslint.config.mjs
├── package.json
├── postcss.config.mjs
├── prettierignore
├── prettierrc
├── server.ts
├── start.ts
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

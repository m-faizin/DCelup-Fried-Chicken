// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: process.env.VERCEL ? true : false,
  tanstackStart: {
    client: {
      entry: "src/client.tsx", // Memaksa aplikasi membaca file fisik, bukan modul virtual
    },
	server: {
      entry: "server",
    },
  },
  // Tambahkan baris resolusi di bawah ini
  resolve: {
    alias: {
      "virtual:tanstack-start-client-entry": "virtual:tanstack-start-client-entry",
    },
  },
});

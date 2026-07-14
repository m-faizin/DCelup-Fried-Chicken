/**
 * src/lib/db/supabase.server.ts
 *
 * Inisialisasi Supabase client untuk server-side.
 * File ini TIDAK akan di-bundle ke client (suffix .server.ts).
 *
 * Semua query data dilakukan lewat server functions (createServerFn),
 * sehingga cukup menggunakan getSupabaseAdmin() yang menggunakan
 * service_role key — aman karena key ini hanya ada di server.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.db";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Supabase] Environment variable "${key}" tidak ditemukan. ` +
        `Pastikan file .env sudah diisi dengan benar.`,
    );
  }
  return value;
}

/**
 * Supabase client dengan service_role key.
 *
 * Digunakan di semua server functions karena:
 * - Berjalan di server, key tidak pernah terekspos ke browser
 * - Tidak perlu JWT forwarding yang rumit
 * - Akses data tetap aman karena dikontrol di level aplikasi (login wajib)
 */
export function getSupabaseAdmin() {
  return createClient<Database>(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

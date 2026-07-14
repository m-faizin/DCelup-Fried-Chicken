/**
 * src/hooks/use-auth.tsx
 *
 * AuthProvider berbasis Supabase Auth.
 * Menggantikan mock auth yang menyimpan user ke localStorage.
 *
 * Yang berubah dari versi lama:
 * - login() sekarang memanggil supabase.auth.signInWithPassword()
 * - logout() memanggil supabase.auth.signOut()
 * - user diambil dari session Supabase, bukan dari daftar hardcoded
 * - JWT otomatis tersimpan dan diperbarui oleh Supabase SDK
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@/lib/data/types";

// ── Supabase client khusus untuk browser (pakai anon key) ───────────────────
// Berbeda dengan supabase.server.ts yang hanya jalan di server,
// file ini boleh di-bundle ke client karena hanya pakai anon key.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Export supabase client agar bisa dipakai di tempat lain (misal: kirim JWT)
export { supabase };

// ── Tipe context (sama persis dengan versi lama) ────────────────────────────
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  currentOutletId?: string;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => ({ error: null }),
  logout: async () => {},
  isAdmin: false,
  isStaff: false,
  isLoading: true,
});

// ── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Ambil profil & role dari database berdasarkan user ID Supabase.
   * Dipanggil setiap kali session berubah.
   */
  async function loadUserProfile(supabaseUserId: string) {
    // Ambil profil (nama, outlet_id)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, nama, outlet_id")
      .eq("id", supabaseUserId)
      .single();

    // Ambil role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", supabaseUserId)
      .single();

    if (!profile || !roleRow) {
      setUser(null);
      return;
    }

    setUser({
      id: profile.id,
      nama: profile.nama,
      email: "", // email ada di auth.users, tidak perlu ditampilkan
      role: roleRow.role,
      outlet_id: profile.outlet_id ?? undefined,
    });
  }

  // Pantau perubahan session Supabase (login, logout, refresh token)
  useEffect(() => {
    // Cek session yang sudah ada saat pertama kali load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe ke perubahan auth (auto-refresh token, logout dari tab lain, dll)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Login dengan email dan password.
   * Mengembalikan { error: string } jika gagal, { error: null } jika berhasil.
   */
  async function login(
    email: string,
    password: string,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Terjemahkan pesan error Supabase ke Bahasa Indonesia
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Email atau password salah" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { error: "Email belum dikonfirmasi, cek inbox kamu" };
      }
      return { error: error.message };
    }

    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAdmin: user?.role === "hq_admin",
    isStaff: user?.role === "outlet_staff",
    currentOutletId: user?.outlet_id,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

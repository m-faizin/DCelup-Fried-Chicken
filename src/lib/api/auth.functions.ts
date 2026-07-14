import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/db/supabase.server";

export const registerUser = createServerFn({ method: "POST" })
    .inputValidator(z.object({
        email: z.string().email(),
        password: z.string().min(6, "Password minimal 6 karakter"),
        nama: z.string().min(1, "Nama wajib diisi"),
        // Role dan Outlet dihapus dari sini karena akan diambil paksa dari database
    }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdmin();

        // 1. CEK APAKAH EMAIL SUDAH DIDAFTARKAN (DI-WHITELIST) OLEH ADMIN
        const { data: allowed, error: allowedError } = await supabase
            .from("allowed_emails")
            .select("*")
            .eq("email", data.email)
            .single();

        if (allowedError || !allowed) {
            throw new Error("Ditolak: Email ini belum didaftarkan/diizinkan oleh Admin Pusat!");
        }

        // 2. Buat akun di sistem autentikasi
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: { nama: data.nama }
        });

        if (authError || !authData.user) {
            throw new Error(`Gagal membuat akun: ${authError?.message}`);
        }

        const userId = authData.user.id;

        // 3. Update Profil dengan Outlet ID dari tabel izin (Bebas manipulasi)
        const { error: profileError } = await supabase.from("profiles")
            .update({
                nama: data.nama,
                outlet_id: allowed.outlet_id
            })
            .eq("id", userId);

        if (profileError) throw new Error(`Gagal melengkapi profil: ${profileError.message}`);

        // 4. Simpan Hak Akses dari tabel izin
        const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: userId,
            role: allowed.role,
        });

        if (roleError) throw new Error(`Gagal memberikan hak akses: ${roleError.message}`);

        // 5. (Opsional) Hapus email dari whitelist agar tidak bisa dipakai mendaftar ulang
        await supabase.from("allowed_emails").delete().eq("email", data.email);

        return { success: true, message: "Akun berhasil didaftarkan!" };
    });
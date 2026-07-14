import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/UI/card";
import { registerUser } from "@/lib/api/auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nama: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Hanya mengirim email, password, dan nama. Hak akses otomatis diurus server.
      await registerUser({ data: formData });

      toast.success("Aktivasi Berhasil!", {
        description: "Akun Anda telah diaktifkan sesuai izin Admin.",
      });

      setTimeout(() => {
        navigate({ to: "/auth" });
      }, 1500);

    } catch (err: any) {
      toast.error("Pendaftaran Ditolak", {
        description: err.message, // Akan menampilkan pesan "Ditolak: Email belum terdaftar"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl text-brand-red">Aktivasi Akun D-Celup</CardTitle>
          <CardDescription className="text-center">
            Gunakan email yang telah didaftarkan oleh Admin Pusat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input
                required
                placeholder="Misal: Hadis Darmawan"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email Terdaftar</Label>
              <Input
                type="email"
                required
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Buat Password Pribadi</Label>
              <Input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-brand-red hover:bg-brand-red/90 mt-2">
              {loading ? "Memverifikasi Email..." : "Aktifkan Akun"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <Link to="/auth" className="text-blue-600 hover:underline">
                Sudah punya akun? Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
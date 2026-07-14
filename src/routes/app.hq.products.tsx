import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import {
  getProducts,
  upsertProduct,
  deactivateProduct,
} from "@/lib/api/outlets.functions";
import type { Product } from "@/lib/data/types";

export const Route = createFileRoute("/app/hq/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  // Fetch produk dari database
  async function refresh() {
    try {
      const data = await getProducts();
      setProducts(data as Product[]);
    } catch (err) {
      toast.error("Gagal memuat produk");
      console.error(err);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  function startEdit(product: Product) {
    setEditing(product);
    setForm({ ...product });
  }

  function startCreate() {
    setEditing({});
    setForm({ nama_produk: "", harga: 0, kategori: "Paket", is_active: true });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
  }

  async function save() {
    if (!form.nama_produk || form.harga == null) return;
    setSaving(true);
    try {
      await upsertProduct({
        data: {
          id: editing?.id,
          nama_produk: form.nama_produk!,
          harga: form.harga!,
          kategori: form.kategori,
          is_active: form.is_active ?? true,
        },
      });
      toast.success("Produk berhasil disimpan!");
      await refresh();
      setEditing(null);
      setForm({});
    } catch (err) {
      toast.error("Gagal menyimpan produk");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Yakin hapus produk ini?")) return;
    try {
      await deactivateProduct({ data: { id } });
      toast.success("Produk berhasil dihapus");
      await refresh();
    } catch (err) {
      toast.error("Gagal menghapus produk");
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Master Produk</h1>
          <p className="text-sm text-muted-foreground">
            Kelola menu dan harga D'Celup
          </p>
        </div>
        <Button
          onClick={startCreate}
          className="gap-2 bg-brand-red hover:bg-brand-red/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {editing !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editing.id ? "Edit Produk" : "Produk Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nama Produk</Label>
                <Input
                  value={form.nama_produk ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_produk: e.target.value }))
                  }
                  placeholder="Contoh: Paket 2 Pcs Ayam"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Harga (Rp)</Label>
                <Input
                  type="number"
                  value={form.harga ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, harga: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.kategori ?? "Paket"}
                  onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paket">Paket</SelectItem>
                    <SelectItem value="Ayam">Ayam</SelectItem>
                    <SelectItem value="Side">Side</SelectItem>
                    <SelectItem value="Minuman">Minuman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={save}
                disabled={saving}
                className="gap-2 bg-brand-red hover:bg-brand-red/90"
              >
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={cancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter((p) => p.is_active).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nama_produk}</TableCell>
                  <TableCell>{p.kategori}</TableCell>
                  <TableCell className="text-right">
                    Rp {p.harga.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SalesForm } from "@/components/forms/SalesForm";
import { useAuth } from "@/hooks/use-auth";
import { getProducts } from "@/lib/api/outlets.functions";
import { upsertSales } from "@/lib/api/sales.functions";
import type { Product, SalesDetail } from "@/lib/data/types";

export const Route = createFileRoute("/app/outlet/sales")({
  component: OutletSales,
});

function OutletSales() {
  const { currentOutletId, user } = useAuth();
  const outletId = currentOutletId ?? "";
  const today = new Date().toISOString().slice(0, 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((p) => setProducts(p as Product[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(total: number, detail: SalesDetail[]) {
    try {
      await upsertSales({
        data: {
          outlet_id: outletId,
          tanggal: today,
          total_penjualan: total,
          detail_item_terjual: detail,
          created_by: user?.id,
        },
      });
      toast.success("Data penjualan berhasil disimpan!");
    } catch (err) {
      toast.error("Gagal menyimpan data penjualan");
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Input Penjualan</h1>
        <p className="text-sm text-muted-foreground">
          Catat penjualan harian untuk {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>

      <SalesForm products={products} onSave={handleSave} />
    </div>
  );
}

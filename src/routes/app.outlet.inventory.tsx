import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { InventoryForm } from "@/components/forms/InventoryForm";
import { useAuth } from "@/hooks/use-auth";
import { getInventory, upsertInventory } from "@/lib/api/inventory.functions";
import type { InventoryItem } from "@/lib/data/types";

export const Route = createFileRoute("/app/outlet/inventory")({
  component: OutletInventory,
});

function OutletInventory() {
  const { currentOutletId, user } = useAuth();
  const outletId = currentOutletId ?? "";
  const today = new Date().toISOString().slice(0, 10);

  const [initialItems, setInitialItems] = useState<InventoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function fetchItems() {
    if (!outletId) return;
    const items = await getInventory({ data: { outlet_id: outletId, tanggal: today } });
    setInitialItems(items as InventoryItem[]);
  }

  useEffect(() => {
    fetchItems()
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, [outletId, today]);

  async function handleSave(items: InventoryItem[]) {
    try {
      await upsertInventory({
        data: {
          items: items.map((item) => ({
            outlet_id: outletId,
            nama_bahan: item.nama_bahan,
            satuan: item.satuan,
            stok_awal: item.stok_awal,
            stok_masuk: item.stok_masuk,
            stok_akhir: item.stok_akhir,
            tanggal: today,
            created_by: user?.id,
          })),
        },
      });
      await fetchItems();
      toast.success("Stok opname berhasil disimpan!");
    } catch (err) {
      toast.error("Gagal menyimpan stok opname");
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Stok Opname Harian
        </h1>
        <p className="text-sm text-muted-foreground">
          Input stok bahan baku awal, masuk, dan akhir hari ini
        </p>
      </div>

      {loaded ? (
        <InventoryForm
          outletId={outletId}
          tanggal={today}
          initialItems={initialItems}
          onSave={handleSave}
        />
      ) : (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
        </div>
      )}
    </div>
  );
}

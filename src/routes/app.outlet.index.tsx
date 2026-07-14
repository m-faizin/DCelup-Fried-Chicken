import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  ShoppingCart,
  History,
  TrendingUp,
  Package,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { useAuth } from "@/hooks/use-auth";
import { getOutlets } from "@/lib/api/outlets.functions";
import { getSales } from "@/lib/api/sales.functions";
import { getInventory } from "@/lib/api/inventory.functions";
import type { Outlet, SalesReport, InventoryItem } from "@/lib/data/types";

export const Route = createFileRoute("/app/outlet/")({
  component: OutletDashboard,
});

function OutletDashboard() {
  const { currentOutletId } = useAuth();
  const outletId = currentOutletId ?? "";
  const today = new Date().toISOString().slice(0, 10);

  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [todaySales, setTodaySales] = useState<SalesReport[]>([]);
  const [todayInventory, setTodayInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outletId) return;
    Promise.all([
      getOutlets(),
      getSales({ data: { outlet_id: outletId, from: today, to: today } }),
      getInventory({ data: { outlet_id: outletId, tanggal: today } }),
    ])
      .then(([outlets, sales, inv]) => {
        setOutlet((outlets as Outlet[]).find((o) => o.id === outletId) ?? null);
        setTodaySales(sales as unknown as SalesReport[]);
        setTodayInventory(inv as InventoryItem[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [outletId, today]);

  const totalOmset = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.total_penjualan, 0),
    [todaySales],
  );

  const totalPorsi = useMemo(
    () =>
      todaySales.reduce(
        (sum, s) => sum + s.detail_item_terjual.reduce((a, d) => a + d.qty, 0),
        0,
      ),
    [todaySales],
  );

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
        <h1 className="text-2xl font-bold text-foreground">
          {outlet?.nama_outlet ?? "Dashboard Outlet"}
        </h1>
        <p className="text-sm text-muted-foreground">{outlet?.lokasi}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Omset Hari Ini
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-brand-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rp {totalOmset.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Porsi Terjual
            </CardTitle>
            <Package className="h-5 w-5 text-brand-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalPorsi} porsi
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/app/outlet/inventory">
          <Card className="transition-colors hover:border-brand-red hover:bg-brand-red/5 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Stok Opname
                </h3>
                <p className="text-sm text-muted-foreground">
                  Input stok bahan baku hari ini
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/outlet/sales">
          <Card className="transition-colors hover:border-brand-orange hover:bg-brand-orange/5 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Input Penjualan
                </h3>
                <p className="text-sm text-muted-foreground">
                  Catat omset dan porsi terjual
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/outlet/history">
          <Card className="transition-colors hover:border-brand-gold hover:bg-brand-gold/5 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Riwayat Transaksi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Lihat 30 hari terakhir
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

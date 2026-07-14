import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { getOutlets } from "@/lib/api/outlets.functions";
import { getInventory } from "@/lib/api/inventory.functions";
import { getSales } from "@/lib/api/sales.functions";
import type { Outlet, InventoryItem, SalesReport } from "@/lib/data/types";

export const Route = createFileRoute("/app/hq/outlets/$outletId")({
  component: OutletDetail,
});

function OutletDetail() {
  const { outletId } = Route.useParams();
  const today = new Date().toISOString().slice(0, 10);

  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      getOutlets(),
      getInventory({ data: { outlet_id: outletId, tanggal: today } }),
      getSales({ data: { outlet_id: outletId } }),
    ])
      .then(([outlets, inv, sal]) => {
        const found = (outlets as Outlet[]).find((o) => o.id === outletId);
        if (!found) {
          setNotFound(true);
        } else {
          setOutlet(found);
          setInventory(inv as InventoryItem[]);
          setSales(sal as unknown as SalesReport[]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [outletId, today]);

  const totalOmset = useMemo(
    () => sales.reduce((s, r) => s + r.total_penjualan, 0),
    [sales],
  );
  const totalPorsi = useMemo(
    () =>
      sales.reduce(
        (s, r) => s + r.detail_item_terjual.reduce((a, d) => a + d.qty, 0),
        0,
      ),
    [sales],
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
      </div>
    );
  }

  if (notFound || !outlet) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Outlet tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/app/hq"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {outlet.nama_outlet}
        </h1>
        <p className="text-sm text-muted-foreground">{outlet.lokasi}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Omset (7 Hari)
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
              Total Porsi Terjual
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-brand-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalPorsi} porsi
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Item Stok Hari Ini
            </CardTitle>
            <Package className="h-5 w-5 text-brand-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {inventory.length} bahan
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Stok Opname Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Awal</TableHead>
                  <TableHead className="text-right">Masuk</TableHead>
                  <TableHead className="text-right">Akhir</TableHead>
                  <TableHead className="text-right">Terpakai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.nama_bahan}
                    </TableCell>
                    <TableCell>{item.satuan}</TableCell>
                    <TableCell className="text-right">{item.stok_awal}</TableCell>
                    <TableCell className="text-right">{item.stok_masuk}</TableCell>
                    <TableCell className="text-right">{item.stok_akhir}</TableCell>
                    <TableCell className="text-right font-medium text-brand-red">
                      {item.terpakai}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada data stok untuk hari ini.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Riwayat Penjualan (7 Hari)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Total Penjualan</TableHead>
                <TableHead className="text-right">Jumlah Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.tanggal}</TableCell>
                  <TableCell className="text-right">
                    Rp {s.total_penjualan.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.detail_item_terjual.length} item
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    Belum ada data penjualan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

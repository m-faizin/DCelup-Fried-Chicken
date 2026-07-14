import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { useAuth } from "@/hooks/use-auth";
import { getSales } from "@/lib/api/sales.functions";
import type { SalesReport } from "@/lib/data/types";

export const Route = createFileRoute("/app/outlet/history")({
  component: OutletHistory,
});

function OutletHistory() {
  const { currentOutletId } = useAuth();
  const outletId = currentOutletId ?? "";

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const from = thirtyDaysAgo.toISOString().slice(0, 10);

  const [sales, setSales] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!outletId) return;
    getSales({ data: { outlet_id: outletId, from, to: today } })
      .then((data) =>
        setSales(
          (data as unknown as SalesReport[]).sort((a, b) =>
            a.tanggal > b.tanggal ? -1 : 1,
          ),
        ),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [outletId]);

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
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-muted-foreground">30 hari terakhir</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Omset</TableHead>
                <TableHead className="text-right">Porsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => {
                const porsi = s.detail_item_terjual.reduce(
                  (a, d) => a + d.qty,
                  0,
                );
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {s.tanggal}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      Rp {s.total_penjualan.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">{porsi} porsi</TableCell>
                  </TableRow>
                );
              })}
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

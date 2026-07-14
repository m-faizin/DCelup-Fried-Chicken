import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { FileDown, Send } from "lucide-react";
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
import { getOutlets, getProducts } from "@/lib/api/outlets.functions";
import { getSales } from "@/lib/api/sales.functions";
import { ReportDocument } from "@/components/reports/ReportPDF";
import { pdf } from "@react-pdf/renderer";
import type { Outlet, Product, SalesReport } from "@/lib/data/types";

export const Route = createFileRoute("/app/hq/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allSales, setAllSales] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [outletId, setOutletId] = useState("all");
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Fetch semua data awal
  useEffect(() => {
    Promise.all([
      getOutlets(),
      getProducts(),
      getSales({ data: {} }),
    ])
      .then(([o, p, s]) => {
        setOutlets(o as Outlet[]);
        setProducts(p as Product[]);
        setAllSales(s as unknown as SalesReport[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch sales saat filter berubah
  useEffect(() => {
    if (loading) return;
    getSales({
      data: {
        outlet_id: outletId !== "all" ? outletId : undefined,
        from,
        to,
      },
    })
      .then((s) => setAllSales(s as unknown as SalesReport[]))
      .catch(console.error);
  }, [outletId, from, to]);

  const filteredSales = useMemo(
    () => [...allSales].sort((a, b) => (a.tanggal > b.tanggal ? -1 : 1)),
    [allSales],
  );

  const totalOmset = useMemo(
    () => filteredSales.reduce((sum, s) => sum + s.total_penjualan, 0),
    [filteredSales],
  );

  const downloadPDF = useCallback(async () => {
    const targetOutlet =
      outletId === "all"
        ? { id: "all", nama_outlet: "Semua Outlet", lokasi: "-" }
        : outlets.find((o) => o.id === outletId)!;

    const doc = (
      <ReportDocument
        outlet={targetOutlet}
        reports={filteredSales}
        products={products}
        from={from}
        to={to}
      />
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-dcelup-${from}-${to}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outletId, from, to, filteredSales, outlets, products]);

  const shareWhatsApp = useCallback(() => {
    const lines = [
      `*Laporan D'Celup Fried Chicken*`,
      `Periode: ${from} s/d ${to}`,
      ``,
      `Total Omset: Rp ${totalOmset.toLocaleString("id-ID")}`,
      `Jumlah Laporan: ${filteredSales.length} hari`,
      ``,
      `_Dicetak otomatis dari sistem_`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [from, to, totalOmset, filteredSales]);

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
        <h1 className="text-2xl font-bold text-foreground">Laporan & Export</h1>
        <p className="text-sm text-muted-foreground">
          Filter dan export laporan penjualan
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end justify-between">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 w-full xl:flex-1">
              <div className="space-y-1.5">
                <Label>Outlet</Label>
                <Select value={outletId} onValueChange={setOutletId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Outlet</SelectItem>
                    {outlets.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nama_outlet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Dari Tanggal</Label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Sampai Tanggal</Label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full xl:w-auto pt-2 xl:pt-0">
              <Button
                onClick={downloadPDF}
                className="gap-2 bg-brand-red hover:bg-brand-red/90 flex-1 sm:flex-none"
              >
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={shareWhatsApp}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Send className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Hasil Laporan ({filteredSales.length} hari)
          </CardTitle>
          <div className="text-sm font-bold text-brand-red">
            Total: Rp {totalOmset.toLocaleString("id-ID")}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead className="text-right">Omset</TableHead>
                <TableHead className="text-right">Porsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((s) => {
                const outlet = outlets.find((o) => o.id === s.outlet_id);
                const porsi = s.detail_item_terjual.reduce(
                  (a, d) => a + d.qty,
                  0,
                );
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.tanggal}</TableCell>
                    <TableCell>{outlet?.nama_outlet ?? s.outlet_id}</TableCell>
                    <TableCell className="text-right">
                      Rp {s.total_penjualan.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">{porsi} porsi</TableCell>
                  </TableRow>
                );
              })}
              {filteredSales.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    Tidak ada data untuk periode ini
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

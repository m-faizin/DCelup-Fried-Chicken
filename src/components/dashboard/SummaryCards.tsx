import React from "react";
import { TrendingUp, TrendingDown, Package, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";

interface SummaryCardsProps {
  totalOmsetHariIni: number;
  totalOmsetBulanIni: number;
  totalPorsiHariIni: number;
  outletAktif: number;
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function SummaryCards({
  totalOmsetHariIni,
  totalOmsetBulanIni,
  totalPorsiHariIni,
  outletAktif,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Omset Hari Ini
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-brand-red" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatRupiah(totalOmsetHariIni)}
          </div>
          <p className="text-xs text-muted-foreground">Total 3 outlet</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Omset Bulan Ini
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-brand-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatRupiah(totalOmsetBulanIni)}
          </div>
          <p className="text-xs text-muted-foreground">Akumulasi bulan ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Porsi Terjual
          </CardTitle>
          <Package className="h-5 w-5 text-brand-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {totalPorsiHariIni.toLocaleString("id-ID")} porsi
          </div>
          <p className="text-xs text-muted-foreground">Hari ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outlet Aktif
          </CardTitle>
          <Store className="h-5 w-5 text-brand-red" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {outletAktif} Outlet
          </div>
          <p className="text-xs text-muted-foreground">Semua beroperasi</p>
        </CardContent>
      </Card>
    </div>
  );
}

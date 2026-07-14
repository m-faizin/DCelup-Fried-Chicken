/**
 * src/lib/api/dashboard.functions.ts — versi getSupabaseAdmin
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/db/supabase.server";

export const getDashboardSummary = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const today = data.tanggal ?? new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    const [outletsRes, todaySalesRes, monthSalesRes, last7DaysSalesRes] =
      await Promise.all([
        supabase.from("outlets").select("id, nama_outlet, lokasi"),
        supabase.from("sales_reports").select("outlet_id, total_penjualan, detail_item_terjual").eq("tanggal", today),
        supabase.from("sales_reports").select("total_penjualan").gte("tanggal", `${monthPrefix}-01`).lte("tanggal", today),
        supabase.from("sales_reports").select("outlet_id, tanggal, total_penjualan").gte("tanggal", subtractDays(today, 6)).lte("tanggal", today).order("tanggal"),
      ]);

    if (outletsRes.error) throw new Error(`Gagal mengambil outlet: ${outletsRes.error.message}`);
    if (todaySalesRes.error) throw new Error(`Gagal mengambil sales hari ini: ${todaySalesRes.error.message}`);
    if (monthSalesRes.error) throw new Error(`Gagal mengambil sales bulan ini: ${monthSalesRes.error.message}`);
    if (last7DaysSalesRes.error) throw new Error(`Gagal mengambil chart data: ${last7DaysSalesRes.error.message}`);

    const outlets = outletsRes.data;
    const todaySales = todaySalesRes.data;
    const monthSales = monthSalesRes.data;
    const last7DaysSales = last7DaysSalesRes.data;

    const totalOmsetHariIni = todaySales.reduce((sum, s) => sum + s.total_penjualan, 0);
    const totalOmsetBulanIni = monthSales.reduce((sum, s) => sum + s.total_penjualan, 0);
    const totalPorsiHariIni = todaySales.reduce((sum, s) => {
      const detail = s.detail_item_terjual as Array<{ qty: number }>;
      return sum + detail.reduce((a, d) => a + d.qty, 0);
    }, 0);

    const outletSummaries = outlets.map((outlet) => {
      const sales = todaySales.filter((s) => s.outlet_id === outlet.id);
      return { outlet, omsetHariIni: sales.reduce((sum, s) => sum + s.total_penjualan, 0) };
    });

    const chartData = outlets.map((outlet) => {
      const chartPoints = Array.from({ length: 7 }, (_, i) => {
        const tanggal = subtractDays(today, 6 - i);
        const found = last7DaysSales.find((s) => s.outlet_id === outlet.id && s.tanggal === tanggal);
        return { tanggal, omset: found?.total_penjualan ?? 0 };
      });
      return { outlet, data: chartPoints };
    });

    return { tanggal: today, totalOmsetHariIni, totalOmsetBulanIni, totalPorsiHariIni, outletAktif: outlets.length, outletSummaries, chartData };
  });

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

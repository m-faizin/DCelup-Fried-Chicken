/**
 * src/lib/api/sales.functions.ts — versi getSupabaseAdmin
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/db/supabase.server";

const SalesDetailSchema = z.object({
  product_id: z.string(),
  nama: z.string(),
  qty: z.number().int().min(0),
  subtotal: z.number().min(0),
});

export const getSales = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    outlet_id: z.string().optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("sales_reports")
      .select("id, outlet_id, tanggal, total_penjualan, detail_item_terjual, created_at")
      .order("tanggal", { ascending: false });
    if (data.outlet_id) query = query.eq("outlet_id", data.outlet_id);
    if (data.from) query = query.gte("tanggal", data.from);
    if (data.to) query = query.lte("tanggal", data.to);
    const { data: reports, error } = await query;
    if (error) throw new Error(`Gagal mengambil data penjualan: ${error.message}`);
    return reports;
  });

export const getSalesByDate = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    outlet_id: z.string(),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: report, error } = await supabase
      .from("sales_reports")
      .select("*")
      .eq("outlet_id", data.outlet_id)
      .eq("tanggal", data.tanggal)
      .maybeSingle();
    if (error) throw new Error(`Gagal mengambil laporan: ${error.message}`);
    return report;
  });

export const upsertSales = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    outlet_id: z.string(),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    total_penjualan: z.number().min(0),
    detail_item_terjual: z.array(SalesDetailSchema),
    created_by: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: saved, error } = await supabase
      .from("sales_reports")
      .upsert({
        outlet_id: data.outlet_id,
        tanggal: data.tanggal,
        total_penjualan: data.total_penjualan,
        detail_item_terjual: data.detail_item_terjual,
        created_by: data.created_by ?? null,
      }, { onConflict: "outlet_id,tanggal" })
      .select().single();
    if (error) throw new Error(`Gagal menyimpan laporan penjualan: ${error.message}`);
    return saved;
  });

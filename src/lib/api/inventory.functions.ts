/**
 * src/lib/api/inventory.functions.ts — versi getSupabaseAdmin
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/db/supabase.server";

export const getInventory = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    outlet_id: z.string(),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: items, error } = await supabase
      .from("inventory")
      .select("id, outlet_id, nama_bahan, satuan, stok_awal, stok_masuk, stok_akhir, terpakai, tanggal")
      .eq("outlet_id", data.outlet_id)
      .eq("tanggal", data.tanggal)
      .order("nama_bahan");
    if (error) throw new Error(`Gagal mengambil data inventory: ${error.message}`);
    return items;
  });

export const getInventoryHistory = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    outlet_id: z.string(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: items, error } = await supabase
      .from("inventory")
      .select("id, outlet_id, nama_bahan, satuan, stok_awal, stok_masuk, stok_akhir, terpakai, tanggal")
      .eq("outlet_id", data.outlet_id)
      .gte("tanggal", data.from)
      .lte("tanggal", data.to)
      .order("tanggal", { ascending: false })
      .order("nama_bahan");
    if (error) throw new Error(`Gagal mengambil riwayat inventory: ${error.message}`);
    return items;
  });

const InventoryItemSchema = z.object({
  outlet_id: z.string(),
  nama_bahan: z.string().min(1),
  satuan: z.string().min(1),
  stok_awal: z.number().min(0),
  stok_masuk: z.number().min(0),
  stok_akhir: z.number().min(0),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_by: z.string().optional(),
});

export const upsertInventory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ items: z.array(InventoryItemSchema) }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: saved, error } = await supabase
      .from("inventory")
      .upsert(
        data.items.map((item) => ({
          outlet_id: item.outlet_id,
          nama_bahan: item.nama_bahan,
          satuan: item.satuan,
          stok_awal: item.stok_awal,
          stok_masuk: item.stok_masuk,
          stok_akhir: item.stok_akhir,
          tanggal: item.tanggal,
          created_by: item.created_by ?? null,
        })),
        { onConflict: "outlet_id,nama_bahan,tanggal", ignoreDuplicates: false },
      )
      .select("id, outlet_id, nama_bahan, satuan, stok_awal, stok_masuk, stok_akhir, terpakai, tanggal");
    if (error) throw new Error(`Gagal menyimpan data inventory: ${error.message}`);
    return saved;
  });

export const deleteInventoryItem = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("inventory").delete().eq("id", data.id);
    if (error) throw new Error(`Gagal menghapus item inventory: ${error.message}`);
    return { success: true };
  });

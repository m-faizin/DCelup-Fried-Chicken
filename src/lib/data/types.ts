export type Role = "hq_admin" | "outlet_staff";

export interface Outlet {
  id: string;
  nama_outlet: string;
  lokasi: string;
}

export interface Product {
  id: string;
  nama_produk: string;
  harga: number;
  kategori: string;
  is_active: boolean;
}

export interface InventoryItem {
  id: string;
  outlet_id: string;
  nama_bahan: string;
  satuan: string;
  stok_awal: number;
  stok_masuk: number;
  stok_akhir: number;
  terpakai: number;
  tanggal: string;
}

export interface SalesDetail {
  product_id: string;
  nama: string;
  qty: number;
  subtotal: number;
}



export interface SalesReport {
  id: string;
  outlet_id: string;
  tanggal: string;
  total_penjualan: number;
  detail_item_terjual: SalesDetail[];


}

export interface User {
  id: string;
  nama: string;
  email: string;
  role: Role;
  outlet_id?: string;
}



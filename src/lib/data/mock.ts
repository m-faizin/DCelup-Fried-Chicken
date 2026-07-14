import type {
  Outlet,
  Product,
  InventoryItem,
  SalesReport,
  User,
} from "./types";

const LS_KEY = "dceLup_mock_db_v1";

const defaultOutlets: Outlet[] = [
  {
    id: "outlet-1",
    nama_outlet: "Outlet 1 - Sudirman",
    lokasi: "Jl. Sudirman No. 12, Jakarta",
  },
  {
    id: "outlet-2",
    nama_outlet: "Outlet 2 - Ahmad Yani",
    lokasi: "Jl. Ahmad Yani No. 45, Bandung",
  },
  {
    id: "outlet-3",
    nama_outlet: "Outlet 3 - Diponegoro",
    lokasi: "Jl. Diponegoro No. 78, Surabaya",
  },
];

const defaultProducts: Product[] = [
  {
    id: "prod-1",
    nama_produk: "Paket 2 Pcs Ayam + Nasi",
    harga: 25000,
    kategori: "Paket",
    is_active: true,
  },
  {
    id: "prod-2",
    nama_produk: "Paket 4 Pcs Ayam + Nasi (2)",
    harga: 45000,
    kategori: "Paket",
    is_active: true,
  },
  {
    id: "prod-3",
    nama_produk: "Paket 6 Pcs Ayam + Nasi (3)",
    harga: 65000,
    kategori: "Paket",
    is_active: true,
  },
  {
    id: "prod-4",
    nama_produk: "Ayam Crispy 1 Pcs",
    harga: 13000,
    kategori: "Ayam",
    is_active: true,
  },
  {
    id: "prod-5",
    nama_produk: "Nasi Putih",
    harga: 5000,
    kategori: "Side",
    is_active: true,
  },
  {
    id: "prod-6",
    nama_produk: "Minuman Soda",
    harga: 8000,
    kategori: "Minuman",
    is_active: true,
  },
  {
    id: "prod-7",
    nama_produk: "Tahu Crispy",
    harga: 3000,
    kategori: "Side",
    is_active: true,
  },
  {
    id: "prod-8",
    nama_produk: "Tempe Crispy",
    harga: 3000,
    kategori: "Side",
    is_active: true,
  },
];

const bahanBaku = [
  { nama: "Potongan Ayam", satuan: "pcs" },
  { nama: "Tepung Fried Chicken", satuan: "kg" },
  { nama: "Minyak Goreng", satuan: "liter" },
  { nama: "Saus Sambal", satuan: "ml" },
  { nama: "Saus Tomat", satuan: "ml" },
  { nama: "Nasi", satuan: "kg" },
  { nama: "Cup Plastik", satuan: "pcs" },
  { nama: "Tahu", satuan: "pcs" },
  { nama: "Tempe", satuan: "pcs" },
];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateMockData() {
  const today = getToday();
  const inventory: InventoryItem[] = [];
  const sales: SalesReport[] = [];

  for (const outlet of defaultOutlets) {
    for (let dayOffset = -6; dayOffset <= 0; dayOffset++) {
      const tanggal = addDays(today, dayOffset);

      for (const bb of bahanBaku) {
        const awal = Math.floor(Math.random() * 200) + 50;
        const masuk = Math.floor(Math.random() * 100);
        const akhir = Math.max(
          0,
          awal + masuk - Math.floor(Math.random() * 150),
        );
        inventory.push({
          id: generateId("inv"),
          outlet_id: outlet.id,
          nama_bahan: bb.nama,
          satuan: bb.satuan,
          stok_awal: awal,
          stok_masuk: masuk,
          stok_akhir: akhir,
          terpakai: awal + masuk - akhir,
          tanggal,
        });
      }

      const detail: {
        product_id: string;
        nama: string;
        qty: number;
        subtotal: number;
      }[] = [];
      let total = 0;
      for (const prod of defaultProducts) {
        const qty = Math.floor(Math.random() * 30);
        if (qty > 0) {
          const subtotal = qty * prod.harga;
          detail.push({
            product_id: prod.id,
            nama: prod.nama_produk,
            qty,
            subtotal,
          });
          total += subtotal;
        }
      }


      sales.push({
        id: generateId("sales"),
        outlet_id: outlet.id,
        tanggal,
        total_penjualan: total,
        detail_item_terjual: detail,


      });
    }
  }

  return {
    outlets: defaultOutlets,
    products: defaultProducts,
    inventory,
    sales,
  };
}

interface MockDB {
  outlets: Outlet[];
  products: Product[];
  inventory: InventoryItem[];
  sales: SalesReport[];
}

function loadDB(): MockDB {
  if (typeof window === "undefined") return generateMockData();
  const raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);
  const initial = generateMockData();
  localStorage.setItem(LS_KEY, JSON.stringify(initial));
  return initial;
}

function saveDB(db: MockDB) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  }
}

function getDB(): MockDB {
  return loadDB();
}

export const mockApi = {
  getOutlets(): Outlet[] {
    return getDB().outlets;
  },

  getProducts(): Product[] {
    return getDB().products;
  },

  upsertProduct(product: Product) {
    const db = getDB();
    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) db.products[idx] = product;
    else db.products.push(product);
    saveDB(db);
  },

  deleteProduct(id: string) {
    const db = getDB();
    db.products = db.products.filter((p) => p.id !== id);
    saveDB(db);
  },

  getInventory(outletId: string, tanggal: string): InventoryItem[] {
    return getDB().inventory.filter(
      (i) => i.outlet_id === outletId && i.tanggal === tanggal,
    );
  },

  upsertInventory(items: InventoryItem[]) {
    const db = getDB();
    for (const item of items) {
      const idx = db.inventory.findIndex(
        (i) =>
          i.outlet_id === item.outlet_id &&
          i.nama_bahan === item.nama_bahan &&
          i.tanggal === item.tanggal,
      );
      const computed = {
        ...item,
        terpakai: item.stok_awal + item.stok_masuk - item.stok_akhir,
      };
      if (idx >= 0) db.inventory[idx] = computed;
      else db.inventory.push(computed);
    }
    saveDB(db);
  },

  getSales(outletId?: string, from?: string, to?: string): SalesReport[] {
    let data = getDB().sales;
    if (outletId) data = data.filter((s) => s.outlet_id === outletId);
    if (from) data = data.filter((s) => s.tanggal >= from);
    if (to) data = data.filter((s) => s.tanggal <= to);
    return data.sort((a, b) => (a.tanggal > b.tanggal ? -1 : 1));
  },

  upsertSales(report: SalesReport) {
    const db = getDB();
    const idx = db.sales.findIndex(
      (s) => s.outlet_id === report.outlet_id && s.tanggal === report.tanggal,
    );
    if (idx >= 0) db.sales[idx] = report;
    else db.sales.push(report);
    saveDB(db);
  },

  getDashboardSummary() {
    const db = getDB();
    const today = getToday();
    const todaySales = db.sales.filter((s) => s.tanggal === today);
    const monthSales = db.sales.filter((s) =>
      s.tanggal.startsWith(today.slice(0, 7)),
    );

    const totalOmsetHariIni = todaySales.reduce(
      (sum, s) => sum + s.total_penjualan,
      0,
    );
    const totalOmsetBulanIni = monthSales.reduce(
      (sum, s) => sum + s.total_penjualan,
      0,
    );
    const totalPorsiHariIni = todaySales.reduce((sum, s) => {
      return sum + s.detail_item_terjual.reduce((a, d) => a + d.qty, 0);
    }, 0);

    const outletSummaries = db.outlets.map((o) => {
      const sales = db.sales.filter(
        (s) => s.outlet_id === o.id && s.tanggal === today,
      );
      const inv = db.inventory.filter(
        (i) => i.outlet_id === o.id && i.tanggal === today,
      );
      return {
        outlet: o,
        omsetHariIni: sales.reduce((sum, s) => sum + s.total_penjualan, 0),
        sisaStokItems: inv.length,

      };
    });

    const chartData = db.outlets.map((o) => {
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(today, -6 + i);
        const s = db.sales.filter(
          (x) => x.outlet_id === o.id && x.tanggal === d,
        );
        return {
          tanggal: d,
          omset: s.reduce((sum, x) => sum + x.total_penjualan, 0),
        };
      });
      return { outlet: o, data: last7 };
    });

    return {
      totalOmsetHariIni,
      totalOmsetBulanIni,
      totalPorsiHariIni,
      outletAktif: db.outlets.length,
      outletSummaries,
      chartData,
    };
  },
};

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Outlet, SalesReport, Product } from "@/lib/data/types";

Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
});

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#333" },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#D32F2F",
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 4,
  },
  subtitle: { fontSize: 11, color: "#666" },
  section: { marginTop: 12, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 6,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: "#666" },
  value: { flex: 1, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  colProduk: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colHarga: { flex: 2, textAlign: "right" },
  colSubtotal: { flex: 2, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#FFF8F0",
    borderTopWidth: 1,
    borderColor: "#D32F2F",
    marginTop: 4,
  },
  totalLabel: { flex: 1, fontWeight: "bold", color: "#D32F2F" },
  totalValue: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
    color: "#D32F2F",
  },
  footer: { marginTop: 24, fontSize: 9, color: "#999", textAlign: "center" },
});

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export interface ReportPDFData {
  outlet: Outlet;
  reports: SalesReport[];
  products: Product[];
  from: string;
  to: string;
}

export function ReportDocument({
  outlet,
  reports,
  products,
  from,
  to,
}: ReportPDFData) {
  const totalOmset = reports.reduce((sum, r) => sum + r.total_penjualan, 0);
  const totalPorsi = reports.reduce(
    (sum, r) => sum + r.detail_item_terjual.reduce((a, d) => a + d.qty, 0),
    0,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>D'Celup Fried Chicken</Text>
          <Text style={styles.subtitle}>
            Laporan Penjualan — {outlet.nama_outlet}
          </Text>
          <Text style={styles.subtitle}>
            Periode: {from} s/d {to}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Outlet</Text>
            <Text style={styles.value}>{outlet.nama_outlet}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lokasi</Text>
            <Text style={styles.value}>{outlet.lokasi}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Omset</Text>
            <Text style={styles.value}>{formatRupiah(totalOmset)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Porsi Terjual</Text>
            <Text style={styles.value}>{totalPorsi} porsi</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Laporan</Text>
            <Text style={styles.value}>{reports.length} hari</Text>
          </View>
        </View>

        {reports.map((report) => (
          <View key={report.id} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Tanggal: {report.tanggal}</Text>
            

            <View style={styles.tableHeader}>
              <Text style={styles.colProduk}>Produk</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colHarga}>Harga Satuan</Text>
              <Text style={styles.colSubtotal}>Subtotal</Text>
            </View>
            {report.detail_item_terjual.map((item, idx) => {
              const prod = products.find((p) => p.id === item.product_id);
              const unitPrice = prod ? prod.harga : item.subtotal / item.qty;
              return (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.colProduk}>{item.nama}</Text>
                  <Text style={styles.colQty}>{item.qty}</Text>
                  <Text style={styles.colHarga}>{formatRupiah(unitPrice)}</Text>
                  <Text style={styles.colSubtotal}>
                    {formatRupiah(item.subtotal)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Hari Ini</Text>
              <Text style={styles.totalValue}>
                {formatRupiah(report.total_penjualan)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>
            Dicetak pada {new Date().toLocaleString("id-ID")} — D'Celup Fried
            Chicken
          </Text>
        </View>
      </Page>
    </Document>
  );
}

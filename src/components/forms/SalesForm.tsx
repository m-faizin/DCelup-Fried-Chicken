import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import type { SalesDetail, Product } from "@/lib/data/types";

interface SalesFormProps {
  products: Product[];
  onSave: (total: number, detail: SalesDetail[]) => void;
}

export function SalesForm({ products, onSave }: SalesFormProps) {
  const [lines, setLines] = useState<{ productId: string; qty: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const activeProducts = products.filter((p) => p.is_active);

  function addLine() {
    if (!selectedProduct) return;
    const existing = lines.find((l) => l.productId === selectedProduct);
    if (existing) {
      setLines((prev) =>
        prev.map((l) =>
          l.productId === selectedProduct
            ? { ...l, qty: l.qty + selectedQty }
            : l,
        ),
      );
    } else {
      setLines((prev) => [
        ...prev,
        { productId: selectedProduct, qty: selectedQty },
      ]);
    }
    setSelectedProduct("");
    setSelectedQty(1);
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeLine(productId);
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    );
  }

  const detail: SalesDetail[] = lines
    .map((l) => {
      const prod = activeProducts.find((p) => p.id === l.productId);
      if (!prod) return null;
      return {
        product_id: l.productId,
        nama: prod.nama_produk,
        qty: l.qty,
        subtotal: l.qty * prod.harga,
      };
    })
    .filter(Boolean) as SalesDetail[];

  const total = detail.reduce((sum, d) => sum + d.subtotal, 0);

  function handleSave() {
    onSave(total, detail);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Input Penjualan Harian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="mb-1.5 block text-sm font-medium">Produk</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk..." />
              </SelectTrigger>
              <SelectContent>
                {activeProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nama_produk} — Rp {p.harga.toLocaleString("id-ID")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Label className="mb-1.5 block text-sm font-medium">Qty</Label>
            <Input
              type="number"
              min={1}
              value={selectedQty}
              onChange={(e) =>
                setSelectedQty(Math.max(1, Number(e.target.value)))
              }
            />
          </div>
          <Button
            onClick={addLine}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </div>

        {lines.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.map((d) => (
                  <TableRow key={d.product_id}>
                    <TableCell className="font-medium">{d.nama}</TableCell>
                    <TableCell className="text-right">
                      Rp{" "}
                      {products
                        .find((p) => p.id === d.product_id)
                        ?.harga.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={d.qty}
                        onChange={(e) =>
                          updateQty(d.product_id, Number(e.target.value))
                        }
                        className="w-20 text-right ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      Rp {d.subtotal.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(d.product_id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Penjualan</p>
            <p className="text-2xl font-bold text-foreground">
              Rp {total.toLocaleString("id-ID")}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={lines.length === 0}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            Simpan Penjualan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

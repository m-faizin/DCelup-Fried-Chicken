import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import type { InventoryItem } from "@/lib/data/types";

interface InventoryFormProps {
  outletId: string;
  tanggal: string;
  onSave: (items: InventoryItem[]) => void;
  initialItems?: InventoryItem[];
}

const defaultBahan = [
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

export function InventoryForm({
  outletId,
  tanggal,
  onSave,
  initialItems,
}: InventoryFormProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    } else {
      setItems(
        defaultBahan.map((bb) => ({
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          outlet_id: outletId,
          nama_bahan: bb.nama,
          satuan: bb.satuan,
          stok_awal: 0,
          stok_masuk: 0,
          stok_akhir: 0,
          terpakai: 0,
          tanggal,
        })),
      );
    }
  }, [initialItems, outletId, tanggal]);

  function updateItem(
    index: number,
    field: keyof InventoryItem,
    value: number | string,
  ) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as InventoryItem;
      if (
        field === "stok_awal" ||
        field === "stok_masuk" ||
        field === "stok_akhir"
      ) {
        const awal = Number(next[index].stok_awal);
        const masuk = Number(next[index].stok_masuk);
        const akhir = Number(next[index].stok_akhir);
        next[index] = { ...next[index], terpakai: awal + masuk - akhir };
      }
      return next;
    });
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        outlet_id: outletId,
        nama_bahan: "",
        satuan: "pcs",
        stok_awal: 0,
        stok_masuk: 0,
        stok_akhir: 0,
        terpakai: 0,
        tanggal,
      },
    ]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    onSave(items);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Input Stok Opname
        </CardTitle>
        <div className="text-sm text-muted-foreground">Tanggal: {tanggal}</div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Nama Bahan</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Stok Awal</TableHead>
                <TableHead>Stok Masuk</TableHead>
                <TableHead>Stok Akhir</TableHead>
                <TableHead>Terpakai</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.nama_bahan}
                      onChange={(e) =>
                        updateItem(idx, "nama_bahan", e.target.value)
                      }
                      placeholder="Nama bahan..."
                      className="min-w-[140px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.satuan}
                      onChange={(e) =>
                        updateItem(idx, "satuan", e.target.value)
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.stok_awal}
                      onChange={(e) =>
                        updateItem(idx, "stok_awal", Number(e.target.value))
                      }
                      className="w-24 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.stok_masuk}
                      onChange={(e) =>
                        updateItem(idx, "stok_masuk", Number(e.target.value))
                      }
                      className="w-24 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.stok_akhir}
                      onChange={(e) =>
                        updateItem(idx, "stok_akhir", Number(e.target.value))
                      }
                      className="w-24 text-right"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-brand-red">
                    {item.terpakai}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(idx)}
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

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" onClick={addRow} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Bahan
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2 bg-brand-red hover:bg-brand-red/90"
          >
            Simpan Stok Opname
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

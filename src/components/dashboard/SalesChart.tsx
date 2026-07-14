import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";

interface ChartDataPoint {
  tanggal: string;
  omset: number;
}

interface SalesChartProps {
  data: {
    outlet: { id: string; nama_outlet: string };
    data: ChartDataPoint[];
  }[];
}

const COLORS = ["#D32F2F", "#FF8F00", "#FFC107"];

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

export function SalesChart({ data }: SalesChartProps) {
  const merged =
    data[0]?.data.map((d, i) => {
      const row: Record<string, number | string> = {
        tanggal: formatShortDate(d.tanggal),
      };
      data.forEach((series) => {
        row[series.outlet.nama_outlet] = series.data[i]?.omset ?? 0;
      });
      return row;
    }) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Omset 7 Hari Terakhir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={merged}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="tanggal"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={formatRupiah}
            />
            <Tooltip
              formatter={(value: number) => [
                `Rp ${value.toLocaleString("id-ID")}`,
                "",
              ]}
              contentStyle={{
                backgroundColor: "var(--color-card)",
                borderColor: "var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-foreground)",
              }}
            />
            <Legend />
            {data.map((series, idx) => (
              <Line
                key={series.outlet.id}
                type="monotone"
                dataKey={series.outlet.nama_outlet}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

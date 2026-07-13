"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { SeriesPoint } from "@/services/analytics.service";

/**
 * Shared line-chart body for every trend on the dashboard (Daily/Weekly/
 * Monthly Visitors, Job Views Trend, Apply Click Trend). A plain client
 * component — Recharts has no server-render story, so this file is only
 * ever reached through `next/dynamic(..., { ssr: false })` in
 * `lazy-charts.tsx`, keeping the charting bundle out of the initial
 * server-rendered payload entirely.
 */
export function AnalyticsLineChart({ data, color = "hsl(var(--primary))" }: { data: SeriesPoint[]; color?: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No data for this period yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(var(--border))",
            fontSize: 12,
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

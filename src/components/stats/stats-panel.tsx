"use client";

import { useState } from "react";
import { VisitorsChart } from "@/components/stats/visitors-chart";
import type { PublicStatsResult } from "@/lib/services/stats.service";

const RANGE_OPTIONS = [
  { days: 1, label: "Last 24 hours" },
  { days: 7, label: "Last 7 days" },
  { days: 15, label: "Last 15 days" },
  { days: 30, label: "Last 30 days" },
];

function formatSessionTime(seconds: number | null): string {
  if (seconds === null) return "–";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-w-32 flex-col gap-1 border-r border-border px-4 py-3 last:border-r-0 sm:px-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function StatsPanel({ initialData }: { initialData: PublicStatsResult }) {
  const [data, setData] = useState(initialData);
  const [rangeDays, setRangeDays] = useState(initialData.rangeDays);
  const [loading, setLoading] = useState(false);

  async function handleRangeChange(days: number) {
    setRangeDays(days);
    setLoading(true);
    try {
      const res = await fetch(`/api/stats/public?range=${days}`);
      const next: PublicStatsResult = await res.json();
      setData(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <span className="text-sm font-medium text-muted-foreground">Traffic overview</span>
        <select
          value={rangeDays}
          onChange={(e) => handleRangeChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.days} value={opt.days}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap divide-border">
        <KpiTile label="Visitors" value={data.totalVisitors.toLocaleString()} />
        <KpiTile label="Your #1 KPI" value="–" />
        <KpiTile label="Conversion rate" value="–" />
        <KpiTile label="Bounce rate" value={data.bounceRatePct === null ? "–" : `${data.bounceRatePct}%`} />
        <KpiTile label="Session time" value={formatSessionTime(data.sessionTimeSeconds)} />
      </div>

      <div className={`border-t border-border p-4 transition-opacity sm:p-6 ${loading ? "opacity-50" : ""}`}>
        <VisitorsChart points={data.points} />
      </div>
    </section>
  );
}

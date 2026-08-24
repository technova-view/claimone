"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Eraser, Shuffle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
});

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function todayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function shiftKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// A plausible DataFast-style curve: a small overnight dip and a broader
// daytime bump, scaled by a peak visitor count.
function randomizedCurve(peak: number): number[] {
  const base = [
    0.55, 0.4, 0.28, 0.18, 0.12, 0.1, 0.14, 0.22, 0.35, 0.5, 0.62, 0.7, 0.75, 0.78, 0.74, 0.68, 0.72, 0.8, 0.9, 0.95,
    0.85, 0.7, 0.6, 0.6,
  ];
  return base.map((f) => Math.round(peak * f * (0.9 + Math.random() * 0.2)));
}

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${pad(s)}s`;
}

export default function AdminStatsPage() {
  const [dateKey, setDateKey] = useState(todayKey);
  const [hourly, setHourly] = useState<number[]>(new Array(24).fill(0));
  const [bounceRatePct, setBounceRatePct] = useState<number | "">("");
  const [sessionTimeSeconds, setSessionTimeSeconds] = useState<number | "">("");
  const [dayLoading, setDayLoading] = useState(true);
  const [daySaving, setDaySaving] = useState(false);

  const [randomMin, setRandomMin] = useState(2000);
  const [randomMax, setRandomMax] = useState(6000);

  const [onlineMin, setOnlineMin] = useState<number | "">("");
  const [onlineMax, setOnlineMax] = useState<number | "">("");
  const [rangeLoading, setRangeLoading] = useState(true);
  const [rangeSaving, setRangeSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on date change is the effect's whole job
    setDayLoading(true);
    fetch(`/api/admin/stats/day?date=${dateKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setHourly(data.hourly ?? new Array(24).fill(0));
        setBounceRatePct(data.bounceRatePct ?? "");
        setSessionTimeSeconds(data.sessionTimeSeconds ?? "");
      })
      .finally(() => {
        if (!cancelled) setDayLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats/settings")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setOnlineMin(data.onlineMin ?? "");
        setOnlineMax(data.onlineMax ?? "");
      })
      .finally(() => {
        if (!cancelled) setRangeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveDay() {
    setDaySaving(true);
    try {
      await fetch("/api/admin/stats/day", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateKey,
          hourly,
          bounceRatePct: bounceRatePct === "" ? null : bounceRatePct,
          sessionTimeSeconds: sessionTimeSeconds === "" ? null : sessionTimeSeconds,
        }),
      });
    } finally {
      setDaySaving(false);
    }
  }

  async function handleSaveRange() {
    if (onlineMin === "" || onlineMax === "") return;
    setRangeSaving(true);
    try {
      await fetch("/api/admin/stats/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlineMin, onlineMax }),
      });
    } finally {
      setRangeSaving(false);
    }
  }

  function handleRandomize() {
    const lo = Math.min(randomMin, randomMax);
    const hi = Math.max(randomMin, randomMax);
    const peak = Math.round(lo + Math.random() * (hi - lo));
    setHourly(randomizedCurve(peak));
    setBounceRatePct(Math.round(50 + Math.random() * 25));
    setSessionTimeSeconds(Math.round(30 + Math.random() * 180));
  }

  function handleClear() {
    setHourly(new Array(24).fill(0));
    setBounceRatePct(0);
    setSessionTimeSeconds(0);
  }

  const totalVisitors = hourly.reduce((sum, v) => sum + (Number(v) || 0), 0);

  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Fake stats</h1>
            <p className="text-sm text-muted-foreground">
              Controls what visitors see on the public /stats page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateKey((d) => shiftKey(d, -1))}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-32 text-center font-mono text-sm font-semibold">{dateKey}</span>
            <button
              type="button"
              onClick={() => setDateKey((d) => shiftKey(d, 1))}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
            <Button type="button" variant="outline" onClick={() => setDateKey(todayKey())}>
              Today
            </Button>
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Hourly visitors — {dateKey}</h2>
              <p className="text-sm text-muted-foreground">Total for this day: {totalVisitors.toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Peak range</span>
                <input
                  type="number"
                  min={0}
                  value={randomMin}
                  onChange={(e) => setRandomMin(Number(e.target.value) || 0)}
                  className="w-20 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
                <span>–</span>
                <input
                  type="number"
                  min={0}
                  value={randomMax}
                  onChange={(e) => setRandomMax(Number(e.target.value) || 0)}
                  className="w-20 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <Button type="button" variant="secondary" onClick={handleRandomize}>
                <Shuffle className="size-3.5" />
                Randomize
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                <Eraser className="size-3.5" />
                Clear
              </Button>
            </div>
          </div>

          <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8", dayLoading && "opacity-50")}>
            {HOUR_LABELS.map((label, hour) => (
              <label key={hour} className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-muted-foreground">{label}</span>
                <input
                  type="number"
                  min={0}
                  value={hourly[hour] ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 0;
                    setHourly((prev) => prev.map((x, i) => (i === hour ? v : x)));
                  }}
                  className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Bounce rate (%)
              <input
                type="number"
                min={0}
                max={100}
                value={bounceRatePct}
                onChange={(e) => setBounceRatePct(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="e.g. 65"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Session time (seconds)
              <input
                type="number"
                min={0}
                value={sessionTimeSeconds}
                onChange={(e) => setSessionTimeSeconds(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="e.g. 59"
              />
              {sessionTimeSeconds !== "" && (
                <span className="text-xs text-muted-foreground">{formatSeconds(Number(sessionTimeSeconds))}</span>
              )}
            </label>
          </div>

          <Button type="button" onClick={handleSaveDay} disabled={daySaving} className="mt-6 h-10 px-6">
            {daySaving ? "Saving…" : "Save day"}
          </Button>
        </section>

        <section className={cn("rounded-3xl border border-border bg-card p-6", rangeLoading && "opacity-50")}>
          <h2 className="text-lg font-semibold">Online now range</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The public page shows a random number in this range, re-rolled every few seconds.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-md">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Min
              <input
                type="number"
                min={0}
                value={onlineMin}
                onChange={(e) => setOnlineMin(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Max
              <input
                type="number"
                min={0}
                value={onlineMax}
                onChange={(e) => setOnlineMax(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
          </div>
          <Button type="button" onClick={handleSaveRange} disabled={rangeSaving} className="mt-6 h-10 px-6">
            {rangeSaving ? "Saving…" : "Save range"}
          </Button>
        </section>
      </div>
    </AdminShell>
  );
}

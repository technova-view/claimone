"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function formatAmount(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Renders inside LeaderboardTable, a client component with no server-fetched
// revenue figure available there, so this fetches its own number on mount
// instead of taking it as a prop.
export function TotalRevenueStatClient() {
  const [totalCents, setTotalCents] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/stats/total-revenue", { cache: "no-store" });
      const data = await res.json();
      setTotalCents(data.totalCents);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch on mount
    handleRefresh();
  }, [handleRefresh]);

  if (totalCents === null) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-sm text-muted-foreground">
        Total claimed on <span className="font-semibold text-primary">claimone.lol</span>
      </p>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/5 blur-2xl" />

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh total"
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5 shrink-0", refreshing && "animate-spin")} />
        </button>

        <div className="relative flex items-baseline gap-1">
          <span className="font-mono text-4xl font-bold text-primary sm:text-5xl">$</span>
          <span className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {formatAmount(totalCents)}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">raised since launch</p>
    </div>
  );
}

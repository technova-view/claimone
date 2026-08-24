"use client";

import { useState } from "react";
import { BidScope } from "@/lib/types/scope";
import { Countdown } from "@/components/leaderboard/countdown";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/leaderboard";

const SCOPE_OPTIONS: { value: BidScope; label: string }[] = [
  { value: BidScope.ALL_TIME, label: "All time" },
  { value: BidScope.DAILY, label: "Daily" },
  { value: BidScope.WEEKLY, label: "Weekly" },
];

// A single category's rows for every scope are already loaded server-side,
// so switching scope here is just a state flip — unlike the homepage's
// LeaderboardSection, no fetch-on-change is needed since there's no
// category dimension left to vary.
export function CategoryScopeBoard({
  rowsByScope,
  categorySlug,
}: {
  rowsByScope: Record<BidScope, LeaderboardRow[]>;
  categorySlug: string;
}) {
  const [scope, setScope] = useState<BidScope>(BidScope.ALL_TIME);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-1 rounded-full border border-border bg-secondary p-1">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setScope(opt.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                scope === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {scope !== BidScope.ALL_TIME && <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />}
      </div>

      <LeaderboardTable key={scope} rows={rowsByScope[scope]} scope={scope} categorySlug={categorySlug} />
    </div>
  );
}

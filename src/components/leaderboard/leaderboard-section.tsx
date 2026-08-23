"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BidScope } from "@/lib/types/scope";
import { slugFromScope } from "@/lib/services/scope-slug";
import { CategoryFilterPills } from "@/components/category/category-filter-pills";
import { Countdown } from "@/components/leaderboard/countdown";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/leaderboard";

const SCOPE_OPTIONS: { value: BidScope; label: string }[] = [
  { value: BidScope.ALL_TIME, label: "All time" },
  { value: BidScope.DAILY, label: "Daily" },
  { value: BidScope.WEEKLY, label: "Weekly" },
];

export function LeaderboardSection({
  initialRowsByScope,
  categories,
}: {
  initialRowsByScope: Record<BidScope, LeaderboardRow[]>;
  categories: { slug: string; name: string }[];
}) {
  const [scope, setScope] = useState<BidScope>(BidScope.ALL_TIME);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [filteredRows, setFilteredRows] = useState<LeaderboardRow[] | null>(null);
  // The key of the filter that filteredRows currently reflects. When it
  // doesn't match the filter the user has selected, a fetch is in flight —
  // derived rather than a separate boolean so there's no state to fall out
  // of sync with what's actually been fetched.
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const scopeSlug = slugFromScope(scope);
  const desiredKey = categorySlug === null ? null : `${scopeSlug}:${categorySlug}`;
  const isLoading = desiredKey !== null && desiredKey !== resolvedKey;
  const rows = categorySlug === null ? initialRowsByScope[scope] : (filteredRows ?? initialRowsByScope[scope]);

  useEffect(() => {
    if (desiredKey === null || categorySlug === null) return;
    let cancelled = false;
    const params = new URLSearchParams({ scope: scopeSlug, category: categorySlug });
    fetch(`/api/leaderboard?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setFilteredRows(data);
        setResolvedKey(desiredKey);
      });
    return () => {
      cancelled = true;
    };
  }, [desiredKey, scopeSlug, categorySlug]);

  function handleScopeChange(next: BidScope) {
    setScope(next);
    setCategorySlug(null);
    setFilteredRows(null);
    setResolvedKey(null);
  }

  function handleCategoryChange(next: string | null) {
    setCategorySlug(next);
    setFilteredRows(null);
    setResolvedKey(null);
  }

  return (
    <section id="leaderboard" className="scroll-mt-24 flex flex-col gap-5">
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-1 rounded-full border border-border bg-secondary p-1">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleScopeChange(opt.value)}
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

      <div id="categories" className="scroll-mt-24 flex min-w-0 items-center gap-2">
        <CategoryFilterPills categories={categories} activeSlug={categorySlug} onChange={handleCategoryChange} />
        {isLoading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />}
      </div>

      <div
        className={cn("transition-opacity duration-150", isLoading && "opacity-60")}
        aria-live="polite"
        aria-busy={isLoading}
      >
        <LeaderboardTable
          key={`${scope}:${categorySlug ?? "all"}`}
          rows={rows}
          scope={scope}
          categorySlug={categorySlug ?? undefined}
        />
      </div>
    </section>
  );
}

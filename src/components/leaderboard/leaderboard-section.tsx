"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { BidScope } from "@/lib/types/scope";
import { slugFromScope } from "@/lib/services/scope-slug";
import { CategoryFilterPills } from "@/components/category/category-filter-pills";
import { Countdown } from "@/components/leaderboard/countdown";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/leaderboard";

export function LeaderboardSection({
  initialRowsByScope,
  categories,
}: {
  initialRowsByScope: Record<BidScope, LeaderboardRow[]>;
  categories: { slug: string; name: string }[];
}) {
  // Scope is driven by the toggle in SiteHeader (shown only on this page),
  // not owned here — a single source of truth shared across the header
  // instead of this section having its own separate toggle.
  const { homeScope: scope } = useAppModals();
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

  // The category filter is local to whichever board is being viewed — reset
  // it when the header toggle switches boards, same as the old in-component
  // toggle used to do.
  const lastHandledScopeRef = useRef(scope);
  useEffect(() => {
    if (lastHandledScopeRef.current === scope) return;
    lastHandledScopeRef.current = scope;
    setCategorySlug(null);
    setFilteredRows(null);
    setResolvedKey(null);
  }, [scope]);

  function handleCategoryChange(next: string | null) {
    setCategorySlug(next);
    setFilteredRows(null);
    setResolvedKey(null);
  }

  return (
    <section id="leaderboard" className="scroll-mt-24 flex flex-col gap-5">
      {scope !== BidScope.ALL_TIME && (
        <div className="flex items-center justify-center">
          <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />
        </div>
      )}

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

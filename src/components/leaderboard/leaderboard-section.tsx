"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { BidScope } from "@/lib/types/scope";
import { slugFromScope } from "@/lib/services/scope-slug";
import { CategoryFilterPills } from "@/components/category/category-filter-pills";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Countdown } from "@/components/leaderboard/countdown";
import { Button } from "@/components/ui/button";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import type { LeaderboardRow } from "@/lib/types/leaderboard";

const SCOPE_LABEL: Record<BidScope, string> = {
  [BidScope.ALL_TIME]: "All-time leaderboard",
  [BidScope.DAILY]: "Daily leaderboard",
  [BidScope.WEEKLY]: "Weekly leaderboard",
};

export function LeaderboardSection({
  scope,
  initialRows,
  categories,
}: {
  scope: BidScope;
  initialRows: LeaderboardRow[];
  categories: { slug: string; name: string }[];
}) {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [filteredRows, setFilteredRows] = useState<LeaderboardRow[] | null>(null);
  const { openHallOfFame } = useAppModals();
  const scopeSlug = slugFromScope(scope);
  const hasHallOfFame = scope === BidScope.DAILY || scope === BidScope.WEEKLY;
  const rows = categorySlug === null ? initialRows : (filteredRows ?? initialRows);

  useEffect(() => {
    if (categorySlug === null) return;
    const params = new URLSearchParams({ scope: scopeSlug, category: categorySlug });
    fetch(`/api/leaderboard?${params}`)
      .then((res) => res.json())
      .then(setFilteredRows);
  }, [categorySlug, scopeSlug]);

  return (
    <section id={scopeSlug} className="scroll-mt-24 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">
            {categories.find((c) => c.slug === categorySlug)?.name ?? "All categories"}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{SCOPE_LABEL[scope]}</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasHallOfFame && (
            <Button variant="ghost" size="sm" onClick={() => openHallOfFame(scope === BidScope.DAILY ? "daily" : "weekly")}>
              <Trophy className="size-4" data-icon="inline-start" />
              Hall of Fame
            </Button>
          )}
          {scope !== BidScope.ALL_TIME && (
            <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />
          )}
        </div>
      </div>
      <CategoryFilterPills categories={categories} activeSlug={categorySlug} onChange={setCategorySlug} />
      <LeaderboardTable rows={rows} scope={scope} categorySlug={categorySlug ?? undefined} />
    </section>
  );
}

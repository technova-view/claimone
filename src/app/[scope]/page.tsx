import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { CategoryNav } from "@/components/category/category-nav";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Countdown } from "@/components/leaderboard/countdown";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { listCategories } from "@/lib/services/category.service";
import { scopeFromSlug } from "@/lib/services/scope-slug";
import { BidScope } from "@/lib/db/entities/bid.entity";

const SCOPE_LABEL: Record<BidScope, string> = {
  [BidScope.DAILY]: "Daily leaderboard",
  [BidScope.WEEKLY]: "Weekly leaderboard",
  [BidScope.ALL_TIME]: "All-time leaderboard",
};

export default async function ScopeLeaderboardPage({
  params,
}: {
  params: Promise<{ scope: string }>;
}) {
  const { scope: scopeSlug } = await params;
  const scope = scopeFromSlug(scopeSlug);
  if (!scope) notFound();

  const [rows, categories] = await Promise.all([
    getLeaderboard({ scope }),
    listCategories(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader activeScope={scopeSlug} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{SCOPE_LABEL[scope]}</h1>
          {scope !== BidScope.ALL_TIME && (
            <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />
          )}
        </div>
        <CategoryNav scope={scopeSlug} categories={categories} />
        <LeaderboardTable rows={rows} />
      </main>
    </div>
  );
}

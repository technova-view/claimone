import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { CategoryNav } from "@/components/category/category-nav";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Countdown } from "@/components/leaderboard/countdown";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { getCategoryBySlug, listCategories } from "@/lib/services/category.service";
import { scopeFromSlug } from "@/lib/services/scope-slug";
import { BidScope } from "@/lib/db/entities/bid.entity";

const SCOPE_LABEL: Record<BidScope, string> = {
  [BidScope.DAILY]: "Daily",
  [BidScope.WEEKLY]: "Weekly",
  [BidScope.ALL_TIME]: "All-time",
};

export default async function CategoryLeaderboardPage({
  params,
}: {
  params: Promise<{ scope: string; categorySlug: string }>;
}) {
  const { scope: scopeSlug, categorySlug } = await params;
  const scope = scopeFromSlug(scopeSlug);
  if (!scope) notFound();

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [rows, categories] = await Promise.all([
    getLeaderboard({ scope, categorySlug }),
    listCategories(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader activeScope={scopeSlug} activeCategorySlug={categorySlug} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-7 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">{SCOPE_LABEL[scope]}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
          </div>
          {scope !== BidScope.ALL_TIME && (
            <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />
          )}
        </div>
        <CategoryNav scope={scopeSlug} categories={categories} activeSlug={categorySlug} />
        <LeaderboardTable rows={rows} scope={scope} categorySlug={categorySlug} />
      </main>
    </div>
  );
}

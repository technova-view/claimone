import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { CategoryNav } from "@/components/category/category-nav";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Countdown } from "@/components/leaderboard/countdown";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { getCategoryBySlug, listCategories } from "@/lib/services/category.service";
import { scopeFromSlug } from "@/lib/services/scope-slug";
import { BidScope } from "@/lib/db/entities/bid.entity";

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
      <SiteHeader activeScope={scopeSlug} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
          {scope !== BidScope.ALL_TIME && (
            <Countdown scope={scope === BidScope.DAILY ? "daily" : "weekly"} />
          )}
        </div>
        <CategoryNav scope={scopeSlug} categories={categories} activeSlug={categorySlug} />
        <LeaderboardTable rows={rows} />
      </main>
    </div>
  );
}

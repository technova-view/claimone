import { SiteHeader } from "@/components/site/site-header";
import { StatusBar } from "@/components/site/status-bar";
import { ClaimHero } from "@/components/leaderboard/claim-hero";
import { LeaderboardSection } from "@/components/leaderboard/leaderboard-section";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { listCategories } from "@/lib/services/category.service";
import { BidScope } from "@/lib/db/entities/bid.entity";

export default async function HomePage() {
  const [allTimeRows, dailyRows, weeklyRows, categoriesEntities] = await Promise.all([
    getLeaderboard({ scope: BidScope.ALL_TIME }),
    getLeaderboard({ scope: BidScope.DAILY }),
    getLeaderboard({ scope: BidScope.WEEKLY }),
    listCategories(),
  ]);

  const categories = categoriesEntities.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-wrap items-center justify-center gap-4 px-4 pt-2 pb-1">
        <StatusBar />
      </div>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-6 pb-8">
        <ClaimHero
          rowsByScope={{
            [BidScope.ALL_TIME]: allTimeRows,
            [BidScope.DAILY]: dailyRows,
            [BidScope.WEEKLY]: weeklyRows,
          }}
          categories={categories}
        />
        <LeaderboardSection
          initialRowsByScope={{
            [BidScope.ALL_TIME]: allTimeRows,
            [BidScope.DAILY]: dailyRows,
            [BidScope.WEEKLY]: weeklyRows,
          }}
          categories={categories}
        />
      </main>
    </div>
  );
}

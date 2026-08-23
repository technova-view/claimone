import { SiteHeader } from "@/components/site/site-header";
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
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-8">
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

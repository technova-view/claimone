import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { listCategories } from "@/lib/services/category.service";
import { BidScope } from "@/lib/db/entities/bid.entity";

export const metadata: Metadata = {
  title: "Stats · claimone.lol",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function StatsPage() {
  const [rows, categories] = await Promise.all([getLeaderboard({ scope: BidScope.ALL_TIME }), listCategories()]);
  const totalBidCents = rows.reduce((sum, row) => sum + row.amountCents, 0);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Stats</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live listings</p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total bid</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatAmount(totalBidCents)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categories</p>
            <p className="mt-1 text-2xl font-bold">{categories.length}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          These reflect the all-time board right now. Visitor and live-presence tracking isn&rsquo;t wired up yet.
        </p>
      </main>
    </div>
  );
}

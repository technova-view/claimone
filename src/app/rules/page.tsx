import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { MIN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

export const metadata: Metadata = {
  title: "Rules · claimone.lol",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function RulesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Rules</h1>
        <ul className="flex flex-col gap-3 text-muted-foreground">
          <li>Pick a category, enter your URL or X handle, and set a bid amount.</li>
          <li>Rank within a category is ordered by bid amount, highest first.</li>
          <li>The minimum bid to list is {formatAmount(MIN_BID_CENTS)}.</li>
          <li>
            To take the #1 spot in a category, you need to bid at least {formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}
            {" "}above the current top bid.
          </li>
          <li>Payment is handled at checkout; your listing goes live once payment completes.</li>
        </ul>
      </main>
    </div>
  );
}

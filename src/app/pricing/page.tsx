import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { MIN_BID_CENTS, MIN_RAISE_OWN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

export const metadata: Metadata = {
  title: "Pricing · claimone.lol",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="mt-2 text-muted-foreground">
            There are no subscription tiers on claimone.lol — you pay a one-time bid amount to claim a ranked spot,
            and your bid amount is your price. Every listing is a single digital purchase, charged once, delivered
            instantly.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">How the price is set</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Minimum to list</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatAmount(MIN_BID_CENTS)}</p>
              <p className="mt-1 text-sm text-muted-foreground">The lowest bid that gets a listing onto the board.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Take the #1 spot</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">
                +{formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Minimum raise above the current top bid, per category.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Raise your own bid</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">
                +{formatAmount(MIN_RAISE_OWN_BID_CENTS)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Minimum increase to top up an existing listing.</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Above those minimums, there&rsquo;s no price cap and no fixed catalog — you choose exactly how much to
            bid, and the highest bid in a category holds rank #1. The current going rate for any spot is always
            visible on the{" "}
            <a href="/" className="text-primary hover:underline">
              leaderboard
            </a>{" "}
            before you pay.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Three boards, three prices</h2>
          <p className="text-muted-foreground">
            The same listing can be bid on independently across three boards, each with its own going rate:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">All-time</span> — a permanent placement; you hold it
              until someone outbids you.
            </li>
            <li>
              <span className="font-medium text-foreground">Weekly</span> — resets every week on a fixed UTC
              schedule; the winner is archived to the Hall of Fame.
            </li>
            <li>
              <span className="font-medium text-foreground">Daily</span> — resets every day on a fixed UTC schedule,
              also archived on completion.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payment &amp; delivery</h2>
          <p className="text-muted-foreground">
            Checkout is handled by Paddle, our payment provider and Merchant of Record — all major cards are
            accepted, and Paddle displays the total in your local currency and handles any applicable sales
            tax/VAT at checkout. Your listing goes live immediately once payment is confirmed; there&rsquo;s nothing
            further to install, download, or wait for.
          </p>
          <p className="text-muted-foreground">
            Because delivery is instant and complete at that point, bids are non-refundable — see our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>{" "}
            for details.
          </p>
        </section>
      </main>
    </div>
  );
}

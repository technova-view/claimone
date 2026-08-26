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
          <p className="mt-2 text-muted-foreground">ClaimOne does not use subscriptions or recurring plans.</p>
          <p className="mt-2 text-muted-foreground">
            Each listing is purchased as a one-time digital service. You choose the amount you want to bid for your
            listing, and that bid determines its position according to the applicable leaderboard&rsquo;s ranking
            rules.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">How pricing works</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Minimum to list</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatAmount(MIN_BID_CENTS)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The minimum amount required to create a listing on a leaderboard.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Increase a listing</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">
                +{formatAmount(MIN_RAISE_OWN_BID_CENTS)} minimum
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You can increase an existing listing&rsquo;s bid by at least this amount, subject to the current
                leaderboard rules.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reach #1</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">
                +{formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                To move a listing into the #1 position, your bid must meet the minimum amount required above the
                current #1 listing, as shown on the leaderboard.
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            There is no fixed catalog of prices. The amount required for a particular position depends on the
            current bids on that leaderboard and is displayed before you complete your purchase.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Three independent leaderboards</h2>
          <p className="text-muted-foreground">
            The same listing can have separate bids on each of ClaimOne&rsquo;s three leaderboards:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">All-time</span> — the listing remains ranked until
              another eligible listing surpasses its bid.
            </li>
            <li>
              <span className="font-medium text-foreground">Weekly</span> — rankings reset according to the
              published weekly UTC schedule. The top-ranked listing at the end of the period may be archived in the
              Hall of Fame.
            </li>
            <li>
              <span className="font-medium text-foreground">Daily</span> — rankings reset according to the published
              daily UTC schedule. The top-ranked listing at the end of the period may be archived in the Hall of
              Fame.
            </li>
          </ul>
          <p className="text-muted-foreground">Each leaderboard has its own ranking and bid amounts.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">What you purchase</h2>
          <p className="text-muted-foreground">
            Your purchase activates a public listing on{" "}
            <Link href="/" className="text-primary hover:underline">
              ClaimOne
            </Link>{" "}
            and assigns it a leaderboard position according to the applicable ranking rules.
          </p>
          <p className="text-muted-foreground">Your purchase includes:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Public listing</span> — Your product website or X profile
              is displayed on ClaimOne.
            </li>
            <li>
              <span className="font-medium text-foreground">Category placement</span> — Your listing appears in the
              category you selected.
            </li>
            <li>
              <span className="font-medium text-foreground">Leaderboard ranking</span> — Your bid determines your
              position relative to other eligible listings.
            </li>
            <li>
              <span className="font-medium text-foreground">Instant activation</span> — Your listing becomes active
              after successful payment confirmation.
            </li>
          </ul>

          <h3 className="mt-2 text-base font-semibold">What your purchase does not guarantee</h3>
          <p className="text-muted-foreground">
            ClaimOne provides leaderboard placement, not guaranteed marketing results. A purchase does not guarantee:
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>A specific number of visitors or clicks</li>
            <li>Customers, leads, or sales</li>
            <li>Followers or conversions</li>
            <li>A permanent position on the leaderboard</li>
            <li>Search-engine rankings</li>
            <li>Any financial return</li>
          </ul>
          <p className="text-muted-foreground">
            Your ranking can change when other eligible listings increase their bids or when a Daily or Weekly
            leaderboard resets.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payment and delivery</h2>
          <p className="text-muted-foreground">Checkout is handled securely by our payment provider and Merchant of Record.</p>
          <p className="text-muted-foreground">
            Our payment provider processes the payment and may display the transaction in your local currency and
            calculate applicable taxes at checkout.
          </p>
          <p className="text-muted-foreground">
            Your listing becomes active after payment is successfully confirmed. No software download, installation,
            or physical delivery is required.
          </p>
          <p className="text-muted-foreground">
            Because the digital service may be delivered immediately after successful payment, transactions are
            generally non-refundable once activated, subject to our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>{" "}
            and any refund or consumer rights that cannot legally be excluded.
          </p>
        </section>
      </main>
    </div>
  );
}

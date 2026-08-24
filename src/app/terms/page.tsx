import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { MIN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

export const metadata: Metadata = {
  title: "Terms of Service · claimone.lol",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated 2026-08-25.</p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What claimone.lol is</h2>
          <p className="text-muted-foreground">
            claimone.lol is a pay-to-rank leaderboard. Anyone can list a URL or an X (Twitter) handle in a category;
            the amount bid determines rank within that category — the highest bid holds #1. By submitting a bid or
            otherwise using the site, you agree to these terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">How ranking works</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>The minimum bid to list is {formatAmount(MIN_BID_CENTS)}.</li>
            <li>
              Taking the #1 spot in a category requires bidding at least {formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}
              {" "}above the current top bid.
            </li>
            <li>
              There are three independent boards — All-time, Daily, and Weekly. Daily and Weekly boards reset on a
              fixed UTC schedule; the top listing from each completed period is archived to the Hall of Fame.
            </li>
            <li>Your rank is not guaranteed to last — another bid can outrank you at any time before a reset.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-muted-foreground">
            Payments are processed by Paddle, our payment provider and Merchant of Record. Your listing goes live
            once Paddle confirms payment. By paying, you also agree to Paddle&rsquo;s own terms. See our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Your content</h2>
          <p className="text-muted-foreground">
            You&rsquo;re solely responsible for the URL, handle, and description your bid submits. Don&rsquo;t list
            anything illegal, infringing, deceptive, or malicious (including phishing links, malware, or content that
            violates a third party&rsquo;s rights). We may remove a listing that violates these terms at any time,
            without refund.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">No warranty</h2>
          <p className="text-muted-foreground">
            The service is provided &ldquo;as is,&rdquo; without warranties of any kind. We&rsquo;re not liable for
            indirect, incidental, or consequential damages arising from your use of claimone.lol, to the maximum
            extent permitted by law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Changes</h2>
          <p className="text-muted-foreground">
            We may update these terms as the product changes. Continuing to use the site after an update means you
            accept the revised terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Email{" "}
            <a href="mailto:waliurrahman957@gmail.com" className="text-primary hover:underline">
              waliurrahman957@gmail.com
            </a>{" "}
            or{" "}
            <a href="mailto:technova.view@gmail.com" className="text-primary hover:underline">
              technova.view@gmail.com
            </a>
            , or reach out via X:{" "}
            <a href="https://x.com/MarufSalim35872" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              @MarufSalim35872
            </a>{" "}
            or{" "}
            <a href="https://x.com/Waliur57" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              @Waliur57
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

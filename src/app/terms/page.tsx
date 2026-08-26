import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";

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
          <p className="mt-2 text-sm text-muted-foreground">Last updated August 27, 2026.</p>
        </div>

        <p className="text-muted-foreground">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of ClaimOne at claimone.lol
          (&ldquo;ClaimOne&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By using ClaimOne,
          submitting a listing, or completing a payment, you agree to these Terms.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">1. What ClaimOne Is</h2>
          <p className="text-muted-foreground">
            ClaimOne is a paid public ranking and product-discovery platform. Customers may pay to list an eligible
            product website or X profile and obtain a leaderboard position based on the amount paid, according to
            the published{" "}
            <a href="/rules" className="text-primary hover:underline">
              Rules
            </a>
            .
          </p>
          <p className="text-muted-foreground">
            A payment purchases leaderboard placement. It does not guarantee traffic, clicks, customers, revenue,
            sales, conversions, search-engine rankings, or a particular final position.
          </p>
          <p className="text-muted-foreground">
            ClaimOne does not operate a lottery, prize pool, betting system, or random-selection system. Payments
            made through ClaimOne do not create a monetary prize or payout for users.
          </p>
          <p className="text-muted-foreground">
            You must be of legal age to enter into binding transactions in your jurisdiction to make a payment
            through ClaimOne.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">2. Eligible Listings</h2>
          <p className="text-muted-foreground">You may submit:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>A product or service website; or</li>
            <li>An X profile using an @handle.</li>
          </ul>
          <p className="text-muted-foreground">
            Certain platform links, including App Store, Play Store, and GitHub links, may be identified by their
            relevant path so that separate products can maintain separate listings.
          </p>
          <p className="text-muted-foreground">ClaimOne does not permit:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Telegram, WhatsApp, Discord, Messenger, Signal, or similar chat/invite links;</li>
            <li>Phishing, malware, or malicious websites;</li>
            <li>Illegal or deceptive content;</li>
            <li>Content that infringes another person&rsquo;s intellectual property, privacy, or other rights;</li>
            <li>Content that violates applicable laws or regulations; or</li>
            <li>Any other content that ClaimOne reasonably determines is inappropriate for the platform.</li>
          </ul>
          <p className="text-muted-foreground">
            Submitted URLs are stored as provided, with &ldquo;https://&rdquo; added automatically if it&rsquo;s
            missing. No other part of the URL is modified.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">3. Bids and Ranking</h2>
          <p className="text-muted-foreground">Bids are denominated in whole United States dollars.</p>
          <p className="text-muted-foreground">
            The minimum bid to create a listing is {formatAmount(MIN_BID_CENTS)}, unless a different minimum is
            displayed on the ClaimOne interface.
          </p>
          <p className="text-muted-foreground">
            A bid determines the listing&rsquo;s position according to the applicable leaderboard&rsquo;s ranking
            rules.
          </p>
          <p className="text-muted-foreground">ClaimOne currently provides:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>All-time rankings;</li>
            <li>Daily rankings; and</li>
            <li>Weekly rankings.</li>
          </ul>
          <p className="text-muted-foreground">
            Daily and Weekly rankings reset according to the schedule displayed by ClaimOne and may use UTC as the
            governing time zone.
          </p>
          <p className="text-muted-foreground">
            Completed Daily and Weekly rankings may be archived in the ClaimOne Hall of Fame.
          </p>
          <p className="text-muted-foreground">
            Rankings are not guaranteed to remain unchanged. A later eligible bid may cause a listing&rsquo;s position
            to change before the applicable ranking period ends.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">4. Raising an Existing Listing</h2>
          <p className="text-muted-foreground">
            If you submit the same eligible website or X handle again at a higher bid, ClaimOne treats it as a new
            listing at that full bid amount, which supersedes and replaces your prior listing for the same
            website/handle in that category and leaderboard once payment is confirmed.
          </p>
          <p className="text-muted-foreground">
            You are charged the full amount of the new bid, not only the difference from your previous bid. The
            amount previously paid for the superseded listing is not refunded or credited toward the new one — see
            our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>
            .
          </p>
          <p className="text-muted-foreground">ClaimOne&rsquo;s interface at the time of the transaction controls the amount charged.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">5. Payment</h2>
          <p className="text-muted-foreground">
            Payments are processed through our payment provider and Merchant of Record,{" "}
            <a
              href="https://www.paddle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Paddle
            </a>
            .
          </p>
          <p className="text-muted-foreground">Your listing becomes active after successful payment confirmation.</p>
          <p className="text-muted-foreground">
            By completing a transaction, you authorize the applicable payment and confirm that the information you
            provide is accurate.
          </p>
          <p className="text-muted-foreground">
            Paddle may process payment, tax, invoicing, fraud prevention, refunds, and related transaction functions
            under its own terms and policies.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">6. No Guaranteed Traffic or Results</h2>
          <p className="text-muted-foreground">ClaimOne provides public listing and leaderboard placement.</p>
          <p className="text-muted-foreground">A payment does not guarantee:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>A particular number of visitors;</li>
            <li>Clicks;</li>
            <li>Leads;</li>
            <li>Sales;</li>
            <li>Downloads;</li>
            <li>Followers;</li>
            <li>Conversions;</li>
            <li>Search-engine rankings; or</li>
            <li>Any financial return.</li>
          </ul>
          <p className="text-muted-foreground">Leaderboard position may change after your transaction.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">7. Listing Content and Responsibility</h2>
          <p className="text-muted-foreground">
            You are responsible for the website, X handle, description, and other information you submit.
          </p>
          <p className="text-muted-foreground">
            You represent that you have the right or authorization to submit the listing and that the listing does
            not violate applicable law or third-party rights.
          </p>
          <p className="text-muted-foreground">
            We may review, restrict, suspend, or remove listings that violate these Terms or create legal, security,
            or platform-integrity concerns.
          </p>
          <p className="text-muted-foreground">
            Where a listing is removed because of a violation of these Terms, the transaction may remain
            non-refundable except where applicable law requires otherwise.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">8. Platform Integrity</h2>
          <p className="text-muted-foreground">
            You must not attempt to manipulate ClaimOne through fraudulent transactions, payment abuse, automated
            attacks, unauthorized access, or other activity intended to interfere with the platform or its ranking
            system.
          </p>
          <p className="text-muted-foreground">
            We may suspend or remove accounts, listings, or transactions associated with suspected fraud, abuse, or
            security threats.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">9. Refunds and Disputes</h2>
          <p className="text-muted-foreground">
            Refunds are governed by our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>{" "}
            and applicable law.
          </p>
          <p className="text-muted-foreground">
            Because leaderboard placement may become active immediately after successful payment, transactions may
            generally be non-refundable once delivered, subject to applicable statutory rights and any refund rights
            provided by Paddle.
          </p>
          <p className="text-muted-foreground">
            You should contact us or Paddle before initiating a payment dispute or chargeback where possible.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">10. Intellectual Property</h2>
          <p className="text-muted-foreground">
            ClaimOne&rsquo;s software, branding, design, text, graphics, and other original materials are owned by or
            licensed to ClaimOne and may not be copied, modified, distributed, or used without permission, except as
            permitted by law.
          </p>
          <p className="text-muted-foreground">
            You retain rights to content you submit, while granting ClaimOne the permission necessary to display that
            content as part of the ClaimOne service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">11. Availability</h2>
          <p className="text-muted-foreground">
            We aim to keep ClaimOne available and functioning reliably, but we do not guarantee uninterrupted or
            error-free operation.
          </p>
          <p className="text-muted-foreground">
            We may temporarily suspend or modify the service for maintenance, security, updates, or other operational
            reasons.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">12. Disclaimer</h2>
          <p className="text-muted-foreground">
            ClaimOne is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the maximum extent
            permitted by law.
          </p>
          <p className="text-muted-foreground">
            We do not guarantee that the service will meet every user&rsquo;s expectations or that a listing will
            achieve any particular ranking, traffic level, or commercial result.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">13. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by applicable law, ClaimOne will not be liable for indirect, incidental,
            special, consequential, or punitive damages arising from your use of the service.
          </p>
          <p className="text-muted-foreground">
            Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">14. Changes to These Terms</h2>
          <p className="text-muted-foreground">We may update these Terms as ClaimOne develops.</p>
          <p className="text-muted-foreground">
            The updated version will be posted on this page with a revised &ldquo;Last updated&rdquo; date. Where
            required by law, we will provide additional notice of material changes.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">15. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws applicable to ClaimOne and its operator, except where applicable
            consumer-protection laws provide otherwise.
          </p>
          <p className="text-muted-foreground">Nothing in these Terms limits rights that cannot legally be excluded.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">16. Contact</h2>
          <p className="text-muted-foreground">For questions about ClaimOne or these Terms, contact:</p>
          <p className="text-muted-foreground">
            Email{" "}
            <a href="mailto:waliurrahman957@gmail.com" className="text-primary hover:underline">
              waliurrahman957@gmail.com
            </a>{" "}
            or{" "}
            <a href="mailto:claimone.lol@gmail.com" className="text-primary hover:underline">
              claimone.lol@gmail.com
            </a>
          </p>
          <p className="text-muted-foreground">
            ClaimOne is built by{" "}
            <a
              href="https://x.com/MarufSalim35872"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @MarufSalim35872
            </a>{" "}
            and{" "}
            <a
              href="https://x.com/Waliur57"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @Waliur57
            </a>
            .
          </p>
          <p className="text-muted-foreground">Website: claimone.lol</p>
        </section>
      </main>
    </div>
  );
}

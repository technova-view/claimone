import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { MIN_BID_CENTS, MIN_RAISE_OWN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

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
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Rules</h1>
          <p className="mt-2 text-muted-foreground">
            ClaimOne is a public product leaderboard. You pay to place your product or profile on the board, and
            your bid determines your rank.
          </p>
          <p className="mt-2 text-muted-foreground">
            The rules below explain exactly how listings, bids, rankings, and payments work.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">How ranking works</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Bids are made in whole US dollars.</li>
            <li>The minimum bid to create a listing is {formatAmount(MIN_BID_CENTS)}.</li>
            <li>Your bid determines your position within the selected category and leaderboard.</li>
            <li>A higher eligible bid ranks above a lower eligible bid.</li>
            <li>The current rankings and bid amounts are visible on the leaderboard before you pay.</li>
            <li>Rankings can change when another listing receives a higher bid.</li>
            <li>Your ranking is not guaranteed to remain unchanged after payment.</li>
          </ul>

          <h3 className="mt-1 text-base font-semibold">Taking #1</h3>
          <p className="text-muted-foreground">
            To move a listing into the #1 position, your bid must meet the minimum increase shown above the current
            #1 bid — currently at least {formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}.
          </p>
          <p className="text-muted-foreground">
            Paying less than the amount required for #1 can still place your listing on the board at the highest
            rank that your bid qualifies for.
          </p>
          <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Example</p>
            <p className="mt-1">If the current bids are:</p>
            <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5">
              <li>#1 — $100</li>
              <li>#2 — $75</li>
              <li>#3 — $50</li>
            </ul>
            <p className="mt-1">An $80 bid would place your listing above the $75 listing but below the $100 listing.</p>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Raising an existing listing</h2>
          <p className="text-muted-foreground">Already have a listing on ClaimOne?</p>
          <p className="text-muted-foreground">Submit the same website or X handle again to increase its bid.</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>The minimum increase is {formatAmount(MIN_RAISE_OWN_BID_CENTS)} above your current bid.</li>
            <li>
              <span className="font-medium text-foreground">You are charged the full amount of your new bid</span>,
              not only the difference from your previous bid.
            </li>
            <li>
              Once payment is confirmed, the new bid replaces your previous listing for that website/handle in the
              same category and leaderboard.
            </li>
            <li>
              The amount you already paid for the earlier bid is not refunded or credited toward the new one — see
              our{" "}
              <a href="/refund-policy" className="text-primary hover:underline">
                Refund Policy
              </a>
              .
            </li>
            <li>Another listing cannot take your position simply by paying the same amount as your current bid.</li>
          </ul>
          <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Example</p>
            <p className="mt-1">
              If your current bid is $50 and you raise it to $75, you are charged <span className="font-semibold text-foreground">$75</span>,
              not $25 — raising a bid is a new full-price purchase, not a top-up.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Equal bids</h2>
          <p className="text-muted-foreground">
            If two listings have the same qualifying bid, the listing that reached that bid first receives the
            higher position.
          </p>
          <p className="text-muted-foreground">Paying the same amount as another listing does not automatically move you above it.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Three independent leaderboards</h2>
          <p className="text-muted-foreground">ClaimOne has three separate leaderboard periods.</p>

          <h3 className="mt-1 text-base font-semibold">All-time</h3>
          <p className="text-muted-foreground">
            The All-time leaderboard represents permanent ranking. Your listing remains on the board until another
            eligible listing surpasses your bid. There is no scheduled reset.
          </p>

          <h3 className="mt-1 text-base font-semibold">Weekly</h3>
          <p className="text-muted-foreground">
            The Weekly leaderboard operates on a fixed UTC schedule, resetting every Monday at 00:00 UTC. The
            top-ranked listing at the end of a completed period may be archived in the{" "}
            <Link href="/hall-of-fame" className="text-primary hover:underline">
              Hall of Fame
            </Link>
            .
          </p>

          <h3 className="mt-1 text-base font-semibold">Daily</h3>
          <p className="text-muted-foreground">
            The Daily leaderboard operates on a fixed UTC schedule, resetting every day at 00:00 UTC. The top-ranked
            listing at the end of a completed period may be archived in the{" "}
            <Link href="/hall-of-fame" className="text-primary hover:underline">
              Hall of Fame
            </Link>
            .
          </p>

          <h3 className="mt-1 text-base font-semibold">Independent bids</h3>
          <p className="text-muted-foreground">
            The same product or profile can have separate bids on different leaderboards. A bid on the All-time
            leaderboard does not automatically create the same bid on the Daily or Weekly leaderboard. Each
            leaderboard has its own ranking and applicable bid amount.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What you can list</h2>
          <p className="text-muted-foreground">You may list:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>A product or service website.</li>
            <li>An X profile using an @handle.</li>
            <li>Eligible product pages hosted on platforms such as the App Store, Play Store, GitHub, or similar platforms.</li>
          </ul>
          <p className="text-muted-foreground">
            Platform listings may be identified by their relevant URL path so that separate products can maintain
            separate listings.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What you cannot list</h2>
          <p className="text-muted-foreground">ClaimOne is for products and profiles, not private communities or group chats.</p>
          <p className="text-muted-foreground">The following are not allowed:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Telegram group or invite links</li>
            <li>WhatsApp group or invite links</li>
            <li>Discord invite links</li>
            <li>Messenger group links</li>
            <li>Signal group links</li>
            <li>Similar chat or invitation links</li>
            <li>Pornographic or sexually explicit websites</li>
            <li>Adult platforms</li>
            <li>Phishing or malicious websites</li>
            <li>Malware or deceptive destinations</li>
            <li>Illegal products or services</li>
            <li>Content that infringes third-party rights</li>
            <li>Link shorteners used to hide the actual destination</li>
            <li>Affiliate, referral, or tracking URLs</li>
          </ul>
          <p className="text-muted-foreground">ClaimOne may reject or remove any listing that violates these Rules or applicable law.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">URL handling</h2>
          <p className="text-muted-foreground">
            Submitted URLs are stored as provided, with &ldquo;https://&rdquo; added automatically if it&rsquo;s
            missing. No other part of the URL is modified — we don&rsquo;t strip query strings or follow redirects
            to a different final destination.
          </p>
          <p className="text-muted-foreground">
            Affiliate, referral, tracking, and link-shortener URLs are against these Rules (see above) and may be
            rejected or removed on review even though they aren&rsquo;t automatically altered at submission.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Categories</h2>
          <p className="text-muted-foreground">Listings are organized into categories, which you choose yourself when submitting a listing.</p>
          <p className="text-muted-foreground">
            If a listing has been placed in an incorrect category, contact us and request a category correction. We
            may review and change category assignments when appropriate.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">After payment</h2>
          <p className="text-muted-foreground">A completed payment is what activates your listing. Once payment has been confirmed:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Your listing becomes publicly visible.</li>
            <li>Your bid is applied to the selected leaderboard.</li>
            <li>Your ranking is calculated according to these Rules.</li>
            <li>Visitors can click through to your submitted destination.</li>
          </ul>
          <p className="text-muted-foreground">
            Your listing may later move to a different position if another eligible listing receives a higher
            qualifying bid.
          </p>
          <p className="text-muted-foreground">ClaimOne does not guarantee:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>A specific number of visitors;</li>
            <li>Clicks;</li>
            <li>Customers;</li>
            <li>Sales;</li>
            <li>Followers;</li>
            <li>Downloads;</li>
            <li>Conversions;</li>
            <li>Search-engine rankings; or</li>
            <li>Any financial return.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-muted-foreground">
            Payments are processed through our payment provider and Merchant of Record, Paddle.
          </p>
          <p className="text-muted-foreground">The final amount charged is displayed during checkout before you complete the purchase.</p>
          <p className="text-muted-foreground">
            Completing payment means you agree to these Rules, our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            , and our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Notice
            </Link>
            .
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Refunds</h2>
          <p className="text-muted-foreground">
            Because ClaimOne&rsquo;s digital service is activated after successful payment, transactions are
            generally non-refundable once the listing has been activated.
          </p>
          <p className="text-muted-foreground">
            Being outranked, receiving fewer clicks than expected, a Daily or Weekly leaderboard resetting, or
            changing your mind does not normally qualify for a refund.
          </p>
          <p className="text-muted-foreground">Any mandatory refund or consumer rights that cannot legally be excluded remain unaffected.</p>
          <p className="text-muted-foreground">
            See our{" "}
            <a href="/refund-policy" className="text-primary hover:underline">
              Refund Policy
            </a>{" "}
            for complete details.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Listing ownership and authorization</h2>
          <p className="text-muted-foreground">You may only submit a website or X profile that you own or are authorized to represent.</p>
          <p className="text-muted-foreground">By submitting a listing, you confirm that:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>You have permission to submit the destination.</li>
            <li>The destination is legitimate and accessible.</li>
            <li>The information you provide is accurate.</li>
            <li>The listing does not violate another person&rsquo;s rights.</li>
            <li>The destination does not contain prohibited or illegal content.</li>
          </ul>
          <p className="text-muted-foreground">ClaimOne may request additional information where necessary to verify a listing.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Listing removal</h2>
          <p className="text-muted-foreground">ClaimOne may refuse, hide, recategorize, suspend, or remove a listing if:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>It violates these Rules.</li>
            <li>
              It violates our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </li>
            <li>The destination becomes unavailable or unsafe.</li>
            <li>The listing contains misleading or fraudulent information.</li>
            <li>We receive a valid legal or rights-holder complaint.</li>
            <li>The listing creates a security or legal risk.</li>
            <li>The listing is otherwise unsuitable for the platform.</li>
          </ul>
          <p className="text-muted-foreground">
            Removal of a listing for violating the Rules does not normally create a refund entitlement, subject to
            applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Fair use of the leaderboard</h2>
          <p className="text-muted-foreground">Do not attempt to manipulate ClaimOne&rsquo;s ranking system through:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Fraudulent payments;</li>
            <li>Unauthorized access;</li>
            <li>Payment abuse;</li>
            <li>Automated attacks;</li>
            <li>Attempts to bypass platform restrictions;</li>
            <li>Manipulation of click or visitor statistics;</li>
            <li>Exploitation of technical vulnerabilities; or</li>
            <li>Other activity intended to interfere with the normal operation of ClaimOne.</li>
          </ul>
          <p className="text-muted-foreground">We may suspend listings or take other measures necessary to protect the integrity of the platform.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Public listings</h2>
          <p className="text-muted-foreground">ClaimOne is a public leaderboard.</p>
          <p className="text-muted-foreground">When you submit a listing, information such as the following may be publicly displayed:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Product or profile name;</li>
            <li>Website or X handle;</li>
            <li>Description;</li>
            <li>Category;</li>
            <li>Bid amount;</li>
            <li>Ranking;</li>
            <li>Listing image or logo;</li>
            <li>Historical ranking information.</li>
          </ul>
          <p className="text-muted-foreground">Do not submit information that you do not want displayed publicly.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Changes to the Rules</h2>
          <p className="text-muted-foreground">We may update these Rules as ClaimOne develops.</p>
          <p className="text-muted-foreground">If we make material changes, we will update the date or version displayed on this page.</p>
          <p className="text-muted-foreground">
            The rules shown at checkout apply to the transaction you complete, except where a change is required by
            law or necessary to address a security or legal issue.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">If you have a question about a listing, category, ranking, or these Rules, contact:</p>
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
        </section>
      </main>
    </div>
  );
}

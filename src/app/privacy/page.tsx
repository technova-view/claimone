import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Privacy Notice · claimone.lol",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Notice</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated 2026-08-25.</p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p className="text-muted-foreground">
            Placing a bid doesn&rsquo;t require an account, name, or email. We store only what the bid itself needs:
            the category, bid amount, and either the URL or X handle you submit (plus a short description, which for
            URL listings is fetched automatically from that page — we don&rsquo;t write it ourselves).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="text-muted-foreground">
            Checkout is handled entirely by Paddle, our payment provider. We never see or store your card details —
            we only receive a transaction reference from Paddle once payment completes. Paddle&rsquo;s own privacy
            policy governs the payment data they process.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Site stats</h2>
          <p className="text-muted-foreground">
            The visitor and &ldquo;online now&rdquo; figures shown around the site are aggregate, site-wide numbers —
            we don&rsquo;t track individual visitors, build browsing profiles, or use third-party analytics/ad
            trackers.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Cookies &amp; local storage</h2>
          <p className="text-muted-foreground">
            Your light/dark theme preference is saved in your browser&rsquo;s local storage — it never leaves your
            device. A session cookie is set only when the site&rsquo;s operator logs into the admin panel; regular
            visitors and bidders never receive it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Changes</h2>
          <p className="text-muted-foreground">
            We may update this notice as the product changes. Continuing to use the site after an update means you
            accept the revised notice.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-muted-foreground">
            Questions about this notice? Email{" "}
            <a href="mailto:waliurrahman957@gmail.com" className="text-primary hover:underline">
              waliurrahman957@gmail.com
            </a>{" "}
            or{" "}
            <a href="mailto:claimone.lol@gmail.com" className="text-primary hover:underline">
              claimone.lol@gmail.com
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

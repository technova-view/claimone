import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Refund Policy · claimone.lol",
};

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Refund Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated 2026-08-25.</p>
        </div>

        <section className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <p className="font-semibold text-foreground">All bids are non-refundable.</p>
          <p className="text-muted-foreground">
            The moment your payment is confirmed, your listing goes live and holds its rank immediately — the service
            is delivered in full at that point. Because of that, we don&rsquo;t offer refunds or credits for any bid,
            including if you&rsquo;re later outbid, if a Daily or Weekly board resets, or if you simply change your
            mind.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Exceptions</h2>
          <p className="text-muted-foreground">
            The only exception is a listing we remove for violating our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            — that removal doesn&rsquo;t entitle you to a refund either, since it&rsquo;s a consequence of breaking
            the rules, not a service failure on our part. Where local law grants you a non-waivable refund right, that
            right isn&rsquo;t affected by this policy.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Payment disputes</h2>
          <p className="text-muted-foreground">
            All payments are processed by Paddle, our payment provider and Merchant of Record. Any chargeback or
            dispute is handled through Paddle under their standard terms.
          </p>
        </section>
      </main>
    </div>
  );
}

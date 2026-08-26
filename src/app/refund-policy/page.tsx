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
          <p className="mt-2 text-sm text-muted-foreground">Last updated August 27, 2026.</p>
        </div>

        <p className="text-muted-foreground">This Refund Policy explains how refunds for ClaimOne transactions are handled.</p>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">1. How ClaimOne Transactions Work</h2>
          <p className="text-muted-foreground">
            When a payment is successfully completed, ClaimOne activates the applicable listing and applies the
            purchased bid amount to the listing&rsquo;s leaderboard position.
          </p>
          <p className="text-muted-foreground">
            Because the service may be delivered immediately after payment, a transaction may generally become
            non-refundable once the listing has been activated.
          </p>
          <p className="text-muted-foreground">
            However, this policy does not remove or limit any refund, cancellation, withdrawal, or other consumer
            rights that cannot legally be excluded.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">2. General Refund Rule</h2>
          <p className="text-muted-foreground">
            Except where applicable law or the applicable payment-provider policy requires otherwise, ClaimOne
            transactions are generally non-refundable after the listing has been successfully activated.
          </p>
          <p className="text-muted-foreground">In particular, we generally do not refund a transaction solely because:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Your listing is later moved to a lower position;</li>
            <li>Another listing receives a higher bid;</li>
            <li>A Daily or Weekly leaderboard reaches its scheduled reset;</li>
            <li>Your listing receives fewer clicks or visitors than expected;</li>
            <li>Your listing does not generate sales or conversions; or</li>
            <li>You change your mind after the listing has been activated.</li>
          </ul>
          <p className="text-muted-foreground">Leaderboard position is not a guaranteed commercial outcome.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">3. Technical Problems</h2>
          <p className="text-muted-foreground">
            If a technical problem prevents ClaimOne from activating or displaying a paid listing as described,
            contact us promptly.
          </p>
          <p className="text-muted-foreground">We will investigate the issue and, where appropriate, attempt to correct the problem.</p>
          <p className="text-muted-foreground">
            Where a material service failure cannot reasonably be corrected, a refund or other appropriate remedy may
            be available, subject to applicable law and the applicable payment-provider rules.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">4. Incorrect or Unauthorized Transactions</h2>
          <p className="text-muted-foreground">
            If you believe a transaction was made without your authorization, contact us and/or Paddle as soon as
            possible.
          </p>
          <p className="text-muted-foreground">We may request transaction details to investigate the matter.</p>
          <p className="text-muted-foreground">Fraudulent or abusive refund requests may be declined where permitted by law.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">5. Listings Removed for Violations</h2>
          <p className="text-muted-foreground">
            If ClaimOne removes a listing because it violates our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>
            , the transaction is generally not refundable.
          </p>
          <p className="text-muted-foreground">This does not affect any mandatory rights provided by applicable law.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">6. Paddle</h2>
          <p className="text-muted-foreground">
            Payments are processed by{" "}
            <a
              href="https://www.paddle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Paddle
            </a>
            , our payment provider and Merchant of Record.
          </p>
          <p className="text-muted-foreground">
            Paddle maintains its own buyer terms and refund procedures. Depending on the transaction and your
            location, Paddle may have additional refund or cancellation requirements or statutory obligations.
          </p>
          <p className="text-muted-foreground">
            Where Paddle is the appropriate party to process a refund, you may use the refund or support process
            provided in your Paddle transaction receipt.
          </p>
          <p className="text-muted-foreground">
            Paddle&rsquo;s current refund policy states that applicable statutory rights are preserved and that
            refunds may also be available in cases such as material product or technical defects.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">7. Chargebacks and Payment Disputes</h2>
          <p className="text-muted-foreground">
            If you have a problem with a transaction, please contact ClaimOne or Paddle before initiating a
            chargeback where possible so that we can investigate and resolve the issue.
          </p>
          <p className="text-muted-foreground">
            Nothing in this policy prevents you from exercising lawful rights available through your card issuer,
            payment provider, or applicable consumer-protection laws.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">8. No Guaranteed Commercial Results</h2>
          <p className="text-muted-foreground">
            A payment for a ClaimOne listing purchases participation and placement according to the applicable
            leaderboard rules.
          </p>
          <p className="text-muted-foreground">It does not guarantee:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Traffic;</li>
            <li>Clicks;</li>
            <li>Sales;</li>
            <li>Leads;</li>
            <li>Followers;</li>
            <li>Downloads;</li>
            <li>Conversions;</li>
            <li>A particular final ranking; or</li>
            <li>Any financial return.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">9. Changes to This Policy</h2>
          <p className="text-muted-foreground">We may update this Refund Policy as ClaimOne changes.</p>
          <p className="text-muted-foreground">
            The version applicable to a transaction will generally be the version in effect when that transaction was
            completed, subject to applicable law and the applicable payment-provider terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p className="text-muted-foreground">For questions regarding a ClaimOne transaction:</p>
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
          <p className="text-muted-foreground">Website: claimone.lol</p>
        </section>
      </main>
    </div>
  );
}

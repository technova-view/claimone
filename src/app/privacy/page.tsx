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
          <p className="mt-2 text-sm text-muted-foreground">Last updated August 27, 2026.</p>
        </div>

        <p className="text-muted-foreground">
          This Privacy Notice explains how ClaimOne (&ldquo;ClaimOne&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) collects, uses, and protects information when you use claimone.lol.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            ClaimOne is designed so that placing a listing does not require you to create a traditional user account.
          </p>
          <p className="text-muted-foreground">Depending on how you use the service, we may collect or receive:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>The category selected for a listing;</li>
            <li>The bid amount;</li>
            <li>The website URL or X handle submitted;</li>
            <li>The listing description;</li>
            <li>A transaction or payment reference supplied by our payment provider;</li>
            <li>Information necessary to operate, secure, and maintain the service; and</li>
            <li>Information you voluntarily provide when contacting us.</li>
          </ul>
          <p className="text-muted-foreground">
            When a URL listing is submitted, ClaimOne may retrieve publicly available information from that page to
            generate or display listing information.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">2. Payment Information</h2>
          <p className="text-muted-foreground">
            Payments are processed by Paddle, which acts as our payment provider and Merchant of Record.
          </p>
          <p className="text-muted-foreground">
            ClaimOne does not store your full credit-card number or other complete payment credentials on our own
            systems.
          </p>
          <p className="text-muted-foreground">
            Paddle may collect and process payment, billing, tax, fraud-prevention, and transaction information
            according to its own policies.
          </p>
          <p className="text-muted-foreground">
            We may receive limited transaction information, such as a transaction identifier and payment status,
            that is necessary to activate and manage your listing.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">3. How We Use Information</h2>
          <p className="text-muted-foreground">We may use information to:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Create and display listings;</li>
            <li>Calculate and display leaderboard rankings;</li>
            <li>Process and verify transactions;</li>
            <li>Maintain the Hall of Fame;</li>
            <li>Prevent fraud and abuse;</li>
            <li>Protect the security of ClaimOne;</li>
            <li>Respond to support requests;</li>
            <li>Maintain and improve the service; and</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
          <p className="text-muted-foreground">We do not sell personal information to advertisers.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">4. Public Listings</h2>
          <p className="text-muted-foreground">Information submitted as part of a ClaimOne listing may be publicly visible.</p>
          <p className="text-muted-foreground">This may include:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>The submitted website or X handle;</li>
            <li>Listing description;</li>
            <li>Category;</li>
            <li>Bid amount;</li>
            <li>Ranking;</li>
            <li>Historical leaderboard information; and</li>
            <li>Hall of Fame information.</li>
          </ul>
          <p className="text-muted-foreground">
            Do not submit personal or confidential information that you do not want publicly displayed.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">5. Analytics and Tracking</h2>
          <p className="text-muted-foreground">
            ClaimOne does not intentionally use third-party advertising trackers to build individual advertising
            profiles.
          </p>
          <p className="text-muted-foreground">
            Some technical information may nevertheless be processed by our hosting, infrastructure, security,
            payment, or other service providers as necessary to operate the service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">6. Cookies and Local Storage</h2>
          <p className="text-muted-foreground">
            ClaimOne may use browser storage for preferences such as light/dark theme settings.
          </p>
          <p className="text-muted-foreground">
            Administrative authentication may use cookies or other authentication mechanisms. These are not intended
            for ordinary public visitors.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">7. Third-Party Services</h2>
          <p className="text-muted-foreground">ClaimOne may use third-party providers for services such as:</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">
            <li>Payment processing;</li>
            <li>Hosting and infrastructure;</li>
            <li>Database services;</li>
            <li>Security;</li>
            <li>Email or customer support; and</li>
            <li>Other technical services required to operate ClaimOne.</li>
          </ul>
          <p className="text-muted-foreground">
            These providers may process information only as necessary to provide their services or comply with
            applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">8. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain information for as long as reasonably necessary to operate ClaimOne, maintain transaction and
            accounting records, prevent fraud, resolve disputes, enforce our agreements, and comply with legal
            obligations.
          </p>
          <p className="text-muted-foreground">
            Public leaderboard information may remain available as part of ClaimOne&rsquo;s historical rankings.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">9. Security</h2>
          <p className="text-muted-foreground">
            We use reasonable technical and organizational measures intended to protect information against
            unauthorized access, loss, misuse, or alteration.
          </p>
          <p className="text-muted-foreground">However, no internet-based service can guarantee absolute security.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">10. Your Rights</h2>
          <p className="text-muted-foreground">
            Depending on your location and applicable law, you may have rights concerning your personal information,
            including rights to access, correct, delete, or restrict certain processing.
          </p>
          <p className="text-muted-foreground">To make a privacy request, contact us using the email addresses below.</p>
          <p className="text-muted-foreground">We may need to verify your request before taking action.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">11. Children&rsquo;s Privacy</h2>
          <p className="text-muted-foreground">
            ClaimOne is not intended for children who are below the minimum age required to enter into transactions
            under applicable law.
          </p>
          <p className="text-muted-foreground">
            We do not knowingly collect personal information from children in violation of applicable law.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">12. International Processing</h2>
          <p className="text-muted-foreground">
            ClaimOne and its service providers may process information in countries other than the country where you
            are located.
          </p>
          <p className="text-muted-foreground">Where required, we use appropriate safeguards for international data transfers.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">13. Changes to This Notice</h2>
          <p className="text-muted-foreground">We may update this Privacy Notice when our service or data practices change.</p>
          <p className="text-muted-foreground">
            The updated version will be posted on this page with a revised &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">14. Contact</h2>
          <p className="text-muted-foreground">For privacy questions or requests:</p>
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, CheckCircle2, Crown, DollarSign, Eye, Layers, RefreshCw, Sparkles, Trophy, XCircle, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { LinkedInIcon, XIcon } from "@/components/icons/social-icons";
import { LiveDot } from "@/components/ui/live-dot";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { listCategories } from "@/lib/services/category.service";
import { slugForListing } from "@/lib/services/product-slug";
import { displayHostFor } from "@/lib/services/link-display";
import { getAllTimeVisitorTotal } from "@/lib/services/stats.service";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { MIN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

export const metadata: Metadata = {
  title: "About · claimone.lol",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const STEPS = [
  {
    icon: Layers,
    title: "Pick a category",
    body: "Every listing lives inside a category, so rankings are determined among products in the same category.",
  },
  {
    icon: DollarSign,
    title: "Set your bid",
    body: "Your bid determines your rank. Rankings are calculated according to the published ClaimOne rules, with the highest qualifying bid holding the top position.",
  },
  {
    icon: Zap,
    title: "Checkout instantly",
    body: "Pay securely at checkout. Your listing goes live the moment payment is confirmed.",
  },
  {
    icon: Trophy,
    title: "Maintain your position",
    body: "Your position can change when another eligible listing reaches a higher qualifying bid, or when a Daily or Weekly leaderboard resets.",
  },
];

const FOUNDERS: {
  name: string;
  initials: string;
  role: string;
  company: string;
  photoUrl: string | null;
  // Per-photo crop focal point (Tailwind arbitrary object-position) — the
  // two source photos frame the head differently, so one shared crop left
  // extra empty space above Maruf's head.
  photoPosition: string;
  handle: string;
  linkedinUrl: string;
}[] = [
  {
    name: "Md. Maruf Bin Salim",
    initials: "MS",
    role: "Full Stack Developer",
    company: "ClaimOne.lol",
    photoUrl: "/Maruf.png",
    photoPosition: "object-[50%_45%]",
    handle: "MarufSalim35872",
    linkedinUrl: "https://www.linkedin.com/in/md-maruf-bin-salim-bhuiyan/",
  },
  {
    name: "Md. Waliur Rahman",
    initials: "WR",
    role: "Full Stack Developer",
    company: "ClaimOne.lol",
    photoUrl: "/waliur.png",
    photoPosition: "object-[50%_15%]",
    handle: "Waliur57",
    linkedinUrl: "https://www.linkedin.com/in/waliur-rahman57",
  },
];

const PRINCIPLES = [
  {
    icon: DollarSign,
    title: "Transparent ranking",
    body: `The amount required for each position is visible on the leaderboard before payment. To reach #1, a listing must meet the applicable minimum increase above the current #1 bid — currently at least ${formatAmount(MIN_RAISE_TO_TAKE_TOP_CENTS)}. Minimum to list is ${formatAmount(MIN_BID_CENTS)}.`,
  },
  {
    icon: RefreshCw,
    title: "Consistent resets",
    body: "Daily and Weekly leaderboards reset according to a fixed UTC schedule, providing the same reset time worldwide.",
  },
  {
    icon: Crown,
    title: "Public history",
    body: "Completed Daily and Weekly leaderboard periods may be archived in the Hall of Fame so previous top-ranked listings remain part of ClaimOne's public history.",
  },
];

export default async function AboutPage() {
  const [rows, categories, visitorTotal] = await Promise.all([
    getLeaderboard({ scope: BidScope.ALL_TIME }),
    listCategories(),
    getAllTimeVisitorTotal(),
  ]);
  const totalBidCents = rows.reduce((sum, row) => sum + row.amountCents, 0);
  const topRow = rows[0] ?? null;
  const topLabel = topRow ? (topRow.handle ? `@${topRow.handle}` : topRow.url ? displayHostFor(topRow.url) : "") : "";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-14 px-6 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center sm:px-10">
          <div className="pointer-events-none absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Crown className="size-5" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Public product rankings, determined by your bid.</h1>
            <p className="max-w-xl text-muted-foreground">
              Submit a product or X profile, choose your bid, and receive public leaderboard placement in your
              category.
            </p>
          </div>
        </div>

        {/* Live numbers */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">By the numbers</h2>
            <Link href="/stats" className="text-sm font-medium text-primary hover:underline">
              Full stats
            </Link>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-border rounded-2xl border border-border bg-secondary/30 sm:grid-cols-4 sm:divide-y-0">
            <div className="flex flex-col gap-1 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live listings</p>
              <p className="font-mono text-2xl font-bold text-primary">{rows.length}</p>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total bid</p>
              <p className="font-mono text-2xl font-bold text-primary">{formatAmount(totalBidCents)}</p>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categories</p>
              <p className="font-mono text-2xl font-bold text-primary">{categories.length}</p>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Eye className="size-3.5 shrink-0" />
                Visitors
              </p>
              <p className="flex items-center gap-1.5 font-mono text-2xl font-bold text-primary">
                {visitorTotal.toLocaleString()}
                <LiveDot />
              </p>
            </div>
          </div>

          {topRow && (
            <Link
              href={`/product/${slugForListing(topRow)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/10"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <Crown className="size-4 shrink-0 text-primary" />
                <span className="truncate">
                  Highest bid held by <span className="font-semibold">{topLabel}</span>
                </span>
              </span>
              <span className="shrink-0 font-mono text-lg font-bold text-primary">
                {formatAmount(topRow.amountCents)}
              </span>
            </Link>
          )}
        </div>

        {/* How it works */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <step.icon className="size-4 shrink-0 text-primary" />
                    {step.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">What you get</h2>
            <p className="mt-1 text-muted-foreground">
              Your purchase activates a public listing on ClaimOne and assigns it a leaderboard position according to
              the applicable ranking rules.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                Included
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                <li>A public product or X profile listing</li>
                <li>Placement within your selected category</li>
                <li>A public leaderboard position determined by your bid</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <XCircle className="size-4 shrink-0 text-muted-foreground" />
                Not guaranteed
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                <li>Traffic, clicks, or followers</li>
                <li>Customers, sales, or conversions</li>
                <li>A permanent position</li>
                <li>Any financial return</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Principles */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold tracking-tight">Transparent and predictable</h2>
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="flex gap-3 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <principle.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{principle.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{principle.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-accent/40 px-6 py-10 text-center dark:border-orange-500/25 dark:bg-orange-950/30">
          <div className="relative flex flex-col items-center gap-3">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Ready to get ranked?</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Pick a category and see what it takes to reach #1.
            </p>
            <Link
              href="/categories"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse categories
            </Link>
          </div>
        </div>

        {/* Founders */}
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Founders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ClaimOne is independently built and operated by its two founders.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FOUNDERS.map((founder) => (
              <div
                key={founder.name}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30"
              >
                <div className="pointer-events-none absolute -top-10 left-1/2 size-40 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80" />
                <div className="relative flex flex-col items-center gap-3">
                  <span className="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-primary/10 font-mono text-2xl font-bold text-primary ring-4 ring-primary/5">
                    {founder.photoUrl ? (
                      <Image
                        src={founder.photoUrl}
                        alt={founder.name}
                        fill
                        className={`object-cover ${founder.photoPosition}`}
                      />
                    ) : (
                      founder.initials
                    )}
                  </span>
                  <div>
                    <p className="text-lg font-bold tracking-tight">{founder.name}</p>
                    <p className="text-sm text-muted-foreground">{founder.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    <Briefcase className="size-3.5 shrink-0 text-primary" />
                    Founder, {founder.company}
                  </span>
                  <div className="mt-1 flex w-full items-center justify-center gap-2 border-t border-border pt-4">
                    <a
                      href={`https://x.com/${founder.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on X`}
                      className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <XIcon className="size-4 shrink-0" />
                    </a>
                    <a
                      href={founder.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${founder.name} on LinkedIn`}
                      className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <LinkedInIcon className="size-4 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

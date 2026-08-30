import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, DollarSign, Layers, MousePointerClick, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { ProductPageActions } from "@/components/product/product-page-actions";
import { getLeaderboard, hasPendingBidMatchingSlug } from "@/lib/services/bidding.service";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { slugForListing } from "@/lib/services/product-slug";
import { displayHostFor, faviconUrlFor, timeAgo } from "@/lib/services/link-display";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/config/site-metadata";
import { getCategoryIcon } from "@/lib/config/category-icons";
import { LiveDot } from "@/components/ui/live-dot";
import { ListingAvatar } from "@/components/ui/listing-avatar";
import { cn } from "@/lib/utils";

// See src/app/page.tsx for why this is required. Especially critical here:
// this page's own "confirming your payment…" auto-refresh loop would show
// the same frozen not-found/pending snapshot forever without it, since the
// static shell wouldn't ever re-run the bid lookup.
export const dynamic = "force-dynamic";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function StatCell({
  icon: Icon,
  label,
  value,
  sub,
  live = false,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  sub: string;
  live?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </div>
      <p className="flex items-center gap-1.5 font-mono text-2xl font-bold text-primary">
        {value}
        {live && <LiveDot />}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

async function loadListing(slug: string) {
  const allRows = await getLeaderboard({ scope: BidScope.ALL_TIME });
  const row = allRows.find((r) => slugForListing(r).toLowerCase() === slug.toLowerCase());
  if (!row) return null;

  const categoryRows = await getLeaderboard({ scope: BidScope.ALL_TIME, categorySlug: row.categorySlug });
  const categoryRank = categoryRows.findIndex((r) => r.id === row.id) + 1;

  return { row, overallTotal: allRows.length, categoryRank, categoryTotal: categoryRows.length };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadListing(slug);
  if (!data) return { title: "Not found · claimone.lol" };
  const { row } = data;
  const label = row.handle ? `@${row.handle}` : row.title ? row.title : row.url ? displayHostFor(row.url) : slug;
  const title = `${label} · claimone.lol`;
  const description = row.description ?? `Ranked #${row.rank} in ${row.categoryName} on claimone.lol.`;
  const image = (row.url ? faviconUrlFor(row.url) : null) ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadListing(slug);

  if (!data) {
    // Checkout redirects here the instant Paddle confirms payment, but the
    // webhook that actually activates the bid runs separately and can lag a
    // second or two behind — so "not found yet" isn't always "doesn't
    // exist." A pending match gets a brief wait instead of a hard 404.
    if (await hasPendingBidMatchingSlug(slug)) {
      return (
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <meta httpEquiv="refresh" content="3" />
          <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
            <h1 className="text-xl font-semibold">Confirming your payment…</h1>
            <p className="text-sm text-muted-foreground">
              This usually takes just a few seconds — this page will refresh on its own.
            </p>
          </main>
        </div>
      );
    }
    notFound();
  }

  const { row, overallTotal, categoryRank, categoryTotal } = data;

  const label = row.handle ? `@${row.handle}` : row.title ? row.title : row.url ? displayHostFor(row.url) : "";
  const isLeader = row.rank === 1;
  const categoryIcon = { Icon: getCategoryIcon(row.categoryName) };

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-6 py-10">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link href={`/categories/${row.categorySlug}`} className="hover:text-foreground">
            {row.categoryName}
          </Link>
        </nav>

        {/* One unified panel (rather than loose stacked blocks) so the
            listing reads as a single premium "profile" instead of a stack
            of unrelated cards. */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <ListingAvatar url={row.url} handle={row.handle} size="size-16" radius="rounded-2xl" />
                <span
                  className={cn(
                    "absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-card",
                    isLeader ? "bg-primary text-primary-foreground" : "border border-primary/35 bg-primary/10 text-primary",
                  )}
                >
                  #{row.rank}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
                {row.description && <p className="mt-1.5 text-muted-foreground">{row.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/categories/${row.categorySlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
                  >
                    <categoryIcon.Icon className="size-3.5 shrink-0 text-primary" />
                    {row.categoryName}
                  </Link>
                  <span className="text-xs text-muted-foreground">Listed {timeAgo(row.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-border rounded-2xl border border-border bg-secondary/30 sm:grid-cols-4 sm:divide-y-0">
              <StatCell
                icon={DollarSign}
                label="Spent"
                value={formatAmount(row.amountCents)}
                sub="Paid to hold this rank"
              />
              <StatCell
                icon={Layers}
                label="Category rank"
                value={`#${categoryRank}`}
                sub={`of ${categoryTotal} in ${row.categoryName}`}
              />
              <StatCell icon={Trophy} label="Overall" value={`#${row.rank}`} sub={`of ${overallTotal} on the board`} />
              <StatCell
                icon={MousePointerClick}
                label="Clicks"
                value={row.clicks.toLocaleString()}
                sub="Outbound clicks"
                live
              />
            </div>

            <ProductPageActions
              outboundHref={`/go/${row.id}`}
              label={label}
              categorySlug={row.categorySlug}
              amountCents={row.amountCents}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

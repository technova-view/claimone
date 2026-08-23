import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { ProductPageActions } from "@/components/product/product-page-actions";
import { getLeaderboard, hasPendingBidMatchingSlug } from "@/lib/services/bidding.service";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { slugForListing } from "@/lib/services/product-slug";
import { displayHostFor, faviconUrlFor, outboundLinkFor, timeAgo, xAvatarUrlFor } from "@/lib/services/link-display";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
  const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : slug;
  return { title: `${label} · claimone.lol` };
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

  const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";
  const avatarSrc = row.handle ? xAvatarUrlFor(row.handle) : row.url ? faviconUrlFor(row.url) : null;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
        <nav className="text-sm text-muted-foreground">
          <Link href="/#leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
          <span> · {row.categoryName}</span>
        </nav>

        <div className="flex items-start gap-4">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="" className="size-16 shrink-0 rounded-2xl border border-border object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl font-semibold text-muted-foreground">
              ?
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
            {row.description && <p className="mt-2 text-muted-foreground">{row.description}</p>}
            <p className="mt-2 text-sm text-muted-foreground">
              {row.categoryName} · {timeAgo(row.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Spent</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">{formatAmount(row.amountCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Paid to hold this rank</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category rank</p>
            <p className="mt-1 text-2xl font-bold">#{categoryRank}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              of {categoryTotal} in {row.categoryName}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Overall</p>
            <p className="mt-1 text-2xl font-bold">#{row.rank}</p>
            <p className="mt-1 text-xs text-muted-foreground">of {overallTotal} on the board</p>
          </div>
        </div>

        <ProductPageActions
          outboundHref={outboundLinkFor(row)}
          label={label}
          categorySlug={row.categorySlug}
          amountCents={row.amountCents}
        />
      </main>
    </div>
  );
}

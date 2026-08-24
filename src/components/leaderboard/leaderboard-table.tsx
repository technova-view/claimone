"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { LeaderboardRow } from "@/lib/types/leaderboard";
import type { BidScope } from "@/lib/types/scope";
import { displayHostFor, outboundLinkFor, timeAgo } from "@/lib/services/link-display";
import { slugForListing } from "@/lib/services/product-slug";
import { placeholderClicks } from "@/lib/services/placeholder-clicks";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { LiveDot } from "@/components/ui/live-dot";
import { ListingAvatar } from "@/components/ui/listing-avatar";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const DESCRIPTION_MAX_CHARS = 150;

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_MAX_CHARS) return description;
  return `${description.slice(0, DESCRIPTION_MAX_CHARS).trimEnd()}…`;
}

function RowAvatar({ row, size = "size-10" }: { row: LeaderboardRow; size?: string }) {
  return <ListingAvatar url={row.url} handle={row.handle} size={size} />;
}

function Dot() {
  return <span className="size-1 shrink-0 rounded-full bg-current opacity-40" />;
}

// The category pill already tells you the category once one is picked, so
// showing it again on every card is redundant — it only earns its place
// while viewing "All", where cards span multiple categories.
function MetaLine({
  createdAt,
  categoryName,
  showCategory,
  seeDetailsHref,
  className,
}: {
  createdAt: string;
  categoryName: string;
  showCategory: boolean;
  seeDetailsHref?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className="shrink-0">{timeAgo(createdAt)}</span>
      {showCategory && (
        <>
          <Dot />
          <span className="min-w-0 truncate">{categoryName}</span>
        </>
      )}
      {seeDetailsHref && (
        <>
          <Dot />
          {/* position: relative lifts this above the card's stretched
              outbound-link overlay so it opens the internal detail page
              instead of the outbound site. */}
          <Link
            href={seeDetailsHref}
            className="group/details relative flex shrink-0 items-center gap-0.5 font-medium text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            see details
            <ArrowRight className="size-3 shrink-0 transition-transform group-hover/details:translate-x-0.5" />
          </Link>
        </>
      )}
    </span>
  );
}

export function LeaderboardTable({
  rows,
  scope,
  categorySlug,
}: {
  rows: LeaderboardRow[];
  scope: BidScope;
  categorySlug?: string;
}) {
  const { openClaim, requestClaimHero } = useAppModals();
  // No effect needed to reset pagination on filter changes — the parent
  // remounts this component (via `key`) whenever the scope/category changes.
  const [page, setPage] = useState(1);
  const showCategory = !categorySlug;

  function handleClaimNow(row: LeaderboardRow) {
    // Deliberately a smaller +$1 nudge (not the site-wide $5 minimum raise
    // used to actually take the top spot) — this is just a fast starting
    // point for the hero form; the user can adjust the amount before
    // submitting.
    requestClaimHero(scope, row.categorySlug, row.amountCents + 100);
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-70 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No active bids yet.</p>
        <button
          type="button"
          onClick={() =>
            openClaim({
              scope,
              categorySlug: categorySlug ?? "",
              amountCents: MIN_BID_CENTS,
              locked: false,
            })
          }
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Be the first to claim this spot
        </button>
      </div>
    );
  }

  // Rows render at their natural size now — no fixed slot count padded with
  // invisible placeholders. That technique kept height constant across
  // categories, but it meant a category with only 1-2 bids still reserved
  // space for 3 top cards + 8 list rows, leaving a large dead gap. A real
  // height change when switching between categories of very different sizes
  // is normal for a filtered list and far less noticeable than that gap.
  const topThree = rows.slice(0, 3);
  const rest = rows.slice(3);
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pageRows = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = rest.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, rest.length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {topThree.map((row) => (
          <TopThreeRow key={row.id} row={row} showCategory={showCategory} onClaimNow={handleClaimNow} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border px-1 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <span>Rank / Product</span>
            <span>Total bid</span>
          </div>

          <ol className="flex flex-col">
            {pageRows.map((row) => {
              const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";

              return (
                <li key={row.id} className="border-b border-border last:border-b-0">
                  <div className="group relative flex items-center gap-4 py-3 transition-colors hover:bg-secondary/40 sm:py-3.5">
                    {/* Stretched link: clicking anywhere on the row (outside
                        the controls below, which sit on their own positioned
                        layer) opens the listing's own site/profile — not the
                        internal detail page. */}
                    <a
                      href={outboundLinkFor(row)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0"
                      aria-label={`Visit ${label}`}
                    />

                    <span className="w-8 shrink-0 text-center font-mono text-sm font-semibold text-muted-foreground">
                      #{row.rank}
                    </span>
                    <RowAvatar row={row} size="size-14" />
                    {/* A fixed min-height keeps every row the same size
                        regardless of description length, and justify-center
                        distributes any slack evenly above/below the actual
                        content instead of leaving a gap wedged under the
                        title when a row has no description. */}
                    <span className="flex min-h-16 min-w-0 flex-1 flex-col justify-center">
                      <span className="block truncate font-medium transition-colors group-hover:text-primary">
                        {label}
                      </span>
                      {row.description && (
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {truncateDescription(row.description)}
                        </span>
                      )}
                      <MetaLine
                        createdAt={row.createdAt}
                        categoryName={row.categoryName}
                        showCategory={showCategory}
                        seeDetailsHref={`/product/${slugForListing(row)}`}
                        className="mt-0.5"
                      />
                    </span>
                    {/* Positioned after the stretched link, so it paints on
                        top and "Claim now" captures its own click instead of
                        opening the outbound link underneath. */}
                    <span className="relative flex shrink-0 flex-col items-end gap-1">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {formatAmount(row.amountCents)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <LiveDot />
                        {placeholderClicks(row.id)} clicks
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClaimNow(row)}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/40 px-2 py-0.5 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:border-primary/60 hover:bg-primary/10"
                      >
                        <Zap className="size-3 shrink-0" />
                        Claim now
                      </button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {rest.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {rangeStart}–{rangeEnd} of {rest.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-1.5 font-mono text-xs">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopThreeRow({
  row,
  showCategory,
  onClaimNow,
}: {
  row: LeaderboardRow;
  showCategory: boolean;
  onClaimNow: (row: LeaderboardRow) => void;
}) {
  const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";
  const isLeader = row.rank === 1;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border p-3 transition-colors sm:p-3.5",
        isLeader
          ? "border-primary/40 bg-accent hover:border-primary/60"
          : "border-primary/15 bg-accent/40 hover:border-primary/30 hover:bg-accent/60",
      )}
    >
      {/* Stretched link: clicking anywhere on the card (outside the
          controls below, which sit on their own positioned layer) opens the
          listing's own site/profile — not the internal detail page. */}
      <a
        href={outboundLinkFor(row)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 rounded-2xl"
        aria-label={`Visit ${label}`}
      />

      {/* Anchored to the card's own corner (not the header row's flex
          baseline), so it stays put regardless of title length. Positioned
          after the stretched link above, so it paints on top and
          "Claim now" captures its own click instead of opening the
          outbound link underneath. */}
      <span className="absolute right-3 top-3 flex flex-col items-end gap-1 sm:right-3.5 sm:top-3.5">
        <span className="font-mono text-lg font-bold text-primary sm:text-xl">{formatAmount(row.amountCents)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <LiveDot />
          {placeholderClicks(row.id)} clicks
        </span>
        <button
          type="button"
          onClick={() => onClaimNow(row)}
          className="inline-flex items-center gap-1 rounded-md border border-primary/40 px-1 py-0.5 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:border-primary/60 hover:bg-primary/10"
        >
          <Zap className="size-3 shrink-0" />
          Claim now
        </button>
      </span>

      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          isLeader ? "bg-primary text-primary-foreground" : "border border-primary/35 bg-primary/10 text-primary",
        )}
      >
        #{row.rank}
      </span>
      <RowAvatar row={row} size="size-14" />

      {/* Title, description, and meta share this column so they line up
          under each other instead of the description/meta spanning the
          full card width from the left edge. A fixed min-height keeps every
          card the same size regardless of description length, and
          justify-center distributes any slack evenly above/below the actual
          content instead of leaving a single gap wedged under the title
          when a card has no description. */}
      <div className="flex min-h-20 min-w-0 flex-1 flex-col justify-center pr-28">
        <span className="block truncate font-semibold transition-colors group-hover:text-primary">{label}</span>
        {row.description && (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {truncateDescription(row.description)}
          </span>
        )}
        <MetaLine
          createdAt={row.createdAt}
          categoryName={row.categoryName}
          showCategory={showCategory}
          seeDetailsHref={`/product/${slugForListing(row)}`}
        />
      </div>
    </div>
  );
}

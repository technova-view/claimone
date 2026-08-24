"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LeaderboardRow } from "@/lib/types/leaderboard";
import type { BidScope } from "@/lib/types/scope";
import { displayHostFor, faviconUrlFor, timeAgo, xAvatarUrlFor } from "@/lib/services/link-display";
import { slugForListing } from "@/lib/services/product-slug";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
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

// Click tracking doesn't exist yet — this is a stable, UI-only stand-in
// (a deterministic hash of the bid's own id, so it's consistent between
// server and client renders and doesn't change on every reload) until
// real counts are wired up.
function placeholderClicks(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 900) + 20;
}

function RowAvatar({ row, size = "size-10" }: { row: LeaderboardRow; size?: string }) {
  const src = row.handle ? xAvatarUrlFor(row.handle) : row.url ? faviconUrlFor(row.url) : null;
  if (!src) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-muted-foreground",
          size,
        )}
      >
        ?
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={cn("shrink-0 rounded-xl border border-border object-cover", size)} />;
}

function Dot() {
  return <span className="size-1 shrink-0 rounded-full bg-current opacity-40" />;
}

// Small pulsing dot marking the click count as live-updating — same
// green ping pattern as the site-wide "online" indicator in StatusBar.
function LiveDot() {
  return (
    <span className="relative flex size-1.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-full w-full rounded-full bg-green-500" />
    </span>
  );
}

// The category pill already tells you the category once one is picked, so
// showing it again on every card is redundant — it only earns its place
// while viewing "All", where cards span multiple categories.
function MetaLine({
  createdAt,
  categoryName,
  showCategory,
  showSeeDetails = true,
  className,
}: {
  createdAt: string;
  categoryName: string;
  showCategory: boolean;
  showSeeDetails?: boolean;
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
      {showSeeDetails && <span className="ml-auto shrink-0 pl-2 group-hover:underline">see details</span>}
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
  const { openClaim } = useAppModals();
  // No effect needed to reset pagination on filter changes — the parent
  // remounts this component (via `key`) whenever the scope/category changes.
  const [page, setPage] = useState(1);
  const showCategory = !categorySlug;

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
          <TopThreeRow key={row.id} row={row} showCategory={showCategory} />
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
                  <Link
                    href={`/product/${slugForListing(row)}`}
                    className="group flex items-center gap-4 py-3 transition-colors hover:bg-secondary/40 sm:py-3.5"
                  >
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
                        showSeeDetails={false}
                        className="mt-0.5"
                      />
                    </span>
                    {/* Stacked so price, clicks, and "see details" all share
                        one right edge — clicks sits naturally in the middle
                        between the other two instead of being centered
                        against a variable-width neighbor. */}
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {formatAmount(row.amountCents)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <LiveDot />
                        {placeholderClicks(row.id)} clicks
                      </span>
                      <span className="text-xs text-muted-foreground group-hover:underline">see details</span>
                    </span>
                  </Link>
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

function TopThreeRow({ row, showCategory }: { row: LeaderboardRow; showCategory: boolean }) {
  const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";
  const isLeader = row.rank === 1;

  return (
    <Link
      href={`/product/${slugForListing(row)}`}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border p-3 transition-colors sm:p-3.5",
        isLeader
          ? "border-primary/40 bg-accent hover:border-primary/60"
          : "border-primary/15 bg-accent/40 hover:border-primary/30 hover:bg-accent/60",
      )}
    >
      {/* Anchored to the card's own corner (not the header row's flex
          baseline), so it stays put regardless of title length. Stacked the
          same way as the compact rows below (price / clicks / see details,
          gap-1) so the spacing between them matches exactly instead of
          drifting apart depending on each row type's own layout math. */}
      <span className="absolute right-3 top-3 flex flex-col items-end gap-1 sm:right-3.5 sm:top-3.5">
        <span className="font-mono text-lg font-bold text-primary sm:text-xl">{formatAmount(row.amountCents)}</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <LiveDot />
          {placeholderClicks(row.id)} clicks
        </span>
        <span className="text-xs text-muted-foreground group-hover:underline">see details</span>
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
          showSeeDetails={false}
        />
      </div>
    </Link>
  );
}

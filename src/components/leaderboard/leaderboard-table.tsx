"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LeaderboardRow } from "@/lib/types/leaderboard";
import type { BidScope } from "@/lib/types/scope";
import { displayHostFor, faviconUrlFor, outboundLinkFor, timeAgo, xAvatarUrlFor } from "@/lib/services/link-display";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";
import { cn } from "@/lib/utils";

const TOP_SLOTS = 3;
const PAGE_SIZE = 8;

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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

// The category pill already tells you the category once one is picked, so
// showing it again on every card is redundant — it only earns its place
// while viewing "All", where cards span multiple categories.
function MetaLine({
  createdAt,
  id,
  categoryName,
  showCategory,
  className,
}: {
  createdAt: string;
  id: string;
  categoryName: string;
  showCategory: boolean;
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
      <Dot />
      <span className="shrink-0 font-semibold text-foreground">{placeholderClicks(id)} clicks</span>
      <span className="ml-auto shrink-0 pl-2 group-hover:underline">see details</span>
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

  const topThree: (LeaderboardRow | null)[] = Array.from({ length: TOP_SLOTS }, (_, i) => rows[i] ?? null);
  const rest = rows.slice(TOP_SLOTS);
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const pageRowsRaw = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageRows: (LeaderboardRow | null)[] = Array.from({ length: PAGE_SIZE }, (_, i) => pageRowsRaw[i] ?? null);
  const rangeStart = rest.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, rest.length);

  return (
    // Both the top-3 block and the row list always render a fixed number of
    // slots (invisible placeholders fill the gaps), and the pagination bar
    // always renders too — so this panel's height is structurally constant
    // regardless of how many bids exist, instead of an estimated min-height.
    // The empty-state message overlays that same fixed structure rather than
    // replacing it with a differently-sized box.
    <div className="relative flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {topThree.map((row, i) => (
          <TopThreeRow key={row?.id ?? `top-empty-${i}`} row={row} placeholderRank={i + 1} showCategory={showCategory} />
        ))}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-1 pb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <span>Rank / Product</span>
          <span>Total bid</span>
        </div>

        <ol className="flex flex-col">
          {pageRows.map((row, i) => {
            if (!row) {
              return (
                <li key={`row-empty-${i}`} className="invisible border-b border-border last:border-b-0" aria-hidden>
                  <div className="flex items-center gap-4 py-3">
                    <span className="w-8 shrink-0 text-center font-mono text-sm font-semibold">#0</span>
                    <span className="size-9 shrink-0 rounded-xl bg-secondary" />
                    <span className="min-w-0 flex-1">
                      <span className="block">placeholder</span>
                      <span className="block truncate text-xs">placeholder text goes here</span>
                      <span className="mt-0.5 block text-xs">placeholder · placeholder · placeholder</span>
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold">$0</span>
                  </div>
                </li>
              );
            }

            const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";

            return (
              <li key={row.id} className="border-b border-border last:border-b-0">
                <a
                  href={outboundLinkFor(row)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-3 transition-colors hover:bg-secondary/40"
                >
                  <span className="w-8 shrink-0 text-center font-mono text-sm font-semibold text-muted-foreground">
                    #{row.rank}
                  </span>
                  <RowAvatar row={row} size="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium transition-colors group-hover:text-primary">
                      {label}
                    </span>
                    <span
                      className={cn("block truncate text-xs text-muted-foreground", !row.description && "invisible")}
                    >
                      {row.description || "—"}
                    </span>
                    <MetaLine
                      createdAt={row.createdAt}
                      id={row.id}
                      categoryName={row.categoryName}
                      showCategory={showCategory}
                      className="mt-0.5"
                    />
                  </span>
                  <span className="shrink-0 font-mono text-sm font-semibold text-primary">
                    {formatAmount(row.amountCents)}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground",
          rest.length === 0 && "invisible",
        )}
        aria-hidden={rest.length === 0}
      >
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

      {rows.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
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
      )}
    </div>
  );
}

function TopThreeRow({
  row,
  placeholderRank,
  showCategory,
}: {
  row: LeaderboardRow | null;
  placeholderRank: number;
  showCategory: boolean;
}) {
  if (!row) {
    return (
      <div className="invisible relative flex items-center gap-3 rounded-2xl border p-4 sm:p-5" aria-hidden>
        <span className="absolute right-4 top-4 text-lg font-bold sm:right-5 sm:top-5 sm:text-xl">$0</span>
        <span className="size-9 shrink-0 rounded-xl border" />
        <span className="size-14 shrink-0 rounded-xl bg-secondary" />
        <div className="min-w-0 flex-1 pr-24">
          <span className="block truncate font-semibold">placeholder {placeholderRank}</span>
          <span className="line-clamp-2 block min-h-10 text-sm">
            Placeholder description text that spans up to two lines of copy.
          </span>
          <span className="block text-xs">placeholder · placeholder · placeholder</span>
        </div>
      </div>
    );
  }

  const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";
  const isLeader = row.rank === 1;

  return (
    <a
      href={outboundLinkFor(row)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border p-4 transition-colors sm:p-5",
        isLeader
          ? "border-primary/40 bg-accent hover:border-primary/60"
          : "border-primary/15 bg-accent/40 hover:border-primary/30 hover:bg-accent/60",
      )}
    >
      {/* Anchored to the card's own corner (not the header row's flex
          baseline), so the price stays put regardless of title length. */}
      <span className="absolute right-4 top-4 font-mono text-lg font-bold text-primary sm:right-5 sm:top-5 sm:text-xl">
        {formatAmount(row.amountCents)}
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
          full card width from the left edge. */}
      <div className="min-w-0 flex-1 pr-24">
        <span className="block truncate font-semibold transition-colors group-hover:text-primary">{label}</span>
        <span className={cn("line-clamp-2 min-h-10 text-sm text-muted-foreground", !row.description && "invisible")}>
          {row.description || "—"}
        </span>
        {/* Cancels the column's own pr-24 (reserved so the longer title/
            description never run under the price) — the meta line is short
            enough to safely extend into that gutter, letting "see details"
            land near the price's right edge instead of stopping short. */}
        <MetaLine
          createdAt={row.createdAt}
          id={row.id}
          categoryName={row.categoryName}
          showCategory={showCategory}
          className="-mr-24"
        />
      </div>
    </a>
  );
}

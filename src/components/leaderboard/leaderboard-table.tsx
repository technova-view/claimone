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
      <div className="flex flex-col gap-2.5">
        {topThree.map((row, i) => (
          <TopThreeRow key={row?.id ?? `top-empty-${i}`} row={row} placeholderRank={i + 1} />
        ))}
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
                    <span className="block text-xs">placeholder</span>
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
                className="flex items-center gap-4 py-3 transition-colors hover:bg-secondary/40"
              >
                <span className="w-8 shrink-0 text-center font-mono text-sm font-semibold text-muted-foreground">
                  #{row.rank}
                </span>
                <RowAvatar row={row} size="size-9" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {timeAgo(row.createdAt)} · {row.categoryName}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm font-semibold text-primary">
                  {formatAmount(row.amountCents)}
                </span>
              </a>
            </li>
          );
        })}
      </ol>

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

function TopThreeRow({ row, placeholderRank }: { row: LeaderboardRow | null; placeholderRank: number }) {
  if (!row) {
    return (
      <div className="invisible flex items-center gap-4 rounded-2xl border p-4 sm:p-5" aria-hidden>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold">
          {placeholderRank}
        </span>
        <span className="size-10 shrink-0 rounded-xl bg-secondary" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">placeholder</span>
          <span className="block text-sm">placeholder</span>
        </span>
        <span className="shrink-0 text-lg font-bold">$0</span>
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
        "flex items-center gap-4 rounded-2xl border p-4 transition-colors sm:p-5",
        isLeader
          ? "border-primary/40 bg-accent hover:border-primary/60"
          : "border-border bg-card hover:border-primary/25 hover:bg-secondary/40",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl font-bold",
          isLeader
            ? "size-11 bg-primary text-lg text-primary-foreground"
            : "size-9 border border-primary/25 bg-transparent text-sm text-primary",
        )}
      >
        {row.rank}
      </span>
      <RowAvatar row={row} size={isLeader ? "size-11" : "size-10"} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{label}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {timeAgo(row.createdAt)} · {row.categoryName}
        </span>
      </span>
      <span className="shrink-0 text-right">
        {isLeader && (
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total bid
          </span>
        )}
        <span className={cn("block font-mono font-bold text-primary", isLeader ? "text-2xl" : "text-lg")}>
          {formatAmount(row.amountCents)}
        </span>
      </span>
    </a>
  );
}

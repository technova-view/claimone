"use client";

import { Plus } from "lucide-react";
import type { LeaderboardRow } from "@/lib/types/leaderboard";
import type { BidScope } from "@/lib/types/scope";
import { claimPriceForAmount } from "@/lib/services/pricing";
import { displayHostFor, faviconUrlFor, outboundLinkFor, xAvatarUrlFor } from "@/lib/services/link-display";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";
import { cn } from "@/lib/utils";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function RowAvatar({ row }: { row: LeaderboardRow }) {
  const src = row.handle ? xAvatarUrlFor(row.handle) : row.url ? faviconUrlFor(row.url) : null;
  if (!src) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-muted-foreground">
        ?
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="size-10 shrink-0 rounded-xl border border-border object-cover" />;
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

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-14 text-center">
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

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row) => {
        const label = row.handle ? `@${row.handle}` : row.url ? displayHostFor(row.url) : "";
        const competitorLabel = label;

        return (
          <li
            key={row.id}
            className={cn(
              "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-all",
              row.rank === 1
                ? "border-primary/40 bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/20 hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "w-8 shrink-0 text-center font-mono text-sm font-semibold",
                row.rank === 1 ? "text-primary" : "text-muted-foreground",
              )}
            >
              #{row.rank}
            </span>

            <a
              href={outboundLinkFor(row)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <RowAvatar row={row} />
              <span className="min-w-0">
                <span className="block truncate font-medium">{label}</span>
                {row.description && (
                  <span className="block truncate text-sm text-muted-foreground">{row.description}</span>
                )}
              </span>
            </a>

            <span className="shrink-0 font-mono text-sm font-semibold text-primary">
              {formatAmount(row.amountCents)}
            </span>

            <button
              type="button"
              onClick={() =>
                openClaim({
                  scope,
                  categorySlug: row.categorySlug,
                  amountCents: claimPriceForAmount(row.amountCents),
                  locked: true,
                  competitorLabel,
                })
              }
              className="absolute inset-y-0 right-0 flex w-40 items-center justify-end gap-1.5 rounded-r-2xl bg-gradient-to-l from-card via-card/95 to-transparent pr-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <Plus className="size-3.5" />
              Claim this spot
            </button>
          </li>
        );
      })}
    </ol>
  );
}

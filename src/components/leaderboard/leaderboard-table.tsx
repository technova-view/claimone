import Link from "next/link";
import type { LeaderboardRow } from "@/lib/types/leaderboard";
import { cn } from "@/lib/utils";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        No active bids yet. Be the first to{" "}
        <Link href="/claim" className="font-medium text-primary underline-offset-4 hover:underline">
          claim this spot
        </Link>
        .
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
            row.rank === 1
              ? "border-primary/40 bg-accent"
              : "border-border bg-card hover:bg-secondary",
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
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            {row.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.logoUrl}
                alt=""
                className="size-9 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground">
                {row.title.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate font-medium">{row.title}</span>
              {row.description && (
                <span className="block truncate text-sm text-muted-foreground">
                  {row.description}
                </span>
              )}
            </span>
          </a>

          <span className="shrink-0 font-mono text-sm font-semibold text-primary">
            {formatAmount(row.amountCents)}
          </span>
        </li>
      ))}
    </ol>
  );
}

import type { HallOfFameEntry } from "@/lib/db/entities/hall-of-fame.entity";
import { displayHostFor, outboundLinkFor } from "@/lib/services/link-display";
import { ListingAvatar } from "@/components/ui/listing-avatar";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function EntryCard({ entry, highlight }: { entry: HallOfFameEntry; highlight?: boolean }) {
  const snap = entry.bidSnapshot;
  const label = snap.handle ? `@${snap.handle}` : snap.url ? displayHostFor(snap.url) : "";

  return (
    <a
      href={outboundLinkFor(snap)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        highlight
          ? "flex items-center gap-3 rounded-2xl border border-primary/40 bg-accent p-4"
          : "flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
      }
    >
      <ListingAvatar url={snap.url} handle={snap.handle} size="size-9" radius="rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        <span className="block truncate text-sm text-muted-foreground">{snap.categoryName}</span>
      </span>
      <span className="shrink-0 font-mono text-sm font-semibold text-primary">
        {formatAmount(snap.amountCents)}
      </span>
    </a>
  );
}

export function HallOfFameList({ entries }: { entries: HallOfFameEntry[] }) {
  const periods = Array.from(new Set(entries.map((e) => e.periodKey)));

  if (periods.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No completed periods yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {periods.map((periodKey) => {
        const periodEntries = entries.filter((e) => e.periodKey === periodKey);
        const overall = periodEntries.find((e) => e.categoryId === null);
        const perCategory = periodEntries.filter((e) => e.categoryId !== null);

        return (
          <section key={periodKey} className="flex flex-col gap-3">
            <h2 className="font-mono text-sm font-semibold text-muted-foreground">{periodKey}</h2>
            {overall && <EntryCard entry={overall} highlight />}
            {perCategory.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {perCategory.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

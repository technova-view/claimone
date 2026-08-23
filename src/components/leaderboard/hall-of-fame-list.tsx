import type { HallOfFameEntry } from "@/lib/db/entities/hall-of-fame.entity";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function EntryCard({ entry, highlight }: { entry: HallOfFameEntry; highlight?: boolean }) {
  const snap = entry.bidSnapshot;
  return (
    <a
      href={snap.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        highlight
          ? "flex items-center gap-3 rounded-2xl border border-primary/40 bg-accent p-4"
          : "flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
      }
    >
      {snap.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={snap.logoUrl} alt="" className="size-9 shrink-0 rounded-lg border border-border object-cover" />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground">
          {snap.title.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{snap.title}</span>
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
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
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

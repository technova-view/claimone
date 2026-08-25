"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Crown, Trophy } from "lucide-react";
import { ListingAvatar } from "@/components/ui/listing-avatar";
import { getCategoryIcon } from "@/lib/config/category-icons";
import { displayHostFor } from "@/lib/services/link-display";
import { cn } from "@/lib/utils";
import type { HallOfFameEntry } from "@/lib/db/entities/hall-of-fame.entity";

const SCOPE_OPTIONS = ["daily", "weekly"] as const;
type Scope = (typeof SCOPE_OPTIONS)[number];

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// periodKey is "YYYY-MM-DD" for a daily period or "YYYY-Www" for a weekly
// one (see period.ts) — the "-W" marker is enough to tell them apart
// without this component needing to know which scope it's showing.
function formatPeriodLabel(periodKey: string): string {
  if (periodKey.includes("-W")) {
    const [year, week] = periodKey.split("-W");
    return `Week ${Number(week)}, ${year}`;
  }
  const date = new Date(`${periodKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return periodKey;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function ChampionSpotlight({ entry }: { entry: HallOfFameEntry }) {
  const snap = entry.bidSnapshot;
  const label = snap.handle ? `@${snap.handle}` : snap.url ? displayHostFor(snap.url) : "";

  return (
    <a
      href={`/go/${snap.bidId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/10 via-card to-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative shrink-0">
        <ListingAvatar url={snap.url} handle={snap.handle} size="size-13" radius="rounded-xl" />
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
          <Crown className="size-3" />
        </span>
      </div>

      <div className="relative min-w-0 flex-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
          <Crown className="size-2.5 shrink-0" />
          #1 overall · {snap.categoryName}
        </span>
        <p className="mt-1 truncate text-base font-semibold transition-colors group-hover:text-primary">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {snap.description || snap.url || (snap.handle ? `@${snap.handle} on X` : "")}
        </p>
      </div>

      <div className="relative flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[0.6rem] font-medium uppercase tracking-wide text-muted-foreground">Winning bid</span>
        <span className="font-mono text-xl font-bold text-primary sm:text-2xl">{formatAmount(snap.amountCents)}</span>
      </div>
    </a>
  );
}

function CategoryWinnerCard({ entry }: { entry: HallOfFameEntry }) {
  const snap = entry.bidSnapshot;
  const label = snap.handle ? `@${snap.handle}` : snap.url ? displayHostFor(snap.url) : "";
  const categoryIcon = { Icon: getCategoryIcon(snap.categoryName) };

  return (
    <a
      href={`/go/${snap.bidId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/20 hover:shadow-md"
    >
      <span className="relative shrink-0">
        <ListingAvatar url={snap.url} handle={snap.handle} size="size-11" radius="rounded-xl" />
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-card">
          <categoryIcon.Icon className="size-2.5 shrink-0" />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-primary/70">
          {snap.categoryName}
        </span>
        <span className="mt-0.5 block truncate font-medium transition-colors group-hover:text-primary">{label}</span>
      </span>
      <span className="shrink-0 font-mono text-sm font-semibold text-primary">{formatAmount(snap.amountCents)}</span>
    </a>
  );
}

function CompactWinnerRow({ entry, highlight }: { entry: HallOfFameEntry; highlight?: boolean }) {
  const snap = entry.bidSnapshot;
  const label = snap.handle ? `@${snap.handle}` : snap.url ? displayHostFor(snap.url) : "";
  const categoryIcon = { Icon: getCategoryIcon(snap.categoryName) };

  return (
    <a
      href={`/go/${snap.bidId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm",
        highlight ? "border-primary/30 bg-accent/40 hover:border-primary/50" : "border-border bg-card hover:border-primary/25",
      )}
    >
      <ListingAvatar url={snap.url} handle={snap.handle} size="size-8" radius="rounded-lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium transition-colors group-hover:text-primary">{label}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {highlight ? <Crown className="size-3 shrink-0" /> : <categoryIcon.Icon className="size-3 shrink-0" />}
          <span className="truncate">{highlight ? `#1 overall · ${snap.categoryName}` : snap.categoryName}</span>
        </span>
      </span>
      <span className="shrink-0 font-mono text-xs font-semibold text-primary">{formatAmount(snap.amountCents)}</span>
    </a>
  );
}

export function HallOfFamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScope: Scope = searchParams.get("scope") === "weekly" ? "weekly" : "daily";
  const [scope, setScope] = useState<Scope>(initialScope);
  const [entries, setEntries] = useState<HallOfFameEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting to the loading state when scope changes is the effect's whole job
    setEntries(null);
    fetch(`/api/hall-of-fame/${scope}`)
      .then((res) => res.json())
      .then((data) => !cancelled && setEntries(data));
    return () => {
      cancelled = true;
    };
  }, [scope]);

  function handleScopeChange(next: Scope) {
    setScope(next);
    router.replace(`/hall-of-fame?scope=${next}`, { scroll: false });
  }

  const periods = entries ? Array.from(new Set(entries.map((e) => e.periodKey))).sort().reverse() : [];
  const [currentPeriod, ...pastPeriods] = periods;
  const currentEntries = entries?.filter((e) => e.periodKey === currentPeriod) ?? [];
  const currentOverall = currentEntries.find((e) => e.categoryId === null);
  const currentPerCategory = currentEntries.filter((e) => e.categoryId !== null);

  return (
    <>
      <div className="relative overflow-hidden bg-linear-to-b from-primary/5 to-transparent">
        <div className="pointer-events-none absolute left-1/2 top-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-6 pb-4 pt-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Crown className="size-7" />
          </span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Hall of Fame</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Once a board resets, its #1 listing — overall and in every category — is archived here for good.
            </p>
          </div>
          <div className="inline-flex gap-1 rounded-full border border-border bg-secondary p-1">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleScopeChange(opt)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors",
                  scope === opt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 pb-12">
        {entries === null && (
          <div className="flex flex-col items-center gap-3 py-16 text-sm text-muted-foreground">
            <Crown className="size-6 shrink-0 animate-pulse text-primary/40" />
            Loading…
          </div>
        )}

        {entries !== null && periods.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-16 text-center">
            <Trophy className="size-8 shrink-0 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No completed {scope} periods yet — check back once the first board resets.
            </p>
          </div>
        )}

        {currentPeriod && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Reigning champions
              </h2>
              <span className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-foreground">{formatPeriodLabel(currentPeriod)}</span>
            </div>

            {currentOverall && <ChampionSpotlight entry={currentOverall} />}

            {currentPerCategory.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {currentPerCategory.map((entry) => (
                  <CategoryWinnerCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </section>
        )}

        {pastPeriods.length > 0 && (
          <section className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Past champions</h2>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-10 border-l border-border pl-7">
              {pastPeriods.map((periodKey) => {
                const periodEntries = entries?.filter((e) => e.periodKey === periodKey) ?? [];
                const overall = periodEntries.find((e) => e.categoryId === null);
                const perCategory = periodEntries.filter((e) => e.categoryId !== null);

                return (
                  <div key={periodKey} className="relative flex flex-col gap-3">
                    <span className="absolute left-[-2.05rem] top-1 flex size-4 items-center justify-center rounded-full bg-primary/15 ring-4 ring-background">
                      <span className="size-1.5 rounded-full bg-primary" />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{formatPeriodLabel(periodKey)}</h3>
                    <div className="flex flex-col gap-2">
                      {overall && <CompactWinnerRow entry={overall} highlight />}
                      {perCategory.map((entry) => (
                        <CompactWinnerRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
          <Trophy className="size-6 shrink-0 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Think you can take the crown next period?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Claim your spot
            <ArrowRight className="size-3.5 shrink-0" />
          </Link>
        </div>
      </main>
    </>
  );
}

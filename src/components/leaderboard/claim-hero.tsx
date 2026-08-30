"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, AtSign, Globe2, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "@/components/category/category-select";
import { submitBidCheckout } from "@/lib/services/checkout-client";
import { CryptoPaymentInstructions } from "@/components/claim/crypto-payment-instructions";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { BidScope } from "@/lib/types/scope";
import { MIN_BID_CENTS, MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/types/leaderboard";

const SCOPE_OPTIONS: { value: BidScope; label: string }[] = [
  { value: BidScope.ALL_TIME, label: "All time" },
  { value: BidScope.DAILY, label: "Daily" },
  { value: BidScope.WEEKLY, label: "Weekly" },
];

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function topAmountFor(rows: LeaderboardRow[], categorySlug: string): number {
  return rows
    .filter((row) => !categorySlug || row.categorySlug === categorySlug)
    .reduce((max, row) => Math.max(max, row.amountCents), 0);
}

function minPriceFor(rows: LeaderboardRow[], categorySlug: string): number {
  const top = topAmountFor(rows, categorySlug);
  return top > 0 ? top + MIN_RAISE_TO_TAKE_TOP_CENTS : MIN_BID_CENTS;
}

type LedgerRow = { kind: "row" | "ghost"; rank: number; amountCents: number; label?: string };

const TOP_N = 5;

// Top N, with the bidder's own (not-yet-submitted) amount inserted at the
// rank it would actually take if it lands in that top N. If it doesn't,
// the top N stays real and the caller shows the ghost rank as a one-line
// note instead of stretching the list to fit it.
//
// `top` is padded to TOP_N slots with null so callers that need the fixed
// length (amountToEnterTop's lookup below) can rely on it; the renderer
// filters the nulls out and shows only the rows that actually exist.
function buildLedger(categoryRows: LeaderboardRow[], amountCents: number, ghostLabel: string) {
  const sorted = [...categoryRows].sort((a, b) => b.amountCents - a.amountCents);
  const insertIndex = sorted.findIndex((r) => r.amountCents < amountCents);
  const idx = insertIndex === -1 ? sorted.length : insertIndex;
  const ghostRank = idx + 1;

  const combined: LedgerRow[] = [
    ...sorted.slice(0, idx).map((r, i) => ({ kind: "row" as const, rank: i + 1, amountCents: r.amountCents })),
    { kind: "ghost" as const, rank: ghostRank, amountCents, label: ghostLabel.trim() || "Your bid" },
    ...sorted.slice(idx).map((r, i) => ({ kind: "row" as const, rank: idx + i + 2, amountCents: r.amountCents })),
  ];

  const topSlice = combined.slice(0, TOP_N);
  const top: (LedgerRow | null)[] = Array.from({ length: TOP_N }, (_, i) => topSlice[i] ?? null);
  const ghostInTop = ghostRank <= TOP_N;
  // only meaningful when the ghost missed the top N — the $ short of 3rd place
  const amountToEnterTop = !ghostInTop ? sorted[TOP_N - 1].amountCents - amountCents + 100 : 0;

  return {
    top,
    ghostRank,
    ghostInTop,
    total: combined.length,
    isEmpty: categoryRows.length === 0,
    amountToEnterTop,
  };
}

const stepperClass =
  "flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-40";

export function ClaimHero({
  rowsByScope,
  categories,
}: {
  rowsByScope: Record<BidScope, LeaderboardRow[]>;
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const { claimHeroRequest } = useAppModals();
  const sectionRef = useRef<HTMLElement>(null);
  const [scope, setScope] = useState<BidScope>(BidScope.ALL_TIME);
  const [categorySlug, setCategorySlug] = useState("");
  const [value, setValue] = useState("");
  const [amountCents, setAmountCents] = useState(() => minPriceFor(rowsByScope[BidScope.ALL_TIME], ""));
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{
    bidId: string;
    payAmount: string;
    payAddress: string;
  } | null>(null);

  // A "Claim now" button elsewhere on the page (e.g. a leaderboard row) can
  // ask this hero to prefill itself for outbidding that row and scroll into
  // view — requestId is bumped on every request so this re-fires even when
  // the same scope/category/amount is requested twice in a row.
  useEffect(() => {
    if (!claimHeroRequest) return;
    function applyRequest() {
      if (!claimHeroRequest) return;
      setScope(claimHeroRequest.scope);
      setCategorySlug(claimHeroRequest.categorySlug);
      setAmountCents(claimHeroRequest.amountCents);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    applyRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on requestId so repeat requests re-fire
  }, [claimHeroRequest?.requestId]);

  const rows = rowsByScope[scope];
  const categoryRows = useMemo(
    () => rows.filter((r) => !categorySlug || r.categorySlug === categorySlug),
    [rows, categorySlug],
  );
  const topCents = topAmountFor(rows, categorySlug);
  const takesTop = amountCents >= (topCents > 0 ? topCents + MIN_RAISE_TO_TAKE_TOP_CENTS : MIN_BID_CENTS);
  const looksLikeHandle = value.trim().startsWith("@");
  const ledger = useMemo(
    () => buildLedger(categoryRows, amountCents, value.trim()),
    [categoryRows, amountCents, value],
  );

  function handleScopeChange(nextScope: BidScope) {
    setScope(nextScope);
    setAmountCents(minPriceFor(rowsByScope[nextScope], categorySlug));
  }

  function handleCategoryChange(slug: string) {
    setCategorySlug(slug);
    setAmountCents(minPriceFor(rows, slug));
  }

  function step(deltaDollars: number) {
    setAmountCents((current) => Math.max(MIN_BID_CENTS, current + deltaDollars * 100));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || !categorySlug) return;

    const looksLikeUrl = trimmed.startsWith("@") ? false : trimmed.includes(".") || trimmed.startsWith("http");
    const linkType = looksLikeUrl ? "url" : "handle";

    setError(null);
    setStatus("submitting");
    const result = await submitBidCheckout({
      scope,
      categorySlug,
      amountCents,
      ...(linkType === "handle" ? { handle: trimmed.replace(/^@/, "") } : { url: trimmed }),
    });
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("idle");
    setPayment({
      bidId: result.bidId,
      payAmount: result.payAmount,
      payAddress: result.payAddress,
    });
  }

  function handleConfirmed(slug: string | null) {
    if (slug) router.push(`/product/${slug}`);
  }

  return (
    <section ref={sectionRef} className="scroll-mt-24 flex flex-col gap-4 pt-4">
      <div className="rounded-2xl border border-border md:grid md:grid-cols-[40%_60%]">
        {/* Ledger pane */}
        <div className="flex flex-col gap-3 rounded-t-2xl border-b border-border bg-secondary/30 p-5 md:rounded-t-none md:rounded-l-2xl md:border-b-0 md:border-r">
          <ol className="flex flex-col gap-1 font-mono text-sm tabular-nums">
            {ledger.top
              .filter((row): row is LedgerRow => row !== null)
              .map((row) => (
                <li
                  key={row.rank}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border px-2 py-1.5",
                    row.kind === "ghost"
                      ? "border-dashed border-primary bg-primary/5"
                      : "border-transparent text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                      row.kind === "ghost" ? "bg-primary text-primary-foreground" : "bg-secondary",
                    )}
                  >
                    #{row.rank}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate",
                      row.kind === "ghost" && "font-semibold text-foreground",
                    )}
                  >
                    {row.kind === "ghost" ? row.label : formatAmount(row.amountCents)}
                  </span>
                  {row.kind === "ghost" && (
                    <span className="shrink-0 text-foreground">{formatAmount(row.amountCents)}</span>
                  )}
                </li>
              ))}
          </ol>

          <div className="flex flex-1 items-center justify-center">
            <p
              className={cn(
                "flex w-fit items-center gap-1.5 text-xs",
                ledger.isEmpty
                  ? "rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary"
                  : !ledger.ghostInTop
                    ? "font-medium text-primary"
                    : "text-foreground/70",
              )}
            >
              {ledger.isEmpty && <Sparkles className="size-3.5 shrink-0" />}

              {ledger.isEmpty ? (
                "No bids here yet — be the first to claim #1."
              ) : ledger.ghostInTop ? (
                <>
                  <Trophy className="size-3.5 shrink-0 text-primary" />
                  <span className="text-primary font-medium">
                    {ledger.total} bids competing for the top.
                  </span>
                </>
              ) : (
                <>
                  <ArrowUp className="size-3.5 shrink-0" />
                  {`Rank #${ledger.ghostRank} of ${ledger.total} — add ${formatAmount(
                    ledger.amountToEnterTop,
                  )} to reach the top ${TOP_N}.`}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Form pane */}
        {payment ? (
          <div className="flex flex-col justify-center gap-4 rounded-b-2xl p-5 md:rounded-b-none md:rounded-r-2xl">
            <CryptoPaymentInstructions
              bidId={payment.bidId}
              payAmount={payment.payAmount}
              payAddress={payment.payAddress}
              onConfirmed={handleConfirmed}
            />
          </div>
        ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center gap-4 rounded-b-2xl p-5 md:rounded-b-none md:rounded-r-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CategorySelect
              categories={categories}
              value={categorySlug}
              onChange={handleCategoryChange}
              variant="ghost"
              className="min-w-0"
            />
            <div className="flex shrink-0 gap-0.5 rounded-md border border-border bg-secondary p-0.5 text-xs">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleScopeChange(opt.value)}
                  className={cn(
                    "rounded px-2 py-1 font-medium transition-colors",
                    scope === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:flex-3">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {looksLikeHandle ? <AtSign className="size-4" /> : <Globe2 className="size-4" />}
              </span>
              <input
                type="text"
                required
                placeholder="Your product URL or @handle"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3.5 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="flex items-center gap-2 sm:flex-2">
              <button type="button" onClick={() => step(-1)} disabled={amountCents <= MIN_BID_CENTS} className={stepperClass} aria-label="Decrease amount">
                −
              </button>
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-primary">
                  $
                </span>
                <input
                  type="number"
                  min={MIN_BID_CENTS / 100}
                  step="1"
                  inputMode="numeric"
                  aria-label="Bid amount in dollars"
                  value={amountCents / 100}
                  onChange={(e) => {
                    const dollars = e.target.value === "" ? 0 : Number(e.target.value);
                    if (!Number.isFinite(dollars)) return;
                    setAmountCents(Math.max(0, Math.round(dollars * 100)));
                  }}
                  onBlur={() => setAmountCents((current) => Math.max(MIN_BID_CENTS, current))}
                  className="w-full rounded-md border border-input bg-background py-1.5 pl-6 pr-2 text-center font-mono text-xl font-bold tabular-nums text-primary outline-none transition-shadow [appearance:textfield] focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <button type="button" onClick={() => step(1)} className={stepperClass} aria-label="Increase amount">
                +
              </button>
            </div>
          </div>

          <div className="-mt-1 flex items-center justify-between gap-3">
            <p className={cn("text-xs text-muted-foreground", categorySlug && "invisible")}>
              Pick a category to place this bid.
            </p>
            {takesTop && (
              <span className="text-xs font-medium text-primary">{ledger.isEmpty ? "Be the first" : "Takes #1"}</span>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" disabled={!value.trim() || !categorySlug || status === "submitting"}>
            {status === "submitting" ? "Preparing checkout…" : takesTop ? "Claim #1" : "Submit bid"}
          </Button>
          <p className="text-xs text-muted-foreground">Already on the list? Enter the same URL or @handle and up your bid.</p>
        </form>
        )}
      </div>
    </section>
  );
}

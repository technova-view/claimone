"use client";

import { useEffect, useState, type FormEvent } from "react";
import { BidScope } from "@/lib/types/scope";
import { slugFromScope } from "@/lib/services/scope-slug";
import { openPaddleCheckout } from "@/lib/paddle/client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ClaimTarget {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  locked: boolean;
  competitorLabel?: string;
}

const SCOPE_OPTIONS: { value: BidScope; label: string }[] = [
  { value: BidScope.DAILY, label: "Daily" },
  { value: BidScope.WEEKLY, label: "Weekly" },
  { value: BidScope.ALL_TIME, label: "All-time" },
];

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "text-sm font-medium text-foreground";

type LinkType = "url" | "handle";

export function ClaimModal({
  target,
  open,
  onOpenChange,
}: {
  target: ClaimTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!target) return null;
  // Keyed on the target's identity below, so this instance remounts fresh
  // (state re-derived from props) every time a new claim is opened — no
  // effect needed to "sync" form state to a changing target prop.
  return <ClaimModalForm key={`${target.scope}:${target.categorySlug}:${target.competitorLabel ?? ""}`} target={target} open={open} onOpenChange={onOpenChange} />;
}

function ClaimModalForm({
  target,
  open,
  onOpenChange,
}: {
  target: ClaimTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [scope, setScope] = useState<BidScope>(target.scope);
  const [categorySlug, setCategorySlug] = useState(target.categorySlug);
  const [linkType, setLinkType] = useState<LinkType>("url");
  const [value, setValue] = useState("");
  const [amount, setAmount] = useState((target.amountCents / 100).toString());
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((cats: { slug: string; name: string }[]) => {
        setCategories(cats);
        setCategorySlug((current) => current || cats[0]?.slug || "");
      })
      .catch(() => setError("Couldn't load categories."));
  }, [open, categories.length]);

  const categoryName = categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Enter a valid bid amount.");
      return;
    }
    if (!value.trim()) {
      setError(linkType === "url" ? "Enter a URL." : "Enter an X handle.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          categorySlug,
          amountCents,
          ...(linkType === "url" ? { url: value.trim() } : { handle: value.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("idle");
        return;
      }

      onOpenChange(false);
      await openPaddleCheckout(data.transactionId);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Claim this spot">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Leaderboard</span>
          {target.locked ? (
            <div className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
              {SCOPE_OPTIONS.find((s) => s.value === scope)?.label} · {categoryName}
            </div>
          ) : (
            <>
              <div className="flex gap-1 rounded-full border border-border bg-secondary p-1">
                {SCOPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScope(opt.value)}
                    className={cn(
                      "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      scope === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <select
                className={fieldClass}
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {target.locked && target.competitorLabel && (
            <p className="text-xs text-muted-foreground">
              You&rsquo;ll rank above <span className="font-medium text-foreground">{target.competitorLabel}</span> on
              the {slugFromScope(scope)} · {categoryName} leaderboard.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1 rounded-full border border-border bg-secondary p-1 self-start">
            <button
              type="button"
              onClick={() => setLinkType("url")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                linkType === "url"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setLinkType("handle")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                linkType === "handle"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              X handle
            </button>
          </div>
          <input
            type={linkType === "url" ? "url" : "text"}
            required
            placeholder={linkType === "url" ? "https://example.com" : "@yourhandle"}
            className={fieldClass}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="claim-amount">
            Bid amount (USD)
          </label>
          <input
            id="claim-amount"
            type="number"
            min="1"
            step="1"
            required
            className={fieldClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="mt-1">
          {status === "submitting" ? "Preparing checkout…" : "Continue to payment"}
        </Button>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BidScope } from "@/lib/types/scope";
import { submitBidCheckout } from "@/lib/services/checkout-client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CryptoPaymentInstructions } from "@/components/claim/crypto-payment-instructions";
import { cn } from "@/lib/utils";

export interface ClaimTarget {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  locked: boolean;
  competitorLabel?: string;
  prefillValue?: string;
  prefillLinkType?: "url" | "handle";
}

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
  const router = useRouter();
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const scope = target.scope;
  const [categorySlug, setCategorySlug] = useState(target.categorySlug);
  const [linkType, setLinkType] = useState<LinkType>(target.prefillLinkType ?? "url");
  const [value, setValue] = useState(target.prefillValue ?? "");
  const [amount, setAmount] = useState((target.amountCents / 100).toString());
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{
    bidId: string;
    payAmount: string;
    payAddress: string;
  } | null>(null);

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
    const result = await submitBidCheckout({
      scope,
      categorySlug,
      amountCents,
      ...(linkType === "url" ? { url: value.trim() } : { handle: value.trim() }),
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
    onOpenChange(false);
    if (slug) router.push(`/product/${slug}`);
  }

  if (payment) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Send payment">
        <CryptoPaymentInstructions
          bidId={payment.bidId}
          payAmount={payment.payAmount}
          payAddress={payment.payAddress}
          onConfirmed={handleConfirmed}
        />
      </Modal>
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Claim this spot">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>Category</span>
          {target.locked ? (
            <div className="rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm text-muted-foreground">
              {categoryName}
            </div>
          ) : (
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
          )}
          {target.locked && target.competitorLabel && (
            <p className="text-xs text-muted-foreground">
              You&rsquo;ll rank above <span className="font-medium text-foreground">{target.competitorLabel}</span> in
              the {categoryName} leaderboard.
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
            // Plain text, not type="url" — native URL validation requires a
            // scheme, which would block "example.com" before the server gets
            // a chance to normalize it to "https://example.com".
            type="text"
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAmount((current) => String(Math.max(1, Math.round(Number(current) || 0) - 1)))}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              aria-label="Decrease bid amount"
            >
              −
            </button>
            <input
              id="claim-amount"
              type="number"
              min="1"
              step="1"
              required
              className={cn(fieldClass, "text-center font-mono")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setAmount((current) => String(Math.round(Number(current) || 0) + 1))}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              aria-label="Increase bid amount"
            >
              +
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Important:</span> A ClaimOne ranking provides public
          leaderboard placement. It does not guarantee clicks, traffic, sales, customers, followers, conversions, or
          other commercial results.
        </p>

        <Button type="submit" size="lg" disabled={status === "submitting"} className="mt-1">
          {status === "submitting" ? "Preparing checkout…" : "Continue to payment"}
        </Button>
      </form>
    </Modal>
  );
}

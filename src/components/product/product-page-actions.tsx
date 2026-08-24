"use client";

import { useState } from "react";
import { Check, ExternalLink, Link2, Zap } from "lucide-react";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { Button } from "@/components/ui/button";
import { BidScope } from "@/lib/types/scope";
import { claimPriceForAmount } from "@/lib/services/pricing";

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function ProductPageActions({
  outboundHref,
  label,
  categorySlug,
  amountCents,
}: {
  outboundHref: string;
  label: string;
  categorySlug: string;
  amountCents: number;
}) {
  const { openClaim } = useAppModals();
  const [copied, setCopied] = useState(false);
  const outbidPrice = claimPriceForAmount(amountCents);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="lg"
        className="flex-1"
        render={<a href={outboundHref} target="_blank" rel="noopener noreferrer" />}
      >
        <ExternalLink className="size-4" data-icon="inline-start" />
        Visit {label}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={() =>
          openClaim({
            scope: BidScope.ALL_TIME,
            categorySlug,
            amountCents: outbidPrice,
            locked: true,
            competitorLabel: label,
          })
        }
      >
        <Zap className="size-4" data-icon="inline-start" />
        Claim now for {formatAmount(outbidPrice)}
      </Button>
      <Button variant="outline" size="lg" onClick={handleCopyLink}>
        {copied ? <Check className="size-4" data-icon="inline-start" /> : <Link2 className="size-4" data-icon="inline-start" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}

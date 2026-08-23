"use client";

import { openPaddleCheckout } from "@/lib/paddle/client";
import { slugForListing } from "@/lib/services/product-slug";
import type { BidScope } from "@/lib/types/scope";

export interface SubmitBidInput {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  url?: string;
  handle?: string;
}

export type SubmitBidResult = { ok: true } | { ok: false; error: string };

// Shared by any form that collects a scope/category/amount/link and wants to
// go straight to Paddle checkout — posts the bid, then opens the checkout
// overlay with the resulting transaction.
export async function submitBidCheckout(input: SubmitBidInput): Promise<SubmitBidResult> {
  try {
    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "Something went wrong." };
    }
    const slug = slugForListing({ url: input.url ?? null, handle: input.handle ?? null });
    const successUrl = slug ? `${window.location.origin}/product/${slug}` : undefined;
    await openPaddleCheckout(data.transactionId, successUrl);
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

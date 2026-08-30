"use client";

import type { BidScope } from "@/lib/types/scope";

export interface SubmitBidInput {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  url?: string;
  handle?: string;
}

export type SubmitBidResult =
  | { ok: true; bidId: string; payAmount: string; payAddress: string; payCurrencyLabel: string }
  | { ok: false; error: string };

// Shared by any form that collects a scope/category/amount/link — posts the
// bid and hands back the payment details (exact amount + address, whichever
// provider generated them) for the caller to display, rather than
// redirecting anywhere.
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
    return {
      ok: true,
      bidId: data.bidId,
      payAmount: data.payAmount,
      payAddress: data.payAddress,
      payCurrencyLabel: data.payCurrencyLabel,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

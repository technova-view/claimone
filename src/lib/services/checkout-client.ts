"use client";

import type { BidScope } from "@/lib/types/scope";

export interface SubmitBidInput {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  method: "card" | "crypto";
  url?: string;
  handle?: string;
}

export type SubmitBidResult =
  | { ok: true; method: "card"; bidId: string; checkoutUrl: string }
  | { ok: true; method: "crypto"; bidId: string; payAmount: string; payAddress: string; payCurrencyLabel: string }
  | { ok: false; error: string };

// Shared by any form that collects a scope/category/amount/link/method —
// posts the bid and hands back either a Gumroad checkout URL to redirect to
// ("card") or the exact crypto amount + address to display ("crypto"),
// rather than redirecting anywhere itself.
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
    if (data.method === "card") {
      return { ok: true, method: "card", bidId: data.bidId, checkoutUrl: data.checkoutUrl };
    }
    return {
      ok: true,
      method: "crypto",
      bidId: data.bidId,
      payAmount: data.payAmount,
      payAddress: data.payAddress,
      payCurrencyLabel: data.payCurrencyLabel,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

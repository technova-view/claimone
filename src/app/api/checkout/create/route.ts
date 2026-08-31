import { NextRequest, NextResponse } from "next/server";
import { BidScope, PaymentProvider } from "@/lib/db/entities/bid.entity";
import { BidValidationError, createPendingBid, validateAndPriceBid } from "@/lib/services/bidding.service";
import { env } from "@/lib/config/env";

interface CreateCheckoutBody {
  scope: BidScope;
  categorySlug: string;
  url?: string;
  handle?: string;
  amountCents: number;
  method: "card" | "crypto";
}

export async function POST(request: NextRequest) {
  let body: CreateCheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Object.values(BidScope).includes(body.scope)) {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }
  if (body.method !== "card" && body.method !== "crypto") {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }
  if (!body.categorySlug || (!body.url && !body.handle) || !body.amountCents) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await validateAndPriceBid({
      scope: body.scope,
      categorySlug: body.categorySlug,
      amountCents: body.amountCents,
    });

    const { bid, checkoutUrl } = await createPendingBid({
      scope: body.scope,
      categorySlug: body.categorySlug,
      url: body.url,
      handle: body.handle,
      amountCents: body.amountCents,
      method: body.method,
    });

    if (checkoutUrl) {
      return NextResponse.json({ bidId: bid.id, method: "card", checkoutUrl });
    }

    const payment =
      bid.paymentProvider === PaymentProvider.NOWPAYMENTS
        ? {
            payAmount: bid.nowpaymentsPayAmount!,
            payAddress: bid.nowpaymentsPayAddress!,
            payCurrencyLabel: "USDT (TRC-20)",
          }
        : {
            payAmount: bid.cryptoAmountUsdt!,
            payAddress: env.cryptoWalletAddress,
            payCurrencyLabel: "USDT (TRC-20)",
          };

    return NextResponse.json({ bidId: bid.id, method: "crypto", ...payment });
  } catch (error) {
    if (error instanceof BidValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("checkout/create failed", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

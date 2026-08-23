import { NextRequest, NextResponse } from "next/server";
import { BidScope } from "@/lib/db/entities/bid.entity";
import {
  BidValidationError,
  createPendingBid,
  setPaddleTransactionId,
  validateAndPriceBid,
} from "@/lib/services/bidding.service";
import { createBidCheckoutTransaction } from "@/lib/paddle/server";

interface CreateCheckoutBody {
  scope: BidScope;
  categorySlug: string;
  url?: string;
  handle?: string;
  amountCents: number;
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
  if (!body.categorySlug || (!body.url && !body.handle) || !body.amountCents) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await validateAndPriceBid({
      scope: body.scope,
      categorySlug: body.categorySlug,
      amountCents: body.amountCents,
    });

    const bid = await createPendingBid({
      scope: body.scope,
      categorySlug: body.categorySlug,
      url: body.url,
      handle: body.handle,
      amountCents: body.amountCents,
    });

    const label = bid.url ?? `@${bid.handle}`;
    const transaction = await createBidCheckoutTransaction({
      bidId: bid.id,
      title: label,
      amountCents: body.amountCents,
    });

    await setPaddleTransactionId(bid.id, transaction.id);

    return NextResponse.json({ bidId: bid.id, transactionId: transaction.id });
  } catch (error) {
    if (error instanceof BidValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("checkout/create failed", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { fetchGumroadSale, isGumroadConfigured } from "@/lib/services/gumroad-payments.service";
import { activateBidWithGumroad, getBidById } from "@/lib/services/bidding.service";

// Gumroad's ping isn't signed in a way we can verify with confidence (see
// gumroad-payments.service.ts), so the inbound body here is treated as
// nothing more than "here's a sale_id and a claimed bidId to go check" —
// neither is trusted for activation on its own. Activation only happens
// once fetchGumroadSale() independently confirms, against Gumroad's own API
// using our access token, that a real sale with that id exists, for our
// product, at a price covering the claimed bid — i.e. a forged ping would
// need a sale_id that actually corresponds to a genuine sufficient payment.
//
// bidId itself has to come from this form body (confirmed via a real test
// sale: the Sales API response has no url_params/custom_fields carrying it)
// — Gumroad flattens the checkout URL's extra query params into a Rails-
// style url_params[<key>] form field on the ping.
export async function POST(request: NextRequest) {
  if (!isGumroadConfigured()) {
    return NextResponse.json({ error: "Gumroad is not configured." }, { status: 503 });
  }

  const form = await request.formData();
  const saleId = form.get("sale_id");
  const bidId = form.get("url_params[bidId]");
  if (typeof saleId !== "string" || typeof bidId !== "string") {
    console.error("Gumroad ping missing sale_id/url_params[bidId]", Array.from(form.entries()));
    return NextResponse.json({ received: true });
  }

  let sale;
  try {
    sale = await fetchGumroadSale(saleId);
  } catch (error) {
    console.error("Gumroad sale verification request failed", error);
    // Non-200 so Gumroad retries — this is a transient failure on our end,
    // not "this ping is bogus."
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }

  if (!sale) {
    console.error("Gumroad sale not found", saleId);
    return NextResponse.json({ received: true });
  }

  if (sale.productPermalink !== env.gumroadProductPermalink) {
    console.error("Gumroad sale is for a different product — refusing to activate", sale);
    return NextResponse.json({ received: true });
  }

  const bid = await getBidById(bidId);
  if (!bid) {
    console.error("Gumroad ping's bidId does not match any bid", bidId);
    return NextResponse.json({ received: true });
  }

  if (sale.priceCents < bid.amountCents) {
    console.error("Gumroad sale price is less than the bid amount — refusing to activate", sale, bid.amountCents);
    return NextResponse.json({ received: true });
  }

  await activateBidWithGumroad(bid.id, sale.id);
  return NextResponse.json({ received: true });
}

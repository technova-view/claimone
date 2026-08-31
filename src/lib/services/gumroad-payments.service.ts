import { env } from "@/lib/config/env";

// Manual setup this depends on:
//  1. One Gumroad product marked "Pay what you want" (min price low enough
//     to cover MIN_BID_CENTS) — its permalink and seller subdomain go in
//     GUMROAD_PRODUCT_PERMALINK / GUMROAD_SELLER_SUBDOMAIN (product URLs are
//     per-seller: https://<subdomain>.gumroad.com/l/<permalink>, there's no
//     shared gumroad.com/l/<permalink> path).
//  2. Settings > Advanced > "Generate access token" -> GUMROAD_ACCESS_TOKEN.
//  3. Settings > Advanced > "Ping endpoint" set to
//     https://<site>/api/webhooks/gumroad — no separate webhook secret is
//     used (see the route for why: it re-verifies every sale against the
//     Sales API below rather than trusting the ping body/signature).
//  4. This Gumroad account/product has no "redirect after purchase" setting
//     exposed in its dashboard (confirmed — checked every tab), so buyers
//     land on Gumroad's own receipt page after paying rather than being
//     bounced back to /product/<slug> directly. Not a correctness issue —
//     activation is driven entirely by the webhook — just a UX nicety we
//     don't get. returnSlug is still passed on the off chance Gumroad
//     forwards it somewhere useful; /checkout/gumroad-return exists as a
//     landing spot for that but isn't wired into the product itself.
//
// Both amountCents comparisons here and the "price" query param below are
// built on the assumption that Gumroad's PWYW price fields are in whole
// dollars for the checkout URL and in cents in the API — confirm both with
// one real (small) test purchase before trusting this for real bids.
export function isGumroadConfigured(): boolean {
  return Boolean(env.gumroadAccessToken && env.gumroadProductPermalink && env.gumroadSellerSubdomain);
}

// No server-side "create session" call exists for Gumroad — checkout is
// just a link to the (already-published) product page with URL params
// prefilling the pay-what-you-want price and passing our bid id through —
// arbitrary extra query params show up in the ping's url_params dict with
// no dashboard-side custom field needed (confirmed: this account's product
// editor has no custom-fields section at all).
export function buildGumroadCheckoutUrl(bidId: string, amountCents: number, returnSlug: string): string {
  if (!isGumroadConfigured()) {
    throw new Error("Gumroad is not configured.");
  }
  const url = new URL(`https://${env.gumroadSellerSubdomain}.gumroad.com/l/${env.gumroadProductPermalink}`);
  url.searchParams.set("price", (amountCents / 100).toString());
  url.searchParams.set("wanted", "true");
  url.searchParams.set("bidId", bidId);
  url.searchParams.set("returnSlug", returnSlug);
  return url.toString();
}

export interface GumroadSale {
  id: string;
  productPermalink: string;
  priceCents: number;
  test: boolean;
}

// The authoritative check: looks the sale up by id directly against
// Gumroad's own API using our access token, rather than trusting anything
// in the inbound ping's body. A forged ping would need a sale_id that
// actually exists in our account at the claimed price to pass this — i.e.
// it'd have to be a real payment.
//
// Confirmed (via a real test sale) that this response has no url_params
// field at all — unlike the ping payload, which does carry it — so bidId
// has to come from the ping itself; see the webhook route.
export async function fetchGumroadSale(saleId: string): Promise<GumroadSale | null> {
  if (!isGumroadConfigured()) {
    throw new Error("Gumroad is not configured.");
  }
  const url = new URL(`https://api.gumroad.com/v2/sales/${saleId}`);
  url.searchParams.set("access_token", env.gumroadAccessToken!);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.success || !data.sale) return null;

  const sale = data.sale as {
    id: string;
    product_permalink?: string;
    price?: number;
    test?: boolean;
  };

  return {
    id: sale.id,
    productPermalink: sale.product_permalink ?? "",
    priceCents: sale.price ?? 0,
    test: sale.test ?? false,
  };
}

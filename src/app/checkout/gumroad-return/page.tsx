import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { getBidById } from "@/lib/services/bidding.service";
import { slugForListing } from "@/lib/services/product-slug";

// Fixed redirect target configured once in the Gumroad product's "Redirect
// to a URL after purchase" setting — there's no per-checkout server-side
// session to customize it with, unlike the Dodo-style redirect this
// replaced. returnSlug/bidId are best-effort: forwarded here only if
// Gumroad happens to carry checkout-time URL params through to this
// redirect (unconfirmed — verify with one real test purchase). Either way,
// activation itself never depends on anything read here; it's driven
// entirely by the verified /api/webhooks/gumroad ping.
export default async function GumroadReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ bidId?: string; returnSlug?: string }>;
}) {
  const { bidId, returnSlug } = await searchParams;

  if (returnSlug) {
    redirect(`/product/${returnSlug}`);
  }

  if (bidId) {
    const bid = await getBidById(bidId);
    if (bid) {
      redirect(`/product/${slugForListing(bid)}`);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">Thanks for your payment.</h1>
        <p className="text-sm text-muted-foreground">
          Your bid is being confirmed — this can take a minute. Check the leaderboard for your listing.
        </p>
        <Link href="/" className="text-sm font-medium text-primary hover:text-primary/80">
          Back to claimone.lol
        </Link>
      </main>
    </div>
  );
}

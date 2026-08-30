import { NextRequest, NextResponse } from "next/server";
import { BidStatus } from "@/lib/db/entities/bid.entity";
import { checkAndActivateCryptoBid, getBidById } from "@/lib/services/bidding.service";
import { slugForListing } from "@/lib/services/product-slug";

// Polled by the checkout page every few seconds while the buyer is looking
// at the "send this amount" instructions — checks the chain for a matching
// transfer and activates the bid the moment one shows up.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ bidId: string }> }) {
  const { bidId } = await params;

  const bid = await getBidById(bidId);
  if (!bid) {
    return NextResponse.json({ error: "Bid not found." }, { status: 404 });
  }

  const current = await checkAndActivateCryptoBid(bid);

  return NextResponse.json({
    status: current.status,
    slug: current.status === BidStatus.ACTIVE ? slugForListing(current) : null,
  });
}

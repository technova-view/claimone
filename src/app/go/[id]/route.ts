import { NextRequest, NextResponse } from "next/server";
import { getBidById, incrementClickCount } from "@/lib/services/bidding.service";
import { outboundLinkFor } from "@/lib/services/link-display";

// Every outbound "visit" link on the site routes through here instead of
// linking straight to the external URL — that's what makes click counts
// real (see Bid.clickCount) rather than a client-side guess: this runs for
// every navigation, including right-click "open in new tab", which a
// pure onClick handler would miss.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bid = await getBidById(id);

  if (!bid || (!bid.url && !bid.handle)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await incrementClickCount(id);
  return NextResponse.redirect(outboundLinkFor(bid), { status: 302 });
}

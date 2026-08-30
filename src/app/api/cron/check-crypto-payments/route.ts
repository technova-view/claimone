import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { checkAndActivateCryptoBid, getPendingCryptoBids } from "@/lib/services/bidding.service";
import { BidStatus } from "@/lib/db/entities/bid.entity";

// Safety net for the on-demand check in crypto-status/[bidId]: catches
// payments from buyers who paid but never came back to the checkout page
// (closed the tab, lost connection, etc.) before it confirmed for them.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const pending = await getPendingCryptoBids();
  let activated = 0;
  for (const bid of pending) {
    const result = await checkAndActivateCryptoBid(bid);
    if (result.status === BidStatus.ACTIVE) activated += 1;
  }

  return NextResponse.json({ checked: pending.length, activated });
}

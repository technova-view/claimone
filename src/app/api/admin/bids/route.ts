import { NextRequest, NextResponse } from "next/server";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { BidValidationError } from "@/lib/services/bidding.service";
import { createAdminBid, listAllBidsForAdmin } from "@/lib/services/admin-bids.service";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") as BidScope | null;
  const categorySlug = request.nextUrl.searchParams.get("categorySlug") ?? undefined;

  if (scope && !Object.values(BidScope).includes(scope)) {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  const rows = await listAllBidsForAdmin({ scope: scope ?? undefined, categorySlug });
  return NextResponse.json({ rows });
}

interface CreateBidBody {
  scope?: BidScope;
  categorySlug?: string;
  amountCents?: number;
  url?: string;
  handle?: string;
  boostClicks?: number;
}

export async function POST(request: NextRequest) {
  let body: CreateBidBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.scope || !Object.values(BidScope).includes(body.scope)) {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }
  if (!body.categorySlug || !body.amountCents) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const bid = await createAdminBid({
      scope: body.scope,
      categorySlug: body.categorySlug,
      amountCents: body.amountCents,
      url: body.url,
      handle: body.handle,
      boostClicks: body.boostClicks,
    });
    return NextResponse.json({ id: bid.id });
  } catch (error) {
    if (error instanceof BidValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("admin/bids POST failed", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

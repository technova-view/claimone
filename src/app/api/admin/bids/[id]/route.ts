import { NextRequest, NextResponse } from "next/server";
import { BidScope, BidStatus } from "@/lib/db/entities/bid.entity";
import { BidValidationError } from "@/lib/services/bidding.service";
import { deleteAdminBid, updateAdminBid } from "@/lib/services/admin-bids.service";

interface UpdateBidBody {
  amountCents?: number;
  url?: string | null;
  handle?: string | null;
  categorySlug?: string;
  scope?: BidScope;
  status?: BidStatus;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: UpdateBidBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.scope && !Object.values(BidScope).includes(body.scope)) {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }
  if (body.status && !Object.values(BidStatus).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const bid = await updateAdminBid(id, body);
    return NextResponse.json({ id: bid.id });
  } catch (error) {
    if (error instanceof BidValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("admin/bids PATCH failed", error);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteAdminBid(id);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getBidById } from "@/lib/services/bidding.service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bid = await getBidById(id);
  if (!bid) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ status: bid.status });
}

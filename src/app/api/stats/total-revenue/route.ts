import { NextResponse } from "next/server";
import { getTotalRevenueCents } from "@/lib/services/bidding.service";

export async function GET() {
  const totalCents = await getTotalRevenueCents();
  return NextResponse.json({ totalCents });
}

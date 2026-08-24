import { NextRequest, NextResponse } from "next/server";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { getStandings } from "@/lib/services/admin-bids.service";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") as BidScope | null;
  const categorySlug = request.nextUrl.searchParams.get("categorySlug");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;

  if (!scope || !Object.values(BidScope).includes(scope) || !categorySlug) {
    return NextResponse.json({ error: "Missing scope or categorySlug." }, { status: 400 });
  }

  const rows = await getStandings(scope, categorySlug, excludeId);
  return NextResponse.json({ rows });
}

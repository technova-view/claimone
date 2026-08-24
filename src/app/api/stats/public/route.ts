import { NextRequest, NextResponse } from "next/server";
import { getPublicStatsForRange } from "@/lib/services/stats.service";

export async function GET(request: NextRequest) {
  const range = Number(request.nextUrl.searchParams.get("range")) || 1;
  const result = await getPublicStatsForRange(range);
  return NextResponse.json(result);
}

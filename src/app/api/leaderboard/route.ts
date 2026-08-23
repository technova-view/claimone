import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { scopeFromSlug } from "@/lib/services/scope-slug";

export async function GET(request: NextRequest) {
  const scopeSlug = request.nextUrl.searchParams.get("scope") ?? "";
  const categorySlug = request.nextUrl.searchParams.get("category") ?? undefined;

  const scope = scopeFromSlug(scopeSlug);
  if (!scope) {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  const rows = await getLeaderboard({ scope, categorySlug });
  return NextResponse.json(rows);
}

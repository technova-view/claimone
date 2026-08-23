import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { runRollover } from "@/lib/services/rollover.service";
import { BidScope } from "@/lib/db/entities/bid.entity";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const summary = await runRollover(BidScope.DAILY);
  return NextResponse.json(summary);
}

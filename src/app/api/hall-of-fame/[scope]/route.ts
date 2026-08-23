import { NextRequest, NextResponse } from "next/server";
import { listHallOfFame } from "@/lib/services/hall-of-fame.service";
import { HallOfFameScope } from "@/lib/db/entities/hall-of-fame.entity";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ scope: string }> }) {
  const { scope } = await params;
  if (scope !== "daily" && scope !== "weekly") {
    return NextResponse.json({ error: "Invalid scope." }, { status: 400 });
  }

  const entries = await listHallOfFame(
    scope === "daily" ? HallOfFameScope.DAILY : HallOfFameScope.WEEKLY,
  );
  return NextResponse.json(entries);
}

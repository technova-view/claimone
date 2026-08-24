import { NextRequest, NextResponse } from "next/server";
import { getClickBoostEnabled, setClickBoostEnabled } from "@/lib/services/stats.service";

export async function GET() {
  const enabled = await getClickBoostEnabled();
  return NextResponse.json({ enabled });
}

export async function PUT(request: NextRequest) {
  let body: { enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "`enabled` must be a boolean." }, { status: 400 });
  }
  await setClickBoostEnabled(body.enabled);
  return NextResponse.json({ enabled: body.enabled });
}

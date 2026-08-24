import { NextRequest, NextResponse } from "next/server";
import { getOnlineRange, saveOnlineRange } from "@/lib/services/stats.service";

export async function GET() {
  const range = await getOnlineRange();
  return NextResponse.json(range);
}

export async function PUT(request: NextRequest) {
  let body: { onlineMin?: number; onlineMax?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const onlineMin = Number(body.onlineMin);
  const onlineMax = Number(body.onlineMax);
  if (!Number.isInteger(onlineMin) || !Number.isInteger(onlineMax) || onlineMin < 0 || onlineMax < onlineMin) {
    return NextResponse.json({ error: "Invalid range." }, { status: 400 });
  }

  await saveOnlineRange({ onlineMin, onlineMax });
  return NextResponse.json({ ok: true });
}

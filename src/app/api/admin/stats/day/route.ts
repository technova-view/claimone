import { NextRequest, NextResponse } from "next/server";
import { getDayView, saveDayView } from "@/lib/services/stats.service";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const dateKey = request.nextUrl.searchParams.get("date");
  if (!dateKey || !DATE_KEY_RE.test(dateKey)) {
    return NextResponse.json({ error: "Missing or invalid `date` query param (YYYY-MM-DD)." }, { status: 400 });
  }
  const view = await getDayView(dateKey);
  return NextResponse.json(view);
}

interface SaveDayBody {
  dateKey?: string;
  hourly?: number[];
  bounceRatePct?: number | null;
  sessionTimeSeconds?: number | null;
}

export async function PUT(request: NextRequest) {
  let body: SaveDayBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.dateKey || !DATE_KEY_RE.test(body.dateKey)) {
    return NextResponse.json({ error: "Invalid dateKey." }, { status: 400 });
  }
  if (!Array.isArray(body.hourly) || body.hourly.length !== 24 || body.hourly.some((v) => !Number.isFinite(v))) {
    return NextResponse.json({ error: "hourly must be an array of 24 numbers." }, { status: 400 });
  }

  await saveDayView({
    dateKey: body.dateKey,
    hourly: body.hourly,
    bounceRatePct: body.bounceRatePct ?? null,
    sessionTimeSeconds: body.sessionTimeSeconds ?? null,
  });
  return NextResponse.json({ ok: true });
}

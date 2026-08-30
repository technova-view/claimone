import { NextRequest, NextResponse } from "next/server";
import { recordHeartbeat } from "@/lib/services/presence.service";

export async function POST(request: NextRequest) {
  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (typeof sessionId !== "string" || sessionId.length < 8 || sessionId.length > 64) {
    return NextResponse.json({ error: "Invalid sessionId." }, { status: 400 });
  }

  await recordHeartbeat(sessionId);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getOnlineCount } from "@/lib/services/presence.service";

export async function GET() {
  const count = await getOnlineCount();
  return NextResponse.json({ count });
}

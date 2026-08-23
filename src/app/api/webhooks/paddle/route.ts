import { NextRequest, NextResponse } from "next/server";
import { EventName } from "@paddle/paddle-node-sdk";
import { getPaddleServerClient } from "@/lib/paddle/server";
import { env } from "@/lib/config/env";
import { activateBid } from "@/lib/services/bidding.service";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  const paddle = getPaddleServerClient();
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, env.paddleWebhookSecret, signature);
  } catch (error) {
    console.error("Paddle webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "Unrecognized event." }, { status: 400 });
  }

  if (event.eventType === EventName.TransactionCompleted) {
    const bidId = event.data.customData?.["bidId"];
    if (typeof bidId === "string") {
      await activateBid(bidId, event.data.id);
    } else {
      console.error("transaction.completed webhook missing bidId in customData", event.data.id);
    }
  }

  return NextResponse.json({ received: true });
}

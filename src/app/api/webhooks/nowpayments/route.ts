import { NextRequest, NextResponse } from "next/server";
import { getNowPaymentsSdk } from "@/lib/services/nowpayments.service";
import { activateBidWithNowPayments } from "@/lib/services/bidding.service";

export async function POST(request: NextRequest) {
  const sdk = getNowPaymentsSdk();
  if (!sdk) {
    return NextResponse.json({ error: "NOWPayments is not configured." }, { status: 503 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const signature = request.headers.get("x-nowpayments-sig") ?? "";
  let event;
  try {
    event = sdk.parseWebhook(payload, signature);
  } catch (error) {
    console.error("NOWPayments webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (event.type === "payment.status_changed" && event.payment.status === "paid") {
    const bidId = event.payment.order_id;
    const paymentId = event.payment.payment_id;
    if (bidId && paymentId) {
      await activateBidWithNowPayments(bidId, paymentId);
    } else {
      console.error("NOWPayments payment.status_changed webhook missing order_id/payment_id", event.payment);
    }
  }

  return NextResponse.json({ received: true });
}

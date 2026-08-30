import { NowPaymentsSDK, type Payment } from "@nowpaymentsio/nowpayments-sdk-nodejs";
import { env } from "@/lib/config/env";

// Fixed to a single network for now (per the "start with one, add more
// later" rollout plan) — the same TRC-20 network the self-hosted fallback
// already uses, so the TronLink one-click-pay button keeps working
// regardless of which provider generated the address.
const PAY_CURRENCY = "usdttrc20";

const SANDBOX_BASE_URL = "https://api-sandbox.nowpayments.io";

let sdk: NowPaymentsSDK | null = null;
let sdkBuiltForEnv: "sandbox" | "production" | null = null;

// Returns null (rather than throwing) when NOWPayments isn't configured, so
// callers can treat "not configured" the same as "not available right now"
// and fall back to the self-hosted flow without a try/catch around config
// errors specifically. Rebuilds the cached client if NOWPAYMENTS_ENV changes
// between calls (matters across a dev-server env reload).
export function getNowPaymentsSdk(): NowPaymentsSDK | null {
  if (!env.nowPaymentsApiKey || !env.nowPaymentsIpnSecret) return null;
  if (!sdk || sdkBuiltForEnv !== env.nowPaymentsEnv) {
    sdk = new NowPaymentsSDK({
      apiKey: env.nowPaymentsApiKey,
      ipnSecret: env.nowPaymentsIpnSecret,
      ipnCallbackUrl: new URL("/api/webhooks/nowpayments", env.siteUrl).toString(),
      baseUrl: env.nowPaymentsEnv === "sandbox" ? SANDBOX_BASE_URL : undefined,
    });
    sdkBuiltForEnv = env.nowPaymentsEnv;
  }
  return sdk;
}

export interface NowPaymentsInvoice {
  paymentId: string;
  payAddress: string;
  payAmount: string;
  payCurrency: string;
}

// Throws on any API/network failure — the caller (checkout/create) catches
// this and falls back to the self-hosted flow rather than handling errors
// itself, since "NOWPayments didn't work" and "NOWPayments isn't
// configured" should both just mean "use the fallback."
export async function createNowPaymentsInvoice(bidId: string, amountCents: number): Promise<NowPaymentsInvoice> {
  const client = getNowPaymentsSdk();
  if (!client) {
    throw new Error("NOWPayments is not configured.");
  }

  const payment: Payment = await client.createDirectPayment({
    amount: amountCents / 100,
    currency: "usd",
    payCurrency: PAY_CURRENCY,
    orderId: bidId,
    orderDescription: `claimone.lol bid ${bidId}`,
  });

  if (!payment.pay_address || payment.pay_amount == null) {
    throw new Error("NOWPayments did not return a pay address/amount.");
  }

  return {
    paymentId: payment.payment_id ?? payment.id ?? bidId,
    payAddress: payment.pay_address,
    payAmount: String(payment.pay_amount),
    payCurrency: payment.pay_currency ?? PAY_CURRENCY,
  };
}

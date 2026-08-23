import { Environment, Paddle, type Transaction } from "@paddle/paddle-node-sdk";
import { env } from "@/lib/config/env";

let paddleClient: Paddle | undefined;

export function getPaddleServerClient(): Paddle {
  if (!paddleClient) {
    paddleClient = new Paddle(env.paddleApiKey, {
      environment: env.paddleEnv === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return paddleClient;
}

interface CreateBidCheckoutTransactionInput {
  bidId: string;
  title: string;
  amountCents: number;
}

// Uses Paddle's non-catalog (dynamic) pricing so we can charge the exact bid
// amount without pre-creating a Product/Price per possible amount.
export async function createBidCheckoutTransaction({
  bidId,
  title,
  amountCents,
}: CreateBidCheckoutTransactionInput): Promise<Transaction> {
  const paddle = getPaddleServerClient();
  return paddle.transactions.create({
    items: [
      {
        quantity: 1,
        price: {
          description: `claimone.lol bid — ${title}`,
          unitPrice: {
            amount: amountCents.toString(),
            currencyCode: "USD",
          },
          product: {
            name: `claimone.lol bid — ${title}`,
            taxCategory: "standard",
          },
        },
      },
    ],
    customData: { bidId },
  });
}

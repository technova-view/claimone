"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstancePromise: Promise<Paddle | undefined> | null = null;

export function getPaddleClient(): Promise<Paddle | undefined> {
  if (!paddleInstancePromise) {
    paddleInstancePromise = initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
    }).then((paddle) => {
      // Don't leave a failed init (e.g. missing token) cached forever —
      // let the next call retry instead of being stuck for the page's life.
      if (!paddle) paddleInstancePromise = null;
      return paddle;
    });
  }
  return paddleInstancePromise;
}

export async function openPaddleCheckout(transactionId: string): Promise<void> {
  const paddle = await getPaddleClient();
  paddle?.Checkout.open({ transactionId });
}

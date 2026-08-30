"use client";

// USDT's canonical TRC-20 contract on Tron mainnet — same constant the
// server uses in crypto-payment.service.ts.
const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_DECIMALS = 6;

interface TronWebContractCall {
  send(options: { feeLimit: number }): Promise<string>;
}
interface TronWebContract {
  transfer(to: string, amountSun: number): TronWebContractCall;
}
interface TronWebInstance {
  defaultAddress: { base58: string | false };
  contract(): { at(address: string): Promise<TronWebContract> };
}

declare global {
  interface Window {
    tronWeb?: TronWebInstance;
    tronLink?: { request(args: { method: string }): Promise<unknown> };
  }
}

export function isTronLinkInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.tronLink);
}

// Prompts TronLink's "connect this site" popup if not already approved.
// Throws with a message safe to show directly to the user.
export async function connectTronLink(): Promise<string> {
  if (!window.tronLink) {
    throw new Error("TronLink isn't installed in this browser.");
  }
  await window.tronLink.request({ method: "tron_requestAccounts" });
  const address = window.tronWeb?.defaultAddress?.base58;
  if (!address) {
    throw new Error("Couldn't read your TronLink address — make sure it's unlocked, then try again.");
  }
  return address;
}

// Prompts TronLink's transaction-approval popup for a TRC-20 USDT transfer
// of the exact amount. Returns the transaction id the moment TronLink
// broadcasts it — this is NOT proof of payment by itself (a broadcast
// transaction can still fail on-chain, e.g. insufficient TRX for fees), so
// the caller keeps polling the server's own chain-verified status exactly
// as it would for a manual transfer; this only makes sending easier.
export async function payWithTronLink(toAddress: string, amountUsdt: string): Promise<string> {
  if (!window.tronWeb) {
    throw new Error("TronLink isn't connected — click Connect first.");
  }
  const amountSun = Math.round(Number(amountUsdt) * 10 ** USDT_DECIMALS);
  const contract = await window.tronWeb.contract().at(USDT_TRC20_CONTRACT);
  return contract.transfer(toAddress, amountSun).send({ feeLimit: 100_000_000 });
}

import { createHash } from "crypto";
import { env } from "@/lib/config/env";

// USDT's canonical TRC-20 contract on Tron mainnet.
const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_DECIMALS = 6;

// A shared wallet address has no per-invoice address or memo field to
// disambiguate concurrent payments, so each bid gets a small deterministic
// fractional offset (derived from its id) added on top of the USD amount —
// e.g. a $5 bid might need to send exactly 5.0037 USDT instead of 5.0000.
// Deterministic (not random+stored) so it's reproducible from the bid alone
// and trivially auditable.
function offsetForBid(bidId: string): number {
  const hash = createHash("sha256").update(bidId).digest();
  const raw = hash.readUInt16BE(0); // 0-65535
  return raw % 9900; // 0-9899 -> 0.0000-0.9899 in hundredths of a cent
}

export function computeCryptoAmountUsdt(bidId: string, amountCents: number): string {
  const dollars = amountCents / 100;
  const offset = offsetForBid(bidId) / 10000;
  return (dollars + offset).toFixed(4);
}

interface TronGridTrc20Transfer {
  transaction_id: string;
  token_info: { address: string };
  from: string;
  to: string;
  value: string; // raw integer string, in the token's smallest unit
  type: string;
}

async function fetchRecentUsdtTransfersTo(address: string): Promise<TronGridTrc20Transfer[]> {
  const url = new URL(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`);
  url.searchParams.set("contract_address", USDT_TRC20_CONTRACT);
  url.searchParams.set("only_confirmed", "true");
  url.searchParams.set("only_to", "true");
  url.searchParams.set("limit", "50");
  url.searchParams.set("order_by", "block_timestamp,desc");

  const res = await fetch(url, {
    headers: env.tronGridApiKey ? { "TRON-PRO-API-KEY": env.tronGridApiKey } : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`TronGrid request failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { data?: TronGridTrc20Transfer[] };
  return data.data ?? [];
}

// Matches a pending bid's required exact amount against recent confirmed
// USDT transfers into our wallet. Returns the matching transaction hash, or
// null if no matching transfer has shown up yet. amountUsdt is compared as
// its exact smallest-unit integer to avoid floating-point comparison bugs.
export async function findMatchingCryptoPayment(
  amountUsdt: string,
  excludeTxHashes: Set<string>,
): Promise<string | null> {
  const targetUnits = Math.round(Number(amountUsdt) * 10 ** USDT_DECIMALS);
  const transfers = await fetchRecentUsdtTransfersTo(env.cryptoWalletAddress);

  for (const transfer of transfers) {
    if (excludeTxHashes.has(transfer.transaction_id)) continue;
    if (transfer.to !== env.cryptoWalletAddress) continue;
    if (Number(transfer.value) === targetUnits) {
      return transfer.transaction_id;
    }
  }
  return null;
}

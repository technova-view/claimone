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
  block_timestamp: number; // milliseconds
}

interface TronGridPage {
  transfers: TronGridTrc20Transfer[];
  nextUrl: string | null;
}

async function fetchUsdtTransfersPage(url: string): Promise<TronGridPage> {
  const res = await fetch(url, {
    headers: env.tronGridApiKey ? { "TRON-PRO-API-KEY": env.tronGridApiKey } : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`TronGrid request failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    data?: TronGridTrc20Transfer[];
    meta?: { links?: { next?: string } };
  };
  return { transfers: data.data ?? [], nextUrl: data.meta?.links?.next ?? null };
}

function firstPageUrl(address: string): string {
  const url = new URL(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`);
  url.searchParams.set("contract_address", USDT_TRC20_CONTRACT);
  url.searchParams.set("only_confirmed", "true");
  url.searchParams.set("only_to", "true");
  url.searchParams.set("limit", "100");
  url.searchParams.set("order_by", "block_timestamp,desc");
  return url.toString();
}

// Safety cap on pages walked per check — bounds worst-case cost if the
// wallet somehow has heavy unrelated traffic and sinceMs is never reached.
// 30 pages * 100/page = up to 3,000 transfers inspected per call.
const MAX_PAGES = 30;

// Matches a pending bid's required exact amount against confirmed USDT
// transfers into our wallet, paginating back through history until either a
// match is found or the transfers are older than the bid itself (a payment
// can't predate the bid it's paying for, so that's a safe stopping point) —
// rather than a fixed lookback count, which could miss a real payment once
// the wallet has done more than one page's worth of transfers since it
// arrived. Returns the matching transaction hash, or null if no matching
// transfer has shown up (yet). amountUsdt is compared as its exact
// smallest-unit integer to avoid floating-point comparison bugs.
export async function findMatchingCryptoPayment(
  amountUsdt: string,
  excludeTxHashes: Set<string>,
  sinceMs: number,
): Promise<string | null> {
  const targetUnits = Math.round(Number(amountUsdt) * 10 ** USDT_DECIMALS);

  let nextUrl: string | null = firstPageUrl(env.cryptoWalletAddress);
  for (let page = 0; nextUrl && page < MAX_PAGES; page++) {
    const { transfers, nextUrl: following } = await fetchUsdtTransfersPage(nextUrl);

    for (const transfer of transfers) {
      if (transfer.block_timestamp < sinceMs) return null; // walked past the bid's creation — no need to look further back
      if (excludeTxHashes.has(transfer.transaction_id)) continue;
      if (transfer.to !== env.cryptoWalletAddress) continue;
      if (Number(transfer.value) === targetUnits) {
        return transfer.transaction_id;
      }
    }

    if (transfers.length === 0) return null;
    nextUrl = following;
  }
  return null;
}

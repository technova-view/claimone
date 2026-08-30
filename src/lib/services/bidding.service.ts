import { randomUUID } from "crypto";
import type { DataSource, EntityManager } from "typeorm";
import { getDataSource } from "@/lib/db/data-source";
import { Bid, BidScope, BidStatus, PaymentProvider } from "@/lib/db/entities/bid.entity";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { getDailyKey, getWeeklyKey } from "@/lib/services/period";
import { getClickBoostEnabled, getFakeItemsEnabled } from "@/lib/services/stats.service";
import { fetchUrlDescription } from "@/lib/services/link-metadata.service";
import { normalizeUrl } from "@/lib/services/link-display";
import { slugForListing } from "@/lib/services/product-slug";
import { computeCryptoAmountUsdt, findMatchingCryptoPayment } from "@/lib/services/crypto-payment.service";
import { createNowPaymentsInvoice, getNowPaymentsSdk } from "@/lib/services/nowpayments.service";
import {
  MAX_BID_CENTS,
  MIN_BID_CENTS,
  MIN_RAISE_OWN_BID_CENTS,
  MIN_RAISE_TO_TAKE_TOP_CENTS,
} from "@/lib/config/bid-config";
import type { BidPricingResult, LeaderboardRow } from "@/lib/types/leaderboard";

export function currentPeriodKeyFor(scope: BidScope): string | null {
  if (scope === BidScope.DAILY) return getDailyKey();
  if (scope === BidScope.WEEKLY) return getWeeklyKey();
  return null;
}

interface LeaderboardParams {
  scope: BidScope;
  categorySlug?: string;
}

export async function getLeaderboard({ scope, categorySlug }: LeaderboardParams): Promise<LeaderboardRow[]> {
  const ds = await getDataSource();
  const periodKey = currentPeriodKeyFor(scope);
  const repo = ds.getRepository(Bid);

  const qb = repo
    .createQueryBuilder("bid")
    .innerJoinAndSelect("bid.category", "category")
    .where("bid.scope = :scope", { scope })
    .andWhere("bid.status = :status", { status: BidStatus.ACTIVE });

  if (periodKey === null) {
    qb.andWhere("bid.periodKey IS NULL");
  } else {
    qb.andWhere("bid.periodKey = :periodKey", { periodKey });
  }

  if (categorySlug) {
    qb.andWhere("category.slug = :categorySlug", { categorySlug });
  }

  // Admin-wide kill switch: hides every fake (admin-injected) entry from
  // public leaderboard views without touching the underlying rows.
  if (!(await getFakeItemsEnabled())) {
    qb.andWhere("bid.isFake = false");
  }

  qb.orderBy("bid.amountCents", "DESC").addOrderBy("bid.createdAt", "ASC");

  const [bids, clickBoostEnabled] = await Promise.all([qb.getMany(), getClickBoostEnabled()]);

  return bids.map((bid, index) => ({
    id: bid.id,
    rank: index + 1,
    url: bid.url,
    handle: bid.handle,
    description: bid.description,
    amountCents: bid.amountCents,
    categoryId: bid.categoryId,
    categoryName: bid.category.name,
    categorySlug: bid.category.slug,
    createdAt: bid.createdAt.toISOString(),
    clicks: bid.clickCount + (clickBoostEnabled ? bid.boostClicks : 0),
  }));
}

async function getTopActiveBid(
  scope: BidScope,
  periodKey: string | null,
  categoryId: string,
): Promise<Bid | null> {
  const ds = await getDataSource();
  const qb = ds
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .where("bid.scope = :scope", { scope })
    .andWhere("bid.status = :status", { status: BidStatus.ACTIVE })
    .andWhere("bid.categoryId = :categoryId", { categoryId });

  if (periodKey === null) {
    qb.andWhere("bid.periodKey IS NULL");
  } else {
    qb.andWhere("bid.periodKey = :periodKey", { periodKey });
  }

  qb.orderBy("bid.amountCents", "DESC").addOrderBy("bid.createdAt", "ASC");
  return qb.getOne();
}

export class BidValidationError extends Error {}

interface ValidateAndPriceInput {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  existingBidId?: string;
}

export async function validateAndPriceBid({
  scope,
  categorySlug,
  amountCents,
  existingBidId,
}: ValidateAndPriceInput): Promise<BidPricingResult> {
  if (!Number.isInteger(amountCents) || amountCents < MIN_BID_CENTS || amountCents > MAX_BID_CENTS) {
    throw new BidValidationError(
      `Amount must be between ${MIN_BID_CENTS} and ${MAX_BID_CENTS} cents.`,
    );
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    throw new BidValidationError(`Unknown category: ${categorySlug}`);
  }

  const periodKey = currentPeriodKeyFor(scope);
  const ds = await getDataSource();

  let existingBid: Bid | null = null;
  if (existingBidId) {
    existingBid = await ds.getRepository(Bid).findOne({ where: { id: existingBidId } });
    if (!existingBid || existingBid.status !== BidStatus.ACTIVE) {
      throw new BidValidationError("Existing bid not found or not active.");
    }
    const minRequired = existingBid.amountCents + MIN_RAISE_OWN_BID_CENTS;
    if (amountCents < minRequired) {
      throw new BidValidationError(`Raising your bid requires at least ${minRequired} cents.`);
    }
  }

  const topBid = await getTopActiveBid(scope, periodKey, category.id);
  const topAmount = topBid?.amountCents ?? 0;

  let takesTopSpot: boolean;
  if (existingBid) {
    // Already-active listing being raised: it competes at its new amount
    // regardless of the take-top raise rule, since it already holds a slot.
    takesTopSpot = amountCents >= topAmount;
  } else if (amountCents > topAmount) {
    const minRequired = topAmount + MIN_RAISE_TO_TAKE_TOP_CENTS;
    if (amountCents < minRequired) {
      throw new BidValidationError(
        `Taking the top spot requires at least ${minRequired} cents (current top is ${topAmount}).`,
      );
    }
    takesTopSpot = true;
  } else {
    takesTopSpot = false;
  }

  return {
    amountCents,
    wouldBeRank: takesTopSpot ? 1 : 2, // exact rank beyond #2 requires a full query; UI only needs top-or-not pre-checkout
    takesTopSpot,
    minRequiredCents: existingBid
      ? existingBid.amountCents + MIN_RAISE_OWN_BID_CENTS
      : MIN_BID_CENTS,
  };
}

interface CreatePendingBidInput {
  scope: BidScope;
  categorySlug: string;
  url?: string | null;
  handle?: string | null;
  amountCents: number;
}

export async function createPendingBid(input: CreatePendingBidInput): Promise<Bid> {
  const url = input.url?.trim() ? normalizeUrl(input.url) : null;
  const handle = input.handle?.trim().replace(/^@/, "") || null;

  if (!url && !handle) {
    throw new BidValidationError("Provide either a URL or an X handle.");
  }
  if (url && handle) {
    throw new BidValidationError("Provide only one of URL or X handle, not both.");
  }

  const category = await getCategoryBySlug(input.categorySlug);
  if (!category) {
    throw new BidValidationError(`Unknown category: ${input.categorySlug}`);
  }

  const description = url ? await fetchUrlDescription(url) : null;

  // Id generated up front (rather than left to the DB default) so both the
  // NOWPayments order_id and the self-hosted fallback's per-bid crypto
  // amount can be derived from it before the first insert.
  const id = randomUUID();

  // NOWPayments is the primary path: a unique deposit address per payment,
  // provider-hosted chain monitoring, and support for more networks than we
  // want to hand-build ourselves. Any failure (not configured, network
  // error, API error) falls straight back to the self-hosted TRC-20 flow —
  // "primary provider is down" should never be a reason checkout breaks.
  let paymentProvider = PaymentProvider.CRYPTO_DIRECT;
  let nowpaymentsPaymentId: string | null = null;
  let nowpaymentsPayAddress: string | null = null;
  let nowpaymentsPayAmount: string | null = null;
  let nowpaymentsPayCurrency: string | null = null;
  try {
    const invoice = await createNowPaymentsInvoice(id, input.amountCents);
    paymentProvider = PaymentProvider.NOWPAYMENTS;
    nowpaymentsPaymentId = invoice.paymentId;
    nowpaymentsPayAddress = invoice.payAddress;
    nowpaymentsPayAmount = invoice.payAmount;
    nowpaymentsPayCurrency = invoice.payCurrency;
  } catch (error) {
    console.error("NOWPayments invoice creation failed, falling back to self-hosted crypto flow", error);
  }

  const ds = await getDataSource();
  const repo = ds.getRepository(Bid);
  const bid = repo.create({
    id,
    scope: input.scope,
    status: BidStatus.PENDING_PAYMENT,
    categoryId: category.id,
    url,
    handle,
    description,
    amountCents: input.amountCents,
    periodKey: currentPeriodKeyFor(input.scope),
    paddleTransactionId: null,
    paymentProvider,
    cryptoAmountUsdt: paymentProvider === PaymentProvider.CRYPTO_DIRECT ? computeCryptoAmountUsdt(id, input.amountCents) : null,
    cryptoTxHash: null,
    nowpaymentsPaymentId,
    nowpaymentsPayAddress,
    nowpaymentsPayAmount,
    nowpaymentsPayCurrency,
    activatedAt: null,
  });
  return repo.save(bid);
}

// One listing (same URL, or same X handle) can't hold two active spots in
// the same category+scope+period — if a duplicate turns up (a second real
// purchase, or an admin edit that collides with an existing entry), keep
// only the highest bidder and delete the rest. Runs against whatever
// manager/DataSource the caller passes so it can join an existing
// transaction (activateBid) or run standalone (admin create/edit).
export async function dedupeActiveListing(
  manager: DataSource | EntityManager,
  params: { scope: BidScope; periodKey: string | null; categoryId: string; url: string | null; handle: string | null },
): Promise<void> {
  const { scope, periodKey, categoryId, url, handle } = params;
  if (!url && !handle) return;

  const repo = manager.getRepository(Bid);
  const qb = repo
    .createQueryBuilder("bid")
    .where("bid.scope = :scope", { scope })
    .andWhere("bid.categoryId = :categoryId", { categoryId })
    .andWhere("bid.status = :status", { status: BidStatus.ACTIVE });

  if (periodKey === null) {
    qb.andWhere("bid.periodKey IS NULL");
  } else {
    qb.andWhere("bid.periodKey = :periodKey", { periodKey });
  }

  if (url) {
    qb.andWhere("LOWER(bid.url) = LOWER(:url)", { url });
  } else if (handle) {
    qb.andWhere("LOWER(bid.handle) = LOWER(:handle)", { handle });
  }

  const matches = await qb.getMany();
  if (matches.length <= 1) return;

  // Highest bid wins; ties go to whoever claimed it first — same ordering
  // the public leaderboard uses.
  matches.sort((a, b) => b.amountCents - a.amountCents || a.createdAt.getTime() - b.createdAt.getTime());
  const losers = matches.slice(1);

  // Fake (admin-injected) losers are freely deleted. A real, paid loser is
  // archived instead — it drops off every public leaderboard exactly like a
  // delete would, but the row (and its paddleTransactionId) survives for
  // accounting/refund purposes rather than being destroyed outright.
  const fakeLosers = losers.filter((b) => b.isFake);
  const realLosers = losers.filter((b) => !b.isFake);
  if (fakeLosers.length) await repo.remove(fakeLosers);
  if (realLosers.length) {
    for (const loser of realLosers) loser.status = BidStatus.ARCHIVED;
    await repo.save(realLosers);
  }
}

export async function setPaddleTransactionId(bidId: string, paddleTransactionId: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(Bid).update({ id: bidId }, { paddleTransactionId });
}

// Called by the /go/[id] outbound-link redirect route on every real
// click-through — a plain atomic increment, no read-then-write race.
export async function incrementClickCount(bidId: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(Bid).increment({ id: bidId }, "clickCount", 1);
}

// Shared by every activation path: flips PENDING_PAYMENT -> ACTIVE and dedupes
// against any other active listing for the same URL/handle. Idempotent — a
// bid that's already ACTIVE is returned as-is, since a webhook or the crypto
// poller can both observe the same payment more than once. Deliberately does
// not re-check ranking rules; the payment already happened, so the bid
// activates at whatever rank its amount now lands on.
async function activateBidCore(bidId: string, applyPaymentRef: (bid: Bid) => void): Promise<Bid> {
  const ds = await getDataSource();
  return ds.transaction(async (manager) => {
    const repo = manager.getRepository(Bid);
    const bid = await repo.findOne({ where: { id: bidId } });
    if (!bid) {
      throw new BidValidationError(`Bid not found: ${bidId}`);
    }
    if (bid.status === BidStatus.ACTIVE) {
      return bid; // already activated, no-op
    }
    bid.status = BidStatus.ACTIVE;
    bid.activatedAt = new Date();
    applyPaymentRef(bid);
    const saved = await repo.save(bid);

    await dedupeActiveListing(manager, {
      scope: saved.scope,
      periodKey: saved.periodKey,
      categoryId: saved.categoryId,
      url: saved.url,
      handle: saved.handle,
    });

    return saved;
  });
}

// Only the verified Paddle webhook handler may call this.
export async function activateBid(bidId: string, paddleTransactionId: string): Promise<Bid> {
  return activateBidCore(bidId, (bid) => {
    bid.paddleTransactionId = paddleTransactionId;
  });
}

// Called by the on-demand payment-status check and the crypto-sweep cron
// once a matching on-chain USDT transfer is found for this bid.
export async function activateBidWithCrypto(bidId: string, cryptoTxHash: string): Promise<Bid> {
  return activateBidCore(bidId, (bid) => {
    bid.cryptoTxHash = cryptoTxHash;
  });
}

// Called by the verified NOWPayments webhook, and by the sweep's own
// fallback poll against NOWPayments' API for bids whose webhook never
// arrived.
export async function activateBidWithNowPayments(bidId: string, nowpaymentsPaymentId: string): Promise<Bid> {
  return activateBidCore(bidId, (bid) => {
    bid.nowpaymentsPaymentId = nowpaymentsPaymentId;
  });
}

// Every bid a real transfer has already been credited to, across every
// status — used to stop the same on-chain transaction from being matched to
// a second bid (e.g. if a stale amount collision briefly lines up).
export async function getUsedCryptoTxHashes(): Promise<Set<string>> {
  const ds = await getDataSource();
  const rows = await ds
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .select("bid.cryptoTxHash", "cryptoTxHash")
    .where("bid.cryptoTxHash IS NOT NULL")
    .getRawMany<{ cryptoTxHash: string }>();
  return new Set(rows.map((r) => r.cryptoTxHash));
}

// Looks for payment confirmation for this specific bid and activates it if
// found — branches on which provider the bid was created against. Used by
// both the buyer-facing "check my payment" poll and the cron sweep; cheap
// and safe to call repeatedly on a bid that's already active (returns it
// unchanged without hitting either provider).
//
// For NOWPAYMENTS bids this is a *fallback* check, not the primary path —
// the webhook is the source of truth and normally activates the bid first;
// this only matters when a webhook delivery is delayed or lost.
export async function checkAndActivateCryptoBid(bid: Bid): Promise<Bid> {
  if (bid.status === BidStatus.ACTIVE) return bid;

  if (bid.paymentProvider === PaymentProvider.NOWPAYMENTS) {
    if (!bid.nowpaymentsPaymentId) return bid;
    const sdk = getNowPaymentsSdk();
    if (!sdk) return bid;
    const payment = await sdk.getPaymentStatus(bid.nowpaymentsPaymentId);
    if (payment.status !== "paid") return bid;
    return activateBidWithNowPayments(bid.id, bid.nowpaymentsPaymentId);
  }

  if (!bid.cryptoAmountUsdt) return bid;
  const usedTxHashes = await getUsedCryptoTxHashes();
  // A few minutes of slack before the bid's own createdAt, purely to absorb
  // clock skew between our server and Tron block timestamps — the payment
  // itself can never actually predate the bid that generated its amount.
  const sinceMs = bid.createdAt.getTime() - 5 * 60_000;
  const txHash = await findMatchingCryptoPayment(bid.cryptoAmountUsdt, usedTxHashes, sinceMs);
  if (!txHash) return bid;

  return activateBidWithCrypto(bid.id, txHash);
}

// Bids still waiting on payment, oldest first — swept by the cron as a
// safety net for buyers whose confirmation never made it back on its own
// (closed tab before the poll caught it, a lost NOWPayments webhook, etc).
export async function getPendingCryptoBids(): Promise<Bid[]> {
  const ds = await getDataSource();
  return ds
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .where("bid.status = :status", { status: BidStatus.PENDING_PAYMENT })
    .andWhere("(bid.cryptoAmountUsdt IS NOT NULL OR bid.nowpaymentsPaymentId IS NOT NULL)")
    .orderBy("bid.createdAt", "ASC")
    .take(200)
    .getMany();
}

export async function getBidById(bidId: string): Promise<Bid | null> {
  const ds = await getDataSource();
  return ds.getRepository(Bid).findOne({ where: { id: bidId } });
}

// Checkout redirects the browser back the moment Paddle confirms payment,
// but activation happens separately via the async webhook — so a bid can
// briefly exist as PENDING_PAYMENT after the buyer is already looking at
// its product page. Used to tell "not paid yet" apart from "doesn't exist"
// so that moment shows a short wait instead of a 404.
export async function hasPendingBidMatchingSlug(slug: string): Promise<boolean> {
  const ds = await getDataSource();
  const recentPending = await ds.getRepository(Bid).find({
    where: { scope: BidScope.ALL_TIME, status: BidStatus.PENDING_PAYMENT },
    order: { createdAt: "DESC" },
    take: 50,
  });
  return recentPending.some((bid) => slugForListing(bid).toLowerCase() === slug.toLowerCase());
}

// Cumulative bid total since launch — every bid that ever went live
// (ACTIVE or ARCHIVED both imply activateBid() ran). Includes admin-seeded
// demo listings (isFake) as well as real paid ones, so this is a "total
// listed" figure rather than strictly real payments — see the site copy
// that displays it. Unlike getLeaderboard's per-scope sum, this never
// drops when a listing gets outbid, archived, or a period resets —
// archived bids keep their amountCents specifically so this figure stays
// accurate.
export async function getTotalRevenueCents(): Promise<number> {
  const ds = await getDataSource();
  const row = await ds
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .select("COALESCE(SUM(bid.amountCents), 0)", "total")
    .where("bid.status IN (:...statuses)", { statuses: [BidStatus.ACTIVE, BidStatus.ARCHIVED] })
    .getRawOne<{ total: string }>();
  return Number(row?.total ?? 0);
}

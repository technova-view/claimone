import { getDataSource } from "@/lib/db/data-source";
import { Bid, BidScope, BidStatus } from "@/lib/db/entities/bid.entity";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { getDailyKey, getWeeklyKey } from "@/lib/services/period";
import { getFakeItemsEnabled } from "@/lib/services/stats.service";
import { fetchUrlDescription } from "@/lib/services/link-metadata.service";
import { slugForListing } from "@/lib/services/product-slug";
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

  const bids = await qb.getMany();

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
  const url = input.url?.trim() || null;
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

  const ds = await getDataSource();
  const repo = ds.getRepository(Bid);
  const bid = repo.create({
    scope: input.scope,
    status: BidStatus.PENDING_PAYMENT,
    categoryId: category.id,
    url,
    handle,
    description,
    amountCents: input.amountCents,
    periodKey: currentPeriodKeyFor(input.scope),
    paddleTransactionId: null,
    activatedAt: null,
  });
  return repo.save(bid);
}

export async function setPaddleTransactionId(bidId: string, paddleTransactionId: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(Bid).update({ id: bidId }, { paddleTransactionId });
}

// Only the verified Paddle webhook handler may call this. Idempotent: safe
// to call more than once for the same bid (Paddle may retry webhooks), and
// deliberately does not re-check ranking rules — the payment already
// succeeded, so the bid activates at whatever rank its amount now lands on.
export async function activateBid(bidId: string, paddleTransactionId: string): Promise<Bid> {
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
    bid.paddleTransactionId = paddleTransactionId;
    return repo.save(bid);
  });
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

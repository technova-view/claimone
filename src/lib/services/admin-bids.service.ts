import { getDataSource } from "@/lib/db/data-source";
import { Bid, BidScope, BidStatus } from "@/lib/db/entities/bid.entity";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { BidValidationError, currentPeriodKeyFor, dedupeActiveListing } from "@/lib/services/bidding.service";
import { normalizeUrl } from "@/lib/services/link-display";

export interface AdminBidRow {
  id: string;
  scope: BidScope;
  status: BidStatus;
  url: string | null;
  handle: string | null;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isFake: boolean;
  createdAt: string;
}

interface ListAdminBidsParams {
  scope?: BidScope;
  categorySlug?: string;
}

export async function listAllBidsForAdmin(params: ListAdminBidsParams = {}): Promise<AdminBidRow[]> {
  const ds = await getDataSource();
  const qb = ds.getRepository(Bid).createQueryBuilder("bid").innerJoinAndSelect("bid.category", "category");

  if (params.scope) qb.andWhere("bid.scope = :scope", { scope: params.scope });
  if (params.categorySlug) qb.andWhere("category.slug = :categorySlug", { categorySlug: params.categorySlug });

  qb.orderBy("bid.scope", "ASC")
    .addOrderBy("category.name", "ASC")
    .addOrderBy("bid.amountCents", "DESC")
    .addOrderBy("bid.createdAt", "ASC");

  const bids = await qb.getMany();
  return bids.map((bid) => ({
    id: bid.id,
    scope: bid.scope,
    status: bid.status,
    url: bid.url,
    handle: bid.handle,
    amountCents: bid.amountCents,
    categoryId: bid.categoryId,
    categoryName: bid.category.name,
    categorySlug: bid.category.slug,
    isFake: bid.isFake,
    createdAt: bid.createdAt.toISOString(),
  }));
}

export interface StandingRow {
  id: string;
  rank: number;
  label: string;
  amountCents: number;
}

// Current active bids for a scope+category, in rank order — used by the
// admin UI to preview where a given amount would land, and to suggest a
// price for "insert at rank N". Excludes `excludeId` so editing a bid's
// own amount doesn't count itself as a neighbor.
export async function getStandings(
  scope: BidScope,
  categorySlug: string,
  excludeId?: string,
): Promise<StandingRow[]> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  const ds = await getDataSource();
  const periodKey = currentPeriodKeyFor(scope);
  const qb = ds
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .where("bid.scope = :scope", { scope })
    .andWhere("bid.status = :status", { status: BidStatus.ACTIVE })
    .andWhere("bid.categoryId = :categoryId", { categoryId: category.id });

  if (periodKey === null) {
    qb.andWhere("bid.periodKey IS NULL");
  } else {
    qb.andWhere("bid.periodKey = :periodKey", { periodKey });
  }
  if (excludeId) qb.andWhere("bid.id != :excludeId", { excludeId });

  qb.orderBy("bid.amountCents", "DESC").addOrderBy("bid.createdAt", "ASC");
  const bids = await qb.getMany();

  return bids.map((bid, index) => ({
    id: bid.id,
    rank: index + 1,
    label: bid.handle ? `@${bid.handle}` : (bid.url ?? ""),
    amountCents: bid.amountCents,
  }));
}

// Suggests a price that would land a new/edited bid at `targetRank` among
// the given standings (best-effort — ties are broken by insertion order,
// same as the public leaderboard).
export function suggestAmountForRank(standings: StandingRow[], targetRank: number): number {
  const index = Math.max(1, targetRank) - 1;
  if (standings.length === 0) return 500; // MIN_BID_CENTS fallback
  if (index <= 0) return standings[0].amountCents + 100;
  if (index >= standings.length) return Math.max(1, standings[standings.length - 1].amountCents - 100);
  const above = standings[index - 1].amountCents;
  const below = standings[index].amountCents;
  const mid = Math.floor((above + below) / 2);
  return mid > below ? mid : above;
}

interface CreateAdminBidInput {
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
  url?: string | null;
  handle?: string | null;
}

export async function createAdminBid(input: CreateAdminBidInput): Promise<Bid> {
  const url = input.url?.trim() ? normalizeUrl(input.url) : null;
  const handle = input.handle?.trim().replace(/^@/, "") || null;

  if (!url && !handle) {
    throw new BidValidationError("Provide either a URL or an X handle.");
  }
  if (url && handle) {
    throw new BidValidationError("Provide only one of URL or X handle, not both.");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1) {
    throw new BidValidationError("Amount must be a positive integer number of cents.");
  }

  const category = await getCategoryBySlug(input.categorySlug);
  if (!category) {
    throw new BidValidationError(`Unknown category: ${input.categorySlug}`);
  }

  const ds = await getDataSource();
  const repo = ds.getRepository(Bid);
  const bid = repo.create({
    scope: input.scope,
    status: BidStatus.ACTIVE,
    categoryId: category.id,
    url,
    handle,
    description: null,
    amountCents: input.amountCents,
    periodKey: currentPeriodKeyFor(input.scope),
    paddleTransactionId: null,
    activatedAt: new Date(),
    isFake: true,
  });
  const saved = await repo.save(bid);

  await dedupeActiveListing(ds, {
    scope: saved.scope,
    periodKey: saved.periodKey,
    categoryId: saved.categoryId,
    url: saved.url,
    handle: saved.handle,
  });

  return saved;
}

interface UpdateAdminBidInput {
  amountCents?: number;
  url?: string | null;
  handle?: string | null;
  categorySlug?: string;
  scope?: BidScope;
  status?: BidStatus;
}

export async function updateAdminBid(id: string, input: UpdateAdminBidInput): Promise<Bid> {
  const ds = await getDataSource();
  const repo = ds.getRepository(Bid);
  const bid = await repo.findOne({ where: { id } });
  if (!bid) throw new BidValidationError(`Bid not found: ${id}`);

  if (input.categorySlug) {
    const category = await getCategoryBySlug(input.categorySlug);
    if (!category) throw new BidValidationError(`Unknown category: ${input.categorySlug}`);
    bid.categoryId = category.id;
  }
  if (input.scope) {
    bid.scope = input.scope;
    bid.periodKey = currentPeriodKeyFor(input.scope);
  }
  if (input.amountCents !== undefined) {
    if (!Number.isInteger(input.amountCents) || input.amountCents < 1) {
      throw new BidValidationError("Amount must be a positive integer number of cents.");
    }
    bid.amountCents = input.amountCents;
  }
  if (input.url !== undefined || input.handle !== undefined) {
    const url = input.url?.trim() ? normalizeUrl(input.url) : null;
    const handle = input.handle?.trim().replace(/^@/, "") || null;
    if (!url && !handle) throw new BidValidationError("Provide either a URL or an X handle.");
    if (url && handle) throw new BidValidationError("Provide only one of URL or X handle, not both.");
    bid.url = url;
    bid.handle = handle;
  }
  if (input.status) bid.status = input.status;

  const saved = await repo.save(bid);

  if (saved.status === BidStatus.ACTIVE) {
    await dedupeActiveListing(ds, {
      scope: saved.scope,
      periodKey: saved.periodKey,
      categoryId: saved.categoryId,
      url: saved.url,
      handle: saved.handle,
    });
  }

  return saved;
}

export async function deleteAdminBid(id: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(Bid).delete({ id });
}

import { IsNull, type EntityManager } from "typeorm";
import { getDataSource } from "@/lib/db/data-source";
import { Bid, BidScope, BidStatus } from "@/lib/db/entities/bid.entity";
import { Category } from "@/lib/db/entities/category.entity";
import { HallOfFameEntry, HallOfFameScope } from "@/lib/db/entities/hall-of-fame.entity";
import { getPreviousDailyKey, getPreviousWeeklyKey } from "@/lib/services/period";

function toHallOfFameScope(scope: BidScope.DAILY | BidScope.WEEKLY): HallOfFameScope {
  return scope === BidScope.DAILY ? HallOfFameScope.DAILY : HallOfFameScope.WEEKLY;
}

async function getTopActiveBid(
  manager: EntityManager,
  scope: BidScope,
  periodKey: string,
  categoryId: string | null,
): Promise<Bid | null> {
  const qb = manager
    .getRepository(Bid)
    .createQueryBuilder("bid")
    .innerJoinAndSelect("bid.category", "category")
    .where("bid.scope = :scope", { scope })
    .andWhere("bid.periodKey = :periodKey", { periodKey })
    .andWhere("bid.status = :status", { status: BidStatus.ACTIVE });

  if (categoryId) {
    qb.andWhere("bid.categoryId = :categoryId", { categoryId });
  }

  qb.orderBy("bid.amountCents", "DESC").addOrderBy("bid.createdAt", "ASC");
  return qb.getOne();
}

async function upsertHallOfFameEntry(
  manager: EntityManager,
  scope: BidScope.DAILY | BidScope.WEEKLY,
  periodKey: string,
  categoryId: string | null,
  bid: Bid,
): Promise<void> {
  const repo = manager.getRepository(HallOfFameEntry);
  const hofScope = toHallOfFameScope(scope);

  const existing = await repo.findOne({
    where: { scope: hofScope, periodKey, categoryId: categoryId ?? IsNull() },
  });
  if (existing) return; // already rolled over for this period — idempotent

  await repo.save(
    repo.create({
      scope: hofScope,
      periodKey,
      categoryId,
      originalBidId: bid.id,
      bidSnapshot: {
        bidId: bid.id,
        url: bid.url,
        handle: bid.handle,
        description: bid.description,
        amountCents: bid.amountCents,
        categoryId: bid.categoryId,
        categoryName: bid.category.name,
      },
    }),
  );
}

export interface RolloverSummary {
  scope: BidScope.DAILY | BidScope.WEEKLY;
  periodKey: string;
  hallOfFameEntriesCreated: number;
  bidsArchived: number;
}

export async function runRollover(scope: BidScope.DAILY | BidScope.WEEKLY): Promise<RolloverSummary> {
  const periodKey = scope === BidScope.DAILY ? getPreviousDailyKey() : getPreviousWeeklyKey();
  const ds = await getDataSource();

  return ds.transaction(async (manager) => {
    const categories = await manager.getRepository(Category).find();
    let hallOfFameEntriesCreated = 0;

    for (const category of categories) {
      const topBid = await getTopActiveBid(manager, scope, periodKey, category.id);
      if (topBid) {
        const before = await manager.getRepository(HallOfFameEntry).count({
          where: { scope: toHallOfFameScope(scope), periodKey, categoryId: category.id },
        });
        await upsertHallOfFameEntry(manager, scope, periodKey, category.id, topBid);
        if (before === 0) hallOfFameEntriesCreated++;
      }
    }

    const overallTopBid = await getTopActiveBid(manager, scope, periodKey, null);
    if (overallTopBid) {
      const before = await manager.getRepository(HallOfFameEntry).count({
        where: { scope: toHallOfFameScope(scope), periodKey, categoryId: IsNull() },
      });
      await upsertHallOfFameEntry(manager, scope, periodKey, null, overallTopBid);
      if (before === 0) hallOfFameEntriesCreated++;
    }

    const archiveResult = await manager
      .getRepository(Bid)
      .createQueryBuilder()
      .update(Bid)
      .set({ status: BidStatus.ARCHIVED })
      .where("scope = :scope", { scope })
      .andWhere("periodKey = :periodKey", { periodKey })
      .andWhere("status = :status", { status: BidStatus.ACTIVE })
      .execute();

    return {
      scope,
      periodKey,
      hallOfFameEntriesCreated,
      bidsArchived: archiveResult.affected ?? 0,
    };
  });
}

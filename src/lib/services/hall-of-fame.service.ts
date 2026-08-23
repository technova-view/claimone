import { getDataSource } from "@/lib/db/data-source";
import { HallOfFameEntry, HallOfFameScope } from "@/lib/db/entities/hall-of-fame.entity";
import { IsNull } from "typeorm";

export async function listHallOfFame(scope: HallOfFameScope): Promise<HallOfFameEntry[]> {
  const ds = await getDataSource();
  return ds.getRepository(HallOfFameEntry).find({
    where: { scope },
    order: { periodKey: "DESC" },
  });
}

export async function getOverallHallOfFame(scope: HallOfFameScope): Promise<HallOfFameEntry[]> {
  const ds = await getDataSource();
  return ds.getRepository(HallOfFameEntry).find({
    where: { scope, categoryId: IsNull() },
    order: { periodKey: "DESC" },
  });
}

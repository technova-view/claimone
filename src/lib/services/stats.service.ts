import { In } from "typeorm";
import { getDataSource } from "@/lib/db/data-source";
import { StatsDaily, StatsHourly, StatsSettings } from "@/lib/db/entities/stats.entity";
import { getDailyKey } from "@/lib/services/period";

export interface DayView {
  dateKey: string;
  hourly: number[]; // 24 entries, index = hour (0-23)
  bounceRatePct: number | null;
  sessionTimeSeconds: number | null;
}

export async function getDayView(dateKey: string): Promise<DayView> {
  const ds = await getDataSource();
  const [hourlyRows, dailyRow] = await Promise.all([
    ds.getRepository(StatsHourly).find({ where: { dateKey } }),
    ds.getRepository(StatsDaily).findOne({ where: { dateKey } }),
  ]);

  const hourly = new Array<number>(24).fill(0);
  for (const row of hourlyRows) {
    if (row.hour >= 0 && row.hour < 24) hourly[row.hour] = row.visitors;
  }

  return {
    dateKey,
    hourly,
    bounceRatePct: dailyRow?.bounceRatePct ?? null,
    sessionTimeSeconds: dailyRow?.sessionTimeSeconds ?? null,
  };
}

export interface SaveDayViewInput {
  dateKey: string;
  hourly: number[];
  bounceRatePct: number | null;
  sessionTimeSeconds: number | null;
}

export async function saveDayView(input: SaveDayViewInput): Promise<void> {
  const ds = await getDataSource();
  await ds.transaction(async (manager) => {
    const hourlyRepo = manager.getRepository(StatsHourly);
    for (let hour = 0; hour < 24; hour++) {
      const visitors = Math.max(0, Math.round(input.hourly[hour] ?? 0));
      const existing = await hourlyRepo.findOne({ where: { dateKey: input.dateKey, hour } });
      if (existing) {
        existing.visitors = visitors;
        await hourlyRepo.save(existing);
      } else {
        await hourlyRepo.save(hourlyRepo.create({ dateKey: input.dateKey, hour, visitors }));
      }
    }

    const dailyRepo = manager.getRepository(StatsDaily);
    const existingDaily = await dailyRepo.findOne({ where: { dateKey: input.dateKey } });
    if (existingDaily) {
      existingDaily.bounceRatePct = input.bounceRatePct;
      existingDaily.sessionTimeSeconds = input.sessionTimeSeconds;
      await dailyRepo.save(existingDaily);
    } else {
      await dailyRepo.save(
        dailyRepo.create({
          dateKey: input.dateKey,
          bounceRatePct: input.bounceRatePct,
          sessionTimeSeconds: input.sessionTimeSeconds,
        }),
      );
    }
  });
}

// All-time visitor count for the site-wide status bar's "visitors since
// launch" figure — the running sum of every hourly bucket the admin has
// ever set.
export async function getAllTimeVisitorTotal(): Promise<number> {
  const ds = await getDataSource();
  const row = await ds
    .getRepository(StatsHourly)
    .createQueryBuilder("h")
    .select("COALESCE(SUM(h.visitors), 0)", "total")
    .getRawOne<{ total: string }>();
  return Number(row?.total ?? 0);
}

export interface OnlineRange {
  onlineMin: number;
  onlineMax: number;
}

export async function getOnlineRange(): Promise<OnlineRange> {
  const ds = await getDataSource();
  const repo = ds.getRepository(StatsSettings);
  const existing = await repo.findOne({ where: { id: 1 } });
  if (existing) return { onlineMin: existing.onlineMin, onlineMax: existing.onlineMax };
  return { onlineMin: 400, onlineMax: 650 };
}

export async function saveOnlineRange(range: OnlineRange): Promise<void> {
  const ds = await getDataSource();
  const repo = ds.getRepository(StatsSettings);
  const existing = await repo.findOne({ where: { id: 1 } });
  if (existing) {
    existing.onlineMin = range.onlineMin;
    existing.onlineMax = range.onlineMax;
    await repo.save(existing);
  } else {
    await repo.save(repo.create({ id: 1, ...range }));
  }
}

// Site-wide switch letting the admin hide every admin-injected fake
// leaderboard entry from public views in one click, and bring them all back
// later — the bids themselves are untouched, only their visibility.
export async function getFakeItemsEnabled(): Promise<boolean> {
  const ds = await getDataSource();
  const existing = await ds.getRepository(StatsSettings).findOne({ where: { id: 1 } });
  return existing?.fakeItemsEnabled ?? true;
}

export async function setFakeItemsEnabled(enabled: boolean): Promise<void> {
  const ds = await getDataSource();
  const repo = ds.getRepository(StatsSettings);
  const existing = await repo.findOne({ where: { id: 1 } });
  if (existing) {
    existing.fakeItemsEnabled = enabled;
    await repo.save(existing);
  } else {
    await repo.save(repo.create({ id: 1, fakeItemsEnabled: enabled }));
  }
}

export const PUBLIC_STATS_RANGES = [1, 7, 15, 30] as const;
export type PublicStatsRangeDays = (typeof PUBLIC_STATS_RANGES)[number];

export interface StatsPoint {
  label: string;
  visitors: number;
}

export interface PublicStatsResult {
  rangeDays: number;
  points: StatsPoint[];
  totalVisitors: number;
  bounceRatePct: number | null;
  sessionTimeSeconds: number | null;
  onlineMin: number;
  onlineMax: number;
}

function dateKeyDaysAgo(daysAgo: number): string {
  return getDailyKey(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
});

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export async function getPublicStatsForRange(rangeDays: number): Promise<PublicStatsResult> {
  const days = PUBLIC_STATS_RANGES.includes(rangeDays as PublicStatsRangeDays) ? rangeDays : 1;
  const todayKey = getDailyKey();
  const currentHour = new Date().getUTCHours();
  const range = await getOnlineRange();

  if (days === 1) {
    const dayView = await getDayView(todayKey);
    // Hours that haven't happened yet today stay at 0, same as real analytics.
    const points = HOUR_LABELS.map((label, hour) => ({
      label,
      visitors: hour <= currentHour ? dayView.hourly[hour] : 0,
    }));
    const totalVisitors = points.reduce((sum, p) => sum + p.visitors, 0);
    return {
      rangeDays: 1,
      points,
      totalVisitors,
      bounceRatePct: dayView.bounceRatePct,
      sessionTimeSeconds: dayView.sessionTimeSeconds,
      onlineMin: range.onlineMin,
      onlineMax: range.onlineMax,
    };
  }

  const dateKeys = Array.from({ length: days }, (_, i) => dateKeyDaysAgo(days - 1 - i));

  const ds = await getDataSource();
  const [hourlyRows, dailyRows] = await Promise.all([
    ds.getRepository(StatsHourly).find({ where: { dateKey: In(dateKeys) } }),
    ds.getRepository(StatsDaily).find({ where: { dateKey: In(dateKeys) } }),
  ]);

  const totalsByDateKey = new Map<string, number>();
  for (const key of dateKeys) totalsByDateKey.set(key, 0);
  for (const row of hourlyRows) {
    if (row.dateKey === todayKey && row.hour > currentHour) continue; // today's future hours don't count yet
    totalsByDateKey.set(row.dateKey, (totalsByDateKey.get(row.dateKey) ?? 0) + row.visitors);
  }

  const dailyByDateKey = new Map(dailyRows.map((row) => [row.dateKey, row]));
  const bounceValues = dateKeys.map((k) => dailyByDateKey.get(k)?.bounceRatePct).filter((v): v is number => v != null);
  const sessionValues = dateKeys
    .map((k) => dailyByDateKey.get(k)?.sessionTimeSeconds)
    .filter((v): v is number => v != null);

  const points = dateKeys.map((key) => ({ label: formatDateLabel(key), visitors: totalsByDateKey.get(key) ?? 0 }));
  const totalVisitors = points.reduce((sum, p) => sum + p.visitors, 0);

  return {
    rangeDays: days,
    points,
    totalVisitors,
    bounceRatePct: bounceValues.length ? Math.round(bounceValues.reduce((s, v) => s + v, 0) / bounceValues.length) : null,
    sessionTimeSeconds: sessionValues.length
      ? Math.round(sessionValues.reduce((s, v) => s + v, 0) / sessionValues.length)
      : null,
    onlineMin: range.onlineMin,
    onlineMax: range.onlineMax,
  };
}

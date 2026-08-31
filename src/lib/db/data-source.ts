import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "@/lib/config/env";
import { Category } from "./entities/category.entity";
import { Bid } from "./entities/bid.entity";
import { HallOfFameEntry } from "./entities/hall-of-fame.entity";
import { StatsDaily, StatsHourly, StatsSettings } from "./entities/stats.entity";
import { VisitorPresence } from "./entities/visitor-presence.entity";
import { ensureCategoriesSeeded } from "./seed/categories.seed";

declare global {
  // Keyed by the exact Bid class reference the DataSource's entity metadata
  // was built with — not a single shared slot. Next.js compiles Server
  // Components and route handlers (and, in dev, each Turbopack recompile)
  // into separate module graphs, so this file — and the entity classes it
  // imports — can end up evaluated more than once, producing structurally
  // identical but reference-distinct Bid classes. A DataSource only
  // recognizes entities built from the exact class it was initialized
  // with, so each graph needs its own DataSource rather than fighting over
  // one slot. An earlier single-slot-plus-evict design had two graphs
  // repeatedly destroying the pool the other one was actively using
  // mid-query ("Called end on pool more than once" / "Connection
  // terminated") — this avoids that entirely by never destroying a
  // healthy pool another graph might still be using. The trade-off is a
  // handful of small pools coexisting (bounded — see MAX_DATA_SOURCES)
  // rather than one, which is a much smaller cost than crashing.
  var __claimoneDataSources: Map<typeof Bid, Promise<DataSource>> | undefined;
}

// Safety valve for long-running dev sessions: Turbopack can produce a new
// Bid reference on some hot-reloads, and with nothing ever evicted that
// would otherwise grow one small pool per recompile for the life of the
// process. Capped well under Supabase's connection limit.
const MAX_DATA_SOURCES = 4;

function createDataSource(): DataSource {
  return new DataSource({
    type: "postgres",
    url: env.databaseUrl,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: [Category, Bid, HallOfFameEntry, StatsHourly, StatsDaily, StatsSettings, VisitorPresence],
    // Supabase's pgbouncer pooler (transaction mode) doesn't support
    // prepared statements well; keep the pool small and disable them.
    extra: {
      max: 5,
    },
  });
}

export async function getDataSource(): Promise<DataSource> {
  if (!globalThis.__claimoneDataSources) {
    globalThis.__claimoneDataSources = new Map();
  }
  const cache = globalThis.__claimoneDataSources;

  const existing = cache.get(Bid);
  if (existing) return existing;

  if (cache.size >= MAX_DATA_SOURCES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      const oldest = cache.get(oldestKey);
      cache.delete(oldestKey);
      oldest?.then((ds) => {
        if (ds.isInitialized) void ds.destroy().catch(() => {});
      });
    }
  }

  const promise = (async () => {
    const dataSource = createDataSource();
    await dataSource.initialize();
    await ensureCategoriesSeeded(dataSource);
    return dataSource;
  })().catch((error) => {
    // Don't leave a failed connection attempt (e.g. a transient DNS or
    // network blip) cached forever — every subsequent call for this same
    // Bid reference would just return this same rejected promise,
    // permanently breaking the app until the process restarts even after
    // the network recovers. Clear the slot so the next call gets a fresh
    // attempt.
    cache.delete(Bid);
    throw error;
  });

  cache.set(Bid, promise);
  return promise;
}

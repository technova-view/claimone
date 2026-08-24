import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "@/lib/config/env";
import { Category } from "./entities/category.entity";
import { Bid } from "./entities/bid.entity";
import { HallOfFameEntry } from "./entities/hall-of-fame.entity";
import { ensureCategoriesSeeded } from "./seed/categories.seed";

declare global {
  var __claimoneDataSource: DataSource | undefined;
  var __claimoneDataSourcePromise: Promise<DataSource> | undefined;
  // Reference to the exact Bid class the cached DataSource was built with —
  // see the mismatch check in getDataSource() below.
  var __claimoneDataSourceBidRef: typeof Bid | undefined;
}

function createDataSource(): DataSource {
  return new DataSource({
    type: "postgres",
    url: env.databaseUrl,
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
    entities: [Category, Bid, HallOfFameEntry],
    // Supabase's pgbouncer pooler (transaction mode) doesn't support
    // prepared statements well; keep the pool small and disable them.
    extra: {
      max: 5,
    },
  });
}

export async function getDataSource(): Promise<DataSource> {
  // In dev, Next.js/Turbopack compiles route handlers and page server
  // components as separate module graphs, so this file (and the entity
  // files it imports) can be evaluated more than once, producing distinct
  // class objects that are each structurally "Bid" but not reference-equal.
  // A DataSource cached on globalThis from one graph won't have metadata
  // for another graph's class objects — detect that and rebuild.
  if (globalThis.__claimoneDataSourceBidRef && globalThis.__claimoneDataSourceBidRef !== Bid) {
    const stale = globalThis.__claimoneDataSource;
    globalThis.__claimoneDataSource = undefined;
    globalThis.__claimoneDataSourcePromise = undefined;
    globalThis.__claimoneDataSourceBidRef = undefined;
    if (stale?.isInitialized) {
      void stale.destroy();
    }
  }

  if (globalThis.__claimoneDataSource?.isInitialized) {
    return globalThis.__claimoneDataSource;
  }

  if (!globalThis.__claimoneDataSourcePromise) {
    const dataSource = createDataSource();
    globalThis.__claimoneDataSource = dataSource;
    globalThis.__claimoneDataSourceBidRef = Bid;
    globalThis.__claimoneDataSourcePromise = dataSource
      .initialize()
      .then(async (ds) => {
        await ensureCategoriesSeeded(ds);
        return ds;
      })
      .catch((error) => {
        // Don't leave a failed connection attempt (e.g. a transient DNS or
        // network blip) cached forever — every subsequent call would just
        // return this same rejected promise, permanently breaking the app
        // until the process restarts even after the network recovers.
        // Clear the cache so the next call gets a fresh attempt.
        globalThis.__claimoneDataSource = undefined;
        globalThis.__claimoneDataSourcePromise = undefined;
        globalThis.__claimoneDataSourceBidRef = undefined;
        throw error;
      });
  }

  return globalThis.__claimoneDataSourcePromise;
}

import { getDataSource } from "@/lib/db/data-source";
import { VisitorPresence } from "@/lib/db/entities/visitor-presence.entity";

// A session that hasn't sent a heartbeat in this long is no longer counted
// as online. Must stay comfortably above the client's heartbeat interval
// (see use-presence-heartbeat.ts) so a normal gap between beats never makes
// someone flicker in and out of the count.
const ONLINE_WINDOW_SECONDS = 60;

export async function recordHeartbeat(sessionId: string): Promise<void> {
  const ds = await getDataSource();
  await ds.getRepository(VisitorPresence).upsert({ sessionId, lastSeenAt: new Date() }, ["sessionId"]);
}

export async function getOnlineCount(): Promise<number> {
  const ds = await getDataSource();
  const cutoff = new Date(Date.now() - ONLINE_WINDOW_SECONDS * 1000);
  return ds
    .getRepository(VisitorPresence)
    .createQueryBuilder("p")
    .where("p.lastSeenAt >= :cutoff", { cutoff })
    .getCount();
}

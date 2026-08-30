import { Column, Entity, PrimaryColumn } from "typeorm";

// One row per active browser session, upserted on every heartbeat — never
// grows per-heartbeat, only per unique visitor. "Online now" is derived by
// counting rows whose lastSeenAt falls inside a short recent window (see
// getOnlineCount in presence.service.ts), not by anything stored here.
@Entity("visitor_presence")
export class VisitorPresence {
  @PrimaryColumn({ type: "varchar", length: 64 })
  sessionId!: string;

  @Column({ type: "timestamptz" })
  lastSeenAt!: Date;
}

import { Column, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

// UTC calendar date, e.g. "2026-08-24" — matches the format used by
// period.ts's getDailyKey().
@Entity("stats_hourly")
@Index(["dateKey", "hour"], { unique: true })
export class StatsHourly {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 20 })
  dateKey!: string;

  @Column({ type: "int" })
  hour!: number;

  @Column({ type: "int", default: 0 })
  visitors!: number;
}

@Entity("stats_daily")
export class StatsDaily {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20 })
  dateKey!: string;

  @Column({ type: "int", nullable: true })
  bounceRatePct!: number | null;

  @Column({ type: "int", nullable: true })
  sessionTimeSeconds!: number | null;
}

// Singleton row (id fixed to 1) holding site-wide admin-controlled settings:
// whether admin-injected fake leaderboard entries are currently shown
// publicly. The "online now" counter used to randomize within an
// admin-set range stored here too; it's now backed by real presence
// tracking (see presence.service.ts) instead.
@Entity("stats_settings")
export class StatsSettings {
  @PrimaryColumn({ type: "int", default: 1 })
  id!: number;

  @Column({ type: "boolean", default: true })
  fakeItemsEnabled!: boolean;

  // When off, every listing's public click count shows its real clickCount
  // only — each bid's admin-set boostClicks is ignored, site-wide.
  @Column({ type: "boolean", default: true })
  clickBoostEnabled!: boolean;
}

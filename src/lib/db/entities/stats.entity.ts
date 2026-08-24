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
// the range the public "online now" counter randomizes within, and whether
// admin-injected fake leaderboard entries are currently shown publicly.
@Entity("stats_settings")
export class StatsSettings {
  @PrimaryColumn({ type: "int", default: 1 })
  id!: number;

  @Column({ type: "int", default: 400 })
  onlineMin!: number;

  @Column({ type: "int", default: 650 })
  onlineMax!: number;

  @Column({ type: "boolean", default: true })
  fakeItemsEnabled!: boolean;
}

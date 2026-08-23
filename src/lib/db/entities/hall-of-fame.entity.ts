import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum HallOfFameScope {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface BidSnapshot {
  bidId: string;
  url: string | null;
  handle: string | null;
  description: string | null;
  amountCents: number;
  categoryId: string;
  categoryName: string;
}

@Entity("hall_of_fame_entries")
// categoryId is null for the "overall" winner of a period; enforcing the
// (scope, periodKey, categoryId) uniqueness here at the app level in
// rollover.service.ts rather than a DB constraint, since Postgres treats
// NULLs as distinct in a plain unique index.
@Index(["scope", "periodKey", "categoryId"])
export class HallOfFameEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: HallOfFameScope })
  scope!: HallOfFameScope;

  @Column({ type: "varchar", length: 20 })
  periodKey!: string;

  // null = overall winner across all categories for this period.
  @Column({ type: "uuid", nullable: true })
  categoryId!: string | null;

  @Column({ type: "jsonb" })
  bidSnapshot!: BidSnapshot;

  @Column({ type: "uuid" })
  originalBidId!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}

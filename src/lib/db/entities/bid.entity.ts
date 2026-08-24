import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { BidScope, BidStatus } from "@/lib/types/scope";

export { BidScope, BidStatus };

@Entity("bids")
@Index(["scope", "periodKey", "category", "status", "amountCents", "createdAt"])
@Index(["scope", "periodKey", "status", "amountCents", "createdAt"])
export class Bid {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: BidScope })
  scope!: BidScope;

  @Column({ type: "enum", enum: BidStatus, default: BidStatus.PENDING_PAYMENT })
  status!: BidStatus;

  @ManyToOne(() => Category, { eager: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "categoryId" })
  category!: Category;

  @Column({ type: "uuid" })
  categoryId!: string;

  // Exactly one of url / handle is set — enforced at the service layer, not
  // the DB, matching the rest of this schema's validation style.
  @Column({ type: "varchar", length: 2048, nullable: true })
  url!: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  handle!: string | null;

  // Auto-fetched (not user-entered) meta description of `url` at submission
  // time; null for handle bids or when the fetch fails.
  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "int" })
  amountCents!: number;

  @Index({ unique: true, where: '"paddleTransactionId" IS NOT NULL' })
  @Column({ type: "varchar", length: 120, nullable: true })
  paddleTransactionId!: string | null;

  // UTC date (daily) or ISO week (weekly) this bid belongs to; null for all_time.
  @Column({ type: "varchar", length: 20, nullable: true })
  periodKey!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  activatedAt!: Date | null;

  // Set only at creation time: true for bids the admin panel injects
  // directly (no Paddle payment), false for bids created through the real
  // checkout flow. Never mutated afterwards — it's provenance, not a toggle.
  @Column({ type: "boolean", default: false })
  isFake!: boolean;

  // Real outbound click-throughs, incremented by the /go/[id] redirect route.
  @Column({ type: "int", default: 0 })
  clickCount!: number;

  // Admin-set number added on top of clickCount for display — never touches
  // the real count itself. See stats_settings.clickBoostEnabled for the
  // site-wide switch that hides this boost.
  @Column({ type: "int", default: 0 })
  boostClicks!: number;
}

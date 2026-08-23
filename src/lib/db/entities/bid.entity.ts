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

export enum BidScope {
  DAILY = "daily",
  WEEKLY = "weekly",
  ALL_TIME = "all_time",
}

export enum BidStatus {
  PENDING_PAYMENT = "pending_payment",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

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

  @Column({ type: "varchar", length: 2048 })
  url!: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  handle!: string | null;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 2048, nullable: true })
  logoUrl!: string | null;

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
}

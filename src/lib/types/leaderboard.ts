import type { BidScope } from "@/lib/db/entities/bid.entity";

export interface LeaderboardRow {
  id: string;
  rank: number;
  url: string | null;
  handle: string | null;
  description: string | null;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
}

export interface LeaderboardQuery {
  scope: BidScope;
  categorySlug?: string;
}

export interface BidPricingResult {
  amountCents: number;
  wouldBeRank: number;
  takesTopSpot: boolean;
  minRequiredCents: number;
}

import type { BidScope } from "@/lib/db/entities/bid.entity";

export interface LeaderboardRow {
  id: string;
  rank: number;
  url: string;
  handle: string | null;
  title: string;
  description: string | null;
  logoUrl: string | null;
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

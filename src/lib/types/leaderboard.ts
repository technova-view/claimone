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
  // Real clickCount, plus the admin's boostClicks when the site-wide boost
  // toggle is on — see getClickBoostEnabled() in stats.service.ts.
  clicks: number;
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

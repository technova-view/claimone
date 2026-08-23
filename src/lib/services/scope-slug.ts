import { BidScope } from "@/lib/db/entities/bid.entity";

const SLUG_TO_SCOPE: Record<string, BidScope> = {
  daily: BidScope.DAILY,
  weekly: BidScope.WEEKLY,
  "all-time": BidScope.ALL_TIME,
};

export function scopeFromSlug(slug: string): BidScope | null {
  return SLUG_TO_SCOPE[slug] ?? null;
}

export const SCOPE_SLUGS = Object.keys(SLUG_TO_SCOPE);

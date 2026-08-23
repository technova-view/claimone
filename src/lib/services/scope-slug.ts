import { BidScope } from "@/lib/types/scope";

const SLUG_TO_SCOPE: Record<string, BidScope> = {
  daily: BidScope.DAILY,
  weekly: BidScope.WEEKLY,
  "all-time": BidScope.ALL_TIME,
};

const SCOPE_TO_SLUG: Record<BidScope, string> = {
  [BidScope.DAILY]: "daily",
  [BidScope.WEEKLY]: "weekly",
  [BidScope.ALL_TIME]: "all-time",
};

export function scopeFromSlug(slug: string): BidScope | null {
  return SLUG_TO_SCOPE[slug] ?? null;
}

export function slugFromScope(scope: BidScope): string {
  return SCOPE_TO_SLUG[scope];
}

export const SCOPE_SLUGS = Object.keys(SLUG_TO_SCOPE);

import { MIN_RAISE_TO_TAKE_TOP_CENTS } from "@/lib/config/bid-config";

// The default price shown when claiming a specific leaderboard row: just
// enough to rank above it. Submission is still re-validated server-side by
// validateAndPriceBid, so this is purely a UI convenience — safe to use from
// client components since it has no server/DB dependency.
export function claimPriceForAmount(targetAmountCents: number): number {
  return targetAmountCents + MIN_RAISE_TO_TAKE_TOP_CENTS;
}

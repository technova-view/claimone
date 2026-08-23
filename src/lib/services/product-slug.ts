import { displayHostFor } from "@/lib/services/link-display";

// The URL-friendly identity of a listing, derived from its own url/handle
// rather than a stored column — matches whatever a viewer already sees as
// its "title" on the leaderboard, so /product/<slug> reads the same way.
export function slugForListing(row: { url: string | null; handle: string | null }): string {
  if (row.url) return displayHostFor(row.url);
  if (row.handle) return row.handle.replace(/^@/, "");
  return "";
}

import type { MetadataRoute } from "next";
import { env } from "@/lib/config/env";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { listCategories } from "@/lib/services/category.service";
import { slugForListing } from "@/lib/services/product-slug";
import { BidScope } from "@/lib/db/entities/bid.entity";

// Listings and categories change constantly (new bids, re-ranks) — a
// statically-cached sitemap would go stale the same way the leaderboard
// pages themselves did before force-dynamic was added everywhere else in
// this app. See src/app/page.tsx for the fuller explanation.
export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  "",
  "/about",
  "/categories",
  "/hall-of-fame",
  "/stats",
  "/how-to-pay",
  "/rules",
  "/terms",
  "/privacy",
  "/refund-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");

  const [rows, categories] = await Promise.all([getLeaderboard({ scope: BidScope.ALL_TIME }), listCategories()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "hourly" : "weekly",
    priority: path === "" ? 1 : 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/categories/${category.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  // Dedupe by slug — slugForListing can collide (e.g. two different urls on
  // the same host), and a sitemap entry only needs to point at the URL once.
  const seenSlugs = new Set<string>();
  const productEntries: MetadataRoute.Sitemap = [];
  for (const row of rows) {
    const slug = slugForListing(row);
    if (!slug || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    productEntries.push({
      url: `${base}/product/${slug}`,
      lastModified: new Date(row.createdAt),
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}

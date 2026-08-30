import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { CategoryScopeBoard } from "@/components/leaderboard/category-scope-board";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { getLeaderboard } from "@/lib/services/bidding.service";
import { getCategoryIcon } from "@/lib/config/category-icons";
import { BidScope } from "@/lib/db/entities/bid.entity";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/config/site-metadata";

// See src/app/page.tsx for why this is required — reads live leaderboard data.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found · claimone.lol" };

  const title = `${category.name} · claimone.lol`;
  const description = `See who's ranked #1 in ${category.name} on claimone.lol — rankings determined by bid.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: SITE_NAME, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [allTimeRows, dailyRows, weeklyRows] = await Promise.all([
    getLeaderboard({ scope: BidScope.ALL_TIME, categorySlug: slug }),
    getLeaderboard({ scope: BidScope.DAILY, categorySlug: slug }),
    getLeaderboard({ scope: BidScope.WEEKLY, categorySlug: slug }),
  ]);

  const icon = { Icon: getCategoryIcon(category.name) };

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <nav className="text-sm text-muted-foreground">
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <span> · {category.name}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <icon.Icon className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
        </div>

        <CategoryScopeBoard
          rowsByScope={{
            [BidScope.ALL_TIME]: allTimeRows,
            [BidScope.DAILY]: dailyRows,
            [BidScope.WEEKLY]: weeklyRows,
          }}
          categorySlug={slug}
        />
      </main>
    </div>
  );
}

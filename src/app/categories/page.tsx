import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { listCategories } from "@/lib/services/category.service";
import { getCategoryIcon } from "@/lib/config/category-icons";

// See src/app/page.tsx for why this is required — without it, changes made
// in the admin panel wouldn't show here until the next deploy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories · claimone.lol",
};

export default async function CategoriesPage() {
  const categories = await listCategories();
  const categoriesWithIcons = categories.map((c) => ({ ...c, Icon: getCategoryIcon(c.name) }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-muted-foreground">Browse the leaderboard by category.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categoriesWithIcons.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <category.Icon className="size-5" />
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

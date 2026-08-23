import { SiteHeader } from "@/components/site/site-header";
import { ClaimForm } from "@/components/claim/claim-form";
import { listCategories } from "@/lib/services/category.service";

export default async function ClaimPage() {
  const categories = await listCategories();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Claim a spot</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay to rank your product or profile on the leaderboard. Daily, weekly, and all-time
            boards are separate — pick one per submission.
          </p>
        </div>
        <ClaimForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </main>
    </div>
  );
}

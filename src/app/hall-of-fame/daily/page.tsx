import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { HallOfFameList } from "@/components/leaderboard/hall-of-fame-list";
import { listHallOfFame } from "@/lib/services/hall-of-fame.service";
import { HallOfFameScope } from "@/lib/db/entities/hall-of-fame.entity";
import { cn } from "@/lib/utils";

export default async function DailyHallOfFamePage() {
  const entries = await listHallOfFame(HallOfFameScope.DAILY);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Hall of Fame</h1>
          <div className="flex gap-1 rounded-full border border-border bg-secondary p-1">
            <Link
              href="/hall-of-fame/daily"
              className={cn("rounded-full px-3 py-1.5 text-sm font-medium", "bg-primary text-primary-foreground")}
            >
              Daily
            </Link>
            <Link
              href="/hall-of-fame/weekly"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Weekly
            </Link>
          </div>
        </div>
        <HallOfFameList entries={entries} />
      </main>
    </div>
  );
}

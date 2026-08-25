import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { HallOfFamePageContent } from "@/components/leaderboard/hall-of-fame-page-content";

export const metadata: Metadata = {
  title: "Hall of Fame · claimone.lol",
  description: "Every period's #1 listing — overall and in every category — archived forever once the board resets.",
};

export default function HallOfFamePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <Suspense>
        <HallOfFamePageContent />
      </Suspense>
    </div>
  );
}

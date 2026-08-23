import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "About · claimone.lol",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="text-muted-foreground">
          claimone.lol is a pay-to-rank leaderboard. Anyone can list a product or profile in a category, and the
          amount bid determines the rank — outbid the current #1 to take the top spot.
        </p>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Trophy, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { BidScope } from "@/lib/types/scope";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";
import { cn } from "@/lib/utils";

const SCOPE_TABS = [
  { slug: "daily", label: "Daily" },
  { slug: "weekly", label: "Weekly" },
  { slug: "all-time", label: "All-time" },
];

const SLUG_TO_SCOPE: Record<string, BidScope> = {
  daily: BidScope.DAILY,
  weekly: BidScope.WEEKLY,
  "all-time": BidScope.ALL_TIME,
};

export function SiteHeader({
  activeScope,
  activeCategorySlug,
}: {
  activeScope?: string;
  activeCategorySlug?: string;
}) {
  const { openClaim, openHallOfFame } = useAppModals();
  const hasHallOfFame = activeScope === "daily" || activeScope === "weekly";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/daily" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          claimone<span className="text-primary">.lol</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary/70 p-1">
          {SCOPE_TABS.map((tab) => (
            <Link
              key={tab.slug}
              href={`/${tab.slug}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeScope === tab.slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {hasHallOfFame && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openHallOfFame(activeScope === "daily" ? "daily" : "weekly")}
            >
              <Trophy className="size-4" data-icon="inline-start" />
              Hall of Fame
            </Button>
          )}
          <Button
            size="sm"
            onClick={() =>
              openClaim({
                scope: SLUG_TO_SCOPE[activeScope ?? "daily"] ?? BidScope.DAILY,
                categorySlug: activeCategorySlug ?? "",
                amountCents: MIN_BID_CENTS,
                locked: false,
              })
            }
          >
            <Plus className="size-4" data-icon="inline-start" />
            Claim a spot
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

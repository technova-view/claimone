"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { BidScope } from "@/lib/types/scope";
import { MIN_BID_CENTS } from "@/lib/config/bid-config";

const SECTION_LINKS = [
  { href: "#all-time", label: "All-time" },
  { href: "#daily", label: "Daily" },
  { href: "#weekly", label: "Weekly" },
];

export function SiteHeader() {
  const { openClaim } = useAppModals();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          claimone<span className="text-primary">.lol</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary/70 p-1">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              openClaim({
                scope: BidScope.DAILY,
                categorySlug: "",
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

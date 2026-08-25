"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAppModals } from "@/components/app-modals/app-modals-provider";
import { BidScope } from "@/lib/types/scope";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Leaderboard" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
];

const SCOPE_OPTIONS: { value: BidScope; label: string }[] = [
  { value: BidScope.ALL_TIME, label: "All time" },
  { value: BidScope.DAILY, label: "Daily" },
  { value: BidScope.WEEKLY, label: "Weekly" },
];

export function SiteHeader() {
  const { resolvedTheme } = useTheme();
  const { homeScope, setHomeScope } = useAppModals();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe theme mount check
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === "dark" ? "/claimone-logo-dark.png" : "/claimone-logo-light.png";

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image src={logoSrc} alt="ClaimOne" width={1030} height={370} className="h-14 w-auto" priority />
        </Link>

        <div className="flex items-center gap-4">
          {isHome && (
            <div className="flex gap-1 rounded-full border border-border bg-secondary p-1">
              {SCOPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHomeScope(opt.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    homeScope === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

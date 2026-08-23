import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCOPE_TABS = [
  { slug: "daily", label: "Daily" },
  { slug: "weekly", label: "Weekly" },
  { slug: "all-time", label: "All-time" },
];

export function SiteHeader({ activeScope }: { activeScope?: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/daily" className="text-lg font-semibold tracking-tight">
          claimone<span className="text-primary">.lol</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-secondary p-1">
          {SCOPE_TABS.map((tab) => (
            <Link
              key={tab.slug}
              href={`/${tab.slug}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                activeScope === tab.slug
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/hall-of-fame/daily" />}
          >
            Hall of Fame
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/claim" />}>
            Claim a spot
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

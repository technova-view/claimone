import Link from "next/link";
import type { Category } from "@/lib/db/entities/category.entity";
import { cn } from "@/lib/utils";

export function CategoryNav({
  scope,
  categories,
  activeSlug,
}: {
  scope: string;
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
      <Link
        href={`/${scope}`}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          !activeSlug
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${scope}/${category.slug}`}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeSlug === category.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

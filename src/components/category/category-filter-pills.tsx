"use client";

import { cn } from "@/lib/utils";

export function CategoryFilterPills({
  categories,
  activeSlug,
  onChange,
}: {
  categories: { slug: string; name: string }[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
          activeSlug === null
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category.slug}
          onClick={() => onChange(category.slug)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
            activeSlug === category.slug
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

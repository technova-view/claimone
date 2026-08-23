"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/config/category-icons";

const SCROLL_AMOUNT = 240;

const arrowClass =
  "flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

export function CategoryFilterPills({
  categories,
  activeSlug,
  onChange,
}: {
  categories: { slug: string; name: string }[];
  activeSlug: string | null;
  onChange: (slug: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const iconedCategories = useMemo(
    () => categories.map((c) => ({ ...c, Icon: getCategoryIcon(c.name) })),
    [categories],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateScrollState() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [categories]);

  function scrollByAmount(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        disabled={!canScrollLeft}
        aria-label="Scroll categories left"
        className={arrowClass}
      >
        <ChevronLeft className="size-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
            activeSlug === null
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
        >
          <LayoutGrid className="size-3.5 shrink-0" />
          All
        </button>
        {iconedCategories.map((category) => (
          <button
            type="button"
            key={category.slug}
            onClick={() => onChange(category.slug)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
              activeSlug === category.slug
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <category.Icon className="size-3.5 shrink-0" />
            {category.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        disabled={!canScrollRight}
        aria-label="Scroll categories right"
        className={arrowClass}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

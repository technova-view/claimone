"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/config/category-icons";

interface CategorySelectProps {
  categories: { slug: string; name: string }[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
  // "field" is the bordered input-style trigger (default, used in forms).
  // "ghost" is a larger, borderless trigger meant to double as a heading —
  // used where the select also acts as a section title.
  variant?: "field" | "ghost";
}

export function CategorySelect({ categories, value, onChange, className, variant = "field" }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.slug === value);
  const selectedIcon = useMemo(
    () => ({ Icon: selected ? getCategoryIcon(selected.name) : Search }),
    [selected],
  );

  const filtered = useMemo(() => {
    const pool = query.trim()
      ? categories.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
      : categories;
    return pool.map((c) => ({ ...c, Icon: getCategoryIcon(c.name) }));
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isGhost = variant === "ghost";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          isGhost
            ? "flex items-center gap-2 text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
            : "flex w-full items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-shadow hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        }
      >
        <selectedIcon.Icon className={cn("shrink-0", isGhost ? "size-4 text-primary" : "size-4 text-muted-foreground")} />
        {/* min-w-0 is required alongside truncate here — a flex item's default
            min-width:auto blocks shrinking below its text's natural width, so
            without it the ellipsis never engages and the row overflows instead. */}
        <span className={cn("min-w-0 truncate text-left", !isGhost && "flex-1")}>
          {selected?.name ?? "Choose a category"}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {categories.length > 8 && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto p-1.5">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matching categories</p>
            )}
            {filtered.map((c) => {
              const active = c.slug === value;
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(c.slug);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    active ? "text-primary" : "text-foreground",
                  )}
                >
                  <c.Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  {active && <Check className="size-3.5 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

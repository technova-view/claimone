"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function nextDailyReset(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function nextWeeklyReset(): Date {
  const now = new Date();
  const daysUntilMonday = (8 - (now.getUTCDay() || 7)) % 7 || 7;
  const day = now.getUTCDay() === 1 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0 ? 0 : daysUntilMonday;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + day));
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function Countdown({ scope, className }: { scope: "daily" | "weekly"; className?: string }) {
  const [remaining, setRemaining] = useState<string | null>(null);
  // The reset boundary is UTC-anchored (fair to every timezone, rather than
  // favoring whichever region "midnight" happens to land in) — but that
  // means the countdown can look wrong to someone whose local clock already
  // reads the next day/week. Labeling it "UTC" and exposing the equivalent
  // local time as a tooltip makes that explicit instead of just confusing.
  const [localTargetLabel, setLocalTargetLabel] = useState<string | null>(null);

  useEffect(() => {
    const target = scope === "daily" ? nextDailyReset() : nextWeeklyReset();
    const label = target.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
    const tick = () => {
      setRemaining(formatRemaining(target.getTime() - Date.now()));
      setLocalTargetLabel(label);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [scope]);

  if (remaining === null) return null;

  return (
    <span
      title={localTargetLabel ? `That's ${localTargetLabel} your local time` : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary),transparent_85%)]" />
      resets in {remaining} UTC
    </span>
  );
}

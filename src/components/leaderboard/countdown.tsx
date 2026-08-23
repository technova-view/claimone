"use client";

import { useEffect, useState } from "react";

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

export function Countdown({ scope }: { scope: "daily" | "weekly" }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const target = scope === "daily" ? nextDailyReset() : nextWeeklyReset();
    const tick = () => setRemaining(formatRemaining(target.getTime() - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [scope]);

  if (remaining === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 font-mono text-sm text-muted-foreground">
      resets in {remaining}
    </span>
  );
}

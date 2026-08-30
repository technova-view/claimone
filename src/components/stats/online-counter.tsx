"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 8000;

// `initialCount` is server-rendered (see status-bar.tsx) so the number is
// correct on first paint with no flash of "—"; this effect then keeps it
// live by polling the real presence count (src/app/api/presence/count).
export function OnlineCounter({ initialCount }: { initialCount: number }) {
  const [value, setValue] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(() => {
      fetch("/api/presence/count")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && typeof data.count === "number") setValue(data.count);
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return <span>{value.toLocaleString()}</span>;
}

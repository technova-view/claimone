"use client";

import { useEffect, useState } from "react";

function randomInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

export function OnlineCounter({ min, max }: { min: number; max: number }) {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- avoids an SSR/client mismatch on the first random value
    setValue(randomInRange(min, max));
    const interval = setInterval(
      () => setValue(randomInRange(min, max)),
      5000 + Math.random() * 3000,
    );
    return () => clearInterval(interval);
  }, [min, max]);

  return <span>{value === null ? "—" : value.toLocaleString()}</span>;
}

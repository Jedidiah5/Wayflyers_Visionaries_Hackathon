"use client";

import { useEffect, useState } from "react";
import { formatLiveClock } from "@/lib/time";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="font-display text-4xl uppercase tracking-tight text-text-primary md:text-5xl">
      {now ? formatLiveClock(now) : "\u00A0"}
    </h1>
  );
}

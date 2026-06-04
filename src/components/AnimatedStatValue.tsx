"use client";

import { useEffect, useState } from "react";
import {
  easeOutCubic,
  formatStatAtProgress,
  parseStatValue,
} from "@/lib/statAnimation";

interface AnimatedStatValueProps {
  value: string;
  duration?: number;
}

export function AnimatedStatValue({
  value,
  duration = 1200,
}: AnimatedStatValueProps) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const parsed = parseStatValue(value);
    setDisplay(formatStatAtProgress(parsed, 0));

    const start = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      setDisplay(formatStatAtProgress(parsed, easeOutCubic(t)));

      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return <>{display}</>;
}

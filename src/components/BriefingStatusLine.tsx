"use client";

import { useEffect, useState } from "react";
import { getBriefingLabel } from "@/lib/time";

export function BriefingStatusLine() {
  const [label, setLabel] = useState("Morning Briefing");

  useEffect(() => {
    const update = () => setLabel(getBriefingLabel(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest text-text-muted">
      <span>{label} / System Status: Nominal</span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 animate-live-pulse bg-[#c8ff00]"
          aria-hidden="true"
        />
        <span className="text-[#c8ff00]">Live</span>
      </span>
    </p>
  );
}

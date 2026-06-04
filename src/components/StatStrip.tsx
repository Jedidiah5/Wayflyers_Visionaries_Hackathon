"use client";

import type { BriefingStats } from "@/lib/types";
import { AnimatedStatValue } from "./AnimatedStatValue";

interface StatStripProps {
  stats: BriefingStats;
}

const STAT_ITEMS: { key: keyof BriefingStats; label: string }[] = [
  { key: "totalRevenue", label: "Revenue" },
  { key: "totalOrders", label: "Orders" },
  { key: "aov", label: "AOV" },
  { key: "repeatCustomerRate", label: "Repeat Rate" },
  { key: "refundRate", label: "Refund Rate" },
  { key: "googleROAS", label: "Google ROAS" },
  { key: "metaROAS", label: "Meta ROAS" },
  { key: "totalAdSpend", label: "Ad Spend" },
];

export function StatStrip({ stats }: StatStripProps) {
  return (
    <section className="border border-border bg-surface">
      <div className="grid grid-cols-4 lg:grid-cols-8">
        {STAT_ITEMS.map((item, index) => (
          <div
            key={item.key}
            className={`flex flex-col gap-1 p-4 ${
              index < STAT_ITEMS.length - 1 ? "border-r border-border" : ""
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {item.label}
            </span>
            <span className="font-mono text-base font-bold text-text-primary">
              <AnimatedStatValue value={stats[item.key]} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

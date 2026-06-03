"use client";

import type { Insight } from "@/lib/types";
import { SeverityBadge, getSeverityStyles } from "./SeverityBadge";
import { cn } from "@/lib/utils";
import { ArrowRight, AlertTriangle, Package, TrendingUp } from "lucide-react";

interface InsightCardProps {
  insight: Insight;
  onAction: (insight: Insight) => void;
}

const icons = {
  critical: AlertTriangle,
  warning: Package,
  opportunity: TrendingUp,
};

export function InsightCard({ insight, onAction }: InsightCardProps) {
  const styles = getSeverityStyles(insight.severity);
  const Icon = icons[insight.severity];
  const isOpportunity = insight.severity === "opportunity";

  return (
    <article
      className={cn(
        "flex flex-col gap-4 bg-surface p-8 transition-colors hover:bg-surface-elevated",
        styles.border && `border ${styles.border}`
      )}
    >
      <div className="flex items-start justify-between border-b border-border pb-3">
        <SeverityBadge severity={insight.severity} />
        <Icon
          className={cn(
            "h-5 w-5",
            insight.severity === "critical" && "text-critical",
            insight.severity === "warning" && "text-warning",
            insight.severity === "opportunity" && "text-accent"
          )}
        />
      </div>

      <h2
        className={cn(
          "font-display text-2xl uppercase leading-tight tracking-tight",
          styles.headline
        )}
      >
        {insight.title}
      </h2>

      <p className="font-body text-sm leading-relaxed text-text-muted">
        {insight.summary}
      </p>

      <div className="mt-auto pt-4">
        {isOpportunity ? (
          <button
            onClick={() => onAction(insight)}
            className="bg-accent px-4 py-2 font-display text-sm uppercase tracking-wide text-black transition-colors hover:bg-white"
          >
            {insight.action}
          </button>
        ) : (
          <button
            onClick={() => onAction(insight)}
            className={cn(
              "flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors hover:text-white",
              insight.severity === "critical" && "text-critical",
              insight.severity === "warning" && "text-text-muted hover:text-accent"
            )}
          >
            {insight.action}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

import type { InsightSeverity } from "@/lib/types";
import { cn } from "@/lib/utils";

const severityStyles: Record<
  InsightSeverity,
  { badge: string; border?: string; headline: string }
> = {
  critical: {
    badge: "border-critical text-critical bg-[#1a0000]",
    border: "border-critical",
    headline: "text-critical",
  },
  warning: {
    badge: "border-warning text-warning bg-[#1a1200]",
    headline: "text-text-primary",
  },
  opportunity: {
    badge: "bg-accent text-black border-accent",
    border: "border-accent",
    headline: "text-accent",
  },
};

interface SeverityBadgeProps {
  severity: InsightSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles = severityStyles[severity];

  return (
    <span
      className={cn(
        "inline-block rounded-badge border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-widest",
        styles.badge,
        className
      )}
    >
      {severity}
    </span>
  );
}

export function getSeverityStyles(severity: InsightSeverity) {
  return severityStyles[severity];
}

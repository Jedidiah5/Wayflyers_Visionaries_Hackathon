import type { AdRow } from "@/lib/types";
import { cn, formatCurrency, formatRoas } from "@/lib/utils";

interface AdsTableProps {
  data: AdRow[];
}

const verdictStyles: Record<AdRow["verdict"], string> = {
  SCALE: "border-accent text-accent bg-[#141a00]",
  MAINTAIN: "border-border text-text-muted",
  REVIEW: "border-warning text-warning bg-[#1a1200]",
  PAUSE: "border-warning text-warning bg-[#1a1200]",
  KILL: "border-critical text-critical bg-[#1a0000]",
};

function VerdictBadge({ verdict }: { verdict: AdRow["verdict"] }) {
  return (
    <span
      className={cn(
        "inline-block rounded-badge border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
        verdictStyles[verdict]
      )}
    >
      {verdict}
    </span>
  );
}

export function AdsTable({ data }: AdsTableProps) {
  return (
    <div className="border border-border bg-surface">
      <div className="grid grid-cols-[2fr_0.75fr_1fr_1fr_0.75fr_0.75fr] gap-4 border-b border-border bg-surface-elevated px-6 py-3">
        {["Campaign", "Platform", "Spend", "Revenue", "ROAS", "Verdict"].map(
          (header) => (
            <div
              key={header}
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest text-text-muted",
                header !== "Campaign" && header !== "Platform" && "text-right"
              )}
            >
              {header}
            </div>
          )
        )}
      </div>

      {data.map((row, index) => (
        <div
          key={row.campaign}
          className={cn(
            "grid grid-cols-[2fr_0.75fr_1fr_1fr_0.75fr_0.75fr] gap-4 border-b border-border px-6 py-4 transition-colors hover:bg-surface-elevated",
            index % 2 === 1 && "bg-[#0d0d0d]",
            row.verdict === "KILL" && "bg-[#120808]"
          )}
        >
          <div className="font-body text-sm font-medium uppercase text-text-primary">
            {row.campaign}
          </div>
          <div className="font-mono text-xs text-text-muted">{row.platform}</div>
          <div className="text-right font-mono text-sm text-text-primary">
            {formatCurrency(row.spend)}
          </div>
          <div className="text-right font-mono text-sm text-text-primary">
            {formatCurrency(row.revenue)}
          </div>
          <div
            className={cn(
              "text-right font-mono text-sm font-bold",
              row.roas >= 3
                ? "text-accent"
                : row.roas < 1
                  ? "text-critical"
                  : "text-warning"
            )}
          >
            {formatRoas(row.roas)}
          </div>
          <div className="text-right">
            <VerdictBadge verdict={row.verdict} />
          </div>
        </div>
      ))}
    </div>
  );
}

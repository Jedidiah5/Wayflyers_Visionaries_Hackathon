import type { AdRow } from "@/lib/types";
import { cn, formatCurrency, formatRoas } from "@/lib/utils";

interface AdsTableProps {
  data: AdRow[];
}

const verdictStyles: Record<AdRow["verdict"], string> = {
  SCALE: "bg-[#c8ff00] text-black",
  MAINTAIN: "bg-[#2a2a2a] text-[#888888]",
  REVIEW: "bg-[#ffaa00] text-black",
  PAUSE: "bg-[#ff6600] text-black",
  KILL: "bg-[#ff3b3b] text-white",
};

function VerdictBadge({ verdict }: { verdict: AdRow["verdict"] }) {
  return (
    <span
      className={cn(
        "inline-block rounded-badge px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest",
        verdictStyles[verdict]
      )}
    >
      {verdict}
    </span>
  );
}

function getRoasColor(roas: number): string {
  if (roas > 4) return "text-[#c8ff00]";
  if (roas >= 2) return "text-text-primary";
  return "text-critical";
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
            index % 2 === 1 && row.verdict !== "KILL" && "bg-[#0d0d0d]",
            row.verdict === "KILL" && "bg-[#1a0000]"
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
              getRoasColor(row.roas)
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

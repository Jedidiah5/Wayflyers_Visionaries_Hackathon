import type { StockoutProjectionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABLE_GRID =
  "grid grid-cols-[1.5fr_0.85fr_0.85fr_0.75fr] gap-3";

interface StockoutProjectionsTableProps {
  data: StockoutProjectionRow[];
}

export function StockoutProjectionsTable({
  data,
}: StockoutProjectionsTableProps) {
  const headers = [
    "Product",
    "Current Stock",
    "Weekly Sell Rate",
    "Days Remaining",
  ];

  return (
    <div className="border border-border">
      <div
        className={cn(
          TABLE_GRID,
          "border-b border-border bg-[#0a0a0a] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted"
        )}
      >
        {headers.map((header, index) => (
          <div key={header} className={cn(index > 0 && "text-right")}>
            {header}
          </div>
        ))}
      </div>

      {data.map((row, index) => (
        <div
          key={row.product}
          className={cn(
            TABLE_GRID,
            "items-center border-b border-border px-3 py-3 font-mono text-sm last:border-b-0",
            index % 2 === 1 && "bg-[#080808]"
          )}
        >
          <div className="font-body uppercase text-text-primary">
            {row.product}
          </div>
          <div className="text-right">{row.currentStock}</div>
          <div className="text-right text-text-muted">
            {row.weeklySellRate}/wk
          </div>
          <div
            className={cn(
              "text-right font-bold",
              row.daysRemaining <= 4 && "text-critical",
              row.daysRemaining === 5 && "text-warning"
            )}
          >
            {row.daysRemaining} days
          </div>
        </div>
      ))}
    </div>
  );
}

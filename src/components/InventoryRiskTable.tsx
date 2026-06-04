import type { InventoryRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABLE_GRID =
  "grid grid-cols-[minmax(88px,1fr)_minmax(96px,1.1fr)_minmax(72px,1fr)_40px_minmax(72px,0.8fr)_minmax(72px,0.8fr)_minmax(64px,0.65fr)_72px] gap-2 sm:gap-3";

function StatusBadge({ status }: { status: InventoryRow["status"] }) {
  if (status === "CRITICAL") {
    return (
      <span className="inline-block rounded-badge bg-critical px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-white sm:text-[10px]">
        {status}
      </span>
    );
  }

  if (status === "WARNING") {
    return (
      <span className="inline-block rounded-badge border border-warning px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-warning sm:text-[10px]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-block rounded-badge border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted sm:text-[10px]">
      {status}
    </span>
  );
}

interface InventoryRiskTableProps {
  data: InventoryRow[];
}

export function InventoryRiskTable({ data }: InventoryRiskTableProps) {
  const headers = [
    "SKU",
    "Product",
    "Colour",
    "Size",
    "Units Remaining",
    "Weekly Sell Rate",
    "Days to Stockout",
    "Status",
  ];

  return (
    <div className="overflow-x-auto border border-border">
      <div className="min-w-[720px]">
        <div
          className={cn(
            TABLE_GRID,
            "border-b border-border bg-[#0a0a0a] px-2 py-2 font-mono text-[9px] uppercase tracking-wider text-text-muted sm:px-3 sm:text-[10px]"
          )}
        >
          {headers.map((header, index) => (
            <div
              key={header}
              className={cn(index >= 4 && index <= 6 && "text-right")}
            >
              {header}
            </div>
          ))}
        </div>

        {data.map((row, index) => (
          <div
            key={row.sku}
            className={cn(
              TABLE_GRID,
              "items-center border-b border-border px-2 py-2.5 font-mono text-xs transition-colors last:border-b-0 hover:bg-surface-elevated sm:px-3 sm:text-sm",
              index % 2 === 1 && "bg-[#080808]"
            )}
          >
            <div className="truncate tracking-wider">{row.sku}</div>
            <div className="truncate font-body text-[11px] uppercase sm:text-xs">
              {row.product}
            </div>
            <div className="truncate font-body text-[11px] text-text-muted sm:text-xs">
              {row.colour}
            </div>
            <div>{row.size}</div>
            <div
              className={cn(
                "text-right font-bold",
                row.unitsRemaining < 0 && "text-critical"
              )}
            >
              {row.unitsRemaining}
            </div>
            <div className="text-right text-text-muted">
              {row.weeklySellRate != null ? row.weeklySellRate : "—"}
            </div>
            <div
              className={cn(
                "text-right font-bold",
                row.daysToStockout != null &&
                  row.daysToStockout <= 6 &&
                  "text-warning",
                row.daysToStockout != null &&
                  row.daysToStockout <= 4 &&
                  "text-critical"
              )}
            >
              {row.daysToStockout != null ? row.daysToStockout : "—"}
            </div>
            <div className="text-right">
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

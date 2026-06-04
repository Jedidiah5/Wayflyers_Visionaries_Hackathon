import type { InventoryRow } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  data: InventoryRow[];
}

function StatusBadge({ status }: { status: InventoryRow["status"] }) {
  const styles = {
    CRITICAL: "border-critical text-critical bg-[#1a0000]",
    WARNING: "border-warning text-warning bg-[#1a1200]",
    OK: "border-border text-text-muted",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-badge border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

export function InventoryTable({ data }: InventoryTableProps) {
  return (
    <div className="border border-border bg-surface">
      <div className="grid grid-cols-[1fr_1.5fr_1fr_0.5fr_0.75fr_0.75fr_0.75fr_0.75fr] gap-4 border-b border-border bg-surface-elevated px-6 py-3">
        {[
          "SKU",
          "Product",
          "Colour",
          "Size",
          "Units",
          "Sell Rate/wk",
          "Days Left",
          "Status",
        ].map((header) => (
          <div
            key={header}
            className="font-mono text-[10px] uppercase tracking-widest text-text-muted"
          >
            {header}
          </div>
        ))}
      </div>

      {data.map((row, index) => (
        <div
          key={row.sku}
          className={cn(
            "grid grid-cols-[1fr_1.5fr_1fr_0.5fr_0.75fr_0.75fr_0.75fr_0.75fr] gap-4 border-b border-border px-6 py-4 transition-colors hover:bg-surface-elevated",
            index % 2 === 1 && "bg-[#0d0d0d]",
            row.status === "CRITICAL" && "bg-[#120808]"
          )}
        >
          <div className="font-mono text-xs text-text-muted">{row.sku}</div>
          <div className="font-body text-sm font-medium uppercase text-text-primary">
            {row.product}
          </div>
          <div className="font-body text-sm text-text-muted">{row.colour}</div>
          <div className="font-mono text-xs text-text-primary">{row.size}</div>
          <div
            className={cn(
              "font-mono text-sm font-bold",
              row.unitsRemaining < 0 ? "text-critical" : "text-text-primary"
            )}
          >
            {row.unitsRemaining.toLocaleString()}
          </div>
          <div className="font-mono text-sm text-text-primary">
            {row.weeklySellRate != null ? row.weeklySellRate : "—"}
          </div>
          <div
            className={cn(
              "font-mono text-sm font-bold",
              row.daysToStockout != null && row.daysToStockout <= 7
                ? "text-warning"
                : "text-text-primary"
            )}
          >
            {row.daysToStockout != null ? row.daysToStockout : "—"}
          </div>
          <div>
            <StatusBadge status={row.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

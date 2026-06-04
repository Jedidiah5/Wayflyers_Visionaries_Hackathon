import type { SizingRefundRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABLE_GRID =
  "grid grid-cols-[1.4fr_0.9fr_1fr_0.75fr] gap-3";

interface SizingRefundsTableProps {
  data: SizingRefundRow[];
}

export function SizingRefundsTable({ data }: SizingRefundsTableProps) {
  const headers = [
    "Product",
    "Sizing Refunds",
    "Refund Value",
    "% of Product Refunds",
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
          <div className="text-right">{row.sizingRefunds}</div>
          <div className="text-right font-bold text-critical">
            {row.refundValue}
          </div>
          <div className="text-right text-[#c8ff00]">
            {row.percentOfProductRefunds}
          </div>
        </div>
      ))}
    </div>
  );
}

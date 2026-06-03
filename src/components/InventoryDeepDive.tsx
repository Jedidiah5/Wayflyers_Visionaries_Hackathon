"use client";

import Link from "next/link";
import type { InventoryRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Download, X } from "lucide-react";

interface InventoryDeepDiveProps {
  data: InventoryRow[];
}

const TABLE_GRID =
  "grid grid-cols-[minmax(88px,1fr)_minmax(96px,1.1fr)_minmax(72px,1fr)_40px_minmax(72px,0.8fr)_minmax(72px,0.8fr)_minmax(64px,0.65fr)_72px] gap-2 sm:gap-3";

function BurnRateChart({ data }: { data: InventoryRow[] }) {
  const rates = data.map((row) => row.weeklySellRate);
  const maxRate = Math.max(...rates, 1);

  return (
    <div className="relative mb-6 h-24 overflow-hidden border border-[#1a1a1a] group sm:mb-8 sm:h-32">
      <div className="absolute left-2 top-2 font-mono text-[10px] text-text-muted sm:text-xs">
        AGGREGATE BURN RATE
      </div>
      <div className="absolute bottom-0 left-0 flex h-16 w-full items-end gap-px px-2 opacity-50 transition-opacity group-hover:opacity-100 sm:h-24">
        {rates.map((rate, index) => {
          const height = Math.max(20, Math.round((rate / maxRate) * 100));
          const isPeak = index >= rates.length - 2;
          const isCritical = index === rates.length - 1;

          return (
            <div
              key={index}
              className={cn(
                "w-full transition-colors",
                isCritical
                  ? "bg-critical"
                  : isPeak
                    ? "bg-accent"
                    : "bg-[#2a2a2a]"
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

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

function InventoryRiskTable({ data }: { data: InventoryRow[] }) {
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
    <div className="overflow-x-auto border border-[#1a1a1a]">
      <div className="min-w-[720px]">
        <div
          className={cn(
            TABLE_GRID,
            "border-b border-[#1a1a1a] bg-[#0a0a0a] px-2 py-2 font-mono text-[9px] uppercase tracking-wider text-text-muted sm:px-3 sm:text-[10px]"
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
              "items-center border-b border-[#1a1a1a] px-2 py-2.5 font-mono text-xs transition-colors last:border-b-0 hover:bg-[#0a0a0a] sm:px-3 sm:text-sm",
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
            <div className="text-right text-text-muted">{row.weeklySellRate}</div>
            <div
              className={cn(
                "text-right font-bold",
                row.daysToStockout <= 0 && "text-critical"
              )}
            >
              {row.daysToStockout}
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

export function InventoryDeepDive({ data }: InventoryDeepDiveProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pt-14 sm:pt-16">
      <div className="absolute inset-0 hidden gap-px bg-[#0a0a0a] p-8 opacity-30 md:grid md:grid-cols-12">
        <div className="relative col-span-8 flex h-full flex-col gap-2 border border-[#1a1a1a] bg-black p-4">
          <div className="flex h-8 items-center border-b border-[#1a1a1a]">
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              SYS_STB_01
            </span>
          </div>
          <div className="flex-1 border border-dashed border-[#1a1a1a]" />
        </div>
        <div className="col-span-4 h-full border border-[#1a1a1a] bg-black" />
      </div>

      <div className="relative z-10 flex h-[calc(100dvh-3.5rem)] min-h-0 items-stretch justify-center bg-black/90 backdrop-blur-sm sm:h-[calc(100dvh-4rem)] md:items-center md:bg-black/80">
        <div className="relative z-50 flex min-h-0 w-full max-w-[960px] flex-1 flex-col border-[#1a1a1a] bg-black shadow-[0_0_0_1px_rgba(26,26,26,1)] md:h-auto md:max-h-[870px] md:flex-none md:border">
          <div className="flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 sm:px-4 sm:py-0">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <AlertTriangle className="h-4 w-4 shrink-0 text-accent sm:h-[18px] sm:w-[18px]" />
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-text-primary sm:text-[11px]">
                Inventory Risk // Critical SKUs
              </h2>
            </div>
            <Link
              href="/"
              aria-label="Close panel"
              className="group flex h-8 w-8 shrink-0 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
            </Link>
          </div>

          <div className="grid shrink-0 grid-cols-2 border-b border-[#1a1a1a] bg-black font-mono text-[10px] sm:grid-cols-4 sm:text-xs">
            <div className="flex flex-col gap-1 border-b border-r border-[#1a1a1a] p-2 sm:border-b-0">
              <span className="text-text-muted">Priority Level</span>
              <span className="font-bold text-accent">CRITICAL</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#1a1a1a] p-2 sm:border-b-0 sm:border-r">
              <span className="text-text-muted">Data Latency</span>
              <span className="text-text-primary">12ms</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-[#1a1a1a] p-2">
              <span className="text-text-muted">Velocity Trnd</span>
              <span className="text-accent">+18.4%</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-text-muted">Restock ETA</span>
              <span className="text-critical">TBD</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-black p-3 sm:p-4">
            <BurnRateChart data={data} />
            <InventoryRiskTable data={data} />
            <div className="mt-2 flex justify-start sm:justify-end">
              <span className="font-mono text-[10px] italic leading-relaxed text-text-muted sm:text-xs">
                Data sync: Real-time. Ovr-allocations indicated by negative
                integers.
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#1a1a1a] bg-black p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 border border-[#f5f5f5] bg-transparent px-4 py-2.5 font-mono text-xs uppercase text-[#f5f5f5] transition-colors hover:bg-[#f5f5f5] hover:text-black sm:w-auto sm:justify-start sm:py-2"
            >
              <Download className="h-4 w-4" />
              Export Log
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 bg-accent px-4 py-2.5 font-display text-lg uppercase text-black transition-colors hover:bg-text-muted sm:w-auto sm:px-6 sm:py-1 sm:text-2xl"
            >
              <span className="text-center">Initiate Re-allocation</span>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

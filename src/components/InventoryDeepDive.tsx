"use client";

import Link from "next/link";
import type { InventoryRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  TriangleAlert,
  X,
} from "lucide-react";

interface InventoryDeepDiveProps {
  data: InventoryRow[];
  productFocus?: string;
}

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

function InventoryRiskRow({
  row,
  isHighlighted,
}: {
  row: InventoryRow;
  isHighlighted: boolean;
}) {
  const isNegative = row.unitsRemaining < 0;
  const isLowPositive =
    !isNegative && row.unitsRemaining <= 20 && row.daysToStockout === 0;

  if (isHighlighted) {
    return (
      <div className="relative overflow-hidden border-b border-[#1a1a1a] bg-accent p-3 text-black last:border-b-0 sm:p-2">
        <div className="pointer-events-none absolute inset-0 border border-black opacity-20" />
        <div className="relative z-10 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="truncate font-mono text-xs font-bold tracking-wider">
            {row.sku}
          </span>
        </div>
        <div className="relative z-10 mt-2 grid grid-cols-3 gap-2 font-mono text-xs sm:mt-0 sm:hidden">
          <div>
            <div className="text-[10px] uppercase opacity-70">Units</div>
            <div className="font-bold">{row.unitsRemaining}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase opacity-70">Rate</div>
            <div className="opacity-80">{row.weeklySellRate}/wk</div>
          </div>
          <div>
            <div className="text-[10px] uppercase opacity-70">Days</div>
            <div className="font-bold">{row.daysToStockout}</div>
          </div>
        </div>
        <div className="relative z-10 hidden grid-cols-12 items-center sm:grid">
          <div className="col-span-4 flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-bold tracking-wider">{row.sku}</span>
          </div>
          <div className="col-span-3 text-right font-bold">
            {row.unitsRemaining}
          </div>
          <div className="col-span-3 text-right opacity-80">
            {row.weeklySellRate}/wk
          </div>
          <div className="col-span-2 text-right font-bold">
            {row.daysToStockout}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-[#1a1a1a] p-3 transition-colors last:border-b-0 hover:bg-[#0a0a0a] sm:p-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 shrink-0",
            isNegative || row.status === "CRITICAL"
              ? "bg-critical"
              : isLowPositive
                ? "bg-accent"
                : "bg-[#2a2a2a]"
          )}
        />
        <span className="truncate font-mono text-xs tracking-wider">
          {row.sku}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-sm sm:mt-0 sm:hidden">
        <div>
          <div className="text-[10px] uppercase text-text-muted">Units</div>
          <div
            className={cn(
              "font-medium",
              isLowPositive && "text-accent",
              isNegative && "text-critical"
            )}
          >
            {row.unitsRemaining}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-text-muted">Rate</div>
          <div className="text-text-muted">{row.weeklySellRate}/wk</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-text-muted">Days</div>
          <div
            className={cn(
              "font-bold",
              row.daysToStockout <= 0 && "text-critical"
            )}
          >
            {row.daysToStockout}
          </div>
        </div>
      </div>
      <div className="hidden grid-cols-12 items-center sm:grid">
        <div className="col-span-4 flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2",
              isNegative || row.status === "CRITICAL"
                ? "bg-critical"
                : isLowPositive
                  ? "bg-accent"
                  : "bg-[#2a2a2a]"
            )}
          />
          <span className="text-xs tracking-wider">{row.sku}</span>
        </div>
        <div
          className={cn(
            "col-span-3 text-right text-base",
            isLowPositive && "text-accent",
            isNegative && "text-critical"
          )}
        >
          {row.unitsRemaining}
        </div>
        <div className="col-span-3 text-right text-base text-text-muted">
          {row.weeklySellRate}/wk
        </div>
        <div
          className={cn(
            "col-span-2 text-right text-base font-bold",
            row.daysToStockout <= 0 && "text-critical"
          )}
        >
          {row.daysToStockout}
        </div>
      </div>
    </div>
  );
}

function InventoryRiskTable({ data }: { data: InventoryRow[] }) {
  const highlightIndex = data.reduce(
    (worst, row, index) =>
      row.unitsRemaining < data[worst].unitsRemaining ? index : worst,
    0
  );

  return (
    <div className="border border-[#1a1a1a]">
      <div className="hidden grid-cols-12 border-b border-[#1a1a1a] bg-[#0a0a0a] p-2 font-mono text-xs text-text-muted sm:grid">
        <div className="col-span-4">SKU IDENTIFIER</div>
        <div className="col-span-3 text-right">UNITS REMAINING</div>
        <div className="col-span-3 text-right">WEEKLY SELL RATE</div>
        <div className="col-span-2 text-right">DAYS TO STOCKOUT</div>
      </div>

      <div className="font-mono text-text-primary sm:text-xl">
        {data.map((row, index) => (
          <InventoryRiskRow
            key={row.sku}
            row={row}
            isHighlighted={index === highlightIndex}
          />
        ))}
      </div>
    </div>
  );
}

export function InventoryDeepDive({
  data,
  productFocus = "ARCH LOGO TEE",
}: InventoryDeepDiveProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pt-14 sm:pt-16">
      {/* Ambient dashboard background — hidden on small screens */}
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

      {/* Panel overlay */}
      <div className="relative z-10 flex h-[calc(100dvh-3.5rem)] min-h-0 items-stretch justify-center bg-black/90 backdrop-blur-sm sm:h-[calc(100dvh-4rem)] md:items-center md:bg-black/80">
        <div className="relative z-50 flex min-h-0 w-full max-w-[800px] flex-1 flex-col border-[#1a1a1a] bg-black shadow-[0_0_0_1px_rgba(26,26,26,1)] md:h-auto md:max-h-[870px] md:flex-none md:border">
          {/* Header bar */}
          <div className="flex min-h-12 shrink-0 items-center justify-between gap-2 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2 sm:px-4 sm:py-0">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <AlertTriangle className="h-4 w-4 shrink-0 text-accent sm:h-[18px] sm:w-[18px]" />
              <h2 className="truncate font-mono text-[10px] uppercase tracking-widest text-text-primary sm:text-[11px] sm:whitespace-normal">
                <span className="sm:hidden">Inv Risk // {productFocus}</span>
                <span className="hidden sm:inline">
                  Inventory Risk Report // {productFocus}
                </span>
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

          {/* Meta data row */}
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

          {/* Scrollable content */}
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

          {/* Footer action bar */}
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
              className="flex w-full items-center justify-center gap-2 bg-accent px-4 py-2.5 font-display text-lg uppercase text-black transition-colors hover:bg-white sm:w-auto sm:px-6 sm:py-1 sm:text-2xl"
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

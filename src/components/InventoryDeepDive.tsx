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
    <div className="relative mb-8 h-32 overflow-hidden border border-[#1a1a1a] group">
      <div className="absolute left-2 top-2 font-mono text-xs text-text-muted">
        AGGREGATE BURN RATE
      </div>
      <div className="absolute bottom-0 left-0 flex h-24 w-full items-end gap-px px-2 opacity-50 transition-opacity group-hover:opacity-100">
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

function InventoryRiskTable({ data }: { data: InventoryRow[] }) {
  const highlightIndex = data.reduce(
    (worst, row, index) =>
      row.unitsRemaining < data[worst].unitsRemaining ? index : worst,
    0
  );

  return (
    <div className="border border-[#1a1a1a]">
      <div className="grid grid-cols-12 border-b border-[#1a1a1a] bg-[#0a0a0a] p-2 font-mono text-xs text-text-muted">
        <div className="col-span-4">SKU IDENTIFIER</div>
        <div className="col-span-3 text-right">UNITS REMAINING</div>
        <div className="col-span-3 text-right">WEEKLY SELL RATE</div>
        <div className="col-span-2 text-right">DAYS TO STOCKOUT</div>
      </div>

      <div className="font-mono text-xl text-text-primary">
        {data.map((row, index) => {
          const isHighlighted = index === highlightIndex;
          const isNegative = row.unitsRemaining < 0;
          const isLowPositive =
            !isNegative && row.unitsRemaining <= 20 && row.daysToStockout === 0;

          if (isHighlighted) {
            return (
              <div
                key={row.sku}
                className="relative grid grid-cols-12 items-center overflow-hidden border-b border-[#1a1a1a] bg-accent p-2 text-black group"
              >
                <div className="pointer-events-none absolute inset-0 border border-black opacity-20" />
                <div className="col-span-4 z-10 flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 animate-pulse" />
                  <span className="text-xs font-bold tracking-wider">
                    {row.sku}
                  </span>
                </div>
                <div className="col-span-3 z-10 text-right font-bold">
                  {row.unitsRemaining}
                </div>
                <div className="col-span-3 z-10 text-right opacity-80">
                  {row.weeklySellRate}/wk
                </div>
                <div className="col-span-2 z-10 text-right font-bold">
                  {row.daysToStockout}
                </div>
              </div>
            );
          }

          return (
            <div
              key={row.sku}
              className="grid grid-cols-12 items-center border-b border-[#1a1a1a] p-2 transition-colors last:border-b-0 hover:bg-[#0a0a0a]"
            >
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
                  "col-span-3 text-right",
                  isLowPositive && "text-accent",
                  isNegative && "text-critical"
                )}
              >
                {row.unitsRemaining}
              </div>
              <div className="col-span-3 text-right text-text-muted">
                {row.weeklySellRate}/wk
              </div>
              <div
                className={cn(
                  "col-span-2 text-right font-bold",
                  row.daysToStockout <= 0 && "text-critical"
                )}
              >
                {row.daysToStockout}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InventoryDeepDive({
  data,
  productFocus = "ARCH LOGO TEE",
}: InventoryDeepDiveProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pt-16">
      {/* Ambient dashboard background */}
      <div className="absolute inset-0 grid grid-cols-12 gap-px bg-[#0a0a0a] p-8 opacity-30">
        <div className="relative col-span-12 flex h-full flex-col gap-2 border border-[#1a1a1a] bg-black p-4 md:col-span-8">
          <div className="flex h-8 items-center border-b border-[#1a1a1a]">
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              SYS_STB_01
            </span>
          </div>
          <div className="flex-1 border border-dashed border-[#1a1a1a]" />
        </div>
        <div className="col-span-12 hidden h-full border border-[#1a1a1a] bg-black md:col-span-4 md:block" />
      </div>

      {/* Panel overlay */}
      <div className="relative z-10 flex h-[calc(100vh-4rem)] items-start justify-end bg-black/80 backdrop-blur-sm md:items-center md:justify-center">
        <div className="relative z-50 flex h-full w-full max-h-[870px] flex-col border-[#1a1a1a] bg-black shadow-[0_0_0_1px_rgba(26,26,26,1)] md:h-auto md:w-[800px] md:border md:border-l">
          {/* Header bar */}
          <div className="flex h-12 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-[18px] w-[18px] text-accent" />
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-text-primary">
                Inventory Risk Report // {productFocus}
              </h2>
            </div>
            <Link
              href="/"
              aria-label="Close panel"
              className="group flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
            </Link>
          </div>

          {/* Meta data row */}
          <div className="grid grid-cols-4 border-b border-[#1a1a1a] bg-black font-mono text-xs">
            <div className="col-span-2 flex flex-col gap-1 border-b border-r border-[#1a1a1a] p-2 md:col-span-1 md:border-b-0">
              <span className="text-text-muted">Priority Level</span>
              <span className="font-bold text-accent">CRITICAL</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 border-b border-r border-[#1a1a1a] p-2 md:col-span-1 md:border-b-0">
              <span className="text-text-muted">Data Latency</span>
              <span className="text-text-primary">12ms</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 border-r border-[#1a1a1a] p-2 md:col-span-1">
              <span className="text-text-muted">Velocity Trnd</span>
              <span className="text-accent">+18.4%</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 p-2 md:col-span-1">
              <span className="text-text-muted">Restock ETA</span>
              <span className="text-critical">TBD</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto bg-black p-4">
            <BurnRateChart data={data} />
            <InventoryRiskTable data={data} />
            <div className="mt-2 flex justify-end">
              <span className="font-mono text-xs italic text-text-muted">
                Data sync: Real-time. Ovr-allocations indicated by negative
                integers.
              </span>
            </div>
          </div>

          {/* Footer action bar */}
          <div className="flex items-center justify-between border-t border-[#1a1a1a] bg-black p-4">
            <button
              type="button"
              className="flex items-center gap-2 border border-[#f5f5f5] bg-transparent px-4 py-2 font-mono text-xs uppercase text-[#f5f5f5] transition-colors hover:bg-[#f5f5f5] hover:text-black"
            >
              <Download className="h-4 w-4" />
              Export Log
            </button>
            <button
              type="button"
              className="flex items-center gap-2 bg-accent px-6 py-1 font-display text-2xl uppercase text-black transition-colors hover:bg-white"
            >
              Initiate Re-allocation
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

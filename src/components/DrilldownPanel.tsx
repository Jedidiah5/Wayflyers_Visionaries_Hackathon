"use client";

import { useEffect, type ReactNode } from "react";
import type { Insight } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { InventoryRiskTable } from "./InventoryRiskTable";
import { AdsTable } from "./AdsTable";
import { SizingRefundsTable } from "./SizingRefundsTable";
import { StockoutProjectionsTable } from "./StockoutProjectionsTable";
import {
  ADS_DATA,
  INVENTORY_DATA,
  SIZING_REFUNDS_DATA,
  SIZING_REFUNDS_SUMMARY,
  STOCKOUT_PROJECTIONS_DATA,
  STOCKOUT_REORDER_RECOMMENDATION,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrilldownPanelProps {
  insight: Insight | null;
  isOpen: boolean;
  onClose: () => void;
}

function PanelSummary({ children }: { children: ReactNode }) {
  return (
    <p className="border border-border bg-surface p-4 font-body text-sm leading-relaxed text-text-primary">
      {children}
    </p>
  );
}

export function DrilldownPanel({
  insight,
  isOpen,
  onClose,
}: DrilldownPanelProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const drilldown = insight?.drilldown;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/70 transition-opacity duration-300 ease",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-14 z-[70] flex h-[calc(100dvh-3.5rem)] w-full max-w-[720px] flex-col border-l border-border bg-surface-elevated transition-transform duration-300 ease sm:top-16 sm:h-[calc(100dvh-4rem)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={insight?.title}
        onClick={(e) => e.stopPropagation()}
      >
        {insight && (
          <>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background p-6">
              <div className="min-w-0">
                <div className="mb-3">
                  <SeverityBadge severity={insight.severity} />
                </div>
                <h2 className="font-display text-2xl uppercase leading-tight tracking-tight text-text-primary sm:text-3xl">
                  {insight.title}
                </h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
                  {insight.action}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group shrink-0 border border-transparent p-2 text-text-muted transition-colors hover:border-border hover:text-text-primary"
                aria-label="Close panel"
              >
                <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {drilldown === "sizing" && (
                <div className="space-y-6">
                  <PanelSummary>{SIZING_REFUNDS_SUMMARY}</PanelSummary>
                  <SizingRefundsTable data={SIZING_REFUNDS_DATA} />
                </div>
              )}

              {drilldown === "inventory" && (
                <InventoryRiskTable data={INVENTORY_DATA} />
              )}

              {drilldown === "ads" && (
                <div className="overflow-x-auto">
                  <AdsTable data={ADS_DATA} />
                </div>
              )}

              {drilldown === "projections" && (
                <div className="space-y-6">
                  <PanelSummary>{STOCKOUT_REORDER_RECOMMENDATION}</PanelSummary>
                  <StockoutProjectionsTable data={STOCKOUT_PROJECTIONS_DATA} />
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Insight } from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { InventoryTable } from "./InventoryTable";
import { AdsTable } from "./AdsTable";
import { INVENTORY_DATA, ADS_DATA } from "@/lib/data";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrilldownPanelProps {
  insight: Insight | null;
  isOpen: boolean;
  onClose: () => void;
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
          "fixed inset-0 z-50 bg-black/60 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-full max-w-[720px] flex-col border-l border-border bg-surface-elevated transition-transform duration-300 ease-out md:w-[720px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={insight?.title}
      >
        {insight && (
          <>
            <div className="flex items-start justify-between border-b border-border bg-background p-8">
              <div>
                <div className="mb-3">
                  <SeverityBadge severity={insight.severity} />
                </div>
                <h2 className="font-display text-3xl uppercase leading-none tracking-tight text-text-primary">
                  {insight.title}
                </h2>
                <p className="mt-2 font-body text-sm text-text-muted">
                  {insight.detail}
                </p>
              </div>
              <button
                onClick={onClose}
                className="border border-transparent p-2 text-text-muted transition-colors hover:border-border hover:text-text-primary"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {drilldown === "sizing" && (
                <div className="space-y-6">
                  <div className="border border-border bg-surface p-6">
                    <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      Refund Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-mono text-2xl font-bold text-critical">
                          1,284
                        </div>
                        <div className="font-mono text-xs text-text-muted">
                          size_too_small
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-critical">
                          1,109
                        </div>
                        <div className="font-mono text-xs text-text-muted">
                          size_too_large
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-border pt-4">
                      <div className="font-mono text-xl font-bold text-critical">
                        £305,692
                      </div>
                      <div className="font-mono text-xs text-text-muted">
                        Total sizing refund value (24 months)
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-sm text-text-muted">
                    Top offenders: Arch Logo Tee, Boxy Crop Tee, Linen Blend
                    Tee. Consider updated size guides and fit photography for
                    these SKUs.
                  </p>
                </div>
              )}

              {drilldown === "inventory" && (
                <div className="space-y-4">
                  <InventoryTable data={INVENTORY_DATA} />
                  <Link
                    href="/inventory"
                    onClick={onClose}
                    className="inline-block font-mono text-xs uppercase tracking-widest text-accent hover:opacity-70"
                  >
                    View full inventory →
                  </Link>
                </div>
              )}

              {drilldown === "ads" && (
                <div className="space-y-4">
                  <AdsTable data={ADS_DATA} />
                  <Link
                    href="/ads"
                    onClick={onClose}
                    className="inline-block font-mono text-xs uppercase tracking-widest text-accent hover:opacity-70"
                  >
                    View full ad performance →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

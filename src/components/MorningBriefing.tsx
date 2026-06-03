"use client";

import { useState } from "react";
import { BRIEFING_DATA } from "@/lib/data";
import type { Insight } from "@/lib/types";
import { InsightCard } from "./InsightCard";
import { StatStrip } from "./StatStrip";
import { ChatInputBar } from "./ChatInputBar";
import { DrilldownPanel } from "./DrilldownPanel";

export function MorningBriefing() {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleInsightAction = (insight: Insight) => {
    setSelectedInsight(insight);
    setPanelOpen(true);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
  };

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 pb-32 pt-24 px-8">
        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <h1 className="font-display text-4xl uppercase tracking-tight text-text-primary md:text-5xl">
            {BRIEFING_DATA.date}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            Morning Briefing / System Status: Nominal
          </p>
        </header>

        <section className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2">
          {BRIEFING_DATA.insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAction={handleInsightAction}
            />
          ))}
        </section>

        <StatStrip stats={BRIEFING_DATA.stats} />
      </main>

      <ChatInputBar redirectToChat />

      <DrilldownPanel
        insight={selectedInsight}
        isOpen={panelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}

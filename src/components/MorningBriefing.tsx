"use client";

import { useState } from "react";
import type { BriefingStats, DrilldownPayload, Insight } from "@/lib/types";
import { InsightCard } from "./InsightCard";
import { StatStrip } from "./StatStrip";
import { ChatInputBar } from "./ChatInputBar";
import { DrilldownPanel } from "./DrilldownPanel";
import { LiveClock } from "./LiveClock";
import { BriefingStatusLine } from "./BriefingStatusLine";

interface MorningBriefingProps {
  insights: Insight[];
  stats: BriefingStats;
  drilldown: DrilldownPayload;
}

export function MorningBriefing({
  insights,
  stats,
  drilldown,
}: MorningBriefingProps) {
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
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 pb-32 pt-24">
        <header className="flex flex-col gap-2 border-b border-border pb-6">
          <LiveClock />
          <BriefingStatusLine />
        </header>

        <section className="grid grid-cols-1 gap-[1px] border border-border bg-border md:grid-cols-2">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onAction={handleInsightAction}
            />
          ))}
        </section>

        <StatStrip stats={stats} />
      </main>

      <ChatInputBar redirectToChat />

      <DrilldownPanel
        insight={selectedInsight}
        isOpen={panelOpen}
        onClose={handleClosePanel}
        drilldown={drilldown}
      />
    </>
  );
}

import { MorningBriefing } from "@/components/MorningBriefing";
import { getBriefingData, getDrilldownPayload } from "@/lib/data";

export default function HomePage() {
  const briefing = getBriefingData();
  const drilldown = getDrilldownPayload();

  return (
    <MorningBriefing
      insights={briefing.insights}
      stats={briefing.stats}
      drilldown={drilldown}
    />
  );
}

import { ADS_DATA, BRIEFING_DATA } from "@/lib/data";
import { AdsTable } from "@/components/AdsTable";
import { PageHeader } from "@/components/PageHeader";

export default function AdsPage() {
  return (
    <main className="mx-auto max-w-7xl px-8 pb-16 pt-24">
      <PageHeader
        title="Ad Performance"
        subtitle={`Google ROAS ${BRIEFING_DATA.stats.googleROAS} · Meta ROAS ${BRIEFING_DATA.stats.metaROAS} · Total spend ${BRIEFING_DATA.stats.totalAdSpend}`}
      />
      <AdsTable data={ADS_DATA} />
    </main>
  );
}
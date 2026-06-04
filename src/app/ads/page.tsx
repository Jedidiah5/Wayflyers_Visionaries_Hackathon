import { AdsTable } from "@/components/AdsTable";
import { PageHeader } from "@/components/PageHeader";
import { getAdsData, getSummaryStats } from "@/lib/data";

export default function AdsPage() {
  const ads = getAdsData();
  const stats = getSummaryStats();

  return (
    <main className="mx-auto max-w-7xl px-8 pb-16 pt-24">
      <PageHeader
        title="Ad Performance"
        subtitle={`Google ROAS ${stats.googleROAS} · Meta ROAS ${stats.metaROAS} · Total spend ${stats.totalAdSpend}`}
      />
      <AdsTable data={ads} />
    </main>
  );
}

import { ADS_DATA } from "@/lib/data";
import { AdsTable } from "@/components/AdsTable";
import { BRIEFING_DATA } from "@/lib/data";

export default function AdsPage() {
  return (
    <main className="mx-auto max-w-7xl px-8 pb-16 pt-24">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-4xl uppercase tracking-tight text-text-primary">
          Ad Performance
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
          Google ROAS {BRIEFING_DATA.stats.googleROAS} · Meta ROAS{" "}
          {BRIEFING_DATA.stats.metaROAS} · Total spend{" "}
          {BRIEFING_DATA.stats.totalAdSpend}
        </p>
      </header>

      <AdsTable data={ADS_DATA} />
    </main>
  );
}

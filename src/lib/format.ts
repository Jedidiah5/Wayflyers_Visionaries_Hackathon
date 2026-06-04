export function parseNum(value: string | undefined | null): number {
  if (value == null || value === "") return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export function formatGbp(amount: number): string {
  const rounded = Math.round(amount);
  return `£${rounded.toLocaleString("en-GB")}`;
}

export function formatGbpCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `£${(amount / 1_000_000).toFixed(2)}m`;
  }
  if (amount >= 1_000) {
    return `£${(amount / 1_000).toFixed(1)}k`;
  }
  return formatGbp(amount);
}

export function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-GB");
}

export function formatPercent(ratio: number, decimals = 1): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

export function formatRoas(roas: number): string {
  return `${roas.toFixed(2)}x`;
}

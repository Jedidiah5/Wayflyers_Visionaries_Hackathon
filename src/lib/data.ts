import "server-only";

import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { getDataDir } from "./data-path";
import {
  formatCount,
  formatGbp,
  formatGbpCompact,
  formatPercent,
  formatRoas,
  parseNum,
} from "./format";
import type {
  AdRow,
  BriefingData,
  BriefingStats,
  DrilldownPayload,
  Insight,
  InventoryRow,
  SizingRefundRow,
  StockoutProjectionRow,
} from "./types";

export type { DrilldownPayload };

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

const csvCache = new Map<string, Record<string, string>[]>();

function readCsv<T extends Record<string, string>>(filename: string): T[] {
  const cached = csvCache.get(filename);
  if (cached) return cached as T[];

  const filePath = path.join(getDataDir(), filename);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    console.warn(`[data] ${filename} parse warnings:`, parsed.errors.slice(0, 3));
  }
  csvCache.set(filename, parsed.data);
  return parsed.data;
}

function inventoryStatus(qty: number): InventoryRow["status"] {
  if (qty < 0) return "CRITICAL";
  if (qty < 50) return "WARNING";
  return "OK";
}

function adVerdict(roas: number): AdRow["verdict"] {
  if (roas >= 4) return "SCALE";
  if (roas >= 2) return "MAINTAIN";
  if (roas >= 1) return "REVIEW";
  if (roas >= 0.5) return "PAUSE";
  return "KILL";
}

function optionValue(
  row: { option1_name: string; option1_value: string; option2_name: string; option2_value: string },
  name: string
): string {
  if (row.option1_name === name) return row.option1_value;
  if (row.option2_name === name) return row.option2_value;
  return "";
}

// ---------------------------------------------------------------------------
// Sell-rate cache (28-day line items → weekly units)
// ---------------------------------------------------------------------------

function buildWeeklySellRates(): Map<string, number> {
  const orders = readCsv<{ order_id: string; created_at: string }>("orders.csv");
  const cutoff = Date.now() - 28 * 24 * 60 * 60 * 1000;
  const recentOrderIds = new Set(
    orders
      .filter((o) => new Date(o.created_at).getTime() >= cutoff)
      .map((o) => o.order_id)
  );

  const lineItems = readCsv<{
    order_id: string;
    variant_id: string;
    quantity: string;
  }>("line_items.csv");

  const qty28d = new Map<string, number>();
  for (const li of lineItems) {
    if (!recentOrderIds.has(li.order_id)) continue;
    const vid = li.variant_id;
    qty28d.set(vid, (qty28d.get(vid) ?? 0) + parseNum(li.quantity));
  }

  const weekly = new Map<string, number>();
  qty28d.forEach((qty, vid) => {
    weekly.set(vid, Math.round(qty / 4));
  });
  return weekly;
}

// ---------------------------------------------------------------------------
// Loaders (run once at module init)
// ---------------------------------------------------------------------------

function buildInventoryData(sellRates: Map<string, number>): InventoryRow[] {
  const products = readCsv<{ product_id: string; title: string }>("products.csv");
  const productTitle = new Map(products.map((p) => [p.product_id, p.title]));

  const variants = readCsv<{
    variant_id: string;
    product_id: string;
    sku: string;
    option1_name: string;
    option1_value: string;
    option2_name: string;
    option2_value: string;
    inventory_quantity: string;
  }>("variants.csv");

  const rows: InventoryRow[] = variants.map((v) => {
    const unitsRemaining = parseNum(v.inventory_quantity);
    const weeklySellRate = sellRates.get(v.variant_id) ?? 0;
    const daysToStockout =
      unitsRemaining > 0 && weeklySellRate > 0
        ? Math.floor(unitsRemaining / (weeklySellRate / 7))
        : 0;

    return {
      sku: v.sku,
      product: productTitle.get(v.product_id) ?? "Unknown",
      colour: optionValue(v, "Colour"),
      size: optionValue(v, "Size") || "ONE",
      unitsRemaining,
      weeklySellRate,
      daysToStockout,
      status: inventoryStatus(unitsRemaining),
    };
  });

  return rows.sort((a, b) => {
    if (a.unitsRemaining !== b.unitsRemaining) {
      return a.unitsRemaining - b.unitsRemaining;
    }
    return a.sku.localeCompare(b.sku);
  });
}

function buildAdsData(): AdRow[] {
  type Agg = { spend: number; revenue: number };
  const campaigns = new Map<string, Agg & { platform: "GOOGLE" | "META" }>();

  const ingest = (
    rows: { campaign_name: string; spend_gbp: string; conversion_value_gbp: string }[],
    platform: "GOOGLE" | "META"
  ) => {
    for (const row of rows) {
      const key = `${platform}:${row.campaign_name}`;
      const existing = campaigns.get(key) ?? { spend: 0, revenue: 0, platform };
      existing.spend += parseNum(row.spend_gbp);
      existing.revenue += parseNum(row.conversion_value_gbp);
      campaigns.set(key, existing);
    }
  };

  ingest(readCsv("google_ads_daily.csv"), "GOOGLE");
  ingest(readCsv("meta_ads_daily.csv"), "META");

  const rows: AdRow[] = Array.from(campaigns.entries()).map(([key, agg]) => {
    const name = key.split(":").slice(1).join(":");
    const roas = agg.spend > 0 ? agg.revenue / agg.spend : 0;
    const prefix = agg.platform === "GOOGLE" ? "Google" : "Meta";
    return {
      campaign: `${prefix}: ${name}`,
      spend: Math.round(agg.spend),
      revenue: Math.round(agg.revenue),
      roas: Math.round(roas * 100) / 100,
      platform: agg.platform,
      verdict: adVerdict(roas),
    };
  });

  return rows.sort((a, b) => b.roas - a.roas);
}

export interface RefundDataResult {
  topProducts: SizingRefundRow[];
  totalSizingRefunds: number;
  totalSizingValue: number;
  totalRefunds: number;
  totalRefundValue: number;
  sizingShareOfRefunds: number;
}

function buildRefundData(): RefundDataResult {
  const variants = readCsv<{ variant_id: string; product_id: string }>("variants.csv");
  const products = readCsv<{ product_id: string; title: string }>("products.csv");
  const variantProduct = new Map(variants.map((v) => [v.variant_id, v.product_id]));
  const productTitle = new Map(products.map((p) => [p.product_id, p.title]));

  const lineItems = readCsv<{ variant_id: string; title: string }>("line_items.csv");
  const titleByVariant = new Map<string, string>();
  for (const li of lineItems) {
    if (!titleByVariant.has(li.variant_id)) {
      titleByVariant.set(li.variant_id, li.title.split(" - ")[0]?.trim() ?? li.title);
    }
  }

  const resolveProduct = (variantId: string): string => {
    const pid = variantProduct.get(variantId);
    if (pid) return productTitle.get(pid) ?? "Unknown";
    return titleByVariant.get(variantId) ?? "Unknown";
  };

  const refunds = readCsv<{
    amount: string;
    reason: string;
    refund_line_items: string;
  }>("refunds.csv");

  const sizingReasons = new Set(["size_too_small", "size_too_large"]);
  const sizingByProduct = new Map<string, { count: number; value: number }>();
  const allRefundsByProduct = new Map<string, number>();

  let totalSizingRefunds = 0;
  let totalSizingValue = 0;
  let totalRefunds = 0;
  let totalRefundValue = 0;

  for (const refund of refunds) {
    const amount = parseNum(refund.amount);
    totalRefunds += 1;
    totalRefundValue += amount;

    let variantIds: string[] = [];
    try {
      variantIds = JSON.parse(refund.refund_line_items.replace(/""/g, '"')) as string[];
    } catch {
      variantIds = [];
    }

    const productNames = new Set<string>();
    for (const vid of variantIds) {
      productNames.add(resolveProduct(vid));
    }
    const primaryProduct = productNames.values().next().value ?? "Unknown";

    allRefundsByProduct.set(
      primaryProduct,
      (allRefundsByProduct.get(primaryProduct) ?? 0) + 1
    );

    if (!sizingReasons.has(refund.reason)) continue;

    totalSizingRefunds += 1;
    totalSizingValue += amount;

    const entry = sizingByProduct.get(primaryProduct) ?? { count: 0, value: 0 };
    entry.count += 1;
    entry.value += amount;
    sizingByProduct.set(primaryProduct, entry);
  }

  const topProducts: SizingRefundRow[] = Array.from(sizingByProduct.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([product, stats]) => {
      const productTotal = allRefundsByProduct.get(product) ?? stats.count;
      return {
        product,
        sizingRefunds: stats.count,
        refundValue: formatGbp(stats.value),
        percentOfProductRefunds: formatPercent(
          productTotal > 0 ? stats.count / productTotal : 0,
          0
        ),
      };
    });

  return {
    topProducts,
    totalSizingRefunds,
    totalSizingValue,
    totalRefunds,
    totalRefundValue,
    sizingShareOfRefunds:
      totalRefunds > 0 ? totalSizingRefunds / totalRefunds : 0,
  };
}

export interface SummaryStatsRaw {
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  repeatCustomerRate: number;
  refundRate: number;
  googleROAS: number;
  metaROAS: number;
  totalAdSpend: number;
}

function buildSummaryStatsRaw(): SummaryStatsRaw {
  const orders = readCsv<{ total_price: string }>("orders.csv");
  const totalRevenue = orders.reduce((s, o) => s + parseNum(o.total_price), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const customers = readCsv<{ orders_count: string }>("customers.csv");
  const repeatCustomers = customers.filter((c) => parseNum(c.orders_count) >= 2).length;
  const repeatCustomerRate =
    customers.length > 0 ? repeatCustomers / customers.length : 0;

  const refunds = readCsv<{ amount: string }>("refunds.csv");
  const totalRefundValue = refunds.reduce((s, r) => s + parseNum(r.amount), 0);
  const refundRate = totalRevenue > 0 ? totalRefundValue / totalRevenue : 0;

  const sumPlatform = (filename: string) => {
    const rows = readCsv<{ spend_gbp: string; conversion_value_gbp: string }>(filename);
    const spend = rows.reduce((s, r) => s + parseNum(r.spend_gbp), 0);
    const revenue = rows.reduce((s, r) => s + parseNum(r.conversion_value_gbp), 0);
    return { spend, revenue, roas: spend > 0 ? revenue / spend : 0 };
  };

  const google = sumPlatform("google_ads_daily.csv");
  const meta = sumPlatform("meta_ads_daily.csv");

  return {
    totalRevenue,
    totalOrders,
    aov,
    repeatCustomerRate,
    refundRate,
    googleROAS: google.roas,
    metaROAS: meta.roas,
    totalAdSpend: google.spend + meta.spend,
  };
}

function buildSummaryStats(s: SummaryStatsRaw): BriefingStats {
  return {
    totalRevenue: formatGbp(s.totalRevenue),
    totalOrders: formatCount(s.totalOrders),
    aov: formatGbp(s.aov),
    repeatCustomerRate: formatPercent(s.repeatCustomerRate),
    refundRate: formatPercent(s.refundRate),
    googleROAS: formatRoas(s.googleROAS),
    metaROAS: formatRoas(s.metaROAS),
    totalAdSpend: formatGbpCompact(s.totalAdSpend),
  };
}

// ---------------------------------------------------------------------------
// Derived dashboard / drilldown payloads
// ---------------------------------------------------------------------------

function buildStockoutProjections(inventory: InventoryRow[]): StockoutProjectionRow[] {
  return inventory
    .filter((r) => r.unitsRemaining > 0 && r.weeklySellRate > 0)
    .map((r) => ({
      product: `${r.product} (${r.colour}, ${r.size})`,
      currentStock: r.unitsRemaining,
      weeklySellRate: r.weeklySellRate,
      daysRemaining: r.daysToStockout,
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 4);
}

function buildSizingRefundsSummary(refundData: RefundDataResult): string {
  const recovery = Math.round(refundData.totalSizingValue * 0.3);
  return `${formatGbp(refundData.totalSizingValue)} lost to sizing returns (${formatPercent(refundData.sizingShareOfRefunds, 0)} of all refunds). Fix sizing guidance on the top offenders to recover an estimated ${formatGbp(recovery)} annually (30% reduction).`;
}

function buildStockoutRecommendation(
  projections: StockoutProjectionRow[]
): string {
  if (projections.length === 0) {
    return "No positive-stock SKUs with measurable sell-through in the last 28 days.";
  }
  const urgent = projections.slice(0, 2);
  const parts = urgent.map(
    (p) =>
      `${p.product} (${p.currentStock} units, ~${p.daysRemaining} days left)`
  );
  return `Reorder ${parts.join(" and ")} immediately — both hit stockout within ${urgent[0]?.daysRemaining ?? 0} days at current velocity.`;
}

function buildDrilldownPayload(
  inventory: InventoryRow[],
  refundData: RefundDataResult,
  ads: AdRow[],
  stockoutProjections: StockoutProjectionRow[]
): DrilldownPayload {
  const criticalInventory = inventory
    .filter((r) => r.status !== "OK")
    .slice(0, 50);

  return {
    sizingRefunds: refundData.topProducts,
    sizingSummary: buildSizingRefundsSummary(refundData),
    inventory: criticalInventory.length > 0 ? criticalInventory : inventory.slice(0, 50),
    ads,
    stockoutProjections,
    stockoutRecommendation: buildStockoutRecommendation(stockoutProjections),
  };
}

function buildBriefingData(
  inventory: InventoryRow[],
  ads: AdRow[],
  refundData: RefundDataResult,
  stats: BriefingStats,
  raw: SummaryStatsRaw,
  topStockout: StockoutProjectionRow | undefined
): BriefingData {

  const negativeVariants = inventory.filter((r) => r.unitsRemaining < 0);
  const oversoldUnits = negativeVariants.reduce(
    (s, r) => s + Math.abs(r.unitsRemaining),
    0
  );

  const oversoldByProduct = new Map<string, number>();
  for (const row of negativeVariants) {
    oversoldByProduct.set(
      row.product,
      (oversoldByProduct.get(row.product) ?? 0) + Math.abs(row.unitsRemaining)
    );
  }
  const topOversold = Array.from(oversoldByProduct.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const blendedRoas =
    raw.totalAdSpend > 0
      ? ads.reduce((s, a) => s + a.revenue, 0) / raw.totalAdSpend
      : 0;

  const zeroRevenueCampaign = ads.find((a) => a.spend > 10_000 && a.revenue === 0);
  const worstPerformer = [...ads].sort((a, b) => a.roas - b.roas)[0];
  const bestPerformer = ads[0];

  const stockout = topStockout;

  const insights: Insight[] = [
    {
      id: "sizing-returns",
      severity: "critical",
      title: `${formatGbpCompact(refundData.totalSizingValue)} lost to sizing returns`,
      summary: `${formatPercent(refundData.sizingShareOfRefunds, 0)} of all refunds are sizing issues. ${formatCount(refundData.totalSizingRefunds)} returns totalling ${formatGbp(refundData.totalSizingValue)}.`,
      detail: `Top offenders: ${refundData.topProducts
        .slice(0, 3)
        .map((p) => p.product)
        .join(", ")}.`,
      action: "View breakdown",
      drilldown: "sizing",
    },
    {
      id: "negative-inventory",
      severity: "critical",
      title: topOversold
        ? `${formatCount(topOversold[1])} units oversold on ${topOversold[0]}`
        : `${formatCount(negativeVariants.length)} variants oversold`,
      summary: `${formatCount(negativeVariants.length)} variants have negative inventory. ${formatCount(oversoldUnits)} units sold that don't exist.`,
      detail: topOversold
        ? `Worst offender: ${topOversold[0]} (${formatCount(topOversold[1])} units oversold).`
        : "Review variant-level inventory across the catalogue.",
      action: "View inventory",
      drilldown: "inventory",
    },
    {
      id: "ads-dead-weight",
      severity: "warning",
      title: zeroRevenueCampaign
        ? `Ad ROAS at ${formatRoas(blendedRoas)} — but ${formatGbpCompact(zeroRevenueCampaign.spend)} generated £0`
        : `Blended ad ROAS at ${formatRoas(blendedRoas)}`,
      summary: zeroRevenueCampaign
        ? `${zeroRevenueCampaign.campaign} spent ${formatGbp(zeroRevenueCampaign.spend)}. Attributed revenue: £0.`
        : `Google ROAS ${stats.googleROAS} overall. Meta ROAS ${stats.metaROAS} overall.`,
      detail: `Best: ${bestPerformer?.campaign ?? "—"} at ${formatRoas(bestPerformer?.roas ?? 0)}. Worst: ${worstPerformer?.campaign ?? "—"} at ${formatRoas(worstPerformer?.roas ?? 0)}.`,
      action: "Scale campaigns",
      drilldown: "ads",
    },
    {
      id: "stockout-risk",
      severity: "warning",
      title: stockout
        ? `Stockout risk: ${stockout.product.split(" (")[0]}`
        : "Stockout risk on fast movers",
      summary: stockout
        ? `~${stockout.daysRemaining} days remaining at current sell-through.`
        : "Monitor variants with low days-to-stockout.",
      detail: `${stats.repeatCustomerRate} of customers are repeat buyers. AOV ${stats.aov}.`,
      action: "View projections",
      drilldown: "projections",
    },
  ];

  return {
    date: "",
    insights,
    stats,
  };
}

function buildSystemPrompt(
  stats: SummaryStatsRaw,
  refundData: RefundDataResult,
  inventory: InventoryRow[],
  ads: AdRow[]
): string {

  const negativeCount = inventory.filter((r) => r.unitsRemaining < 0).length;
  const oversoldUnits = inventory
    .filter((r) => r.unitsRemaining < 0)
    .reduce((s, r) => s + Math.abs(r.unitsRemaining), 0);
  const topSizing = refundData.topProducts
    .slice(0, 3)
    .map((p) => p.product)
    .join(", ");
  const bestAd = ads[0];
  const worstAd = ads[ads.length - 1];

  return `You are Fly Intelligence, an AI operator co-pilot for Pretty Fly — a London streetwear brand. You know their last 24 months of data. Key facts: Total revenue ${formatGbp(stats.totalRevenue)} across ${formatCount(stats.totalOrders)} orders. AOV ${formatGbp(stats.aov)}. Refund rate ${formatPercent(stats.refundRate)} — ${formatPercent(refundData.sizingShareOfRefunds, 0)} are sizing issues totalling ${formatGbp(refundData.totalSizingValue)}. Top sizing offenders: ${topSizing}. ${formatCount(negativeCount)} variants have negative inventory — ${formatCount(oversoldUnits)} units oversold. Best ad campaign: ${bestAd?.campaign ?? "n/a"} at ${formatRoas(bestAd?.roas ?? 0)} ROAS. Worst: ${worstAd?.campaign ?? "n/a"} at ${formatRoas(worstAd?.roas ?? 0)} ROAS. ${formatPercent(stats.repeatCustomerRate)} repeat customers. Be direct, cite exact figures, keep responses under 150 words unless asked for detail.`;
}

// ---------------------------------------------------------------------------
// Module-level cache: parsed once per Node process (build + runtime)
// ---------------------------------------------------------------------------

const WEEKLY_SELL_RATES = buildWeeklySellRates();
const INVENTORY_DATA = buildInventoryData(WEEKLY_SELL_RATES);
const ADS_DATA = buildAdsData();
const REFUND_DATA = buildRefundData();
const SUMMARY_STATS_RAW = buildSummaryStatsRaw();
const SUMMARY_STATS = buildSummaryStats(SUMMARY_STATS_RAW);
const STOCKOUT_PROJECTIONS = buildStockoutProjections(INVENTORY_DATA);
const DRILLDOWN_PAYLOAD = buildDrilldownPayload(
  INVENTORY_DATA,
  REFUND_DATA,
  ADS_DATA,
  STOCKOUT_PROJECTIONS
);
const BRIEFING_DATA = buildBriefingData(
  INVENTORY_DATA,
  ADS_DATA,
  REFUND_DATA,
  SUMMARY_STATS,
  SUMMARY_STATS_RAW,
  STOCKOUT_PROJECTIONS[0]
);
const SYSTEM_PROMPT = buildSystemPrompt(
  SUMMARY_STATS_RAW,
  REFUND_DATA,
  INVENTORY_DATA,
  ADS_DATA
);

/** @internal Parsed Pretty Fly datasets (frozen at module load). */
export const prettyFlyData = {
  inventory: INVENTORY_DATA,
  ads: ADS_DATA,
  refund: REFUND_DATA,
  summaryStats: SUMMARY_STATS,
  summaryStatsRaw: SUMMARY_STATS_RAW,
  drilldown: DRILLDOWN_PAYLOAD,
  briefing: BRIEFING_DATA,
  systemPrompt: SYSTEM_PROMPT,
} as const;

export const getInventoryData = (): InventoryRow[] => INVENTORY_DATA;
export const getAdsData = (): AdRow[] => ADS_DATA;
export const getRefundData = (): RefundDataResult => REFUND_DATA;
export const getSummaryStatsRaw = (): SummaryStatsRaw => SUMMARY_STATS_RAW;
export const getSummaryStats = (): BriefingStats => SUMMARY_STATS;
export const getDrilldownPayload = (): DrilldownPayload => DRILLDOWN_PAYLOAD;
export const getBriefingData = (): BriefingData => BRIEFING_DATA;
export const getSystemPrompt = (): string => SYSTEM_PROMPT;

export function getStockoutProjections(
  inventory: InventoryRow[] = INVENTORY_DATA
): StockoutProjectionRow[] {
  return buildStockoutProjections(inventory);
}

export function getSizingRefundsSummary(
  refundData: RefundDataResult = REFUND_DATA
): string {
  return buildSizingRefundsSummary(refundData);
}

export function getStockoutRecommendation(
  projections: StockoutProjectionRow[] = STOCKOUT_PROJECTIONS
): string {
  return buildStockoutRecommendation(projections);
}

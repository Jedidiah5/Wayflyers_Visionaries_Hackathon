export type InsightSeverity = "critical" | "warning" | "opportunity";

export type DrilldownType = "sizing" | "inventory" | "ads" | "projections";

export interface SizingRefundRow {
  product: string;
  sizingRefunds: number;
  refundValue: string;
  percentOfProductRefunds: string;
}

export interface StockoutProjectionRow {
  product: string;
  currentStock: number;
  weeklySellRate: number;
  daysRemaining: number;
}

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  summary: string;
  detail: string;
  action: string;
  drilldown: DrilldownType;
}

export interface BriefingStats {
  totalRevenue: string;
  totalOrders: string;
  aov: string;
  repeatCustomerRate: string;
  refundRate: string;
  googleROAS: string;
  metaROAS: string;
  totalAdSpend: string;
}

export interface BriefingData {
  date: string;
  insights: Insight[];
  stats: BriefingStats;
}

export interface InventoryRow {
  sku: string;
  product: string;
  colour: string;
  size: string;
  unitsRemaining: number;
  /** Units sold per week (last 90d sales ÷ 13); null → display "—" */
  weeklySellRate: number | null;
  /** null → display "—" */
  daysToStockout: number | null;
  status: "CRITICAL" | "WARNING" | "OK";
}

export interface AdRow {
  campaign: string;
  spend: number;
  revenue: number;
  roas: number;
  platform: "META" | "GOOGLE";
  verdict: "SCALE" | "MAINTAIN" | "REVIEW" | "PAUSE" | "KILL";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface DrilldownPayload {
  sizingRefunds: SizingRefundRow[];
  sizingSummary: string;
  inventory: InventoryRow[];
  ads: AdRow[];
  stockoutProjections: StockoutProjectionRow[];
  stockoutRecommendation: string;
}

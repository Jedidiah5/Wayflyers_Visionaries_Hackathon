import type {
  AdRow,
  BriefingData,
  InventoryRow,
  SizingRefundRow,
  StockoutProjectionRow,
} from "./types";

export const BRIEFING_DATA: BriefingData = {
  date: "Wednesday 4 June, 07:42",
  insights: [
    {
      id: "sizing-returns",
      severity: "critical",
      title: "£305k lost to sizing returns",
      summary:
        "41% of all refunds are sizing issues. 2,393 returns totalling £305,692 in 24 months.",
      detail:
        "size_too_small (1,284) and size_too_large (1,109) are the top two refund reasons. The Arch Logo Tee, Boxy Crop Tee, and Linen Blend Tee are the worst offenders.",
      action: "View breakdown",
      drilldown: "sizing",
    },
    {
      id: "negative-inventory",
      severity: "critical",
      title: "1,236 units oversold on Arch Logo Tee",
      summary:
        "296 variants have negative inventory. 12,731 units sold that don't exist.",
      detail:
        "Top offenders: Arch Logo Tee (-1,236), Boxy Crop Tee (-1,044), Linen Blend Tee (-1,043), Winter Logo Tee (-805), Emblem Cap (-497).",
      action: "View inventory",
      drilldown: "inventory",
    },
    {
      id: "ads-dead-weight",
      severity: "warning",
      title: "Ad ROAS at 5.2x — but £16k generated £0",
      summary:
        "Brand_Awareness_UK spent £16,149 last 6 months. Attributed revenue: £0.",
      detail:
        "Google ROAS 3.70x overall. Meta ROAS 2.72x overall. Best performer: Meta Retargeting_AllUsers at 5.0x. Worst: Brand_Awareness_UK at 0.0x. Womens_Launch_Prospecting at 0.98x — spending more than it makes.",
      action: "Scale campaigns",
      drilldown: "ads",
    },
    {
      id: "stockout-risk",
      severity: "warning",
      title: "Stockout risk: Cargo Pants",
      summary:
        "Current sell-through suggests 6 days remaining on top SKUs.",
      detail:
        "53.8% of customers are repeat buyers. Average LTV £290. Womenswear launched Dec 2025 — £42k first month, declining to £34k by May 2026.",
      action: "View projections",
      drilldown: "projections",
    },
  ],
  stats: {
    totalRevenue: "£6,522,560",
    totalOrders: "49,793",
    aov: "£130.99",
    repeatCustomerRate: "53.8%",
    refundRate: "11.7%",
    googleROAS: "3.70x",
    metaROAS: "2.72x",
    totalAdSpend: "£1,034,482",
  },
};

export const INVENTORY_DATA: InventoryRow[] = [
  {
    sku: "ALT-XS-WB",
    product: "Arch Logo Tee",
    colour: "Washed Black",
    size: "XS",
    unitsRemaining: -223,
    weeklySellRate: 145,
    daysToStockout: 0,
    status: "CRITICAL",
  },
  {
    sku: "BCT-XS-VC",
    product: "Boxy Crop Tee",
    colour: "Vintage Cream",
    size: "XS",
    unitsRemaining: -217,
    weeklySellRate: 112,
    daysToStockout: 0,
    status: "CRITICAL",
  },
  {
    sku: "LBT-XS-OW",
    product: "Linen Blend Tee",
    colour: "Off-White",
    size: "XS",
    unitsRemaining: -201,
    weeklySellRate: 98,
    daysToStockout: 0,
    status: "CRITICAL",
  },
  {
    sku: "ALT-XS-VC",
    product: "Arch Logo Tee",
    colour: "Vintage Cream",
    size: "XS",
    unitsRemaining: -196,
    weeklySellRate: 89,
    daysToStockout: 0,
    status: "CRITICAL",
  },
  {
    sku: "LC-ONE-DN",
    product: "Logo Cap",
    colour: "Deep Navy",
    size: "ONE",
    unitsRemaining: -179,
    weeklySellRate: 67,
    daysToStockout: 0,
    status: "CRITICAL",
  },
  {
    sku: "EC-ONE-OW",
    product: "Emblem Cap",
    colour: "Off-White",
    size: "ONE",
    unitsRemaining: -177,
    weeklySellRate: 55,
    daysToStockout: 0,
    status: "CRITICAL",
  },
];

export const SIZING_REFUNDS_DATA: SizingRefundRow[] = [
  {
    product: "Arch Logo Tee",
    sizingRefunds: 487,
    refundValue: "£62,340",
    percentOfProductRefunds: "44%",
  },
  {
    product: "Boxy Crop Tee",
    sizingRefunds: 312,
    refundValue: "£48,210",
    percentOfProductRefunds: "41%",
  },
  {
    product: "Linen Blend Tee",
    sizingRefunds: 298,
    refundValue: "£41,890",
    percentOfProductRefunds: "39%",
  },
  {
    product: "Heritage Hoodie",
    sizingRefunds: 201,
    refundValue: "£38,120",
    percentOfProductRefunds: "35%",
  },
  {
    product: "Court Trainer",
    sizingRefunds: 189,
    refundValue: "£52,890",
    percentOfProductRefunds: "31%",
  },
];

export const SIZING_REFUNDS_SUMMARY =
  "£305,692 lost. Fix sizing guidance on these 5 products and you recover an estimated £91,707 annually (30% reduction).";

export const STOCKOUT_PROJECTIONS_DATA: StockoutProjectionRow[] = [
  {
    product: "Cargo Pants Slim",
    currentStock: 42,
    weeklySellRate: 68,
    daysRemaining: 4,
  },
  {
    product: "Cargo Pants Wide",
    currentStock: 31,
    weeklySellRate: 55,
    daysRemaining: 4,
  },
  {
    product: "Arch Logo Tee (Grey)",
    currentStock: 18,
    weeklySellRate: 23,
    daysRemaining: 5,
  },
  {
    product: "Heritage Hoodie (Black, XL)",
    currentStock: 12,
    weeklySellRate: 14,
    daysRemaining: 6,
  },
];

export const STOCKOUT_REORDER_RECOMMENDATION =
  "Reorder Cargo Pants Slim (500 units) and Cargo Pants Wide (400 units) immediately — both hit stockout in 4 days at current velocity. Expedite Portugal supplier PO #PF-2847.";

export const ADS_DATA: AdRow[] = [
  {
    campaign: "Meta: Retargeting_AllUsers",
    spend: 38856,
    revenue: 194333,
    roas: 5.0,
    platform: "META",
    verdict: "SCALE",
  },
  {
    campaign: "Google: Brand_Search_UK",
    spend: 28443,
    revenue: 141653,
    roas: 4.98,
    platform: "GOOGLE",
    verdict: "SCALE",
  },
  {
    campaign: "Google: Brand_Search_EU",
    spend: 9943,
    revenue: 39752,
    roas: 4.0,
    platform: "GOOGLE",
    verdict: "MAINTAIN",
  },
  {
    campaign: "Google: Shopping_Tees_UK",
    spend: 17509,
    revenue: 66704,
    roas: 3.81,
    platform: "GOOGLE",
    verdict: "MAINTAIN",
  },
  {
    campaign: "Google: Shopping_Hoodies_UK",
    spend: 24033,
    revenue: 84520,
    roas: 3.52,
    platform: "GOOGLE",
    verdict: "MAINTAIN",
  },
  {
    campaign: "Meta: Prospecting_Mens_UK",
    spend: 59229,
    revenue: 177177,
    roas: 2.99,
    platform: "META",
    verdict: "REVIEW",
  },
  {
    campaign: "Meta: Womens_Launch_Prospecting",
    spend: 32123,
    revenue: 31524,
    roas: 0.98,
    platform: "META",
    verdict: "PAUSE",
  },
  {
    campaign: "Google: Brand_Awareness_UK",
    spend: 16149,
    revenue: 0,
    roas: 0.0,
    platform: "GOOGLE",
    verdict: "KILL",
  },
];

export const SYSTEM_PROMPT = `You are Fly Intelligence, an AI operator co-pilot for Pretty Fly — a London streetwear brand. You know their last 24 months of data. Key facts: Total revenue £6,522,560 across 49,793 orders. AOV £130.99. Refund rate 11.7% — 41% are sizing issues totalling £305,692. Top sizing offenders: Arch Logo Tee, Boxy Crop Tee, Linen Blend Tee. 296 variants have negative inventory — 12,731 units oversold. Best ad campaign: Meta Retargeting_AllUsers at 5.0x ROAS. Worst: Brand_Awareness_UK spent £16,149, generated £0. Womens Launch campaign ROAS 0.98x — losing money. 53.8% repeat customers, £290 avg LTV. Support: 1,204 tickets, 41.9% bot-resolved, 447 min avg resolution. Be direct, cite exact figures, keep responses under 150 words unless asked for detail.`;

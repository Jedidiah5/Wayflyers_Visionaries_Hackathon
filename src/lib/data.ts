import type { AdRow, BriefingData, InventoryRow } from "./types";

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
      drilldown: "inventory",
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

export const SYSTEM_PROMPT = `You are Fly Intelligence, an AI operator co-pilot for Pretty Fly — a London-based premium streetwear brand. You have deep knowledge of their last 24 months of business data.

Key facts you know:
- Total revenue: £6,522,560 across 49,793 orders. AOV £130.99.
- Refund rate: 11.7%. £602,389 total refunds. 41% are sizing issues (£305,692).
- Top sizing offenders: Arch Logo Tee, Boxy Crop Tee, Linen Blend Tee.
- 296 variants have negative inventory. 12,731 units oversold. Arch Logo Tee alone: -1,236 units.
- Google ROAS: 3.70x (£505k spend, £1.87M revenue). Meta ROAS: 2.99x (£528k spend, £1.58M revenue).
- Best campaign: Meta Retargeting_AllUsers at 5.0x ROAS.
- Worst campaign: Brand_Awareness_UK — £16,149 spent, £0 revenue.
- Womens_Launch_Prospecting ROAS: 0.98x — losing money.
- Womenswear launched Dec 2025. £42,720 first month, declining to £34,567 by May 2026.
- 53.8% repeat customer rate. Average LTV £290.67. 22,440 total customers.
- Avg supplier lead time from Portugal, Italy, Turkey. Total supplier spend: £2.19M.
- Support: 1,204 tickets. 41.9% bot-resolved. Avg resolution 447 mins. Top categories: order_status, returns_exchanges, sizing_fit.

Respond concisely and specifically. Always cite exact figures. Be direct — this is an operator tool, not a chatbot. When asked for recommendations, give a clear action with a reason. Never say "I don't have access to" — you have all the data. Keep responses under 150 words unless a detailed breakdown is requested.`;

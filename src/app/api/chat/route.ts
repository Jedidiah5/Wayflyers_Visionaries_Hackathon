import {
  FunctionCallingMode,
  GoogleGenerativeAI,
  SchemaType,
  type FunctionCall,
  type FunctionDeclaration,
  type Part,
} from "@google/generative-ai";
import {
  getAdsData,
  getInventoryData,
  getRefundData,
  getStockoutProjections,
  getSummaryStats,
  getSystemPrompt,
} from "@/lib/data";
import { formatCount, formatGbp, formatPercent, formatRoas } from "@/lib/format";
import { retrieve } from "@/lib/rag";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-001",
];

const MAX_TOOL_ROUNDS = 4;
const MAX_SEARCH_K = 8;

const METRIC_TOPICS = [
  "summary",
  "refunds",
  "ads",
  "inventory",
  "stockouts",
] as const;

type MetricTopic = (typeof METRIC_TOPICS)[number];

type ChatMessage = { role: "user" | "assistant"; content: string };

const TOOL_POLICY = `Use tools to answer questions about Pretty Fly. Do not answer from the briefing numbers above.

- METRICS (revenue, orders, AOV, repeat rate, refund rate, ROAS, ad spend, stock, sell-through, days to stockout): call get_metrics. Every figure in that result was already computed in code. Quote it. Do not add, average, rank, or otherwise recalculate.
- Account totals live in get_metrics.summary: refundRate, googleROAS, metaROAS, totalRevenue, totalAdSpend. Campaign rows in ads are individual campaigns, not those account totals.
- SUPPORT (what customers said, complaints, reasons, examples): call search_support_tickets. Cite the ticket_id of each ticket you use.
- BOTH (a number plus what customers said, for example why refunds are up): call both tools before answering.
- Greetings and general advice do not need a tool.`;

const TOOLS: FunctionDeclaration[] = [
  {
    name: "get_metrics",
    description:
      "Precomputed Pretty Fly business metrics. Use for any number: revenue, orders, AOV, repeat rate, refund rate, ad spend, ROAS, inventory, and stockout projections. Do not use for what customers said.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topics: {
          type: SchemaType.ARRAY,
          description:
            "Which precomputed datasets to return. Omit to return all of them.",
          items: {
            type: SchemaType.STRING,
            format: "enum",
            enum: [...METRIC_TOPICS],
          },
        },
        product: {
          type: SchemaType.STRING,
          description:
            "Optional product or campaign name. Applied as a filter in code, not by you.",
        },
      },
    },
  },
  {
    name: "search_support_tickets",
    description:
      "Search customer support tickets for what customers and agents actually said. Use for complaints, reasons, sizing comments, delivery experience, and examples. Pass the user's question as the query.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "The user's question, in their words.",
        },
        k: {
          type: SchemaType.INTEGER,
          description: "How many tickets to return. Default 6, maximum 8.",
        },
        category: {
          type: SchemaType.STRING,
          description:
            "Optional exact category: sizing_fit, order_status, returns_exchanges, product_quality, discount_code, drop_restock, other.",
        },
        product_id: {
          type: SchemaType.STRING,
          description: "Optional catalog id such as prod_00047.",
        },
      },
      required: ["query"],
    },
  },
];

function getModelList(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  if (preferred) {
    return [preferred, ...FALLBACK_MODELS.filter((model) => model !== preferred)];
  }
  return FALLBACK_MODELS;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function isMetricTopic(value: string): value is MetricTopic {
  return (METRIC_TOPICS as readonly string[]).includes(value);
}

function selectedTopics(value: unknown): MetricTopic[] {
  if (!Array.isArray(value)) return [...METRIC_TOPICS];
  const picked = value.filter(
    (item): item is MetricTopic => typeof item === "string" && isMetricTopic(item)
  );
  return picked.length > 0 ? picked : [...METRIC_TOPICS];
}

function matchesProduct(haystack: string, product: string | undefined): boolean {
  if (!product) return true;
  return haystack.toLowerCase().includes(product.toLowerCase());
}

function runGetMetrics(args: Record<string, unknown>): Record<string, unknown> {
  const topics = selectedTopics(args.topics);
  const product = asString(args.product);
  const result: Record<string, unknown> = {
    note: "Every figure below is precomputed. Quote these values. Do not recalculate them.",
    topics,
  };
  if (product) result.productFilter = product;

  if (topics.includes("summary")) {
    result.summary = {
      ...getSummaryStats(),
      howToRead:
        "These are account totals. refundRate is the refund rate. googleROAS and metaROAS are platform totals, not the best campaign.",
    };
  }

  if (topics.includes("refunds")) {
    const refunds = getRefundData();
    result.refunds = {
      totalRefunds: formatCount(refunds.totalRefunds),
      totalRefundValue: formatGbp(refunds.totalRefundValue),
      sizingRefunds: formatCount(refunds.totalSizingRefunds),
      sizingValue: formatGbp(refunds.totalSizingValue),
      sizingShareOfRefunds: formatPercent(refunds.sizingShareOfRefunds, 0),
      topProducts: refunds.topProducts,
    };
  }

  if (topics.includes("ads")) {
    const ads = getAdsData().filter((row) =>
      matchesProduct(`${row.platform} ${row.campaign}`, product)
    );
    result.ads = ads.map((row) => ({
      campaign: row.campaign,
      platform: row.platform,
      spend: formatGbp(row.spend),
      revenue: formatGbp(row.revenue),
      roas: formatRoas(row.roas),
      verdict: row.verdict,
    }));
  }

  if (topics.includes("inventory")) {
    const rows = getInventoryData().filter((row) =>
      matchesProduct(`${row.product} ${row.sku} ${row.colour} ${row.size}`, product)
    );
    const critical = rows.filter((row) => row.unitsRemaining < 0);
    const warning = rows.filter((row) => row.status === "WARNING");
    const oversoldUnits = critical.reduce(
      (sum, row) => sum + Math.abs(row.unitsRemaining),
      0
    );
    const shown = product ? rows : critical.slice(0, 40);
    result.inventory = {
      variantsInScope: formatCount(rows.length),
      criticalVariants: formatCount(critical.length),
      warningVariants: formatCount(warning.length),
      okVariants: formatCount(rows.filter((row) => row.status === "OK").length),
      oversoldUnits: formatCount(oversoldUnits),
      rows: shown.map((row) => ({
        sku: row.sku,
        product: row.product,
        colour: row.colour,
        size: row.size,
        unitsRemaining: row.unitsRemaining,
        weeklySellRate:
          row.weeklySellRate == null ? null : Number(row.weeklySellRate.toFixed(1)),
        daysToStockout: row.daysToStockout,
        status: row.status,
      })),
      rowsNote: product
        ? "All variants matching the product filter."
        : "Critical variants only, capped at 40. Counts above are the full filtered set.",
    };
  }

  if (topics.includes("stockouts")) {
    const projections = getStockoutProjections().filter((row) =>
      matchesProduct(row.product, product)
    );
    result.stockouts = projections.map((row) => ({
      product: row.product,
      currentStock: row.currentStock,
      weeklySellRate: Number(row.weeklySellRate.toFixed(1)),
      daysRemaining: row.daysRemaining,
    }));
  }

  return result;
}

async function runSearchSupport(
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const query = asString(args.query);
  if (!query) {
    return { error: "query is required" };
  }

  const requestedK = typeof args.k === "number" ? args.k : 6;
  const k = Math.min(MAX_SEARCH_K, Math.max(1, Math.round(requestedK)));
  const category = asString(args.category);
  const productId = asString(args.product_id);

  try {
    const chunks = await retrieve(query, {
      k,
      filters: {
        category,
        product_id: productId,
      },
    });
    return {
      query,
      count: chunks.length,
      tickets: chunks.map((chunk) => ({
        ticket_id: chunk.metadata.ticket_id,
        category: chunk.metadata.category,
        product_id: chunk.metadata.product_id,
        product_name: chunk.metadata.product_name,
        created_at: chunk.metadata.created_at,
        satisfaction_rating: chunk.metadata.satisfaction_rating,
        score: Number(chunk.score.toFixed(3)),
        text: chunk.text,
      })),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Support search failed";
    console.error("[/api/chat] search_support_tickets failed:", message);
    return { error: message };
  }
}

async function executeTool(call: FunctionCall): Promise<Record<string, unknown>> {
  const args = asRecord(call.args);
  if (call.name === "get_metrics") return runGetMetrics(args);
  if (call.name === "search_support_tickets") return runSearchSupport(args);
  return { error: `Unknown tool: ${call.name}` };
}

async function generateReply(
  apiKey: string,
  modelName: string,
  messages: ChatMessage[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `${getSystemPrompt()}\n\n${TOOL_POLICY}`,
    tools: [{ functionDeclarations: TOOLS }],
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingMode.AUTO },
    },
  });

  const last = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  let result = await chat.sendMessage(last.content);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const calls = result.response.functionCalls();
    if (!calls?.length) break;

    console.log(
      `[/api/chat] ${modelName} tool round ${round + 1}:`,
      calls.map((call) => call.name).join(", ")
    );

    const responses: Part[] = [];
    const answered = new Map<string, Record<string, unknown>>();
    for (const call of calls) {
      const key = `${call.name}:${JSON.stringify(call.args ?? {})}`;
      let response = answered.get(key);
      if (!response) {
        response = await executeTool(call);
        answered.set(key, response);
      }
      responses.push({
        functionResponse: {
          name: call.name,
          response,
        },
      });
    }
    result = await chat.sendMessage(responses);
  }

  const trailingCalls = result.response.functionCalls();
  if (trailingCalls?.length) {
    throw new Error("Gemini kept calling tools without answering");
  }

  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}

export async function POST(request: NextRequest) {
  console.log("[/api/chat] POST request received");

  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.error("[/api/chat] GEMINI_API_KEY is missing");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error("[/api/chat] Invalid messages payload:", body);
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from the user" },
        { status: 400 }
      );
    }

    console.log("[/api/chat] Message count:", messages.length);

    const models = getModelList();
    let lastError: unknown;

    for (const modelName of models) {
      try {
        console.log("[/api/chat] Trying model:", modelName);
        const content = await generateReply(apiKey, modelName, messages);
        console.log("[/api/chat] Success with model:", modelName);
        return NextResponse.json({ content, model: modelName });
      } catch (error) {
        lastError = error;
        console.error(`[/api/chat] Model ${modelName} failed:`, error);
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : "All Gemini models failed";

    console.error("[/api/chat] All models failed:", message);
    return NextResponse.json({ error: message.slice(0, 400) }, { status: 500 });
  } catch (error) {
    console.error("[/api/chat] Unhandled error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

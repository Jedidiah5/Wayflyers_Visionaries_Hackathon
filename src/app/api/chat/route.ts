import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-001",
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function getModelList(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  if (preferred) {
    return [preferred, ...FALLBACK_MODELS.filter((m) => m !== preferred)];
  }
  return FALLBACK_MODELS;
}

async function generateReply(
  apiKey: string,
  modelName: string,
  messages: ChatMessage[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });

  const last = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.content);
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
      lastError instanceof Error
        ? lastError.message
        : "All Gemini models failed";

    console.error("[/api/chat] All models failed:", message);
    return NextResponse.json({ error: message.slice(0, 400) }, { status: 500 });
  } catch (error) {
    console.error("[/api/chat] Unhandled error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

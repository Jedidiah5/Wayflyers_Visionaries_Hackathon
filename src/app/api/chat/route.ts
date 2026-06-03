import {
  GoogleGenerativeAI,
  type Content,
} from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

const PREFERRED_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-latest",
].filter(Boolean) as string[];

type ChatMessage = { role: "user" | "assistant"; content: string };

type GeminiModel = {
  name?: string;
  supportedGenerationMethods?: string[];
};

function normalizeModelName(name: string): string {
  return name.replace(/^models\//, "");
}

function isFlashChatModel(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("gemini") &&
    lower.includes("flash") &&
    !lower.includes("live") &&
    !lower.includes("tts") &&
    !lower.includes("embedding") &&
    !lower.includes("audio") &&
    !lower.includes("image")
  );
}

async function resolveModelCandidates(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=100`
    );

    if (response.ok) {
      const data = (await response.json()) as { models?: GeminiModel[] };
      const available = (data.models ?? [])
        .filter(
          (model) =>
            model.name &&
            model.supportedGenerationMethods?.includes("generateContent") &&
            isFlashChatModel(normalizeModelName(model.name))
        )
        .map((model) => normalizeModelName(model.name!));

      const preferred = PREFERRED_MODELS.filter((name) =>
        available.includes(name)
      );
      const remainder = available.filter((name) => !preferred.includes(name));

      if (preferred.length > 0 || remainder.length > 0) {
        return Array.from(new Set([...preferred, ...remainder]));
      }
    }
  } catch (error) {
    console.error("Failed to list Gemini models:", error);
  }

  return Array.from(new Set(PREFERRED_MODELS));
}

function isRetryableModelError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: number; message?: string };
  const message = err.message?.toLowerCase() ?? "";

  return (
    err.status === 404 ||
    err.status === 429 ||
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("429") ||
    message.includes("quota")
  );
}

function formatClientError(error: unknown): { message: string; status: number } {
  if (!error || typeof error !== "object") {
    return { message: "Internal server error", status: 500 };
  }

  const err = error as { status?: number; message?: string };
  const message = err.message ?? "";

  if (err.status === 429 || message.toLowerCase().includes("quota")) {
    return {
      message:
        "Gemini API quota exceeded. Wait a minute and try again, or enable billing in Google AI Studio.",
      status: 429,
    };
  }

  if (err.status === 404 || message.includes("not found")) {
    return {
      message:
        "No compatible Gemini model is available for this API key. Create a key at https://aistudio.google.com/apikey and set GEMINI_MODEL if needed.",
      status: 404,
    };
  }

  if (message.includes("API key not valid")) {
    return {
      message:
        "Invalid Gemini API key. Create one at https://aistudio.google.com/apikey",
      status: 401,
    };
  }

  return {
    message: message.slice(0, 280) || "Internal server error",
    status: err.status && err.status >= 400 ? err.status : 500,
  };
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

  const lastMessage = messages[messages.length - 1];
  const history: Content[] = messages.slice(0, -1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text() || "No response generated.";
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
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

    const models = await resolveModelCandidates(apiKey);
    let lastError: unknown;

    for (const modelName of models) {
      try {
        const content = await generateReply(apiKey, modelName, messages);
        return NextResponse.json({ content, model: modelName });
      } catch (error) {
        lastError = error;
        console.error(`Chat API error (${modelName}):`, error);

        if (!isRetryableModelError(error)) {
          break;
        }
      }
    }

    const { message, status } = formatClientError(lastError);
    return NextResponse.json({ error: message }, { status });
  } catch (error) {
    console.error("Chat API error:", error);
    const { message, status } = formatClientError(error);
    return NextResponse.json({ error: message }, { status });
  }
}

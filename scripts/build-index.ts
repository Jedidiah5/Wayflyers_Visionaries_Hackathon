/**
 * Build a Gemini embedding index over Pretty Fly support tickets.
 *
 *   npx tsx scripts/build-index.ts
 *
 * Reads GEMINI_API_KEY from .env.local. Never prints the key.
 * Writes data/support-index.json.
 */
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import {
  GoogleGenerativeAI,
  TaskType,
} from "@google/generative-ai";

const EMBED_MODEL = "gemini-embedding-001";
const MAX_CHUNK_CHARS = 1500;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 50;
const MAX_RETRIES = 6;

const ROOT = process.cwd();
const PACK_DATA = path.join(
  ROOT,
  "src",
  "app",
  "pretty_fly_data_pack",
  "data"
);
const OUT_DIR = path.join(ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "support-index.json");

interface TicketMessage {
  message_id: string;
  sender: string;
  sender_name: string | null;
  timestamp: string;
  body: string;
}

interface TicketThread {
  ticket_id: string;
  messages: TicketMessage[];
}

interface TicketRow {
  ticket_id: string;
  channel: string;
  category: string;
  subject: string;
  related_product_id: string;
  created_at: string;
  satisfaction_rating: string;
}

interface ProductRow {
  product_id: string;
  title: string;
}

interface ChunkMetadata {
  ticket_id: string;
  category: string;
  product_id: string;
  product_name: string;
  created_at: string;
  satisfaction_rating: number | null;
}

interface SupportChunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
}

interface IndexedChunk extends SupportChunk {
  embedding: number[];
}

function loadEnvLocal(): void {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function speakerLabel(sender: string): string {
  return sender === "customer" ? "Customer" : "Agent";
}

function formatConversation(messages: TicketMessage[]): string {
  return messages
    .map((message) => `${speakerLabel(message.sender)}: ${message.body.trim()}`)
    .join("\n");
}

function headerLine(meta: ChunkMetadata, channel: string, subject: string): string {
  const rating =
    meta.satisfaction_rating == null
      ? "n/a"
      : String(meta.satisfaction_rating);
  return [
    `category: ${meta.category || "unknown"}`,
    `product: ${meta.product_name || "unknown"}`,
    `subject: ${subject || "n/a"}`,
    `channel: ${channel || "unknown"}`,
    `satisfaction: ${rating}`,
    `created: ${meta.created_at || "unknown"}`,
  ].join(" | ");
}

function splitWithOverlap(text: string, size: number, overlap: number): string[] {
  if (text.length <= size) return [text];
  const parts: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const window = text.slice(start, end);
      const breakAt = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(" "));
      if (breakAt > size * 0.6) end = start + breakAt;
    }
    const piece = text.slice(start, end).trim();
    if (piece) parts.push(piece);
    if (end >= text.length) break;
    const next = end - overlap;
    start = next > start ? next : end;
  }
  return parts;
}

function buildChunks(
  threads: TicketThread[],
  tickets: Map<string, TicketRow>,
  products: Map<string, string>
): SupportChunk[] {
  const chunks: SupportChunk[] = [];
  let missingTicket = 0;

  for (const thread of threads) {
    const ticket = tickets.get(thread.ticket_id);
    if (!ticket) {
      missingTicket += 1;
      continue;
    }

    const productId = ticket.related_product_id || "";
    const ratingRaw = ticket.satisfaction_rating?.trim();
    const rating =
      ratingRaw && Number.isFinite(Number(ratingRaw)) ? Number(ratingRaw) : null;

    const metadata: ChunkMetadata = {
      ticket_id: ticket.ticket_id,
      category: ticket.category || "",
      product_id: productId,
      product_name: products.get(productId) ?? "",
      created_at: ticket.created_at || "",
      satisfaction_rating: rating,
    };

    const header = headerLine(metadata, ticket.channel, ticket.subject);
    const conversation = formatConversation(thread.messages ?? []);
    const full = conversation ? `${header}\n${conversation}` : header;

    if (full.length <= MAX_CHUNK_CHARS) {
      chunks.push({ id: ticket.ticket_id, text: full, metadata });
      continue;
    }

    const bodyBudget = Math.max(400, MAX_CHUNK_CHARS - header.length - 1);
    const pieces = splitWithOverlap(conversation || header, bodyBudget, CHUNK_OVERLAP);
    pieces.forEach((piece, index) => {
      const text = conversation ? `${header}\n${piece}` : piece;
      chunks.push({
        id: pieces.length === 1 ? ticket.ticket_id : `${ticket.ticket_id}#${index + 1}`,
        text,
        metadata,
      });
    });
  }

  if (missingTicket > 0) {
    console.warn(`[index] skipped ${missingTicket} threads with no matching ticket row`);
  }

  return chunks;
}

function isRateLimit(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|rate limit|resource_exhausted|quota/i.test(message);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedBatch(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  texts: string[]
): Promise<number[][]> {
  let attempt = 0;
  while (true) {
    try {
      const response = await model.batchEmbedContents({
        requests: texts.map((text) => ({
          content: { role: "user", parts: [{ text }] },
          taskType: TaskType.RETRIEVAL_DOCUMENT,
        })),
      });
      return response.embeddings.map((item) => item.values);
    } catch (error) {
      attempt += 1;
      if (!isRateLimit(error) || attempt > MAX_RETRIES) throw error;
      const waitMs = 1000 * 2 ** attempt;
      console.warn(
        `[index] rate limited, retry ${attempt}/${MAX_RETRIES} in ${waitMs}ms`
      );
      await sleep(waitMs);
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env.local");
  }

  const threads = JSON.parse(
    fs.readFileSync(path.join(PACK_DATA, "support_messages.json"), "utf-8")
  ) as TicketThread[];

  const ticketParsed = Papa.parse<TicketRow>(
    fs.readFileSync(path.join(PACK_DATA, "support_tickets.csv"), "utf-8"),
    { header: true, skipEmptyLines: true }
  );
  const productParsed = Papa.parse<ProductRow>(
    fs.readFileSync(path.join(PACK_DATA, "products.csv"), "utf-8"),
    { header: true, skipEmptyLines: true }
  );

  const tickets = new Map(ticketParsed.data.map((row) => [row.ticket_id, row]));
  const products = new Map(productParsed.data.map((row) => [row.product_id, row.title]));

  const chunks = buildChunks(threads, tickets, products);
  console.log(
    `[index] ${threads.length} threads, ${tickets.size} tickets, ${chunks.length} chunks`
  );
  console.log(`[index] embedding with ${EMBED_MODEL} (RETRIEVAL_DOCUMENT)`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: EMBED_MODEL });

  const indexed: IndexedChunk[] = [];
  for (let offset = 0; offset < chunks.length; offset += BATCH_SIZE) {
    const batch = chunks.slice(offset, offset + BATCH_SIZE);
    const vectors = await embedBatch(
      model,
      batch.map((chunk) => chunk.text)
    );
    if (vectors.length !== batch.length) {
      throw new Error(
        `Embedding batch size mismatch: expected ${batch.length}, got ${vectors.length}`
      );
    }
    batch.forEach((chunk, index) => {
      indexed.push({ ...chunk, embedding: vectors[index] });
    });
    console.log(
      `[index] embedded ${Math.min(offset + BATCH_SIZE, chunks.length)}/${chunks.length}`
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(indexed));
  const bytes = fs.statSync(OUT_FILE).size;
  console.log(
    `[index] wrote ${indexed.length} chunks to ${path.relative(ROOT, OUT_FILE)} (${(bytes / (1024 * 1024)).toFixed(1)} MB)`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[index] failed: ${message}`);
  process.exit(1);
});

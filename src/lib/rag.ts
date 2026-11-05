import "server-only";

import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { getDataDir } from "./data-path";

/** Must match the model used by scripts/build-index.ts. */
const EMBED_MODEL = "gemini-embedding-001";

/**
 * Raw cosine floor. Gemini embeddings are unit length, so this is also the
 * dot product. Chunks under this are unrelated enough that sending them to
 * the model adds noise. The hybrid boost is applied only after this cut,
 * so a keyword match cannot rescue an off-topic ticket.
 */
const MIN_SIMILARITY = 0.35;

/** Added when the chunk's product_name is one the question names. */
const PRODUCT_BOOST = 0.08;

/** Added when the chunk's category is one the question keywords map to. */
const CATEGORY_BOOST = 0.05;

/**
 * Spoken words do not match the CSV category ids, so the boost maps them.
 * "delivery" has no category of its own; those tickets are filed as order_status.
 */
const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: "sizing_fit", keywords: ["sizing", "size", "sizes", "fit"] },
  {
    category: "order_status",
    keywords: ["delivery", "deliveries", "shipping", "shipped"],
  },
  {
    category: "returns_exchanges",
    keywords: ["refund", "refunds", "return", "returns"],
  },
  { category: "product_quality", keywords: ["quality"] },
  {
    category: "discount_code",
    keywords: ["discount", "discounts"],
  },
];

export interface ChunkMetadata {
  ticket_id: string;
  category: string;
  product_id: string;
  product_name: string;
  created_at: string;
  satisfaction_rating: number | null;
}

export interface IndexedChunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
  embedding: number[];
}

export interface RetrievalFilters {
  category?: string;
  product_id?: string;
  /** Inclusive ISO date or datetime. Compared against metadata.created_at. */
  from?: string;
  /** Inclusive ISO date or datetime. Compared against metadata.created_at. */
  to?: string;
}

export interface RetrieveOptions {
  k?: number;
  filters?: RetrievalFilters;
}

export interface RetrievedChunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
  /** Cosine similarity after the hybrid boost. This is the ranking score. */
  score: number;
  /** Cosine similarity before any boost. */
  similarity: number;
}

let indexCache: IndexedChunk[] | null = null;
let productNamesCache: string[] | null = null;

function indexPath(): string {
  return path.join(process.cwd(), "data", "support-index.json");
}

function loadIndex(): IndexedChunk[] {
  if (indexCache) return indexCache;
  const filePath = indexPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(
      "Support index not found at data/support-index.json. Run npm run index first."
    );
  }
  indexCache = JSON.parse(fs.readFileSync(filePath, "utf-8")) as IndexedChunk[];
  return indexCache;
}

function loadProductNames(): string[] {
  if (productNamesCache) return productNamesCache;
  const parsed = Papa.parse<{ title: string }>(
    fs.readFileSync(path.join(getDataDir(), "products.csv"), "utf-8"),
    { header: true, skipEmptyLines: true }
  );
  const names = Array.from(
    new Set(
      parsed.data
        .map((row) => row.title?.trim())
        .filter((title): title is string => Boolean(title))
    )
  ).sort((a, b) => b.length - a.length);
  productNamesCache = names;
  return productNamesCache;
}

function normalize(value: string): string {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

function cosine(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function passesFilters(metadata: ChunkMetadata, filters?: RetrievalFilters): boolean {
  if (!filters) return true;
  if (filters.category && metadata.category !== filters.category) return false;
  if (filters.product_id && metadata.product_id !== filters.product_id) return false;

  const created = Date.parse(metadata.created_at);
  if (filters.from) {
    const from = Date.parse(filters.from);
    if (!Number.isFinite(created) || created < from) return false;
  }
  if (filters.to) {
    const to = Date.parse(filters.to);
    if (!Number.isFinite(created) || created > to) return false;
  }
  return true;
}

interface QuestionHints {
  products: Set<string>;
  categories: Set<string>;
}

/**
 * Hybrid boost, kept deliberately small and computed once per question.
 *
 * 1. Product: walk catalog titles longest-first. If the normalised question
 *    contains the full title ("womens relaxed hoodie"), that product is
 *    marked and removed from the question so a shorter title inside it
 *    ("relaxed hoodie") is not also matched. Each matched product_name
 *    gets PRODUCT_BOOST.
 * 2. Category: if the question contains a keyword from CATEGORY_KEYWORDS,
 *    chunks in that category get CATEGORY_BOOST. A question can hit more
 *    than one category ("refunds and sizing"); a chunk is boosted once,
 *    for its own category only.
 *
 * The boost is added only after the similarity floor, so a keyword match
 * reorders relevant tickets and cannot pull in an unrelated one.
 */
function detectHints(question: string): QuestionHints {
  const questionNorm = normalize(question);
  let remaining = questionNorm;
  const products = new Set<string>();

  for (const name of loadProductNames()) {
    const needle = normalize(name).trim();
    if (needle.length < 3) continue;
    const padded = ` ${needle} `;
    if (!remaining.includes(padded)) continue;
    products.add(name.toLowerCase());
    remaining = remaining.split(padded).join(" ");
  }

  const categories = new Set<string>();
  for (const entry of CATEGORY_KEYWORDS) {
    const mentioned = entry.keywords.some((keyword) =>
      questionNorm.includes(` ${keyword} `)
    );
    if (mentioned) categories.add(entry.category);
  }

  return { products, categories };
}

function hybridBoost(hints: QuestionHints, metadata: ChunkMetadata): number {
  let boost = 0;
  if (hints.products.has(metadata.product_name.trim().toLowerCase())) {
    boost += PRODUCT_BOOST;
  }
  if (hints.categories.has(metadata.category)) {
    boost += CATEGORY_BOOST;
  }
  return boost;
}

export async function embedQuery(question: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: EMBED_MODEL });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text: question }] },
    taskType: TaskType.RETRIEVAL_QUERY,
  });

  const values = result.embedding?.values;
  if (!values?.length) {
    throw new Error("Gemini returned an empty query embedding");
  }
  return values;
}

export async function retrieve(
  question: string,
  options: RetrieveOptions = {}
): Promise<RetrievedChunk[]> {
  const k = options.k ?? 6;
  const filters = options.filters;
  const index = loadIndex();
  const hints = detectHints(question);
  const queryEmbedding = await embedQuery(question);

  const ranked: RetrievedChunk[] = [];
  for (const chunk of index) {
    if (!passesFilters(chunk.metadata, filters)) continue;
    const similarity = cosine(queryEmbedding, chunk.embedding);
    if (similarity < MIN_SIMILARITY) continue;
    ranked.push({
      id: chunk.id,
      text: chunk.text,
      metadata: chunk.metadata,
      similarity,
      score: similarity + hybridBoost(hints, chunk.metadata),
    });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, k);
}

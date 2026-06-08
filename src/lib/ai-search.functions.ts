import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string().trim().min(1).max(500),
});

type CatalogEntry = {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  badge?: string;
};

async function loadCatalog(): Promise<CatalogEntry[]> {
  const { products } = await import("@/lib/products");
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    badge: p.badge,
  }));
}

async function callLovableAI(body: Record<string, unknown>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Search is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as {
    choices: Array<{
      message: {
        content?: string | null;
        tool_calls?: Array<{ function: { name: string; arguments: string } }>;
      };
    }>;
  };
}

/* ============================================================
   FULL SEARCH: returns ranked product IDs + AI explanation
   ============================================================ */
export type AISearchResult = {
  query: string;
  detected_language: "en" | "fr" | "rw";
  explanation: string;
  product_ids: string[];
  category?: "Lighting" | "CCTV" | "Electrical" | null;
  max_price?: number | null;
  suggested_categories: string[];
};

const SEARCH_SYSTEM = `You are the product search assistant for LISA VOLT LINK, a Rwandan online shop selling lighting, CCTV cameras, and electrical accessories.

Customers may write in English, French, or Kinyarwanda (e.g. "amashanyarazi" = electricity, "umuriro" = light/fire). Be lenient with typos, synonyms, and use-case descriptions ("light that turns on when someone walks in" -> motion-sensor lighting). Extract a max price if the query mentions one (e.g. "under 20000 RWF").

You will receive a JSON catalog. Choose the products that best match the customer intent and rank them most-relevant first. Write a one-sentence explanation in the customer's detected language describing what you searched for. If nothing matches, return an empty product list and suggest 1-3 related categories.`;

const searchTool = {
  type: "function",
  function: {
    name: "return_search_results",
    description: "Return ranked search results for the customer query.",
    parameters: {
      type: "object",
      properties: {
        detected_language: { type: "string", enum: ["en", "fr", "rw"] },
        explanation: { type: "string" },
        product_ids: { type: "array", items: { type: "string" } },
        category: { type: "string", enum: ["Lighting", "CCTV", "Electrical"] },
        max_price: { type: "number" },
        suggested_categories: { type: "array", items: { type: "string" } },
      },
      required: ["detected_language", "explanation", "product_ids"],
      additionalProperties: false,
    },
  },
} as const;

export const aiSearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuerySchema.parse(d))
  .handler(async ({ data }): Promise<AISearchResult> => {
    const catalog = await loadCatalog();
    const json = await callLovableAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SEARCH_SYSTEM },
        {
          role: "user",
          content: `CATALOG (JSON):\n${JSON.stringify(catalog)}\n\nCUSTOMER QUERY: ${data.query}`,
        },
      ],
      tools: [searchTool],
      tool_choice: { type: "function", function: { name: "return_search_results" } },
    });
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return {
        query: data.query,
        detected_language: "en",
        explanation: "We could not understand the query. Try a few different words.",
        product_ids: [],
        suggested_categories: [],
      };
    }
    const parsed = JSON.parse(call.function.arguments) as Partial<AISearchResult>;
    const validIds = new Set(catalog.map((c) => c.id));
    return {
      query: data.query,
      detected_language: parsed.detected_language ?? "en",
      explanation: parsed.explanation ?? "",
      product_ids: (parsed.product_ids ?? []).filter((id) => validIds.has(id)),
      category: parsed.category ?? null,
      max_price: parsed.max_price ?? null,
      suggested_categories: parsed.suggested_categories ?? [],
    };
  });

/* ============================================================
   LIVE SUGGESTIONS: lightweight, ranked top matches
   ============================================================ */
export type AISuggestResult = {
  product_ids: string[];
  categories: string[];
};

const SUGGEST_SYSTEM = `You suggest products for a Rwandan electrical/lighting/CCTV shop as the user is typing. Be fast and lenient with typos, synonyms, English/French/Kinyarwanda. Return up to 5 best-matching product IDs and 0-3 matching category names (Lighting, CCTV, Electrical, or subcategory names you see in the catalog).`;

const suggestTool = {
  type: "function",
  function: {
    name: "return_suggestions",
    parameters: {
      type: "object",
      properties: {
        product_ids: { type: "array", items: { type: "string" } },
        categories: { type: "array", items: { type: "string" } },
      },
      required: ["product_ids", "categories"],
      additionalProperties: false,
    },
  },
} as const;

export const aiSuggest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => QuerySchema.parse(d))
  .handler(async ({ data }): Promise<AISuggestResult> => {
    const catalog = await loadCatalog();
    // Tiny prompt: id+name+subcategory only
    const slim = catalog.map((c) => `${c.id}|${c.name}|${c.subcategory}|${c.category}`).join("\n");
    const json = await callLovableAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SUGGEST_SYSTEM },
        { role: "user", content: `CATALOG (id|name|subcategory|category):\n${slim}\n\nTYPING: ${data.query}` },
      ],
      tools: [suggestTool],
      tool_choice: { type: "function", function: { name: "return_suggestions" } },
    });
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return { product_ids: [], categories: [] };
    const parsed = JSON.parse(call.function.arguments) as Partial<AISuggestResult>;
    const validIds = new Set(catalog.map((c) => c.id));
    return {
      product_ids: (parsed.product_ids ?? []).filter((id) => validIds.has(id)).slice(0, 5),
      categories: (parsed.categories ?? []).slice(0, 3),
    };
  });

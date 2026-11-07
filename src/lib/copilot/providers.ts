import { isIP } from "node:net";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export type ProviderId = "openai" | "openrouter" | "agentrouter";

export type ProviderConfig = {
  id: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  extraHeaders?: Record<string, string>;
  jsonMode: boolean;
};

type CopilotDb = {
  enabled?: boolean;
  preferred_provider?: string;
  system_prompt_extra?: string;
  openai_api_key?: string;
  openai_model?: string;
  openai_base_url?: string;
  openrouter_api_key?: string;
  openrouter_model?: string;
  agentrouter_api_key?: string;
  agentrouter_base_url?: string;
  agentrouter_model?: string;
};

function normalizeOpenAiBase(raw: string, fallback: string): string {
  let base = (raw || fallback).trim().replace(/\/$/, "");
  if (!base) base = fallback;
  if (!/\/v1$/i.test(base) && !/\/v1\//i.test(base)) base = `${base}/v1`;
  return base.replace(/\/$/, "");
}

function safeProviderBase(raw: string, fallback: string): string | null {
  try {
    const base = normalizeOpenAiBase(raw, fallback);
    const url = new URL(base);
    const host = url.hostname.toLowerCase().replace(/^\\[|\\]$/g, "").replace(/\\.$/, "");
    if (
      url.protocol !== "https:" ||
      url.username || url.password ||
      isIP(host) !== 0 ||
      host === "localhost" || host.endsWith(".localhost") ||
      host.endsWith(".local") || host.endsWith(".internal") ||
      host.endsWith(".test")
    ) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function loadCopilotDb(): Promise<CopilotDb> {
  if (!isNeonConfigured()) return {};
  try {
    const sql = getSql()!;
    const rows = await sql`SELECT value FROM site_settings WHERE key = 'copilot' LIMIT 1`;
    if (!rows[0]) return {};
    const v = (rows[0] as { value: unknown }).value;
    return (typeof v === "object" && v ? (v as CopilotDb) : {}) as CopilotDb;
  } catch {
    return {};
  }
}

/** Resolve providers from Admin → Copilot DB settings, falling back to env vars. */
export async function listProviders(): Promise<ProviderConfig[]> {
  const db = await loadCopilotDb();
  if (db.enabled === false) return [];
  const preferred = (
    db.preferred_provider ||
    process.env.COPILOT_PROVIDER ||
    ""
  ).toLowerCase() as ProviderId | "";

  const candidates: ProviderConfig[] = [];

  const agentKey =
    db.agentrouter_api_key ||
    process.env.AGENTROUTER_API_KEY ||
    process.env.AGENTIC_API_KEY ||
    "";
  if (agentKey) {
    const rawBase =
      db.agentrouter_base_url ||
      process.env.AGENTROUTER_BASE_URL ||
      process.env.AGENTIC_API_BASE_URL ||
      "https://agentrouter.org/v1";
    const baseUrl = safeProviderBase(rawBase, "https://agentrouter.org/v1");
    if (baseUrl) {
      candidates.push({
        id: "agentrouter",
        baseUrl,
        apiKey: agentKey,
        model:
          db.agentrouter_model ||
          process.env.AGENTROUTER_MODEL ||
          process.env.OPENAI_MODEL ||
          "gpt-4o-mini",
        extraHeaders: { "User-Agent": "TapPath-Copilot/1.0" },
        jsonMode: process.env.AGENTROUTER_JSON_MODE === "true",
      });
    }
  }

  const openaiKey = db.openai_api_key || process.env.OPENAI_API_KEY || "";
  if (openaiKey) {
    const baseUrl = safeProviderBase(
      db.openai_base_url || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      "https://api.openai.com/v1"
    );
    if (baseUrl) candidates.push({
      id: "openai",
      baseUrl,
      apiKey: openaiKey,
      model: db.openai_model || process.env.OPENAI_MODEL || "gpt-4o-mini",
      jsonMode: true,
    });
  }

  const orKey = db.openrouter_api_key || process.env.OPENROUTER_API_KEY || "";
  if (orKey) {
    const baseUrl = safeProviderBase(
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      "https://openrouter.ai/api/v1"
    );
    if (baseUrl) candidates.push({
      id: "openrouter",
      baseUrl,
      apiKey: orKey,
      model: db.openrouter_model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      extraHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://tappath.com",
        "X-Title": "TapPath Copilot",
      },
      jsonMode: true,
    });
  }

  if (!preferred) return candidates;
  const preferredList = candidates.filter((c) => c.id === preferred);
  const rest = candidates.filter((c) => c.id !== preferred);
  return [...preferredList, ...rest];
}

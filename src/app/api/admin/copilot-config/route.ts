import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

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

async function readDbConfig(): Promise<CopilotDb> {
  if (!isNeonConfigured()) return {};
  try {
    const sql = getSql()!;
    const rows = await sql`
      SELECT value FROM site_settings WHERE key = 'copilot' LIMIT 1
    `;
    if (!rows[0]) return {};
    const v = (rows[0] as { value: unknown }).value;
    return (typeof v === "object" && v ? (v as CopilotDb) : {}) as CopilotDb;
  } catch {
    return {};
  }
}

function maskKey(key?: string) {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••" + key.slice(-4);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  const db = await readDbConfig();

  const providers = {
    openai: Boolean(db.openai_api_key || process.env.OPENAI_API_KEY),
    openrouter: Boolean(db.openrouter_api_key || process.env.OPENROUTER_API_KEY),
    agentrouter: Boolean(
      db.agentrouter_api_key || process.env.AGENTROUTER_API_KEY || process.env.AGENTIC_API_KEY
    ),
  };

  return NextResponse.json({
    backend: isNeonConfigured() ? "neon" : "mock",
    env: {
      providers,
      preferred: (process.env.COPILOT_PROVIDER || "").toLowerCase() || null,
      models: {
        openai: db.openai_model || process.env.OPENAI_MODEL || "gpt-4o-mini",
        openrouter: db.openrouter_model || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        agentrouter: db.agentrouter_model || process.env.AGENTROUTER_MODEL || "gpt-4o-mini",
      },
    },
    db: {
      enabled: db.enabled !== false,
      preferred_provider: db.preferred_provider || "",
      system_prompt_extra: db.system_prompt_extra || "",
      openai_api_key_set: Boolean(db.openai_api_key),
      openai_api_key_masked: maskKey(db.openai_api_key),
      openai_model: db.openai_model || "",
      openai_base_url: db.openai_base_url || "",
      openrouter_api_key_set: Boolean(db.openrouter_api_key),
      openrouter_api_key_masked: maskKey(db.openrouter_api_key),
      openrouter_model: db.openrouter_model || "",
      agentrouter_api_key_set: Boolean(db.agentrouter_api_key),
      agentrouter_api_key_masked: maskKey(db.agentrouter_api_key),
      agentrouter_base_url: db.agentrouter_base_url || "",
      agentrouter_model: db.agentrouter_model || "",
    },
  });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await readDbConfig();

  const str = (k: string, max = 500) =>
    body[k] !== undefined ? String(body[k] || "").trim().slice(0, max) : undefined;

  const nextKey = (field: keyof CopilotDb, incoming?: string) => {
    if (incoming === undefined) return existing[field];
    if (incoming === "") return existing[field];
    if (incoming === "__CLEAR__") return "";
    return incoming;
  };

  const safe: CopilotDb = {
    enabled: body.enabled !== false,
    preferred_provider: str("preferred_provider", 40) ?? existing.preferred_provider ?? "",
    system_prompt_extra: str("system_prompt_extra", 2000) ?? existing.system_prompt_extra ?? "",
    openai_api_key: nextKey("openai_api_key", str("openai_api_key", 200)) as string | undefined,
    openai_model: str("openai_model", 80) ?? existing.openai_model ?? "",
    openai_base_url: str("openai_base_url", 200) ?? existing.openai_base_url ?? "",
    openrouter_api_key: nextKey("openrouter_api_key", str("openrouter_api_key", 200)) as string | undefined,
    openrouter_model: str("openrouter_model", 80) ?? existing.openrouter_model ?? "",
    agentrouter_api_key: nextKey("agentrouter_api_key", str("agentrouter_api_key", 200)) as string | undefined,
    agentrouter_base_url: str("agentrouter_base_url", 200) ?? existing.agentrouter_base_url ?? "",
    agentrouter_model: str("agentrouter_model", 80) ?? existing.agentrouter_model ?? "",
  };

  const sql = getSql()!;
  try {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('copilot', ${JSON.stringify(safe)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return NextResponse.json({
      ok: true,
      config: {
        ...safe,
        openai_api_key: maskKey(safe.openai_api_key),
        openrouter_api_key: maskKey(safe.openrouter_api_key),
        agentrouter_api_key: maskKey(safe.agentrouter_api_key),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

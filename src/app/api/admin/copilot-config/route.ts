import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  const providers = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    agentrouter: Boolean(process.env.AGENTROUTER_API_KEY),
  };
  const preferred = (process.env.COPILOT_PROVIDER || "").toLowerCase() || null;

  let dbConfig: Record<string, unknown> = {};
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        SELECT value FROM site_settings WHERE key = 'copilot' LIMIT 1
      `;
      if (rows[0]) {
        const v = (rows[0] as { value: unknown }).value;
        dbConfig = (typeof v === "object" && v ? (v as Record<string, unknown>) : {}) as Record<
          string,
          unknown
        >;
      }
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    backend: isNeonConfigured() ? "neon" : "mock",
    env: {
      providers,
      preferred,
      models: {
        openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
        openrouter: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        agentrouter: process.env.AGENTROUTER_MODEL || "default",
      },
    },
    db: dbConfig,
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

  const safe = {
    enabled: body.enabled !== false,
    preferred_provider: String(body.preferred_provider || ""),
    system_prompt_extra: String(body.system_prompt_extra || "").slice(0, 2000),
  };

  const sql = getSql()!;
  try {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('copilot', ${JSON.stringify(safe)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return NextResponse.json({ ok: true, db: safe });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

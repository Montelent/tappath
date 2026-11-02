import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { SITE_SETTINGS_DEFAULTS, type SiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

function unwrapValue(v: unknown): unknown {
  if (v && typeof v === "object" && !Array.isArray(v) && "value" in (v as object)) {
    return (v as { value: unknown }).value;
  }
  return v;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  if (!isNeonConfigured()) {
    return NextResponse.json({ backend: "mock", settings: SITE_SETTINGS_DEFAULTS });
  }

  const sql = getSql()!;
  try {
    const rows = await sql`SELECT key, value FROM site_settings`;
    const settings: Record<string, unknown> = { ...SITE_SETTINGS_DEFAULTS };
    for (const r of rows as { key: string; value: unknown }[]) {
      settings[r.key] = unwrapValue(r.value);
    }
    return NextResponse.json({ backend: "neon", settings });
  } catch (e) {
    return NextResponse.json({
      backend: "neon",
      settings: SITE_SETTINGS_DEFAULTS,
      error: e instanceof Error ? e.message : "Query failed",
      hint: "Create site_settings table if missing",
    });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: { settings?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const incoming = body.settings || {};
  const sql = getSql()!;

  const allowed = new Set(Object.keys(SITE_SETTINGS_DEFAULTS));

  try {
    for (const [key, value] of Object.entries(incoming)) {
      if (!allowed.has(key)) continue;
      const def = SITE_SETTINGS_DEFAULTS[key as keyof SiteSettings];
      let toStore: unknown = value;
      if (typeof def === "boolean") {
        toStore = value === true || value === "true";
      } else if (Array.isArray(def)) {
        toStore = Array.isArray(value) ? value : def;
      } else if (typeof def === "string") {
        toStore = value == null ? "" : String(value);
      }
      const json = JSON.stringify(toStore);
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${key}, ${json}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
    }
    return NextResponse.json({ ok: true, backend: "neon" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

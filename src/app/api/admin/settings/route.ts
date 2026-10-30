import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, unknown> = {
  site_name: "TapPath",
  site_tagline: "Visual step-by-step smartphone guides",
  support_email: "support@tappath.com",
  homepage_hero_title: "Find any phone setting in seconds",
  homepage_hero_subtitle: "Interactive guides for Samsung, Xiaomi, Google Pixel, and more.",
  maintenance_mode: false,
  allow_signups: true,
  default_locale: "en",
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  if (!isNeonConfigured()) {
    return NextResponse.json({ backend: "mock", settings: DEFAULTS });
  }

  const sql = getSql()!;
  try {
    const rows = await sql`SELECT key, value FROM site_settings`;
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const r of rows as { key: string; value: unknown }[]) {
      const v = r.value;
      if (v && typeof v === "object" && !Array.isArray(v) && "value" in (v as object)) {
        settings[r.key] = (v as { value: unknown }).value;
      } else {
        settings[r.key] = v;
      }
    }
    return NextResponse.json({ backend: "neon", settings });
  } catch (e) {
    return NextResponse.json({
      backend: "neon",
      settings: DEFAULTS,
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
  const settings = body.settings || {};
  const sql = getSql()!;

  try {
    for (const [key, value] of Object.entries(settings)) {
      const json = JSON.stringify(value);
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

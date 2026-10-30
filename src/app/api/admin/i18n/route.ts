import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { dictionaries, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj == null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, path));
    } else {
      out[path] = String(v ?? "");
    }
  }
  return out;
}

function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== "object" || cur[p] == null) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  const locale = (req.nextUrl.searchParams.get("locale") || "en") as Locale;
  const base = dictionaries[locale] || dictionaries.en;
  const flat = flatten(base);

  let overrides: Record<string, string> = {};
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        SELECT value FROM site_settings WHERE key = ${`i18n_${locale}`} LIMIT 1
      `;
      if (rows[0]) {
        const v = (rows[0] as { value: unknown }).value;
        if (v && typeof v === "object") {
          overrides = flatten(v);
        }
      }
    } catch {
      /* ignore */
    }
  }

  const merged = { ...flat, ...overrides };
  return NextResponse.json({
    backend: isNeonConfigured() ? "neon" : "mock",
    locale,
    keys: Object.keys(merged).sort(),
    values: merged,
    overrideKeys: Object.keys(overrides),
  });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

  let body: { locale?: string; overrides?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const locale = (body.locale === "de" ? "de" : "en") as Locale;
  const overrides = body.overrides || {};
  const nested: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(overrides)) {
    if (!path || value == null) continue;
    setPath(nested, path, String(value));
  }

  const sql = getSql()!;
  try {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${`i18n_${locale}`}, ${JSON.stringify(nested)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `;
    return NextResponse.json({ ok: true, locale, keys: Object.keys(overrides).length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

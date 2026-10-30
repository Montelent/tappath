import { NextRequest, NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { requireAdmin } from "@/lib/session";

const ALLOWED = new Set([
  "brands",
  "topics",
  "devices",
  "glossary_terms",
  "guides",
  "forum_topics",
  "forum_replies",
  "site_settings",
  "guide_feedback",
  "profiles",
]);

type Ctx = { params: Promise<{ table: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });

  const { table } = await ctx.params;
  if (!ALLOWED.has(table)) return NextResponse.json({ error: "Unknown table" }, { status: 400 });

  if (!isNeonConfigured()) {
    return NextResponse.json({
      error: "Set DATABASE_URL (Neon) on Vercel.",
      usingSupabase: false,
      rows: [],
    });
  }

  const sql = getSql()!;
  try {
    const rows = await sql`SELECT * FROM ${sql(table)} LIMIT 500`;
    return NextResponse.json({ rows, usingSupabase: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Query failed", rows: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { table } = await ctx.params;
  if (!ALLOWED.has(table)) return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  if (!isNeonConfigured()) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  delete body.id;

  const sql = getSql()!;
  try {
    const json = JSON.stringify(body);
    const rows = await sql`
      INSERT INTO ${sql(table)}
      SELECT * FROM json_populate_record(null::${sql(table)}, ${json}::json)
      RETURNING *
    `;
    return NextResponse.json({ row: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Insert failed" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { table } = await ctx.params;
  if (!ALLOWED.has(table)) return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  if (!isNeonConfigured()) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sql = getSql()!;
  try {
    const existing = await sql`SELECT * FROM ${sql(table)} WHERE id::text = ${id} LIMIT 1`;
    if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const merged = { ...(existing[0] as object), ...body };
    delete (merged as { updated_at?: unknown }).updated_at;
    const json = JSON.stringify(merged);
    await sql`DELETE FROM ${sql(table)} WHERE id::text = ${id}`;
    const rows = await sql`
      INSERT INTO ${sql(table)}
      SELECT * FROM json_populate_record(null::${sql(table)}, ${json}::json)
      RETURNING *
    `;
    return NextResponse.json({ row: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { table } = await ctx.params;
  if (!ALLOWED.has(table)) return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  if (!isNeonConfigured()) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sql = getSql()!;
  try {
    await sql`DELETE FROM ${sql(table)} WHERE id::text = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 400 }
    );
  }
}

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
    const rows = await sql`SELECT * FROM ${sql(table)} ORDER BY updated_at DESC NULLS LAST LIMIT 500`;
    return NextResponse.json({ rows, usingSupabase: true });
  } catch {
    try {
      const rows = await sql`SELECT * FROM ${sql(table)} LIMIT 500`;
      return NextResponse.json({ rows, usingSupabase: true });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Query failed", rows: [], usingSupabase: true },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  const { table } = await ctx.params;
  if (!ALLOWED.has(table)) return NextResponse.json({ error: "Unknown table" }, { status: 400 });
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set — cannot write to database" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  delete body.id;
  delete body.created_at;
  delete body.updated_at;

  const sql = getSql()!;
  try {
    if (table === "guides") {
      const row = await insertGuide(sql, body);
      return NextResponse.json({ row }, { status: 201 });
    }
    if (table === "brands") {
      const row = await insertBrand(sql, body);
      return NextResponse.json({ row }, { status: 201 });
    }
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
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set — cannot write to database" }, { status: 503 });
  }

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
    if (table === "guides") {
      const row = await updateGuide(sql, id, body);
      return NextResponse.json({ row });
    }
    if (table === "brands") {
      const row = await updateBrand(sql, id, body);
      return NextResponse.json({ row });
    }
    const existing = await sql`SELECT * FROM ${sql(table)} WHERE id::text = ${id} LIMIT 1`;
    if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const merged = { ...(existing[0] as object), ...body };
    delete (merged as { updated_at?: unknown }).updated_at;
    delete (merged as { created_at?: unknown }).created_at;
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
  if (!isNeonConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  }

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

type Sql = NonNullable<ReturnType<typeof getSql>>;

async function insertGuide(sql: Sql, b: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO guides (
      slug, brand, brand_slug, product_line, title, short_description,
      updated_label, read_time, category, versions, article, faqs,
      related, compatible_devices, confirmations, forum_verified, published
    ) VALUES (
      ${String(b.slug || "")},
      ${String(b.brand || "")},
      ${String(b.brand_slug || "")},
      ${String(b.product_line || "")},
      ${String(b.title || "")},
      ${String(b.short_description || "")},
      ${String(b.updated_label || "")},
      ${String(b.read_time || "2 min")},
      ${String(b.category || "General")},
      ${JSON.stringify(b.versions || [])}::jsonb,
      ${JSON.stringify(b.article || [])}::jsonb,
      ${JSON.stringify(b.faqs || [])}::jsonb,
      ${JSON.stringify(b.related || [])}::jsonb,
      ${JSON.stringify(b.compatible_devices || [])}::jsonb,
      ${Number(b.confirmations) || 0},
      ${Boolean(b.forum_verified)},
      ${Boolean(b.published)}
    )
    RETURNING *
  `;
  return rows[0];
}

async function updateGuide(sql: Sql, id: string, b: Record<string, unknown>) {
  const rows = await sql`
    UPDATE guides SET
      slug = ${String(b.slug || "")},
      brand = ${String(b.brand || "")},
      brand_slug = ${String(b.brand_slug || "")},
      product_line = ${String(b.product_line || "")},
      title = ${String(b.title || "")},
      short_description = ${String(b.short_description || "")},
      updated_label = ${String(b.updated_label || "")},
      read_time = ${String(b.read_time || "2 min")},
      category = ${String(b.category || "General")},
      versions = ${JSON.stringify(b.versions || [])}::jsonb,
      article = ${JSON.stringify(b.article || [])}::jsonb,
      faqs = ${JSON.stringify(b.faqs || [])}::jsonb,
      related = ${JSON.stringify(b.related || [])}::jsonb,
      compatible_devices = ${JSON.stringify(b.compatible_devices || [])}::jsonb,
      confirmations = ${Number(b.confirmations) || 0},
      forum_verified = ${Boolean(b.forum_verified)},
      published = ${Boolean(b.published)}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Guide not found");
  return rows[0];
}

async function insertBrand(sql: Sql, b: Record<string, unknown>) {
  const rows = await sql`
    INSERT INTO brands (
      slug, name, color, description, guides_count, devices_count,
      product_lines, top_guides, devices_list, seo_updates, seo_help,
      published, sort_order
    ) VALUES (
      ${String(b.slug || "")},
      ${String(b.name || "")},
      ${String(b.color || "bg-blue-500")},
      ${String(b.description || "")},
      ${Number(b.guides_count) || 0},
      ${Number(b.devices_count) || 0},
      ${JSON.stringify(b.product_lines || [])}::jsonb,
      ${JSON.stringify(b.top_guides || [])}::jsonb,
      ${JSON.stringify(b.devices_list || [])}::jsonb,
      ${String(b.seo_updates || "")},
      ${String(b.seo_help || "")},
      ${Boolean(b.published)},
      ${Number(b.sort_order) || 0}
    )
    RETURNING *
  `;
  return rows[0];
}

async function updateBrand(sql: Sql, id: string, b: Record<string, unknown>) {
  const rows = await sql`
    UPDATE brands SET
      slug = ${String(b.slug || "")},
      name = ${String(b.name || "")},
      color = ${String(b.color || "bg-blue-500")},
      description = ${String(b.description || "")},
      guides_count = ${Number(b.guides_count) || 0},
      devices_count = ${Number(b.devices_count) || 0},
      product_lines = ${JSON.stringify(b.product_lines || [])}::jsonb,
      top_guides = ${JSON.stringify(b.top_guides || [])}::jsonb,
      devices_list = ${JSON.stringify(b.devices_list || [])}::jsonb,
      seo_updates = ${String(b.seo_updates || "")},
      seo_help = ${String(b.seo_help || "")},
      published = ${Boolean(b.published)},
      sort_order = ${Number(b.sort_order) || 0}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Brand not found");
  return rows[0];
}

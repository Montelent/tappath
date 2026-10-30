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
type Sql = NonNullable<ReturnType<typeof getSql>>;

/** Explicit queries — Neon cannot bind table names as $1 parameters. */
async function selectAll(sql: Sql, table: string) {
  switch (table) {
    case "brands":
      return sql`SELECT * FROM brands ORDER BY sort_order ASC NULLS LAST, name ASC LIMIT 500`;
    case "topics":
      return sql`SELECT * FROM topics ORDER BY sort_order ASC NULLS LAST, name ASC LIMIT 500`;
    case "devices":
      return sql`SELECT * FROM devices ORDER BY name ASC LIMIT 500`;
    case "glossary_terms":
      return sql`SELECT * FROM glossary_terms ORDER BY term ASC LIMIT 500`;
    case "guides":
      return sql`SELECT * FROM guides ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "forum_topics":
      return sql`SELECT * FROM forum_topics ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "forum_replies":
      return sql`SELECT * FROM forum_replies ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "site_settings":
      return sql`SELECT * FROM site_settings LIMIT 100`;
    case "guide_feedback":
      return sql`SELECT * FROM guide_feedback ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "profiles":
      return sql`SELECT id, email, name, role, created_at FROM profiles ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    default:
      throw new Error("Unknown table");
  }
}

async function deleteById(sql: Sql, table: string, id: string) {
  switch (table) {
    case "brands":
      return sql`DELETE FROM brands WHERE id::text = ${id}`;
    case "topics":
      return sql`DELETE FROM topics WHERE id::text = ${id}`;
    case "devices":
      return sql`DELETE FROM devices WHERE id::text = ${id}`;
    case "glossary_terms":
      return sql`DELETE FROM glossary_terms WHERE id::text = ${id}`;
    case "guides":
      return sql`DELETE FROM guides WHERE id::text = ${id}`;
    case "forum_topics":
      return sql`DELETE FROM forum_topics WHERE id::text = ${id}`;
    case "forum_replies":
      return sql`DELETE FROM forum_replies WHERE id::text = ${id}`;
    case "site_settings":
      return sql`DELETE FROM site_settings WHERE id::text = ${id}`;
    case "guide_feedback":
      return sql`DELETE FROM guide_feedback WHERE id::text = ${id}`;
    case "profiles":
      return sql`DELETE FROM profiles WHERE id::text = ${id}`;
    default:
      throw new Error("Unknown table");
  }
}

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
    const rows = await selectAll(sql, table);
    return NextResponse.json({ rows, usingSupabase: true, backend: "neon" });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Query failed",
        rows: [],
        usingSupabase: true,
        backend: "neon",
      },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: `Create via dedicated editor not yet for ${table}` },
      { status: 400 }
    );
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
    if (table === "forum_topics") {
      const row = await updateForumTopic(sql, id, body);
      return NextResponse.json({ row });
    }
    return NextResponse.json({ error: `Update not implemented for ${table}` }, { status: 400 });
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
    await deleteById(sql, table, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 400 }
    );
  }
}

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

async function updateForumTopic(sql: Sql, id: string, b: Record<string, unknown>) {
  const rows = await sql`
    UPDATE forum_topics SET
      title = ${String(b.title || "")},
      brand = ${String(b.brand || "General")},
      brand_slug = ${String(b.brand_slug || "general")},
      category = ${String(b.category || "General")},
      author_name = ${String(b.author_name || "Anonymous")},
      excerpt = ${String(b.excerpt || "")},
      body = ${String(b.body || "")},
      solved = ${Boolean(b.solved)},
      views = ${Number(b.views) || 0}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Topic not found");
  return rows[0];
}

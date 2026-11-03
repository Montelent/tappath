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

async function selectAll(sql: Sql, table: string) {
  switch (table) {
    case "brands":
      return sql`
        SELECT b.*,
          (SELECT count(*)::int FROM guides g WHERE g.brand_slug = b.slug) AS guides_count,
          (SELECT count(*)::int FROM devices d WHERE d.brand_slug = b.slug) AS devices_count
        FROM brands b
        ORDER BY b.sort_order ASC NULLS LAST, b.name ASC
        LIMIT 500
      `;
    case "devices":
      return sql`
        SELECT d.*,
          (
            SELECT count(*)::int FROM guides g
            WHERE g.brand_slug = d.brand_slug
          ) AS guides_count
        FROM devices d
        ORDER BY d.sort_order ASC NULLS LAST, d.name ASC
        LIMIT 500
      `;
    case "topics":
      return sql`SELECT * FROM topics ORDER BY sort_order ASC NULLS LAST, name ASC LIMIT 500`;
    case "glossary_terms":
      return sql`SELECT * FROM glossary_terms ORDER BY term ASC LIMIT 500`;
    case "guides":
      return sql`SELECT * FROM guides ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "forum_topics":
      return sql`SELECT * FROM forum_topics ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "forum_replies":
      return sql`SELECT * FROM forum_replies ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "site_settings":
      return sql`SELECT * FROM site_settings LIMIT 10`;
    case "guide_feedback":
      return sql`SELECT * FROM guide_feedback ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "profiles":
      return sql`SELECT * FROM profiles ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    default:
      return [];
  }
}

async function deleteById(sql: Sql, table: string, id: string) {
  switch (table) {
    case "brands":
      return sql`DELETE FROM brands WHERE id::text = ${id}`;
    case "devices":
      return sql`DELETE FROM devices WHERE id::text = ${id}`;
    case "topics":
      return sql`DELETE FROM topics WHERE id::text = ${id}`;
    case "glossary_terms":
      return sql`DELETE FROM glossary_terms WHERE id::text = ${id}`;
    case "guides":
      return sql`DELETE FROM guides WHERE id::text = ${id}`;
    case "forum_topics":
      return sql`DELETE FROM forum_topics WHERE id::text = ${id}`;
    case "forum_replies":
      return sql`DELETE FROM forum_replies WHERE id::text = ${id}`;
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
    if (table === "glossary_terms") {
      const row = await insertGlossary(sql, body);
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
    if (table === "glossary_terms") {
      const row = await updateGlossary(sql, id, body);
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

async function ensureGuideColumns(sql: Sql) {
  try {
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS featured_image_url text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS seo_title text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS seo_description text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS focus_keyword text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS canonical_url text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS robots_index boolean DEFAULT true`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS robots_follow boolean DEFAULT true`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS og_title text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS og_description text`;
    await sql`ALTER TABLE guides ADD COLUMN IF NOT EXISTS og_image text`;
  } catch {
    /* column may already exist */
  }
}

async function ensureGlossaryColumns(sql: Sql) {
  try {
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS seo_title text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS seo_description text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS focus_keyword text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS canonical_url text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS robots_index boolean DEFAULT true`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS robots_follow boolean DEFAULT true`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS og_title text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS og_description text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS og_image text`;
    await sql`ALTER TABLE glossary_terms ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb`;
  } catch {
    /* column may already exist */
  }
}

async function insertGuide(sql: Sql, b: Record<string, unknown>) {
  await ensureGuideColumns(sql);
  const rows = await sql`
    INSERT INTO guides (
      slug, brand, brand_slug, product_line, title, short_description,
      updated_label, read_time, category, versions, article, faqs,
      related, compatible_devices, confirmations, forum_verified, published,
      featured_image_url, seo_title, seo_description,
      focus_keyword, canonical_url, robots_index, robots_follow,
      og_title, og_description, og_image
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
      ${Boolean(b.published)},
      ${String(b.featured_image_url || "") || null},
      ${String(b.seo_title || "") || null},
      ${String(b.seo_description || "") || null},
      ${String(b.focus_keyword || "") || null},
      ${String(b.canonical_url || "") || null},
      ${b.robots_index === false ? false : true},
      ${b.robots_follow === false ? false : true},
      ${String(b.og_title || "") || null},
      ${String(b.og_description || "") || null},
      ${String(b.og_image || "") || null}
    )
    RETURNING *
  `;
  return rows[0];
}

async function updateGuide(sql: Sql, id: string, b: Record<string, unknown>) {
  await ensureGuideColumns(sql);
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
      published = ${Boolean(b.published)},
      featured_image_url = ${String(b.featured_image_url || "") || null},
      seo_title = ${String(b.seo_title || "") || null},
      seo_description = ${String(b.seo_description || "") || null},
      focus_keyword = ${String(b.focus_keyword || "") || null},
      canonical_url = ${String(b.canonical_url || "") || null},
      robots_index = ${b.robots_index === false ? false : true},
      robots_follow = ${b.robots_follow === false ? false : true},
      og_title = ${String(b.og_title || "") || null},
      og_description = ${String(b.og_description || "") || null},
      og_image = ${String(b.og_image || "") || null}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Guide not found");
  return rows[0];
}

async function insertGlossary(sql: Sql, b: Record<string, unknown>) {
  await ensureGlossaryColumns(sql);
  const rows = await sql`
    INSERT INTO glossary_terms (
      slug, term, category, short, definition, faqs, related_guides, published,
      seo_title, seo_description, focus_keyword, canonical_url,
      robots_index, robots_follow, og_title, og_description, og_image
    ) VALUES (
      ${String(b.slug || "")},
      ${String(b.term || "")},
      ${String(b.category || "General")},
      ${String(b.short || "")},
      ${String(b.definition || "")},
      ${JSON.stringify(b.faqs || [])}::jsonb,
      ${JSON.stringify(b.related_guides || b.related || [])}::jsonb,
      ${b.published === false ? false : true},
      ${String(b.seo_title || "") || null},
      ${String(b.seo_description || "") || null},
      ${String(b.focus_keyword || "") || null},
      ${String(b.canonical_url || "") || null},
      ${b.robots_index === false ? false : true},
      ${b.robots_follow === false ? false : true},
      ${String(b.og_title || "") || null},
      ${String(b.og_description || "") || null},
      ${String(b.og_image || "") || null}
    )
    RETURNING *
  `;
  return rows[0];
}

async function updateGlossary(sql: Sql, id: string, b: Record<string, unknown>) {
  await ensureGlossaryColumns(sql);
  const rows = await sql`
    UPDATE glossary_terms SET
      slug = ${String(b.slug || "")},
      term = ${String(b.term || "")},
      category = ${String(b.category || "General")},
      short = ${String(b.short || "")},
      definition = ${String(b.definition || "")},
      faqs = ${JSON.stringify(b.faqs || [])}::jsonb,
      related_guides = ${JSON.stringify(b.related_guides || b.related || [])}::jsonb,
      published = ${b.published === false ? false : true},
      seo_title = ${String(b.seo_title || "") || null},
      seo_description = ${String(b.seo_description || "") || null},
      focus_keyword = ${String(b.focus_keyword || "") || null},
      canonical_url = ${String(b.canonical_url || "") || null},
      robots_index = ${b.robots_index === false ? false : true},
      robots_follow = ${b.robots_follow === false ? false : true},
      og_title = ${String(b.og_title || "") || null},
      og_description = ${String(b.og_description || "") || null},
      og_image = ${String(b.og_image || "") || null}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Glossary term not found");
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
      ${b.published === false ? false : true},
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
      published = ${b.published === false ? false : true},
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
      body = ${String(b.body || "")},
      status = ${String(b.status || "open")},
      pinned = ${Boolean(b.pinned)},
      locked = ${Boolean(b.locked)}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Topic not found");
  return rows[0];
}

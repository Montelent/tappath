import { NextRequest, NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { requireAdmin } from "@/lib/session";

const ALLOWED = new Set([
  "brands",
  "topics",
  "devices",
  "glossary_terms",
  "guides",
  "pages",
  "forum_topics",
  "forum_replies",
  "site_settings",
  "guide_feedback",
]);

type Ctx = { params: Promise<{ table: string }> };
type Sql = NonNullable<ReturnType<typeof getSql>>;

let pagesSchemaReady: Promise<void> | null = null;

let devicesSchemaReady: Promise<void> | null = null;

async function ensureDevicesColumns(sql: Sql) {
  if (!devicesSchemaReady) {
    devicesSchemaReady = sql`ALTER TABLE devices ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0`
      .then(() => undefined)
      .catch((error) => {
        devicesSchemaReady = null;
        throw error;
      });
  }
  await devicesSchemaReady;
}

async function ensurePagesTable(sql: Sql) {
  if (!pagesSchemaReady) {
    pagesSchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS pages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          title text NOT NULL,
          slug text NOT NULL UNIQUE,
          content text NOT NULL DEFAULT '',
          excerpt text NOT NULL DEFAULT '',
          published boolean NOT NULL DEFAULT false,
          seo_title text,
          seo_description text,
          focus_keyword text,
          canonical_url text,
          robots_index boolean NOT NULL DEFAULT true,
          robots_follow boolean NOT NULL DEFAULT true,
          og_title text,
          og_description text,
          og_image text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS focus_keyword text`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS canonical_url text`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS robots_index boolean NOT NULL DEFAULT true`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS robots_follow boolean NOT NULL DEFAULT true`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_title text`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_description text`;
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS og_image text`;
    })().catch((error) => {
      pagesSchemaReady = null;
      throw error;
    });
  }
  await pagesSchemaReady;
}

async function selectAll(sql: Sql, table: string) {
  if (table === "pages") await ensurePagesTable(sql);
  if (table === "devices") await ensureDevicesColumns(sql);
  switch (table) {
    case "brands":
      return sql`
        SELECT b.*,
          (SELECT count(*)::int FROM guides g WHERE g.brand_slug = b.slug AND g.published = true) AS guides_count,
          (SELECT count(*)::int FROM devices d WHERE d.brand_slug = b.slug AND COALESCE(d.published, true) = true) AS devices_count
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
      return sql`
        SELECT t.*,
          (
            SELECT count(*)::int
            FROM guides g
            WHERE g.published = true
              AND COALESCE(trim(g.category), '') <> ''
              AND (
                lower(trim(g.category)) = lower(trim(t.name))
                OR lower(trim(g.category)) LIKE '%' || lower(trim(t.name)) || '%'
                OR lower(trim(t.name)) LIKE '%' || lower(trim(g.category)) || '%'
                OR lower(replace(trim(g.category), '&', 'and')) = lower(replace(trim(t.name), '&', 'and'))
              )
          ) AS guide_count
        FROM topics t
        ORDER BY t.sort_order ASC NULLS LAST, t.name ASC
        LIMIT 500
      `;
    case "glossary_terms":
      return sql`SELECT * FROM glossary_terms ORDER BY term ASC LIMIT 500`;
    case "guides":
      return sql`SELECT * FROM guides ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "pages":
      return sql`SELECT * FROM pages ORDER BY updated_at DESC LIMIT 500`;
    case "forum_topics":
      return sql`SELECT * FROM forum_topics ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "forum_replies":
      return sql`SELECT * FROM forum_replies ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    case "site_settings":
      return sql`SELECT * FROM site_settings LIMIT 10`;
    case "guide_feedback":
      return sql`SELECT * FROM guide_feedback ORDER BY created_at DESC NULLS LAST LIMIT 500`;
    default:
      return [];
  }
}

async function deleteById(sql: Sql, table: string, id: string) {
  if (table === "pages") await ensurePagesTable(sql);
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
    case "pages":
      return sql`DELETE FROM pages WHERE id::text = ${id}`;
    case "forum_topics":
      return sql`DELETE FROM forum_topics WHERE id::text = ${id}`;
    case "forum_replies":
      return sql`DELETE FROM forum_replies WHERE id::text = ${id}`;
    case "guide_feedback":
      return sql`DELETE FROM guide_feedback WHERE id::text = ${id}`;
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
    if (table === "pages") {
      await ensurePagesTable(sql);
      const title = String(body.title || "").trim();
      const slug = String(body.slug || "").trim().toLowerCase();
      if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("A title and valid URL slug are required");
      const rows = await sql`INSERT INTO pages (title, slug, content, excerpt, published, seo_title, seo_description, focus_keyword, canonical_url, robots_index, robots_follow, og_title, og_description, og_image) VALUES (${title}, ${slug}, ${String(body.content || "")}, ${String(body.excerpt || "")}, ${body.published === true}, ${String(body.seo_title || "") || null}, ${String(body.seo_description || "") || null}, ${String(body.focus_keyword || "") || null}, ${String(body.canonical_url || "") || null}, ${body.robots_index === false ? false : true}, ${body.robots_follow === false ? false : true}, ${String(body.og_title || "") || null}, ${String(body.og_description || "") || null}, ${String(body.og_image || "") || null}) RETURNING *`;
      return NextResponse.json({ row: rows[0] }, { status: 201 });
    }
    if (table === "topics") {
      const row = await insertTopic(sql, body);
      return NextResponse.json({ row }, { status: 201 });
    }
    if (table === "guides") {
      const row = await insertGuide(sql, body);
      return NextResponse.json({ row }, { status: 201 });
    }
    if (table === "devices") {
      const row = await insertDevice(sql, body);
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
    if (table === "pages") {
      await ensurePagesTable(sql);
      const title = String(body.title || "").trim();
      const slug = String(body.slug || "").trim().toLowerCase();
      if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("A title and valid URL slug are required");
      const rows = await sql`UPDATE pages SET title = ${title}, slug = ${slug}, content = ${String(body.content || "")}, excerpt = ${String(body.excerpt || "")}, published = ${body.published === true}, seo_title = ${String(body.seo_title || "") || null}, seo_description = ${String(body.seo_description || "") || null}, focus_keyword = ${String(body.focus_keyword || "") || null}, canonical_url = ${String(body.canonical_url || "") || null}, robots_index = ${body.robots_index === false ? false : true}, robots_follow = ${body.robots_follow === false ? false : true}, og_title = ${String(body.og_title || "") || null}, og_description = ${String(body.og_description || "") || null}, og_image = ${String(body.og_image || "") || null}, updated_at = now() WHERE id::text = ${id} RETURNING *`;
      if (!rows[0]) throw new Error("Page not found");
      return NextResponse.json({ row: rows[0] });
    }
    if (table === "topics") {
      const row = await updateTopic(sql, id, body);
      return NextResponse.json({ row });
    }
    if (table === "guides") {
      const row = await updateGuide(sql, id, body);
      return NextResponse.json({ row });
    }
    if (table === "devices") {
      const row = await updateDevice(sql, id, body);
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
    const guideBeforeDelete = table === "guides" ? await sql`SELECT brand_slug FROM guides WHERE id::text = ${id} LIMIT 1` : [];
    await deleteById(sql, table, id);
    if (table === "guides" && guideBeforeDelete[0]?.brand_slug) await refreshBrandCounts(sql, String(guideBeforeDelete[0].brand_slug));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 400 }
    );
  }
}

function slugifyTopicName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function insertTopic(sql: Sql, body: Record<string, unknown>) {
  const name = String(body.name || "").trim();
  const requestedSlug = String(body.slug || "").trim();
  const slug = slugifyTopicName(requestedSlug || name);
  if (!name || !slug) throw new Error("A topic name and valid slug are required");
  const description = String(body.description || "").trim();
  const icon = String(body.icon || "Settings").trim() || "Settings";
  const published = body.published !== false;
  const sortOrder = body.sort_order_mode === "auto"
    ? Number((await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM topics`)[0]?.next_order || 1)
    : (Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0);
  const rows = await sql`
    INSERT INTO topics (slug, name, description, icon, guide_count, brands, published, sort_order)
    VALUES (${slug}, ${name}, ${description}, ${icon}, 0, ARRAY[]::text[], ${published}, ${sortOrder})
    RETURNING *
  `;
  return rows[0];
}

async function updateTopic(sql: Sql, id: string, body: Record<string, unknown>) {
  const name = String(body.name || "").trim();
  const existing = await sql`SELECT slug FROM topics WHERE id::text = ${id} LIMIT 1`;
  const requestedSlug = String(body.slug || existing[0]?.slug || "").trim();
  const slug = slugifyTopicName(requestedSlug || name);
  if (!name || !slug) throw new Error("A topic name and valid slug are required");
  const description = String(body.description || "").trim();
  const icon = String(body.icon || "Settings").trim() || "Settings";
  const published = body.published !== false;
  const sortOrder = body.sort_order_mode === "auto"
    ? Number((await sql`SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM topics WHERE id::text <> ${id}`)[0]?.next_order || 1)
    : (Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0);
  const rows = await sql`
    UPDATE topics
    SET slug = ${slug}, name = ${name}, description = ${description},
        icon = ${icon}, published = ${published}, sort_order = ${sortOrder}
    WHERE id::text = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error("Topic not found");
  return rows[0];
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


async function normalizeDeviceInput(sql: Sql, b: Record<string, unknown>, existingSlug?: string) {
  await ensureDevicesColumns(sql);
  const name = String(b.name || "").trim();
  const slug = String(b.slug || existingSlug || name).normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const brandSlug = String(b.brand_slug || "").trim().toLowerCase();
  if (!name || !slug || !brandSlug) throw new Error("Device name and brand are required");
  const brands = await sql`SELECT slug, name FROM brands WHERE slug = ${brandSlug} LIMIT 1`;
  if (!brands[0]) throw new Error("Select a valid brand");
  return {
    name, slug, brandSlug, brandName: String(brands[0].name),
    os: String(b.os || ""), href: `/${brandSlug}/${slug}`,
    year: b.year == null || b.year === "" ? null : Number(b.year),
    guides: JSON.stringify(Array.isArray(b.guides) ? b.guides : []),
    published: b.published !== false,
  };
}

async function insertDevice(sql: Sql, b: Record<string, unknown>) {
  const d = await normalizeDeviceInput(sql, b);
  const rows = await sql`
    INSERT INTO devices (slug, name, brand_slug, brand_name, os, href, year, guides, published)
    VALUES (${d.slug}, ${d.name}, ${d.brandSlug}, ${d.brandName}, ${d.os}, ${d.href}, ${d.year}, ${d.guides}::jsonb, ${d.published})
    RETURNING *
  `;
  return rows[0];
}

async function updateDevice(sql: Sql, id: string, b: Record<string, unknown>) {
  const existing = await sql`SELECT slug FROM devices WHERE id::text = ${id} LIMIT 1`;
  const d = await normalizeDeviceInput(sql, b, String(existing[0]?.slug || ""));
  const rows = await sql`
    UPDATE devices SET slug = ${d.slug}, name = ${d.name}, brand_slug = ${d.brandSlug},
      brand_name = ${d.brandName}, os = ${d.os}, href = ${d.href}, year = ${d.year},
      guides = ${d.guides}::jsonb, published = ${d.published}, updated_at = now()
    WHERE id::text = ${id} RETURNING *
  `;
  if (!rows[0]) throw new Error("Device not found");
  return rows[0];
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
  if (rows[0]?.brand_slug) await refreshBrandCounts(sql, String(rows[0].brand_slug));
  return rows[0];
}

async function updateGuide(sql: Sql, id: string, b: Record<string, unknown>) {
  await ensureGuideColumns(sql);
  const previousRows = await sql`SELECT brand_slug, product_line, slug FROM guides WHERE id::text = ${id} LIMIT 1`;
  const previous = previousRows[0] as { brand_slug?: string; product_line?: string; slug?: string } | undefined;
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

  if (previous?.slug) {
    const pathFor = (brand: unknown, line: unknown, slug: unknown) => {
      const brandPart = String(brand || "").trim().toLowerCase();
      const linePart = String(line || "guides").toLowerCase()
        .trim()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
      return `/${brandPart}/${linePart || "guides"}/${String(slug || "").trim()}`;
    };
    const oldPath = pathFor(previous.brand_slug, previous.product_line, previous.slug);
    const newPath = pathFor(rows[0].brand_slug, rows[0].product_line, rows[0].slug);
    if (oldPath !== newPath) {
      const settingRows = await sql`SELECT value FROM site_settings WHERE key = 'seo_redirects' LIMIT 1`;
      let redirects: { id?: string; from?: string; to?: string; code?: number; enabled?: boolean }[] = [];
      const raw = settingRows[0]?.value;
      if (Array.isArray(raw)) redirects = raw;
      else if (typeof raw === "string") {
        try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) redirects = parsed; } catch { /* use empty list */ }
      } else if (raw && typeof raw === "object") {
        const value = (raw as { value?: unknown }).value;
        if (Array.isArray(value)) redirects = value as typeof redirects;
      }
      redirects = redirects.map((item) =>
        item && item.to === oldPath ? { ...item, to: newPath } : item
      );
      const existingIndex = redirects.findIndex((item) => item?.from === oldPath);
      const automatic = { id: `guide-${id}`, from: oldPath, to: newPath, code: 301, enabled: true };
      if (existingIndex >= 0) redirects[existingIndex] = automatic;
      else redirects.push(automatic);
      const json = JSON.stringify(redirects);
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('seo_redirects', ${json}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
    }
  }
  if (previous?.brand_slug) await refreshBrandCounts(sql, String(previous.brand_slug));
  if (rows[0]?.brand_slug && rows[0].brand_slug !== previous?.brand_slug) await refreshBrandCounts(sql, String(rows[0].brand_slug));
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

async function refreshBrandCounts(sql: Sql, slug: string) {
  const rows = await sql`
    UPDATE brands b SET
      guides_count = (
        SELECT count(*)::int FROM guides g
        WHERE g.brand_slug = b.slug AND g.published = true
      ),
      devices_count = (
        SELECT count(*)::int FROM devices d
        WHERE d.brand_slug = b.slug AND COALESCE(d.published, true) = true
      ),
      product_lines = COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'name', line.name,
          'count', line.guide_count,
          'href', '/' || b.slug || '/' || regexp_replace(lower(line.name), '[^a-z0-9]+', '-', 'g')
        ) ORDER BY line.name)
        FROM (
          SELECT g.product_line AS name, count(*)::int AS guide_count
          FROM guides g
          WHERE g.brand_slug = b.slug AND g.published = true
            AND COALESCE(g.product_line, '') <> ''
          GROUP BY g.product_line
        ) line
      ), '[]'::jsonb),
      top_guides = COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'title', guide.title,
          'href', '/' || b.slug || '/' || regexp_replace(lower(COALESCE(guide.product_line, 'guides')), '[^a-z0-9]+', '-', 'g') || '/' || guide.slug,
          'category', COALESCE(guide.category, 'General')
        ) ORDER BY guide.updated_at DESC NULLS LAST)
        FROM (
          SELECT g.title, g.product_line, g.slug, g.category, g.updated_at
          FROM guides g
          WHERE g.brand_slug = b.slug AND g.published = true
          ORDER BY g.updated_at DESC NULLS LAST
          LIMIT 24
        ) guide
      ), '[]'::jsonb),
      devices_list = COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'name', d.name, 'os', COALESCE(d.os, ''), 'href', COALESCE(d.href, '/' || b.slug || '/' || d.slug)
        ) ORDER BY d.name)
        FROM devices d
        WHERE d.brand_slug = b.slug AND COALESCE(d.published, true) = true
      ), '[]'::jsonb)
    WHERE b.slug = ${slug}
    RETURNING b.*
  `;
  return rows[0] || null;
}

function slugifyBrandValue(value: string) {
  return value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function insertBrand(sql: Sql, b: Record<string, unknown>) {
  const name = String(b.name || "").trim();
  const requestedSlug = String(b.slug || "").trim();
  const slug = slugifyBrandValue(requestedSlug || name);
  if (!name || !slug) throw new Error("Enter a valid brand name and slug");
  const rows = await sql`
    INSERT INTO brands (
      slug, name, color, description, guides_count, devices_count,
      product_lines, top_guides, devices_list, seo_updates, seo_help,
      published, sort_order
    ) VALUES (
      ${slug},
      ${name},
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
  return (await refreshBrandCounts(sql, slug)) || rows[0];
}

async function updateBrand(sql: Sql, id: string, b: Record<string, unknown>) {
  const name = String(b.name || "").trim();
  const currentRows = await sql`SELECT slug FROM brands WHERE id::text = ${id} LIMIT 1`;
  if (!currentRows[0]) throw new Error("Brand not found");
  const requestedSlug = String(b.slug || "").trim();
  const slug = slugifyBrandValue(requestedSlug || String(currentRows[0].slug || ""));
  if (!name || !slug) throw new Error("Enter a valid brand name and slug");
  const rows = await sql`
    UPDATE brands SET
      slug = ${slug},
      name = ${name},
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
  return (await refreshBrandCounts(sql, slug)) || rows[0];
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

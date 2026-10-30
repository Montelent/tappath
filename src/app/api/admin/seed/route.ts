import { NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { requireAdmin } from "@/lib/session";
import { ensureDemoUsers } from "@/lib/db/users";
import { brands } from "@/data/brands";
import { topics } from "@/data/topics";
import { devices } from "@/data/devices";
import { glossaryTerms } from "@/data/glossary";
import { guides } from "@/data/guides";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  if (!isNeonConfigured()) {
    return NextResponse.json(
      { error: "Set DATABASE_URL to your Neon connection string on Vercel." },
      { status: 503 }
    );
  }

  const sql = getSql()!;
  const results: Record<string, number | string> = {};

  try {
    await ensureDemoUsers();
    results.demoUsers = "ok";
  } catch (e) {
    results.demoUsers = e instanceof Error ? e.message : "failed";
  }

  try {
    let n = 0;
    for (const [i, b] of Object.values(brands).entries()) {
      await sql`
        INSERT INTO brands (
          slug, name, color, description, guides_count, devices_count,
          product_lines, top_guides, devices_list, seo_updates, seo_help,
          published, sort_order
        ) VALUES (
          ${b.slug}, ${b.name}, ${b.color}, ${b.description},
          ${b.guides}, ${b.devices},
          ${JSON.stringify(b.productLines)}::jsonb,
          ${JSON.stringify(b.topGuides)}::jsonb,
          ${JSON.stringify(b.devicesList)}::jsonb,
          ${b.seoText?.updates ?? ""}, ${b.seoText?.help ?? ""},
          true, ${i}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          guides_count = EXCLUDED.guides_count,
          devices_count = EXCLUDED.devices_count,
          product_lines = EXCLUDED.product_lines,
          top_guides = EXCLUDED.top_guides,
          devices_list = EXCLUDED.devices_list,
          seo_updates = EXCLUDED.seo_updates,
          seo_help = EXCLUDED.seo_help,
          sort_order = EXCLUDED.sort_order
      `;
      n++;
    }
    results.brands = n;
  } catch (e) {
    results.brands = e instanceof Error ? e.message : "failed";
  }

  try {
    let n = 0;
    for (const [i, t] of topics.entries()) {
      const brandSlugs = (t.guidesByBrand ?? []).map((b) => b.brandSlug);
      await sql`
        INSERT INTO topics (slug, name, description, icon, guide_count, brands, published, sort_order)
        VALUES (
          ${t.slug}, ${t.name}, ${t.description}, ${t.icon},
          ${t.guideCount}, ${brandSlugs}, true, ${i}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          guide_count = EXCLUDED.guide_count,
          brands = EXCLUDED.brands,
          sort_order = EXCLUDED.sort_order
      `;
      n++;
    }
    results.topics = n;
  } catch (e) {
    results.topics = e instanceof Error ? e.message : "failed";
  }

  try {
    let n = 0;
    for (const d of devices) {
      await sql`
        INSERT INTO devices (slug, name, brand_slug, brand_name, os, href, year, guides, published)
        VALUES (
          ${d.slug}, ${d.name}, ${d.brandSlug}, ${d.brand}, ${d.os}, ${d.href},
          ${d.year ?? null}, ${JSON.stringify(d.guides)}::jsonb, true
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          brand_slug = EXCLUDED.brand_slug,
          brand_name = EXCLUDED.brand_name,
          os = EXCLUDED.os,
          href = EXCLUDED.href,
          year = EXCLUDED.year,
          guides = EXCLUDED.guides
      `;
      n++;
    }
    results.devices = n;
  } catch (e) {
    results.devices = e instanceof Error ? e.message : "failed";
  }

  try {
    let n = 0;
    for (const t of glossaryTerms) {
      await sql`
        INSERT INTO glossary_terms (slug, term, category, short, definition, related_guides, published)
        VALUES (
          ${t.slug}, ${t.term}, ${t.category}, ${t.short}, ${t.definition},
          '[]'::jsonb, true
        )
        ON CONFLICT (slug) DO UPDATE SET
          term = EXCLUDED.term,
          category = EXCLUDED.category,
          short = EXCLUDED.short,
          definition = EXCLUDED.definition
      `;
      n++;
    }
    results.glossary = n;
  } catch (e) {
    results.glossary = e instanceof Error ? e.message : "failed";
  }

  try {
    let n = 0;
    for (const g of Object.values(guides)) {
      const existing = await sql`
        SELECT id FROM guides
        WHERE brand_slug = ${g.brandSlug} AND slug = ${g.slug}
        LIMIT 1
      `;
      if (existing[0]) {
        await sql`
          UPDATE guides SET
            brand = ${g.brand},
            product_line = ${g.productLine},
            title = ${g.title},
            short_description = ${g.shortDescription},
            updated_label = ${g.updated},
            read_time = ${g.readTime},
            category = ${g.category},
            versions = ${JSON.stringify(g.versions)}::jsonb,
            article = ${JSON.stringify(g.article)}::jsonb,
            faqs = ${JSON.stringify(g.faqs)}::jsonb,
            related = ${JSON.stringify(g.related)}::jsonb,
            compatible_devices = ${JSON.stringify(g.compatibleDevices)}::jsonb,
            confirmations = ${g.confirmations},
            forum_verified = ${!!g.forumVerified},
            published = true
          WHERE id = ${(existing[0] as { id: string }).id}::uuid
        `;
      } else {
        await sql`
          INSERT INTO guides (
            slug, brand, brand_slug, product_line, title, short_description,
            updated_label, read_time, category, versions, article, faqs,
            related, compatible_devices, confirmations, forum_verified, published
          ) VALUES (
            ${g.slug}, ${g.brand}, ${g.brandSlug}, ${g.productLine}, ${g.title},
            ${g.shortDescription}, ${g.updated}, ${g.readTime}, ${g.category},
            ${JSON.stringify(g.versions)}::jsonb,
            ${JSON.stringify(g.article)}::jsonb,
            ${JSON.stringify(g.faqs)}::jsonb,
            ${JSON.stringify(g.related)}::jsonb,
            ${JSON.stringify(g.compatibleDevices)}::jsonb,
            ${g.confirmations}, ${!!g.forumVerified}, true
          )
        `;
      }
      n++;
    }
    results.guides = n;
  } catch (e) {
    results.guides = e instanceof Error ? e.message : "failed";
  }

  await sql`
    INSERT INTO site_settings (key, value)
    VALUES ('homepage', ${JSON.stringify({ seededAt: new Date().toISOString() })}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;

  return NextResponse.json({ ok: true, results, backend: "neon" });
}

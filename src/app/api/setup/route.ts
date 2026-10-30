import { NextResponse } from "next/server";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { ensureDemoUsers } from "@/lib/db/users";
import { brands } from "@/data/brands";
import { topics } from "@/data/topics";
import { devices } from "@/data/devices";
import { glossaryTerms } from "@/data/glossary";
import { guides } from "@/data/guides";

export const dynamic = "force-dynamic";

/**
 * First-time bootstrap: creates demo admin + seeds content into Neon.
 * After this, sign in with admin@tappath.com / admin1234 and open /admin.
 */
export async function POST() {
  if (!isNeonConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL not set on Vercel." },
      { status: 503 }
    );
  }

  const sql = getSql()!;
  let profileCount = 0;
  let guideCount = 0;
  try {
    const [p] = await sql`SELECT count(*)::int AS n FROM profiles`;
    const [g] = await sql`SELECT count(*)::int AS n FROM guides`;
    profileCount = (p as { n: number }).n;
    guideCount = (g as { n: number }).n;
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Cannot query Neon",
        hint: "Run schema SQL in Neon SQL Editor first.",
      },
      { status: 500 }
    );
  }

  const results: Record<string, number | string> = {};

  try {
    await ensureDemoUsers();
    results.demoUsers = "ok";
  } catch (e) {
    results.demoUsers = e instanceof Error ? e.message : "failed";
  }

  if (guideCount === 0) {
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
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
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
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
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
          ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        `;
        n++;
      }
      results.devices = n;
    } catch (e) {
      results.devices = e instanceof Error ? e.message : "failed";
    }

    try {
      let n = 0;
      for (const term of glossaryTerms) {
        await sql`
          INSERT INTO glossary_terms (slug, term, category, short, definition, related, published)
          VALUES (
            ${term.slug}, ${term.term}, ${term.category}, ${term.short}, ${term.definition},
            ${JSON.stringify(term.relatedGuides ?? [])}::jsonb, true
          )
          ON CONFLICT (slug) DO UPDATE SET
            term = EXCLUDED.term,
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
          ON CONFLICT (brand_slug, product_line, slug) DO UPDATE SET
            title = EXCLUDED.title,
            article = EXCLUDED.article,
            versions = EXCLUDED.versions,
            published = true
        `;
        n++;
      }
      results.guides = n;
    } catch (e) {
      results.guides = e instanceof Error ? e.message : "failed";
    }
  } else {
    results.content = "already seeded (guides > 0); only refreshed demo users";
  }

  const [p2] = await sql`SELECT count(*)::int AS n FROM profiles`;
  const [g2] = await sql`SELECT count(*)::int AS n FROM guides`;
  const [b2] = await sql`SELECT count(*)::int AS n FROM brands`;

  return NextResponse.json({
    ok: true,
    backend: "neon",
    before: { profiles: profileCount, guides: guideCount },
    results,
    after: {
      profiles: (p2 as { n: number }).n,
      guides: (g2 as { n: number }).n,
      brands: (b2 as { n: number }).n,
    },
    next: "Sign in at /sign-in with admin@tappath.com / admin1234 then open /admin",
  });
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to bootstrap Neon (demo admin + seed content).",
    url: "/api/setup",
  });
}

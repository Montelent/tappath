import { getSql } from "@/lib/db/neon";

export type SitePage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  updated_at: string;
};

async function ensurePagesTable() {
  const sql = getSql();
  if (!sql) return null;
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
  return sql;
}

export async function getPublishedPage(slug: string): Promise<SitePage | null> {
  try {
    const sql = await ensurePagesTable();
    if (!sql) return null;
    const rows = await sql`SELECT id, title, slug, content, excerpt, published, seo_title, seo_description, focus_keyword, canonical_url, robots_index, robots_follow, og_title, og_description, og_image, updated_at FROM pages WHERE slug = ${slug} AND published = true LIMIT 1`;
    return (rows[0] as SitePage | undefined) ?? null;
  } catch (error) {
    console.error("[getPublishedPage]", error);
    return null;
  }
}

export async function listPublishedPages(): Promise<SitePage[]> {
  try {
    const sql = await ensurePagesTable();
    if (!sql) return [];
    const rows = await sql`SELECT id, title, slug, content, excerpt, published, seo_title, seo_description, updated_at FROM pages WHERE published = true ORDER BY updated_at DESC`;
    return rows as SitePage[];
  } catch (error) {
    console.error("[listPublishedPages]", error);
    return [];
  }
}

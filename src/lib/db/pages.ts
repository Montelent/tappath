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
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  return sql;
}

export async function getPublishedPage(slug: string): Promise<SitePage | null> {
  try {
    const sql = await ensurePagesTable();
    if (!sql) return null;
    const rows = await sql`SELECT id, title, slug, content, excerpt, published, seo_title, seo_description, updated_at FROM pages WHERE slug = ${slug} AND published = true LIMIT 1`;
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

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { getStore, saveStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = brand
        ? await sql`
            SELECT t.*,
              (SELECT count(*)::int FROM forum_replies r WHERE r.topic_id = t.id) AS replies
            FROM forum_topics t
            WHERE t.brand_slug = ${brand}
            ORDER BY t.updated_at DESC
          `
        : await sql`
            SELECT t.*,
              (SELECT count(*)::int FROM forum_replies r WHERE r.topic_id = t.id) AS replies
            FROM forum_topics t
            ORDER BY t.updated_at DESC
            LIMIT 100
          `;
      return NextResponse.json({
        topics: (rows as Record<string, unknown>[]).map((t) => ({
          id: t.id,
          title: t.title,
          brand: t.brand,
          brandSlug: t.brand_slug,
          category: t.category,
          author: t.author_name,
          excerpt: t.excerpt,
          solved: t.solved,
          views: t.views,
          replies: t.replies,
          lastActivity: t.updated_at,
        })),
      });
    } catch { /* memory */ }
  }

  let topics = getStore().topics;
  if (brand) topics = topics.filter((t) => t.brandSlug === brand);
  topics = [...topics].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const { replies } = getStore();
  return NextResponse.json({
    topics: topics.map((t) => ({
      id: t.id,
      title: t.title,
      brand: t.brand,
      brandSlug: t.brandSlug,
      category: t.category,
      author: t.authorName,
      excerpt: t.excerpt,
      solved: t.solved,
      views: t.views,
      replies: replies.filter((r) => r.topicId === t.id).length,
      lastActivity: t.updatedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: {
    title?: string;
    brand?: string;
    brandSlug?: string;
    category?: string;
    content?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const content = (body.content || "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        INSERT INTO forum_topics (
          title, brand, brand_slug, category, author_name, excerpt, body
        ) VALUES (
          ${title},
          ${body.brand || "General"},
          ${body.brandSlug || "general"},
          ${body.category || "General"},
          ${user.name},
          ${content.slice(0, 120)},
          ${content}
        )
        RETURNING *
      `;
      return NextResponse.json({ topic: rows[0] }, { status: 201 });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Insert failed" },
        { status: 500 }
      );
    }
  }

  const id = `t-${Date.now()}`;
  const now = new Date().toISOString();
  const topic = {
    id,
    title,
    brand: body.brand || "General",
    brandSlug: body.brandSlug || "general",
    category: body.category || "General",
    authorId: user.id,
    authorName: user.name,
    excerpt: content.slice(0, 120),
    body: content,
    solved: false,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
  saveStore((db) => {
    db.topics.unshift(topic);
  });
  return NextResponse.json({ topic }, { status: 201 });
}

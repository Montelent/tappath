import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getStore, saveStore } from "@/lib/store";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.body || "").trim();
  if (!text || text.length > 10000) {
    return NextResponse.json({ error: "Reply body must be between 1 and 10000 characters." }, { status: 400 });
  }

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        INSERT INTO forum_replies (topic_id, author_id, author_name, body)
        SELECT id, ${user.id}, ${user.name}, ${text}
        FROM forum_topics WHERE id::text = ${id}
        RETURNING *
      `;
      if (!rows[0]) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      await sql`UPDATE forum_topics SET updated_at = now() WHERE id::text = ${id}`;
      return NextResponse.json({ reply: rows[0] }, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Forum database unavailable" }, { status: 503 });
    }
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forum database is not configured" }, { status: 503 });
  }

  const store = getStore();
  if (!store.topics.find((t) => t.id === id)) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const reply = {
    id: `r-${Date.now()}`,
    topicId: id,
    authorId: user.id,
    authorName: user.name,
    body: text,
    createdAt: new Date().toISOString(),
  };

  saveStore((db) => {
    db.replies.push(reply);
    const t = db.topics.find((x) => x.id === id);
    if (t) t.updatedAt = reply.createdAt;
  });

  return NextResponse.json({ reply }, { status: 201 });
}

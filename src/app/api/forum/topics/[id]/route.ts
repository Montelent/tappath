import { NextRequest, NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store";
import { getSql, isNeonConfigured } from "@/lib/db/neon";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        UPDATE forum_topics SET views = views + 1
        WHERE id::text = ${id}
        RETURNING *
      `;
      const topic = rows[0] as Record<string, unknown> | undefined;
      if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const replies = await sql`
        SELECT * FROM forum_replies WHERE topic_id::text = ${id} ORDER BY created_at ASC
      `;
      return NextResponse.json({ topic, replies });
    } catch {
      return NextResponse.json({ error: "Forum database unavailable" }, { status: 503 });
    }
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forum database is not configured" }, { status: 503 });
  }

  const store = getStore();
  const topic = store.topics.find((t) => t.id === id);
  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  saveStore((db) => {
    const t = db.topics.find((x) => x.id === id);
    if (t) t.views += 1;
  });

  const replies = store.replies
    .filter((r) => r.topicId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return NextResponse.json({
    topic: { ...topic, views: topic.views + 1 },
    replies,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getStore, saveStore } from "@/lib/store";

function withReplyCount(topicId: string) {
  const { replies } = getStore();
  return replies.filter((r) => r.topicId === topicId).length;
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand");
  let topics = getStore().topics;
  if (brand) {
    topics = topics.filter((t) => t.brandSlug === brand);
  }
  topics = [...topics].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

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
      replies: withReplyCount(t.id),
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

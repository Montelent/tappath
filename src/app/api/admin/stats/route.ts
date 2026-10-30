import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getSql, isNeonConfigured } from "@/lib/db/neon";
import { getStore } from "@/lib/store";
import { guides } from "@/data/guides";
import { topics } from "@/data/topics";
import { getAllDevices } from "@/data/devices";
import { glossaryTerms } from "@/data/glossary";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin required." }, { status: 403 });
  }

  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const [guidesC] = await sql`SELECT count(*)::int AS n FROM guides`;
      const [topicsC] = await sql`SELECT count(*)::int AS n FROM topics`;
      const [devicesC] = await sql`SELECT count(*)::int AS n FROM devices`;
      const [glossaryC] = await sql`SELECT count(*)::int AS n FROM glossary_terms`;
      const [brandsC] = await sql`SELECT count(*)::int AS n FROM brands`;
      const [usersC] = await sql`SELECT count(*)::int AS n FROM profiles`;
      const [forumC] = await sql`SELECT count(*)::int AS n FROM forum_topics`;
      const [repliesC] = await sql`SELECT count(*)::int AS n FROM forum_replies`;
      const [feedbackC] = await sql`SELECT count(*)::int AS n FROM guide_feedback`;

      const recentFeedback = await sql`
        SELECT id, guide_slug, correct, created_at::text
        FROM guide_feedback ORDER BY created_at DESC LIMIT 20
      `;
      const recentTopics = await sql`
        SELECT id, title, brand, solved, created_at::text
        FROM forum_topics ORDER BY created_at DESC LIMIT 10
      `;

      return NextResponse.json({
        backend: "neon",
        content: {
          guides: (guidesC as { n: number }).n,
          topics: (topicsC as { n: number }).n,
          devices: (devicesC as { n: number }).n,
          glossaryTerms: (glossaryC as { n: number }).n,
          brands: (brandsC as { n: number }).n,
        },
        community: {
          users: (usersC as { n: number }).n,
          forumTopics: (forumC as { n: number }).n,
          forumReplies: (repliesC as { n: number }).n,
          feedback: (feedbackC as { n: number }).n,
        },
        recentFeedback,
        recentTopics,
      });
    } catch (e) {
      return NextResponse.json({
        backend: "neon",
        error: e instanceof Error ? e.message : "Neon query failed",
        content: { guides: 0, topics: 0, devices: 0, glossaryTerms: 0, brands: 0 },
        community: { users: 0, forumTopics: 0, forumReplies: 0, feedback: 0 },
        recentFeedback: [],
        recentTopics: [],
      });
    }
  }

  const store = getStore();
  return NextResponse.json({
    backend: "mock",
    message: "DATABASE_URL not set — these numbers are from mock files only.",
    content: {
      guides: Object.keys(guides).length,
      topics: topics.length,
      devices: getAllDevices().length,
      glossaryTerms: glossaryTerms.length,
      brands: 8,
    },
    community: {
      users: store.users.length,
      forumTopics: store.topics.length,
      forumReplies: store.replies.length,
      feedback: store.feedback.length,
    },
    recentFeedback: store.feedback.slice(-20).reverse(),
    recentTopics: store.topics.slice(0, 10),
  });
}

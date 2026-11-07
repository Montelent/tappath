"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { useAuthOptional } from "@/context/AuthContext";
import ShareButtons from "@/components/share/ShareButtons";

type Topic = {
  id: string;
  title: string;
  brand: string;
  brandSlug: string;
  category: string;
  authorName: string;
  body: string;
  solved: boolean;
  views: number;
};

type Reply = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export default function ForumTopicPage() {
  const params = useParams();
  const id = params.id as string;
  const auth = useAuthOptional();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setBody("");
    setError("");
    try {
      const res = await fetch(`/api/forum/topics/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setTopic(null);
        setLoadError(data.error || (res.status === 404 ? "Topic not found." : "Could not load this topic."));
        return;
      }
      setTopic(data.topic || null);
      setReplies(Array.isArray(data.replies) ? data.replies : []);
    } catch {
      setTopic(null);
      setLoadError("A network error prevented this topic from loading.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!auth?.user) {
      setError("Sign in to reply.");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch(`/api/forum/topics/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed");
      else {
        setBody("");
        await load();
      }
    } catch {
      setError("Network error");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>{loadError || "Topic not found."}</p>
        {loadError && <button type="button" onClick={() => void load()} className="mt-3 text-sm font-medium underline">Try again</button>}
        <Link href="/forum" className="mt-4 inline-block text-brand-600">
          ← Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/forum" className="hover:text-[var(--foreground)]">
          Forum
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)] line-clamp-1">{topic.title}</span>
      </nav>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {topic.brand} · {topic.category}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{topic.title}</h1>
        <div className="mt-4 mb-6">
          <ShareButtons title={topic.title} text={`Forum: ${topic.title}`} />
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          by {topic.authorName} · {topic.views} views
        </p>
        <p className="mt-4 whitespace-pre-wrap text-[var(--foreground)]">{topic.body}</p>
      </article>

      <h2 className="mb-3 mt-10 text-lg font-bold">Replies ({replies.length})</h2>
      <ul className="space-y-3">
        {replies.map((r) => (
          <li key={r.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm font-medium">{r.authorName}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">{r.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={submitReply} className="mt-8 space-y-3">
        {!auth?.user && (
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/sign-in" className="font-medium text-brand-600 underline dark:text-brand-400">Sign in</Link> to reply to this discussion.
          </p>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply…"
          rows={3}
          disabled={!auth?.user || posting}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={posting || !auth?.user}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {posting ? "Posting…" : "Post reply"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react";
import { useAuthOptional } from "@/context/AuthContext";

type Topic = {
  id: string;
  title: string;
  brand: string;
  brandSlug: string;
  category: string;
  author: string;
  excerpt: string;
  solved: boolean;
  views: number;
  replies: number;
  lastActivity: string;
};

export default function ForumBoard({ brand }: { brand?: string }) {
  const auth = useAuthOptional();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = brand ? `?brand=${encodeURIComponent(brand)}` : "";
      const res = await fetch(`/api/forum/topics${q}`);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [brand]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!auth?.user) {
      setError("Sign in to post.");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
          brand: brand === "samsung" ? "Samsung" : brand === "xiaomi" ? "Xiaomi" : "General",
          brandSlug: brand || "general",
          category: "General",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post");
      } else {
        setTitle("");
        setContent("");
        setShowForm(false);
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
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          {brand ? `${brand} topics` : "Recent topics"}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New topic
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-8 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
        >
          {!auth?.user && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <Link href="/sign-in" className="underline">
                Sign in
              </Link>{" "}
              to post a topic.
            </p>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic title"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe the issue or tip…"
            rows={4}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={posting || !auth?.user}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Post topic"}
          </button>
        </form>
      )}

      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {topics.map((t) => (
          <li key={t.id}>
            <Link
              href={`/forum/topic/${t.id}`}
              className="block px-4 py-4 transition hover:bg-[var(--muted)]/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                {t.solved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Solved
                  </span>
                )}
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {t.brand} · {t.category}
                </span>
              </div>
              <h3 className="mt-1 font-semibold">{t.title}</h3>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)] line-clamp-1">
                {t.excerpt}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                by {t.author} · {t.replies} replies · {t.views} views
              </p>
            </Link>
          </li>
        ))}
        {topics.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No topics yet. Be the first to post.
          </li>
        )}
      </ul>
    </div>
  );
}

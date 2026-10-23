"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  guideSlug: string;
  initialConfirmations: number;
  forumVerified?: boolean;
};

export default function GuideFeedback({
  guideSlug,
  initialConfirmations,
  forumVerified,
}: Props) {
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [count, setCount] = useState(initialConfirmations);

  const vote = async (v: "yes" | "no") => {
    if (voted) return;
    setVoted(v);
    if (v === "yes") setCount((c) => c + 1);
    try {
      await fetch("/api/guides/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ guideSlug, correct: v === "yes" }),
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="font-semibold">Was the guide correct?</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Help others: confirm the path or report a problem.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => vote("yes")}
          disabled={!!voted}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
            voted === "yes"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-[var(--border)] hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes, correct
        </button>
        <button
          onClick={() => vote("no")}
          disabled={!!voted}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
            voted === "no"
              ? "border-red-500 bg-red-500 text-white"
              : "border-[var(--border)] hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">{count} confirmations</span>
        {forumVerified && (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Forum verified this path
          </span>
        )}
      </div>

      {voted && (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
          Thanks for your feedback!
        </p>
      )}
    </div>
  );
}

"use client";

import { Trash2 } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";

type Faq = { q: string; a: string };
type Related = { title: string; href: string; category: string };

type Props = {
  faqs: Faq[];
  related: Related[];
  category: string;
  onChangeFaqs: (faqs: Faq[]) => void;
  onChangeRelated: (related: Related[]) => void;
};

export default function GuideMetaFields({
  faqs,
  related,
  category,
  onChangeFaqs,
  onChangeRelated,
}: Props) {
  return (
    <>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">FAQ</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Shown under the guide and emitted as FAQPage schema for Google.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-brand-600"
            onClick={() => onChangeFaqs([...(faqs || []), { q: "", a: "" }])}
          >
            + Add question
          </button>
        </div>
        {(faqs || []).length === 0 && (
          <p className="text-xs text-[var(--muted-foreground)]">
            No FAQs yet. Add common questions readers ask about this guide.
          </p>
        )}
        <div className="space-y-4">
          {(faqs || []).map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Q{i + 1}
                </span>
                <button
                  type="button"
                  className="text-red-500"
                  aria-label="Remove FAQ"
                  onClick={() => onChangeFaqs(faqs.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                value={f.q}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...next[i], q: e.target.value };
                  onChangeFaqs(next);
                }}
                placeholder="Question"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
              />
              <RichTextEditor
                label="Answer"
                help="Supports formatting. Copy/paste works on mobile and desktop."
                value={f.a}
                onChange={(html) => {
                  const next = [...faqs];
                  next[i] = { ...next[i], a: html };
                  onChangeFaqs(next);
                }}
                minHeight={140}
                compact
                placeholder="Answer…"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Related guides</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Grid at the bottom of the guide page. Use full paths like /samsung/galaxy/slug.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-brand-600"
            onClick={() =>
              onChangeRelated([
                ...(related || []),
                { title: "", href: "", category: category || "" },
              ])
            }
          >
            + Add related
          </button>
        </div>
        <div className="space-y-3">
          {(related || []).map((r, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <input
                value={r.title}
                onChange={(e) => {
                  const next = [...related];
                  next[i] = { ...next[i], title: e.target.value };
                  onChangeRelated(next);
                }}
                placeholder="Title"
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <input
                value={r.href}
                onChange={(e) => {
                  const next = [...related];
                  next[i] = { ...next[i], href: e.target.value };
                  onChangeRelated(next);
                }}
                placeholder="/brand/product/slug"
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
              />
              <input
                value={r.category}
                onChange={(e) => {
                  const next = [...related];
                  next[i] = { ...next[i], category: e.target.value };
                  onChangeRelated(next);
                }}
                placeholder="Category"
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="text-red-500 self-center justify-self-end"
                onClick={() => onChangeRelated(related.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

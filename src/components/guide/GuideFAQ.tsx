"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  faqs: { q: string; a: string }[];
};

function looksLikeHtml(s: string) {
  return /<[a-z][\s\S]*>/i.test(s);
}

export default function GuideFAQ({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <div className="space-y-2" itemScope itemType="https://schema.org/FAQPage">
      {faqs.map((f, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-medium" itemProp="name">
              {f.q}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform",
                open === i && "rotate-180"
              )}
            />
          </button>
          {open === i && (
            <div
              className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)] leading-relaxed [&_a]:text-[var(--accent)] [&_p]:mb-2"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              {looksLikeHtml(f.a) ? (
                <div itemProp="text" dangerouslySetInnerHTML={{ __html: f.a }} />
              ) : (
                <div itemProp="text" className="whitespace-pre-wrap">
                  {f.a}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

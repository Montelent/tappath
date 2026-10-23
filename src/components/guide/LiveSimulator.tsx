"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideVersion } from "@/data/guides";

type Props = {
  versions: GuideVersion[];
  brandName: string;
};

export default function LiveSimulator({ versions, brandName }: Props) {
  const [versionId, setVersionId] = useState(versions[0]?.id ?? "");
  const version = versions.find((v) => v.id === versionId) ?? versions[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const steps = version?.steps ?? [];
  const current = steps[stepIndex];
  const total = steps.length;

  useEffect(() => {
    setStepIndex(0);
  }, [versionId]);

  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(total - 1, i + 1));

  const homeItems = [
    { label: "Google Search Bar", isWidget: true },
    { label: "Phone", isWidget: false },
    { label: "Messages", isWidget: false },
    { label: "Camera", isWidget: false },
    { label: "Gallery", isWidget: false },
    { label: "Settings", isWidget: false },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden",
        fullscreen && "fixed inset-4 z-50 flex flex-col shadow-2xl"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Live simulator
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Path verified
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={versionId}
            onChange={(e) => setVersionId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("grid gap-6 p-4 sm:p-6", fullscreen ? "flex-1 lg:grid-cols-2" : "lg:grid-cols-2")}>
        <div className="flex justify-center">
          <div className="relative w-full max-w-[260px]">
            <div className="overflow-hidden rounded-[2rem] border-[5px] border-slate-800 bg-slate-900 shadow-xl dark:border-slate-700">
              <div className="flex items-center justify-between px-4 pb-1 pt-2.5 text-[10px] text-white/80">
                <span>09:41</span>
                <div className="flex gap-1">
                  <span className="h-2 w-3 rounded-sm border border-white/50" />
                  <span className="h-2 w-1 rounded-sm bg-white/70" />
                </div>
              </div>

              <div className="min-h-[380px] bg-gradient-to-b from-slate-100 to-slate-200 px-3 pb-4 pt-2 dark:from-slate-800 dark:to-slate-900">
                <div className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Home screen · {brandName}
                </div>

                <div className="space-y-2">
                  {homeItems.map((item) => {
                    const isHighlight =
                      current &&
                      (item.label === current.highlight ||
                        (current.highlight === "Remove" && item.label === "Google Search Bar"));
                    const showRemoveMenu =
                      stepIndex === 1 && item.label === "Google Search Bar";

                    return (
                      <div key={item.label} className="relative">
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                            isHighlight
                              ? "scale-[1.03] bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-300"
                              : item.isWidget
                                ? "bg-white/90 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200"
                                : "bg-white/60 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300"
                          )}
                        >
                          {item.isWidget ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-[10px] font-bold text-white">
                              G
                            </span>
                          ) : (
                            <span className="h-6 w-6 rounded-md bg-slate-300 dark:bg-slate-600" />
                          )}
                          <span className="font-medium">{item.label}</span>
                        </div>

                        {showRemoveMenu && (
                          <div className="absolute left-2 right-2 top-full z-10 mt-1 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-600 dark:bg-slate-800">
                            <div
                              className={cn(
                                "rounded-lg px-3 py-2 text-sm font-medium",
                                current?.highlight === "Remove"
                                  ? "bg-red-500 text-white"
                                  : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                              )}
                            >
                              Remove
                            </div>
                            <div className="rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                              Resize
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-white dark:bg-white/20">
                    Step {stepIndex + 1} of {total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Follow the highlighted element on the phone.
            </p>
          </div>

          <ol className="flex-1 space-y-2">
            {steps.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => setStepIndex(i)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition",
                    i === stepIndex
                      ? "border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/50"
                      : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        i === stepIndex
                          ? "bg-brand-500 text-white"
                          : i < stepIndex
                            ? "bg-emerald-500 text-white"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      )}
                    >
                      {i < stepIndex ? "✓" : i + 1}
                    </span>
                    <div>
                      <div
                        className="text-sm font-medium"
                        dangerouslySetInnerHTML={{
                          __html: s.instruction.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                      {i === stepIndex && s.detail && (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.detail}</p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-xs text-[var(--muted-foreground)]">
              {stepIndex + 1} / {total}
            </span>
            <button
              onClick={goNext}
              disabled={stepIndex === total - 1}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

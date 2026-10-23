"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Connections", highlight: false },
  { label: "Wi-Fi", highlight: false },
  { label: "SIM manager", highlight: true },
  { label: "Mobile data", highlight: false },
  { label: "Bluetooth", highlight: false },
  { label: "Airplane mode", highlight: false },
  { label: "Hotspot", highlight: false },
];

export default function HeroPhone() {
  const [current, setCurrent] = useState(2);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % steps.length);
    }, 2200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px]">
      <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 shadow-2xl dark:border-slate-700">
        <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

        <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[10px] text-white/80">
          <span>09:41</span>
          <div className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm border border-white/60" />
            <span className="h-2 w-1 rounded-sm bg-white/80" />
          </div>
        </div>

        <div className="relative min-h-[420px] bg-gradient-to-b from-slate-100 to-slate-200 px-4 pb-6 pt-2 dark:from-slate-800 dark:to-slate-900">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Connections
          </div>

          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-300",
                  i === current
                    ? "scale-[1.02] bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "bg-white/80 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200"
                )}
              >
                <span className="text-sm font-medium">{step.label}</span>
                <div
                  className={cn(
                    "h-5 w-9 rounded-full transition-colors",
                    i === current ? "bg-white/30" : "bg-slate-200 dark:bg-slate-600"
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full bg-white shadow transition-transform",
                      i === current ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-emerald-500/95 px-3 py-1 text-[11px] font-medium text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Path verified
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Step {current + 1} of {steps.length}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Tap <strong>{steps[current].label}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute -right-2 top-16 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg dark:bg-slate-800 dark:text-slate-200">
        4,600+ devices
      </div>

      <button
        onClick={() => setPaused(!paused)}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] font-medium text-[var(--muted-foreground)] shadow-sm transition hover:text-[var(--foreground)]"
      >
        {paused ? "Play animation" : "Pause animation"}
      </button>
    </div>
  );
}

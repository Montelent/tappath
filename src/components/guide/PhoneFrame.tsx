"use client";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  deviceModel?: string;
  className?: string;
};

export default function PhoneFrame({ children, deviceModel = "Galaxy S23+", className }: Props) {
  return (
    <div className={cn("relative w-full max-w-[280px]", className)}>
      {deviceModel && (
        <div className="mb-2 text-center text-[11px] font-medium text-[var(--muted-foreground)]">{deviceModel}</div>
      )}
      <div className="overflow-hidden rounded-[1.75rem] border-[6px] border-slate-900 bg-black shadow-2xl dark:border-slate-800">
        <div className="relative bg-slate-950 px-3 pb-1 pt-2">
          <div className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-800 ring-1 ring-slate-700" />
          <div className="flex items-center justify-between pt-1 text-[10px] text-white/80">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px]">5G</span>
              <span className="h-2 w-3 rounded-sm border border-white/60">
                <span className="block h-full w-2/3 bg-white/70" />
              </span>
            </div>
          </div>
        </div>
        <div className="relative aspect-[9/19] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">{children}</div>
        <div className="flex justify-center bg-black py-2">
          <div className="h-1 w-24 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

export function TapMarker({ x, y }: { x: number; y: number }) {
  const left = Math.min(95, Math.max(5, x));
  const top = Math.min(95, Math.max(5, y));
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-400/40" />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand-500 shadow-lg shadow-brand-500/50">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M12 2L4 14h6v8l8-12h-6V2z" />
        </svg>
      </span>
    </div>
  );
}

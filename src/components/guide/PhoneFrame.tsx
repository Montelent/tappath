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
        <div className="mb-2 text-center text-[11px] font-medium text-[var(--muted-foreground)]">
          {deviceModel}
        </div>
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

/** Compact pointing-hand marker — fingertip is the click target */
export function TapMarker({ x, y }: { x: number; y: number }) {
  const left = Math.min(96, Math.max(4, x));
  const top = Math.min(96, Math.max(4, y));
  return (
    <div className="pointer-events-none absolute z-20" style={{ left: `${left}%`, top: `${top}%` }} aria-hidden>
      <span className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-400/35" />
      <span className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 ring-2 ring-white shadow" />
      <svg
        viewBox="0 0 64 64"
        className="absolute left-0 top-0 h-9 w-9 -translate-x-[18%] -translate-y-[12%] drop-shadow-md sm:h-10 sm:w-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28 58c-4.5 0-7-2.8-7-6.5V34.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V42h2V18.5c0-1.5 1.2-2.7 2.7-2.7 1.5 0 2.7 1.2 2.7 2.7V38h2V14.5c0-1.6 1.3-2.9 2.9-2.9s2.9 1.3 2.9 2.9V38h2V17.5c0-1.5 1.2-2.7 2.7-2.7 1.5 0 2.7 1.2 2.7 2.7V40h2V26.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V48c0 6.5-4.2 10-10.5 10H28z"
          fill="#F5D0A9"
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="39.3" cy="8.2" r="3.2" fill="#F5D0A9" stroke="#1e293b" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

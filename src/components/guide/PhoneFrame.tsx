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

/** Index-finger pointing marker — tip of the index finger sits on (x%, y%). */
export function TapMarker({ x, y }: { x: number; y: number }) {
  const left = Math.min(96, Math.max(4, x));
  const top = Math.min(96, Math.max(4, y));
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden
    >
      <span className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-sky-400/40" />
      <span className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 ring-2 ring-white shadow" />

      <svg
        viewBox="0 0 48 64"
        className="absolute left-0 top-0 h-11 w-8 -translate-x-[28%] -translate-y-[8%] drop-shadow-md sm:h-12 sm:w-9"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 4c-2.4 0-4.2 1.9-4.2 4.2V28.5c0 1.1.9 2 2 2s2-.9 2-2V8.8c0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6V28.5c0 1.1.9 2 2 2s2-.9 2-2V12.2c0-2.3-1.9-4.2-4.2-4.2h-.8z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse cx="22" cy="5.2" rx="4.4" ry="4.8" fill="#F5C89A" stroke="#1e293b" strokeWidth="1.5" />
        <path
          d="M28.5 30.5V22c0-1.5 1.1-2.6 2.5-2.6s2.5 1.1 2.5 2.6v10.5"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M28.2 30.2h6.2c1.2 0 2.2 1 2.2 2.2v4.5c0 1.2-1 2.2-2.2 2.2h-6.2v-8.9z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M34.8 34.5v-5.2c0-1.2.9-2.1 2-2.1s2 .9 2 2.1v6.5"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M34.5 34.2h5.5c1 0 1.9.9 1.9 1.9v3.8c0 1-.9 1.9-1.9 1.9h-5.5v-7.6z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M40.2 37.5v-3.8c0-1 .8-1.8 1.7-1.8s1.7.8 1.7 1.8v5"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M18.5 34c-3.2 1.2-5.5 3.8-5.5 7.2 0 3.5 2.6 6.3 6.2 6.3"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M14.2 40.5c-.2-2.2 1.2-4.4 3.6-5.4l1.2-.5v10.2c-2.6-.3-4.6-2.2-4.8-4.3z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 32.5h16.5c2.2 0 4 1.8 4 4v12c0 5.2-4 9.5-9.2 9.5H23c-4.5 0-8-3.2-8-7.5V36.5c0-2.2 1.8-4 4-4z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

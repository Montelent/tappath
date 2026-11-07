"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  deviceModel?: string;
  className?: string;
  hideStatusBar?: boolean;
};

export default function PhoneFrame({
  children,
  deviceModel = "Galaxy S23+",
  className,
  hideStatusBar = false,
}: Props) {
  return (
    <div className={cn("relative w-full max-w-[280px]", className)}>
      {deviceModel && (
        <div className="mb-2 text-center font-path text-[11px] text-[var(--muted-foreground)]">
          {deviceModel}
        </div>
      )}
      <div className="overflow-hidden rounded-[1.5rem] border-[5px] border-neutral-900 bg-black shadow-lg dark:border-neutral-800">
        {!hideStatusBar && (
          <div className="relative bg-neutral-950 px-3 pb-1 pt-2">
            <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-neutral-800" />
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
        )}
        <div className="relative aspect-[9/19] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {children}
        </div>
        <div className="flex justify-center bg-black py-2">
          <div className="h-1 w-20 rounded-full bg-white/35" />
        </div>
      </div>
    </div>
  );
}

/** Beginner-friendly tap marker: pulse + hand + TAP HERE label */
export function TapMarker({ x, y }: { x: number; y: number }) {
  const left = Math.min(98, Math.max(2, x));
  const top = Math.min(98, Math.max(2, y));
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden
    >
      <span className="absolute left-0 top-0 h-12 w-12 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[var(--accent)]/30" />
      <span className="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50" />
      <span className="absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/40" />

      <div className="absolute" style={{ left: 0, top: 0, transform: "translate(4px, 2px)" }}>
        <svg viewBox="0 0 56 72" width="48" height="62" className="drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 40h20c3.5 0 6.5 3 6.5 6.5V58c0 5-4 9-9 9H22c-4.5 0-8.5-3.5-8.5-8.5V44c0-2.2 1.8-4 4-4z" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M24 40V8.5c0-2.8 2.2-5 5-5s5 2.2 5 5V40" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.7" strokeLinejoin="round" />
          <ellipse cx="29" cy="5" rx="5" ry="5.2" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.7" />
          <path d="M34 38v-9c0-1.6 1.2-2.8 2.7-2.8s2.7 1.2 2.7 2.8V40" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M40 40v-6c0-1.3 1-2.4 2.3-2.4s2.3 1.1 2.3 2.4V42" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M16 42c-3.5 1.5-6 5-6 8.5 0 3.5 2.2 6.5 5.5 7.5" fill="none" stroke="#1e293b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 48c0-2.8 1.6-5.2 4-6.2V58c-2.2-.6-4-3-4-5.8z" fill="#F8C9A0" stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round" />
          <ellipse cx="29" cy="4.2" rx="2.2" ry="1.6" fill="#FFE8D2" opacity="0.9" />
        </svg>
        <span className="absolute -right-1 top-1 select-none animate-bounce rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md ring-2 ring-white/80">
          Tap here
        </span>
      </div>
    </div>
  );
}

type ImageBox = { left: number; top: number; width: number; height: number };

function computeContainTop(cw: number, ch: number, nw: number, nh: number): ImageBox {
  if (!cw || !ch || !nw || !nh) return { left: 0, top: 0, width: cw, height: ch };
  const scale = Math.min(cw / nw, ch / nh);
  const width = nw * scale;
  const height = nh * scale;
  return { left: (cw - width) / 2, top: 0, width, height };
}

export function ScreenshotLayer({
  imageUrl,
  markerX,
  markerY,
  alt = "",
  onPlace,
  className,
}: {
  imageUrl: string;
  markerX?: number;
  markerY?: number;
  alt?: string;
  onPlace?: (x: number, y: number) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState<ImageBox | null>(null);

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh || !cw || !ch) return;
    setBox(computeContainTop(cw, ch, nw, nh));
  }, []);

  useEffect(() => {
    setBox(null);
    const timeoutIds: number[] = [];
    const id = window.requestAnimationFrame(() => {
      recalc();
      timeoutIds.push(window.setTimeout(recalc, 50));
      timeoutIds.push(window.setTimeout(recalc, 250));
    });
    const container = containerRef.current;
    const ro =
      container && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => recalc())
        : null;
    if (container && ro) ro.observe(container);
    return () => {
      window.cancelAnimationFrame(id);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      ro?.disconnect();
    };
  }, [recalc, imageUrl]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPlace || !containerRef.current) return;
    const crect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;
    const nw = img?.naturalWidth || 0;
    const nh = img?.naturalHeight || 0;
    const b = nw && nh ? computeContainTop(crect.width, crect.height, nw, nh) : box;
    if (!b || b.width <= 0 || b.height <= 0) return;
    const px = e.clientX - crect.left - b.left;
    const py = e.clientY - crect.top - b.top;
    if (px < 0 || py < 0 || px > b.width || py > b.height) return;
    onPlace(
      Math.round(Math.min(99, Math.max(1, (px / b.width) * 100)) * 10) / 10,
      Math.round(Math.min(99, Math.max(1, (py / b.height) * 100)) * 10) / 10
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-neutral-900",
        onPlace && "cursor-crosshair",
        className
      )}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt}
        draggable={false}
        onLoad={recalc}
        width={390}
        height={844}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-top"
      />
      {box &&
        markerX != null &&
        markerY != null &&
        Number.isFinite(markerX) &&
        Number.isFinite(markerY) && (
          <div
            className="pointer-events-none absolute"
            style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
          >
            <TapMarker x={markerX} y={markerY} />
          </div>
        )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
        <div className="relative aspect-[9/19] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          {children}
        </div>
        <div className="flex justify-center bg-black py-2">
          <div className="h-1 w-24 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

/** Index-finger marker. (x,y) are % of the *image content* box. Blue dot = exact hotspot. */
export function TapMarker({ x, y }: { x: number; y: number }) {
  const left = Math.min(99, Math.max(1, x));
  const top = Math.min(99, Math.max(1, y));
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden
    >
      <span className="absolute left-0 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-sky-400/35" />
      <span className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow-md" />
      <svg
        viewBox="0 0 48 64"
        width="40"
        height="53"
        className="absolute drop-shadow-md"
        style={{ left: 0, top: 0, transform: "translate(-50%, -6%)" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 36h18c3 0 5.5 2.5 5.5 5.5V52c0 4.5-3.5 8-8 8H20c-4 0-7.5-3-7.5-7.5V40c0-2.2 1.8-4 4-4z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M28 34v-6.5c0-1.3 1-2.3 2.2-2.3s2.2 1 2.2 2.3V36"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M34 36v-4.5c0-1.1.9-2 2-2s2 .9 2 2V38"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M14 38c-3 1.5-5 4.2-5 7.5 0 3 2 5.5 5 6"
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M10.5 44c0-2.5 1.5-4.5 3.5-5.5V52c-2-.5-3.5-2.5-3.5-5z"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 34V10.5c0-2.2 1.7-4 3.8-4s3.8 1.8 3.8 4V34"
          fill="#F5C89A"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <ellipse cx="24.3" cy="6.5" rx="4.2" ry="4.6" fill="#F5C89A" stroke="#1e293b" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

type ImageBox = { left: number; top: number; width: number; height: number };

/** object-contain + object-top geometry inside a container */
function computeContainTop(cw: number, ch: number, nw: number, nh: number): ImageBox {
  if (!cw || !ch || !nw || !nh) {
    return { left: 0, top: 0, width: cw, height: ch };
  }
  const scale = Math.min(cw / nw, ch / nh);
  const width = nw * scale;
  const height = nh * scale;
  const left = (cw - width) / 2;
  const top = 0; // object-top
  return { left, top, width, height };
}

/**
 * Marker coords are % of the *actual displayed image*, not the letterboxed frame.
 * Admin and Frontend therefore always match.
 */
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
    recalc();
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(container);
    return () => ro.disconnect();
  }, [recalc, imageUrl]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onPlace || !box || !containerRef.current) return;
    const crect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - crect.left - box.left;
    const py = e.clientY - crect.top - box.top;
    if (px < 0 || py < 0 || px > box.width || py > box.height) return;
    const x = (px / box.width) * 100;
    const y = (py / box.height) * 100;
    onPlace(
      Math.round(Math.min(99, Math.max(1, x)) * 10) / 10,
      Math.round(Math.min(99, Math.max(1, y)) * 10) / 10
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-slate-900",
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
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-top"
      />
      {box && markerX != null && markerY != null && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
          }}
        >
          <TapMarker x={markerX} y={markerY} />
        </div>
      )}
    </div>
  );
}

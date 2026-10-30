"use client";

import { useRef } from "react";
import { Crosshair, Image as ImageIcon } from "lucide-react";
import { TapMarker } from "@/components/guide/PhoneFrame";

export type StepShot = {
  id?: number;
  instruction: string;
  highlight: string;
  detail?: string;
  imageUrl?: string;
  markerX?: number;
  markerY?: number;
};

type Props = {
  step: StepShot;
  stepNumber: number;
  onChange: (step: StepShot) => void;
  onRemove: () => void;
};

export default function StepScreenshotEditor({ step, stepNumber, onChange, onRemove }: Props) {
  const imgRef = useRef<HTMLDivElement>(null);

  const placeMarker = (e: React.MouseEvent) => {
    if (!step.imageUrl || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onChange({
      ...step,
      markerX: Math.round(Math.min(98, Math.max(2, x)) * 10) / 10,
      markerY: Math.round(Math.min(98, Math.max(2, y)) * 10) / 10,
    });
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">Step {stepNumber}</span>
        <button type="button" onClick={onRemove} className="text-xs text-red-600">Remove</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <input value={step.instruction} onChange={(e) => onChange({ ...step, instruction: e.target.value })}
            placeholder='Instruction e.g. Tap on **Settings**'
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm" />
          <input value={step.highlight} onChange={(e) => onChange({ ...step, highlight: e.target.value })}
            placeholder="Highlight label (menu name)"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm" />
          <input value={step.detail || ""} onChange={(e) => onChange({ ...step, detail: e.target.value })}
            placeholder="Optional detail"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm" />
          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              <ImageIcon className="h-3 w-3" /> Screenshot URL
            </span>
            <input value={step.imageUrl || ""} onChange={(e) => onChange({ ...step, imageUrl: e.target.value.trim() })}
              placeholder="https://…/step-1.webp"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 font-mono text-xs" />
          </label>
          {step.imageUrl && (
            <p className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
              <Crosshair className="h-3 w-3" /> Click the preview to place the tap arrow
              {step.markerX != null && step.markerY != null && (
                <span className="ml-1 font-mono text-brand-600">({step.markerX}%, {step.markerY}%)</span>
              )}
            </p>
          )}
        </div>
        <div>
          {step.imageUrl ? (
            <div ref={imgRef} onClick={placeMarker}
              className="relative mx-auto aspect-[9/19] max-h-64 w-full max-w-[160px] cursor-crosshair overflow-hidden rounded-2xl border-4 border-slate-900 bg-black"
              title="Click to place marker">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.imageUrl} alt="" className="h-full w-full object-cover object-top" />
              {step.markerX != null && step.markerY != null && <TapMarker x={step.markerX} y={step.markerY} />}
            </div>
          ) : (
            <div className="flex aspect-[9/19] max-h-64 max-w-[160px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] text-center text-[11px] text-[var(--muted-foreground)]">
              Add screenshot URL to preview + place arrow
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

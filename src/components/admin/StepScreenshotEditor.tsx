"use client";

import { useRef, useState } from "react";
import { Crosshair, Image as ImageIcon, Loader2, Upload } from "lucide-react";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }
      onChange({
        ...step,
        imageUrl: data.url as string,
        markerX: undefined,
        markerY: undefined,
      });
    } catch {
      setUploadError("Network error during upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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

          <div className="rounded-lg border border-dashed border-[var(--border)] p-2">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              <Upload className="h-3 w-3" /> Upload screenshot
            </span>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full text-xs" disabled={uploading}
              onChange={(e) => onFile(e.target.files?.[0] || null)} />
            {uploading && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-brand-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
              </p>
            )}
            {uploadError && <p className="mt-1 text-[11px] text-red-600">{uploadError}</p>}
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
              PNG / JPG / WebP, max ~1.5 MB. Or paste a public URL below.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              <ImageIcon className="h-3 w-3" /> Screenshot URL
            </span>
            <input
              value={step.imageUrl?.startsWith("data:") ? "(uploaded image)" : step.imageUrl || ""}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === "(uploaded image)") return;
                onChange({ ...step, imageUrl: v });
              }}
              placeholder="https://…/step-1.webp"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 font-mono text-xs"
            />
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
              Upload or paste URL then click to place arrow
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

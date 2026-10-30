"use client";

import { useRef, useState } from "react";
import { Crosshair, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { ScreenshotLayer } from "@/components/guide/PhoneFrame";

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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
        <button type="button" onClick={onRemove} className="text-xs text-red-600">
          Remove
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <input
            value={step.instruction}
            onChange={(e) => onChange({ ...step, instruction: e.target.value })}
            placeholder='Instruction e.g. Tap on **Settings**'
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm"
          />
          <input
            value={step.highlight}
            onChange={(e) => onChange({ ...step, highlight: e.target.value })}
            placeholder="Highlight label (menu name)"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm"
          />
          <input
            value={step.detail || ""}
            onChange={(e) => onChange({ ...step, detail: e.target.value })}
            placeholder="Optional detail"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm"
          />

          <div className="rounded-lg border border-dashed border-[var(--border)] p-2">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              <Upload className="h-3 w-3" /> Upload screenshot
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full text-xs"
              disabled={uploading}
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            {uploading && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-brand-600">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
              </p>
            )}
            {uploadError && <p className="mt-1 text-[11px] text-red-600">{uploadError}</p>}
            <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
              PNG / JPG / WebP, max ~2 MB. Or paste a public URL below.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
              <ImageIcon className="h-3 w-3" /> Screenshot URL
            </span>
            <input
              value={
                step.imageUrl?.startsWith("data:")
                  ? "(uploaded image)"
                  : step.imageUrl || ""
              }
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === "(uploaded image)") return;
                onChange({ ...step, imageUrl: v });
              }}
              placeholder="https://… or /api/media/…"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 font-mono text-xs"
            />
          </label>

          {step.imageUrl && (
            <p className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
              <Crosshair className="h-3 w-3" /> Click the phone preview to place the finger
              {step.markerX != null && step.markerY != null && (
                <span className="ml-1 font-mono text-brand-600">
                  ({step.markerX}%, {step.markerY}%)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="mx-auto w-full max-w-[160px]">
          {step.imageUrl ? (
            <div className="overflow-hidden rounded-[1.25rem] border-[5px] border-slate-900 bg-black shadow-lg">
              <div className="relative aspect-[9/19] w-full">
                <ScreenshotLayer
                  imageUrl={step.imageUrl}
                  markerX={step.markerX}
                  markerY={step.markerY}
                  onPlace={(x, y) => onChange({ ...step, markerX: x, markerY: y })}
                />
              </div>
            </div>
          ) : (
            <div className="flex aspect-[9/19] items-center justify-center rounded-[1.25rem] border border-dashed border-[var(--border)] text-center text-[11px] text-[var(--muted-foreground)]">
              Upload or paste URL
              <br />
              then click to place finger
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

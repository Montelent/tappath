"use client";

import StepScreenshotEditor from "@/components/admin/StepScreenshotEditor";

export type VersionStep = {
  id?: number;
  instruction?: string;
  highlight?: string;
  detail?: string;
  imageUrl?: string;
  markerX?: number;
  markerY?: number;
};

export type GuideVersionForm = {
  id?: string;
  label: string;
  steps?: VersionStep[];
};

type Props = {
  versions: GuideVersionForm[];
  onChange: (versions: GuideVersionForm[]) => void;
};

export default function GuideVersionsEditor({ versions, onChange }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">OS / UI version + steps (screenshots)</h3>
        <button
          type="button"
          className="text-xs text-brand-600"
          onClick={() =>
            onChange([
              ...versions,
              {
                id: `v-${Date.now()}`,
                label: "Latest",
                steps: [{ instruction: "", highlight: "" }],
              },
            ])
          }
        >
          + Version
        </button>
      </div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">
        TechBone-style: paste a screenshot URL per step, then click the preview to place the tap arrow.
        Host images in Media library or any public CDN.
      </p>
      <div className="space-y-4">
        {versions.map((v, vi) => (
          <div key={vi} className="rounded-2xl border border-[var(--border)] p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <input
                value={v.label}
                onChange={(e) => {
                  const next = [...versions];
                  next[vi] = { ...next[vi], label: e.target.value };
                  onChange(next);
                }}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-sm"
                placeholder="Android 14 · One UI 6"
              />
              <button
                type="button"
                className="text-xs text-brand-600"
                onClick={() => {
                  const next = [...versions];
                  const steps = [...(next[vi].steps || []), { instruction: "", highlight: "" }];
                  next[vi] = { ...next[vi], steps };
                  onChange(next);
                }}
              >
                + Step
              </button>
              <button
                type="button"
                className="ml-auto text-xs text-red-600"
                onClick={() => onChange(versions.filter((_, j) => j !== vi))}
              >
                Remove version
              </button>
            </div>
            <div className="space-y-2">
              {(v.steps || []).map((s, si) => (
                <StepScreenshotEditor
                  key={si}
                  stepNumber={si + 1}
                  step={{
                    instruction: s.instruction || "",
                    highlight: s.highlight || "",
                    detail: s.detail,
                    imageUrl: s.imageUrl,
                    markerX: s.markerX,
                    markerY: s.markerY,
                  }}
                  onChange={(nextStep) => {
                    const next = [...versions];
                    const steps = [...(next[vi].steps || [])];
                    steps[si] = { ...steps[si], ...nextStep, id: si + 1 };
                    next[vi] = { ...next[vi], steps };
                    onChange(next);
                  }}
                  onRemove={() => {
                    const next = [...versions];
                    next[vi] = {
                      ...next[vi],
                      steps: (next[vi].steps || []).filter((_, j) => j !== si),
                    };
                    onChange(next);
                  }}
                />
              ))}
              {!(v.steps || []).length && (
                <p className="text-xs text-[var(--muted-foreground)]">No steps yet — click + Step.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

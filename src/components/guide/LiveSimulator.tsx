"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2, CheckCircle2,
  Settings, Wifi, Battery, Smartphone, Home, Search, Fingerprint, Bell, AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideVersion } from "@/data/guides";
import PhoneFrame, { TapMarker } from "@/components/guide/PhoneFrame";

type Props = { versions: GuideVersion[]; brandName: string; deviceModel?: string };
type MenuItem = {
  id: string; label: string;
  icon?: "settings" | "wifi" | "battery" | "phone" | "home" | "search" | "fingerprint" | "bell" | "apps";
  isWidget?: boolean;
};

const ICON_MAP = {
  settings: Settings, wifi: Wifi, battery: Battery, phone: Smartphone,
  home: Home, search: Search, fingerprint: Fingerprint, bell: Bell, apps: AppWindow,
};

function guessIcon(label: string): MenuItem["icon"] {
  const l = label.toLowerCase();
  if (/wifi|network|dns|connection/.test(l)) return "wifi";
  if (/battery|power/.test(l)) return "battery";
  if (/security|lock|privacy|fingerprint|biometr/.test(l)) return "fingerprint";
  if (/notification|sound|bell/.test(l)) return "bell";
  if (/home|display|wallpaper|screen/.test(l)) return "home";
  if (/search|google/.test(l)) return "search";
  if (/app|install/.test(l)) return "apps";
  if (/setting/.test(l)) return "settings";
  if (/phone|device|about/.test(l)) return "phone";
  return "settings";
}

function plain(s: string) { return s.replace(/\*\*/g, "").trim(); }

function buildMenuFromSteps(steps: GuideVersion["steps"]): MenuItem[] {
  const seen = new Set<string>();
  const items: MenuItem[] = [];
  for (const s of steps) {
    const label = plain(s.highlight || "");
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    if (["remove","delete","ok","done","next","confirm","cancel","yes","no"].includes(key)) continue;
    seen.add(key);
    items.push({ id: key, label, icon: guessIcon(label), isWidget: /search bar|widget/i.test(label) });
  }
  if (!items.length) {
    return [
      { id: "search", label: "Google Search Bar", icon: "search", isWidget: true },
      { id: "phone", label: "Phone", icon: "phone" },
      { id: "messages", label: "Messages", icon: "bell" },
      { id: "settings", label: "Settings", icon: "settings" },
    ];
  }
  for (const f of [
    { id: "f-settings", label: "Settings", icon: "settings" as const },
    { id: "f-connections", label: "Connections", icon: "wifi" as const },
    { id: "f-display", label: "Display", icon: "home" as const },
    { id: "f-battery", label: "Battery", icon: "battery" as const },
  ]) {
    if (items.length >= 6) break;
    if (!seen.has(f.label.toLowerCase())) { seen.add(f.label.toLowerCase()); items.push(f); }
  }
  return items;
}

function isActionHighlight(h: string) {
  return /^(remove|delete|ok|done|next|confirm|cancel|yes|no|add|save|apply)$/i.test(plain(h));
}

export default function LiveSimulator({ versions, brandName, deviceModel = "Galaxy S23+" }: Props) {
  const safeVersions = versions?.length ? versions : [];
  const [versionId, setVersionId] = useState(safeVersions[0]?.id ?? "");
  const version = safeVersions.find((v) => v.id === versionId) ?? safeVersions[0];
  const [stepIndex, setStepIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const steps = version?.steps ?? [];
  const current = steps[stepIndex];
  const total = steps.length;

  useEffect(() => { setStepIndex(0); }, [versionId]);
  useEffect(() => {
    if (safeVersions[0] && !safeVersions.find((v) => v.id === versionId)) setVersionId(safeVersions[0].id);
  }, [safeVersions, versionId]);

  const menuItems = useMemo(() => buildMenuFromSteps(steps), [steps]);
  const highlightPlain = plain(current?.highlight || "");
  const showActionPopup = current && isActionHighlight(highlightPlain);
  const hasScreenshot = Boolean(current?.imageUrl);
  const goPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(total - 1, i + 1));

  if (!safeVersions.length || !steps.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
        Live simulator needs steps. Add instruction + optional screenshot URL and tap marker in Admin.
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]", fullscreen && "fixed inset-4 z-50 flex flex-col shadow-2xl")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Live simulator</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Path verified
          </span>
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">{brandName} · {deviceModel}</span>
          {hasScreenshot && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">Screenshot mode</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={versionId} onChange={(e) => setVersionId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500">
            {safeVersions.map((v) => (<option key={v.id} value={v.id}>{v.label}</option>))}
          </select>
          <button type="button" onClick={() => setFullscreen(!fullscreen)}
            className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("grid gap-6 p-4 sm:p-6", fullscreen ? "flex-1 lg:grid-cols-2" : "lg:grid-cols-2")}>
        <div className="flex flex-col items-center">
          <PhoneFrame deviceModel={deviceModel}>
            {hasScreenshot && current?.imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.imageUrl} alt={plain(current.instruction)} className="absolute inset-0 h-full w-full object-cover object-top" />
                {current.markerX != null && current.markerY != null && (
                  <TapMarker x={current.markerX} y={current.markerY} />
                )}
              </>
            ) : (
              <div className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                <div className="border-b border-slate-200/80 px-3 py-2 dark:border-slate-700/80">
                  <div className="text-center text-[11px] font-semibold text-slate-700 dark:text-slate-200">Settings</div>
                  <div className="text-center text-[9px] text-slate-400">{brandName}</div>
                </div>
                <div className="space-y-1.5 px-2.5 py-3">
                  {menuItems.map((item) => {
                    const Icon = ICON_MAP[item.icon || "settings"];
                    const isRowHighlight = !!highlightPlain && !showActionPopup && (
                      item.label.toLowerCase() === highlightPlain.toLowerCase() ||
                      item.label.toLowerCase().includes(highlightPlain.toLowerCase()) ||
                      highlightPlain.toLowerCase().includes(item.label.toLowerCase())
                    );
                    return (
                      <div key={item.id} className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all",
                        isRowHighlight ? "scale-[1.02] bg-brand-500 text-white shadow-lg ring-2 ring-brand-300" : "bg-white/80 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
                      )}>
                        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", isRowHighlight ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700")}>
                          <Icon className={cn("h-3.5 w-3.5", isRowHighlight ? "text-white" : "text-slate-500")} />
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                {showActionPopup && (
                  <div className="absolute inset-x-4 bottom-16 z-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:bg-slate-800">
                    <div className="rounded-xl bg-red-500 px-3 py-2.5 text-center text-sm font-semibold text-white">{highlightPlain}</div>
                  </div>
                )}
              </div>
            )}
          </PhoneFrame>
          <p className="mt-3 max-w-[280px] text-center text-[11px] text-[var(--muted-foreground)]">
            {hasScreenshot
              ? "Real screenshot with tap marker — same style as TechBone."
              : "Synthetic UI. Add a screenshot URL + marker in Admin for photo-accurate steps."}
          </p>
        </div>

        <div className={cn(fullscreen && "overflow-y-auto")}>
          <h3 className="text-sm font-semibold">Follow these steps</h3>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{stepIndex + 1} / {total} · {deviceModel}</p>
          <ol className="mt-4 space-y-2">
            {steps.map((s, i) => (
              <li key={s.id ?? i}>
                <button type="button" onClick={() => setStepIndex(i)}
                  className={cn("w-full rounded-xl border px-3 py-3 text-left transition",
                    i === stepIndex ? "border-brand-400 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/50" : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)]/50")}>
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      i === stepIndex ? "bg-brand-500 text-white" : i < stepIndex ? "bg-emerald-500 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]")}>
                      {i < stepIndex ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: s.instruction.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                      {i === stepIndex && s.detail && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.detail}</p>}
                      {s.imageUrl && <p className="mt-1 text-[10px] text-brand-600 dark:text-brand-400">Has screenshot</p>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={goPrev} disabled={stepIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-xs text-[var(--muted-foreground)]">{stepIndex + 1} / {total}</span>
            <button type="button" onClick={goNext} disabled={stepIndex === total - 1}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

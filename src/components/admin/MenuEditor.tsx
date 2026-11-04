"use client";

import { ChevronDown, ChevronUp, Plus, Trash2, ExternalLink } from "lucide-react";
import type { NavMenuItem } from "@/lib/site-settings";

type Props = {
  label: string;
  help?: string;
  items: NavMenuItem[];
  onChange: (items: NavMenuItem[]) => void;
};

function newId() {
  return `nav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** WordPress-style menu editor — add, edit, reorder, nested one level. */
export default function MenuEditor({ label, help, items, onChange }: Props) {
  const list = Array.isArray(items) ? items : [];

  function update(i: number, patch: Partial<NavMenuItem>) {
    const next = list.map((row, idx) => (idx === i ? { ...row, ...patch } : row));
    onChange(next);
  }

  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function add() {
    onChange([
      ...list,
      { id: newId(), label: "New link", href: "/", openInNewTab: false },
    ]);
  }

  function addChild(parentIdx: number) {
    const parent = list[parentIdx];
    const children = [...(parent.children || [])];
    children.push({
      id: newId(),
      label: "Sub-link",
      href: "/",
      openInNewTab: false,
    });
    update(parentIdx, { children });
  }

  function updateChild(
    parentIdx: number,
    childIdx: number,
    patch: Partial<NavMenuItem>
  ) {
    const parent = list[parentIdx];
    const children = (parent.children || []).map((c, i) =>
      i === childIdx ? { ...c, ...patch } : c
    );
    update(parentIdx, { children });
  }

  function removeChild(parentIdx: number, childIdx: number) {
    const parent = list[parentIdx];
    const children = (parent.children || []).filter((_, i) => i !== childIdx);
    update(parentIdx, { children: children.length ? children : undefined });
  }

  function moveChild(parentIdx: number, childIdx: number, dir: -1 | 1) {
    const parent = list[parentIdx];
    const children = [...(parent.children || [])];
    const target = childIdx + dir;
    if (target < 0 || target >= children.length) return;
    [children[childIdx], children[target]] = [children[target], children[childIdx]];
    update(parentIdx, { children });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{label}</h3>
          {help && (
            <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] max-w-xl">
              {help}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      </div>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
          No menu items yet. Click <strong>Add item</strong> to create your first
          link.
        </p>
      )}

      <ul className="space-y-3">
        {list.map((item, i) => (
          <li
            key={item.id || i}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-caps text-[10px]">#{i + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-30"
                  onClick={() => move(i, 1)}
                  disabled={i === list.length - 1}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--border)] p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => remove(i)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-xs">
                <span className="mb-1 block text-[var(--muted-foreground)]">
                  Label
                </span>
                <input
                  value={item.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  placeholder="Topics"
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block text-[var(--muted-foreground)]">
                  URL / path
                </span>
                <input
                  value={item.href}
                  onChange={(e) => update(i, { href: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm"
                  placeholder="/topics or https://…"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input
                type="checkbox"
                checked={!!item.openInNewTab}
                onChange={(e) => update(i, { openInNewTab: e.target.checked })}
                className="rounded border-[var(--border)]"
              />
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </label>

            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                  Sub-links (optional)
                </span>
                <button
                  type="button"
                  onClick={() => addChild(i)}
                  className="text-xs font-medium text-[var(--accent)]"
                >
                  + Add sub-link
                </button>
              </div>
              {(item.children || []).map((child, ci) => (
                <div
                  key={child.id || ci}
                  className="grid gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-2.5 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    value={child.label}
                    onChange={(e) =>
                      updateChild(i, ci, { label: e.target.value })
                    }
                    placeholder="Label"
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm"
                  />
                  <input
                    value={child.href}
                    onChange={(e) =>
                      updateChild(i, ci, { href: e.target.value })
                    }
                    placeholder="/path"
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 font-mono text-sm"
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" className="rounded p-1 text-[var(--muted-foreground)] disabled:opacity-30" onClick={() => moveChild(i, ci, -1)} disabled={ci === 0} aria-label="Move sub-link up"><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" className="rounded p-1 text-[var(--muted-foreground)] disabled:opacity-30" onClick={() => moveChild(i, ci, 1)} disabled={ci === (item.children || []).length - 1} aria-label="Move sub-link down"><ChevronDown className="h-4 w-4" /></button>
                    <button type="button" className="rounded p-1 text-red-500" onClick={() => removeChild(i, ci)} aria-label="Remove sub-link"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] sm:col-span-2">
                    <input type="checkbox" checked={!!child.openInNewTab} onChange={(e) => updateChild(i, ci, { openInNewTab: e.target.checked })} />
                    Open sub-link in new tab
                  </label>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

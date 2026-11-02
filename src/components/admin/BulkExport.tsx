"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  AdminField,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSelect,
  wp,
} from "./AdminUI";

const TABLES = [
  { id: "guides", label: "Guides (step-by-step how-tos)" },
  { id: "brands", label: "Brands (Samsung, Xiaomi, …)" },
  { id: "topics", label: "Topics (categories)" },
  { id: "devices", label: "Devices (phone models)" },
  { id: "glossary_terms", label: "Glossary terms" },
  { id: "forum_topics", label: "Forum topics" },
  { id: "guide_feedback", label: "Guide feedback votes" },
  { id: "profiles", label: "Users (no passwords)" },
] as const;

export default function BulkExport() {
  const [table, setTable] = useState<string>("guides");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/export?table=${encodeURIComponent(table)}&format=${format}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Export failed (${res.status})`);
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const match = /filename="([^"]+)"/.exec(cd);
      const name = match?.[1] || `tappath-${table}.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={wp.page + " mx-auto max-w-xl"}>
      <AdminPageHeader
        title="Bulk Export"
        description="Download a backup of your content as a file. Choose a table and format, then click Download."
      />

      {error && <AdminNotice tone="err">{error}</AdminNotice>}

      <AdminPanel
        title="Export options"
        description="JSON is best for backups. CSV is easier to open in Excel or Google Sheets."
        footer={
          <AdminPrimaryButton onClick={download} loading={loading}>
            <Download className="h-4 w-4" />
            Download {format.toUpperCase()}
          </AdminPrimaryButton>
        }
      >
        <AdminField label="What to export" help="Pick one content type per download.">
          <AdminSelect value={table} onChange={(e) => setTable(e.target.value)}>
            {TABLES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
        <AdminField label="File format">
          <AdminSelect
            value={format}
            onChange={(e) => setFormat(e.target.value as "json" | "csv")}
          >
            <option value="json">JSON (recommended for backups)</option>
            <option value="csv">CSV (spreadsheet)</option>
          </AdminSelect>
        </AdminField>
      </AdminPanel>
    </div>
  );
}

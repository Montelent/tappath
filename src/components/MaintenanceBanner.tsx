import { getSiteSettings } from "@/lib/site-settings";

/** Full-width notice when maintenance_mode is enabled in site settings. */
export default async function MaintenanceBanner() {
  const s = await getSiteSettings();
  if (!s.maintenance_mode) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
    >
      {s.maintenance_message ||
        "We're doing a short maintenance window. Some features may be temporarily unavailable."}
    </div>
  );
}

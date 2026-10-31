import type { Device } from "@/data/devices";
import { getDevice as getStaticDevice, getAllDevices as getStaticDevices } from "@/data/devices";
import {
  listDevices,
  listGuides,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { isNeonConfigured } from "@/lib/db/neon";
import { guideHref } from "@/lib/guides/resolve";
import type { DbDevice, DbGuide } from "@/lib/db/types";

function dbDeviceToDevice(d: DbDevice, guides: DbGuide[]): Device {
  const brandGuides = guides
    .filter((g) => g.brand_slug === d.brand_slug)
    .slice(0, 12)
    .map((g) => ({
      title: g.title,
      href: guideHref(g),
      category: g.category || "General",
    }));

  const href = d.href || `/${d.brand_slug}/${d.slug}`;

  return {
    slug: d.slug,
    name: d.name,
    brand: d.brand_name || d.brand_slug,
    brandSlug: d.brand_slug,
    os: d.os || "",
    year: d.year ?? undefined,
    href,
    description: `${d.name} — settings guides and help.`,
    guides:
      brandGuides.length > 0
        ? brandGuides
        : Array.isArray(d.guides)
          ? (d.guides as Device["guides"]).map((g) => ({
              title: g.title,
              href: g.href,
              category: "General",
            }))
          : [],
    relatedDevices: [],
  };
}

export async function listDevicesPublic(): Promise<Device[]> {
  if (isDatabaseConfigured()) {
    try {
      const [devices, guides] = await Promise.all([listDevices(), listGuides()]);
      return devices.map((d) => dbDeviceToDevice(d, guides));
    } catch (e) {
      console.error("[listDevicesPublic]", e);
      return [];
    }
  }
  if (isNeonConfigured()) return [];
  return getStaticDevices();
}

export async function resolveDevice(slug: string): Promise<Device | null> {
  const key = slug.toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const [devices, guides] = await Promise.all([listDevices(), listGuides()]);
      const hit = devices.find((d) => d.slug === key);
      if (!hit) return null;
      return dbDeviceToDevice(hit, guides);
    } catch (e) {
      console.error("[resolveDevice]", e);
      return null;
    }
  }

  if (isNeonConfigured()) return null;
  return getStaticDevice(key) ?? null;
}

export function deviceBrandFilters(devices: Device[]): { slug: string; name: string }[] {
  const map = new Map<string, string>();
  for (const d of devices) {
    if (d.brandSlug) map.set(d.brandSlug, d.brand);
  }
  return Array.from(map.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
